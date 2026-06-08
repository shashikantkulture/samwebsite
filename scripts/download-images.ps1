# Download all product images to public/products/
$outputDir = "e:\SAM WEBSITE\public\products"
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

$urls = Get-Content "e:\SAM WEBSITE\scripts\image-urls.txt" | Where-Object { $_ -match 'https?://' }

$success = 0
$failed = 0
$mapping = @{}

foreach ($url in $urls) {
    # Extract filename from URL (before any query string)
    $uri = [System.Uri]$url
    $filename = [System.IO.Path]::GetFileName($uri.LocalPath)
    
    # Sanitize filename - remove special chars
    $safeFilename = $filename -replace '[?&=]', '_'
    $destPath = Join-Path $outputDir $safeFilename

    if (Test-Path $destPath) {
        Write-Host "SKIP (exists): $safeFilename"
        $mapping[$url] = "/products/$safeFilename"
        $success++
        continue
    }

    try {
        $wc = New-Object System.Net.WebClient
        $wc.Headers.Add("User-Agent", "Mozilla/5.0")
        $wc.DownloadFile($url, $destPath)
        $size = (Get-Item $destPath).Length
        Write-Host "OK [$([math]::Round($size/1024))KB]: $safeFilename"
        $mapping[$url] = "/products/$safeFilename"
        $success++
    } catch {
        Write-Host "FAIL: $url - $_"
        $mapping[$url] = $url  # keep original if download fails
        $failed++
    }
}

Write-Host ""
Write-Host "=== DONE: $success downloaded, $failed failed ==="

# Output mapping as JSON for the update script
$mapping | ConvertTo-Json | Out-File "e:\SAM WEBSITE\scripts\image-mapping.json" -Encoding UTF8
Write-Host "Mapping saved to scripts/image-mapping.json"
