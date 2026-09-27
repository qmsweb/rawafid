"""توليد نسخ WebP خفيفة لصور الأفلام الوثائقية.

يقرأ assets/doc/movies.json، ويحوّل كل bg / logo إلى عدة نسخ WebP متجاوبة
ثم يكتب مسارات bgSrcset / logoSrcset داخل ملف JSON نفسه.

الاستخدام:  python generate-doc-images.py
"""

import json
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit("يتطلب هذا السكربت مكتبة Pillow:  pip install Pillow")

ROOT = Path(__file__).resolve().parent
MOVIES_JSON = ROOT / "assets" / "doc" / "movies.json"

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

BACK_WIDTHS = (640, 960, 1600)
LOGO_WIDTHS = (256, 512)
BACK_QUALITY = 72
LOGO_QUALITY = 85


def build_variants(source: Path, widths, quality: int) -> dict:
    """ينشئ نسخ WebP بأعرض محددة ويعيد {srcset, src, size}."""
    if not source.is_file():
        raise FileNotFoundError(f"الصورة غير موجودة: {source}")

    stem = source.stem
    public_stem = source.parent.relative_to(ROOT).as_posix()
    produced = []

    with Image.open(source) as image:
        image = image.convert("RGBA") if image.mode in ("RGBA", "LA", "P") else image.convert("RGB")

        for width in widths:
            if width > image.width and produced:
                continue

            scale = width / image.width
            target = (width, max(1, round(image.height * scale)))
            variant = image.resize(target, Image.LANCZOS)

            target_path = source.with_name(f"{stem}-{width}.webp")
            variant.save(target_path, "WEBP", quality=quality, method=6)
            produced.append((width, target_path, target_path.stat().st_size))

    if not produced:
        raise RuntimeError(f"لم يتم إنتاج أي نسخة لـ {source.name}")

    srcset = ", ".join(
        f"/{public_stem}/{path.name} {width}w" for width, path, _ in produced
    )
    widest = produced[-1]
    return {
        "src": f"/{public_stem}/{widest[1].name}",
        "srcset": srcset,
        "bytes": widest[2],
        "width": widest[0],
        "files": produced,
    }


def to_site_path(value: str) -> Path:
    return ROOT / value.lstrip("/")


def main() -> None:
    data = json.loads(MOVIES_JSON.read_text(encoding="utf-8-sig"))
    total_before = 0
    total_after = 0

    for movie in data:
        name = movie.get("title") or movie.get("id") or "?"

        for field, widths, quality in (
            ("bg", BACK_WIDTHS, BACK_QUALITY),
            ("logo", LOGO_WIDTHS, LOGO_QUALITY),
        ):
            original = movie.get(field)
            if not original:
                continue

            source = to_site_path(original)
            total_before += source.stat().st_size

            result = build_variants(source, widths, quality)
            movie[field] = result["src"]
            movie[f"{field}Srcset"] = result["srcset"]
            total_after += result["bytes"]

            details = " ".join(
                f"{path.name}={size // 1024}KB" for _, path, size in result["files"]
            )
            print(f"[{name}] {field}: {source.name} ({source.stat().st_size // 1024}KB)")
            print(f"    -> {details}")

    MOVIES_JSON.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    print(
        f"\nتم التحديث: {MOVIES_JSON.relative_to(ROOT)} "
        f"({total_before // 1024}KB -> {total_after // 1024}KB للنسخ الأساسية)"
    )


if __name__ == "__main__":
    main()
