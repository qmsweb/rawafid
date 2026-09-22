# Generates per-course data files and clean-URL pages for the study-plan tool:
#   assets/plans/<plan>/<CODE>.json          -> self-contained course data (fetched on demand)
#   tools/study-plan/<plan>/<CODE>/index.md  -> clean URL page: /tools/study-plan/<plan>/<CODE>
# Rerun after editing assets/plans/edu.json or assets/plans/aadab.json.
$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$plansDir = Join-Path $root 'assets\plans'
$pageRoot = Join-Path $root 'tools\study-plan'

# الخطط المعروضة في أداة الخطة (تطابق قائمة planSelector في التخطيط)
$plans = @('edu', 'aadab')
$planTitles = @{
    'edu'   = 'تخصص التربية في اللغة العربية'
    'aadab' = 'تخصص آداب اللغة العربية'
}

# تحويل JSON مع إبقاء الحروف العربية واضحة (متوافق مع PowerShell 5.1 و 7)
function ConvertTo-CleanJson($obj) {
    $json = $obj | ConvertTo-Json -Depth 10
    $json = [regex]::Replace($json, '\\u([0-9a-fA-F]{4})', { param($m) [char][Convert]::ToInt32($m.Groups[1].Value, 16) })
    return $json
}

# حقل مرتبط مختصر (اسم فقط) لكائن مقرر
function New-RelatedStub($course) {
    return [ordered]@{ id = $course.id; name = $course.name }
}

# كائن مقرر مختصر يحوي الحقول التي تحتاجها بطاقة المقرر داخل لوحة الاختيارات
function New-LightCourse($course) {
    $o = [ordered]@{}
    $o.id = $course.id
    $o.name = $course.name
    if ($null -ne $course.hours) { $o.hours = $course.hours }
    if ($course.cat) { $o.cat = $course.cat }
    $o.prereq = $course.prereq
    $o.coreq = $course.coreq
    if ($course.summary) { $o.summary = $course.summary }
    if ($course.hidden) { $o.hidden = $true }
    return $o
}

function Get-Ids($value) {
    if ([string]::IsNullOrWhiteSpace($value)) { return @() }
    return ($value -split ',') | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' }
}

$totalData = 0
$totalPages = 0

foreach ($plan in $plans) {
    $bulkFile = Join-Path $plansDir "$plan.json"
    if (-not (Test-Path -LiteralPath $bulkFile)) {
        Write-Warning "Plan file not found: $bulkFile"
        continue
    }
    $courses = Get-Content $bulkFile -Raw -Encoding UTF8 | ConvertFrom-Json

    $byId = @{}
    foreach ($c in $courses) { $byId[$c.id] = $c }

    # إعداد المجلدات (حذف القديم لإعادة التوليد النظيف)
    $planDataDir = Join-Path $plansDir $plan
    if (Test-Path -LiteralPath $planDataDir) { Remove-Item -LiteralPath $planDataDir -Recurse -Force }
    New-Item -ItemType Directory -Path $planDataDir -Force | Out-Null

    $planPageDir = Join-Path $pageRoot $plan
    if (Test-Path -LiteralPath $planPageDir) { Remove-Item -LiteralPath $planPageDir -Recurse -Force }
    New-Item -ItemType Directory -Path $planPageDir -Force | Out-Null

    $utf8 = New-Object System.Text.UTF8Encoding $false

    foreach ($course in $courses) {
        $code = $course.id

        # المتطلبات اللاحقة: المقررات التي يسأل عنها هذا المقرر ضمن متطلبها السابق
        $postreq = @()
        foreach ($other in $courses) {
            if ($other.id -eq $code) { continue }
            $prereqs = Get-Ids $other.prereq
            if ($prereqs -contains $code) { $postreq += $other.id }
        }
        $postreqValue = if ($postreq.Count -gt 0) { $postreq -join ', ' } else { $null }

        # المقررات المرتبطة (لحل الأسماء في صفحة المقرر المفردة دون جلب الخطة كاملة)
        $relatedIds = @()
        $relatedIds += (Get-Ids $course.prereq)
        $relatedIds += (Get-Ids $course.coreq)
        $relatedIds += $postreq
        $relatedIds = $relatedIds | Select-Object -Unique | Where-Object { $_ -ne $code }

        $isElectiveSlot = $code -match '^ELECTIVE\d+$'
        if ($isElectiveSlot) {
            # لوحة المقررات الاختيارية تحتاج بياناتها الكاملة لرسم البطاقات
            $related = @()
            foreach ($other in $courses) {
                if (($other.id -match '^ELECTIVE\d+$') -and ($other.id -ne $code)) {
                    $related += , (New-LightCourse $other)
                }
            }
        } else {
            $related = foreach ($rid in $relatedIds) {
                $rc = $byId[$rid]
                if ($rc) { New-RelatedStub $rc } else { [ordered]@{ id = $rid; name = $rid } }
            }
        }

        # 1) ملف بيانات المقرر (يُجلب وحده عند فتح رابط المقرر)
        $dataObj = [ordered]@{}
        $dataObj.id = $course.id
        $dataObj.name = $course.name
        if ($null -ne $course.hours) { $dataObj.hours = $course.hours }
        if ($course.cat) { $dataObj.cat = $course.cat }
        $dataObj.prereq = $course.prereq
        $dataObj.coreq = $course.coreq
        if ($course.year) { $dataObj.year = $course.year }
        if ($course.semester) { $dataObj.semester = $course.semester }
        if ($course.summary) { $dataObj.summary = $course.summary }
        if ($course.hidden) { $dataObj.hidden = $true }
        $dataObj.postreq = $postreqValue
        $dataObj.related = @($related)

        $dataJson = ConvertTo-CleanJson $dataObj
        $dataPath = Join-Path $planDataDir "$code.json"
        [System.IO.File]::WriteAllText($dataPath, $dataJson, $utf8)
        $totalData++

        # 2) صفحة الرابط النظيف /tools/study-plan/<plan>/<CODE>
        $pageDir = Join-Path $planPageDir $code
        New-Item -ItemType Directory -Path $pageDir -Force | Out-Null

        $name = $course.name
        $title = "$name - الخطة الدراسية"
        $ogTitle = "$name - الخطة الدراسية - روافد"
        $ogDesc = "تفاصيل مقرر $name ($code) ضمن $($_ = $planTitles[$plan]; $_): المتطلبات السابقة والمتزامنة والساعات المعتمدة."
        $permalink = "/tools/study-plan/$plan/$code"

        $front = "---`r`n"
        $front += "layout: study-plan`r`n"
        $front += "plan: $plan`r`n"
        $front += "code: `"$code`"`r`n"
        $front += "title: `"$title`"`r`n"
        $front += "og_title: `"$ogTitle`"`r`n"
        $front += "og_description: `"$ogDesc`"`r`n"
        $front += "permalink: $permalink`r`n"
        $front += "---`r`n"
        [System.IO.File]::WriteAllText((Join-Path $pageDir 'index.md'), $front, $utf8)
        $totalPages++
    }
}

Write-Output "Generated $totalData course data files and $totalPages course pages."
