# Generates /events/ pages (Jekyll collection: _events) from assets/calendar.json.
# Each event becomes a standalone page at /events/<slug>/ with a shareable URL.
# Rerun after editing assets/calendar.json.
$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$src = Join-Path $root 'assets\calendar.json'
$dest = Join-Path $root '_events'

if (Test-Path -LiteralPath $dest) {
    Remove-Item -LiteralPath $dest -Recurse -Force
}
New-Item -ItemType Directory -Path $dest -Force | Out-Null

function ConvertTo-YamlValue {
    param([string]$Value)
    if ([string]::IsNullOrEmpty($Value)) { return '""' }
    $v = $Value -replace '\\', '\\' -replace '"', '\"'
    return "`"$v`""
}

$events = Get-Content $src -Raw -Encoding UTF8 | ConvertFrom-Json
$count = 0

foreach ($ev in @($events)) {
    $date = [string]$ev.date
    if ([string]::IsNullOrWhiteSpace($date)) { continue }

    # المعرّف الفريد للحدث = تاريخه (التواريخ فريدة: أحد كل أسبوع)
    $slug = $date

    $title = ConvertTo-YamlValue ([string]$ev.title)
    $weekBadge = ConvertTo-YamlValue ([string]$ev.weekBadge)
    $semester = ConvertTo-YamlValue ([string]$ev.semester)
    $isHoliday = if ($ev.isHoliday -eq $true) { 'true' } else { 'false' }
    $details = [string]$ev.details

    $front = @(
        '---'
        "layout: event"
        "title: $title"
        "date: $date"
        "weekBadge: $weekBadge"
        "semester: $semester"
        "isHoliday: $isHoliday"
        "permalink: /events/$slug/"
        '---'
        ''
        $details
        ''
    ) -join "`r`n"

    [System.IO.File]::WriteAllText((Join-Path $dest "$slug.md"), $front, (New-Object System.Text.UTF8Encoding $false))
    $count++
}

Write-Output "Generated $count event pages."