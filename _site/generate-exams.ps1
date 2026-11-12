# Generates clean /exam/CODE and /exam2/CODE pages from the online YAML files.
# Rerun after adding/removing any assets/online/*.yaml.
$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$onlineDir = Join-Path $root 'assets\online'
$dest = Join-Path $root 'exam'
$dest2 = Join-Path $root 'exam2'

foreach ($outputDir in @($dest, $dest2)) {
    if (Test-Path -LiteralPath $outputDir) {
        Remove-Item -LiteralPath $outputDir -Recurse -Force
    }
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

$count = 0
Get-ChildItem "$onlineDir\*.yaml" | ForEach-Object {
    $code = $_.BaseName

    # النسخة الأصلية: /exam/CODE
    $dir = Join-Path $dest $code
    New-Item -ItemType Directory -Path $dir -Force | Out-Null

    $front = "---`r`nlayout: exam`r`nexam_code: `"$code`"`r`ntitle: `"Exam $code`"`r`npermalink: /exam/$code`r`n---`r`n"
    [System.IO.File]::WriteAllText((Join-Path $dir "index.md"), $front, (New-Object System.Text.UTF8Encoding $false))

    # صفحة طباعة مستقلة لكل اختبار على المسار /exam/CODE/print
    $printDir = Join-Path $dir 'print'
    New-Item -ItemType Directory -Path $printDir -Force | Out-Null
    $frontPrint = "---`r`nlayout: exam_print`r`nexam_code: `"$code`"`r`ntitle: `"Exam $code - PDF`"`r`npermalink: /exam/$code/print`r`n---`r`n"
    [System.IO.File]::WriteAllText((Join-Path $printDir "index.md"), $frontPrint, (New-Object System.Text.UTF8Encoding $false))

    # النسخة الثانية (التصميم الجديد): /exam2/CODE
    $dir2 = Join-Path $dest2 $code
    New-Item -ItemType Directory -Path $dir2 -Force | Out-Null

    $front2 = "---`r`nlayout: exam2`r`nexam_code: `"$code`"`r`ntitle: `"Exam $code`"`r`npermalink: /exam2/$code`r`n---`r`n"
    [System.IO.File]::WriteAllText((Join-Path $dir2 "index.md"), $front2, (New-Object System.Text.UTF8Encoding $false))

    $printDir2 = Join-Path $dir2 'print'
    New-Item -ItemType Directory -Path $printDir2 -Force | Out-Null
    $frontPrint2 = "---`r`nlayout: exam_print`r`nexam_code: `"$code`"`r`nexam_path_prefix: exam2`r`ntitle: `"Exam $code - PDF`"`r`npermalink: /exam2/$code/print`r`n---`r`n"
    [System.IO.File]::WriteAllText((Join-Path $printDir2 "index.md"), $frontPrint2, (New-Object System.Text.UTF8Encoding $false))

    $count++
}

Write-Output "Generated $count exam pages (exam + exam2, with print pages)."
