"""توليد نسخ WebP خفيفة وصيانة بيانات الأفلام الوثائقية.

`assets/doc/movies.json` هو المصدر الوحيد للحقيقة. يقرأ هذا السكربت منه ويقوم بـ:

1. تحويل كل bg / logo إلى عدة نسخ WebP متجاوبة وكتابة bgSrcset / logoSrcset
   (مع حفظ مسار الصورة الأصلية في bgSource / logoSource حتى يبقى السكربت
   قابلًا لإعادة التشغيل دون تدهور جودة الصور).
2. توليد `assets/doc/slider.json` المشتق من movies.json حتى لا يتكرر المحتوى
   بين الملفين ولا يتناقص.

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
SLIDER_JSON = ROOT / "assets" / "doc" / "slider.json"

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

BACK_WIDTHS = (640, 960, 1600)
LOGO_WIDTHS = (256, 512)
BACK_QUALITY = 72
LOGO_QUALITY = 85

# الحقول التي ينسخها slider.json من movies.json (القائمة الرمفية للواجهة الرئيسية).
SLIDER_FIELDS = ("id", "title", "logo", "logoSrcset", "bg", "bgSrcset", "desc", "type", "link")


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


def load_movies() -> list:
    """يحمّل movies.json مع رسالة خطأ واضحة بدل استثناء JSON الخام."""
    try:
        data = json.loads(MOVIES_JSON.read_text(encoding="utf-8-sig"))
    except json.JSONDecodeError as error:
        sys.exit(
            f"movies.json غير صالح كملف JSON (سطر {error.lineno}، عمود {error.colno}): {error.msg}\n"
            f"راجع {MOVIES_JSON.relative_to(ROOT)}"
        )

    if not isinstance(data, list):
        sys.exit("movies.json يجب أن يحتوي على قائمة (Array) من الأفلام.")

    for index, movie in enumerate(data):
        if not isinstance(movie, dict):
            sys.exit(f"العنصر رقم {index + 1} في movies.json ليس كائنًا (Object).")
        if not movie.get("id") or not movie.get("title"):
            sys.exit(f"العنصر رقم {index + 1} في movies.json ينقصه الحقل id أو title.")

    return data


def write_json(path: Path, data) -> None:
    path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


def build_slider(movies: list) -> list:
    """يبني محتوى slider.json من movies.json دون تكرار البيانات يدويًا."""
    slider = []
    for movie in movies:
        entry = {field: movie[field] for field in SLIDER_FIELDS if movie.get(field)}
        if not entry.get("link") and movie.get("id"):
            entry["link"] = f"/video/{movie['id']}"
        slider.append(entry)
    return slider


def main() -> None:
    data = load_movies()
    total_before = 0
    total_after = 0

    for movie in data:
        name = movie.get("title") or movie.get("id") or "?"

        for field, widths, quality in (
            ("bg", BACK_WIDTHS, BACK_QUALITY),
            ("logo", LOGO_WIDTHS, LOGO_QUALITY),
        ):
            # نقرأ من الصورة الأصلية المحفوظة (bgSource) لا من نسخة WebP
            # الناتجة سابقًا، وإلا تدهورت الصور مع كل إعادة تشغيل.
            original = movie.get(f"{field}Source") or movie.get(field)
            if not original:
                continue

            source = to_site_path(original)
            if not source.is_file():
                sys.exit(
                    f"صورة '{field}' غير موجودة للأفلام '{movie.get('id')}': "
                    f"{source.relative_to(ROOT)}"
                )

            source_size = source.stat().st_size
            total_before += source_size

            result = build_variants(source, widths, quality)
            movie[field] = result["src"]
            movie[f"{field}Srcset"] = result["srcset"]
            movie[f"{field}Source"] = original
            total_after += result["bytes"]

            details = " ".join(
                f"{path.name}={size // 1024}KB" for _, path, size in result["files"]
            )
            print(f"[{name}] {field}: {source.name} ({source_size // 1024}KB)")
            print(f"    -> {details}")

    write_json(MOVIES_JSON, data)

    slider = build_slider(data)
    write_json(SLIDER_JSON, slider)

    print(
        f"\nتم التحديث: {MOVIES_JSON.relative_to(ROOT)} "
        f"({total_before // 1024}KB -> {total_after // 1024}KB للنسخ الأساسية)"
    )
    print(f"تمت مزامنة {SLIDER_JSON.relative_to(ROOT)} ({len(slider)} فيلم).")


if __name__ == "__main__":
    main()
