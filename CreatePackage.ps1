$root = (Get-Location).Path
$publish = Join-Path (Get-Location).Path "Publish/"
		
# Create Publish folder or remove any existing release packages
if (!(Test-path $publish)) {
	mkdir $publish
} else {
	Set-Location $publish

	Get-Childitem -File -Recurse -ErrorAction SilentlyContinue | ForEach-Object { Remove-Item $_ }

	Set-Location $root
}

# build Firefox add on
$addon = Resolve-Path -LiteralPath "FirefoxAddOn/"
	
npm i -g web-ext

web-ext build -s $addon -a $publish -o --filename "sonarr_radarr_lidarr_autosearch-firefox-{version}.zip"

Set-Location $publish

$zip = Get-Childitem -Include *firefox* -File -Recurse -ErrorAction SilentlyContinue

Copy-Item -Path $zip -Destination ($zip.FullName -replace "zip", "xpi") -Force

# build Chrome zip
Set-Location $root

# get package version from Firefox zip
$version = ''
if ($zip -match '.+(?<Version>\d+\.\d+\.\d+\.\d+)\.zip') {
	$version = $Matches.Version
}

$extension = Resolve-Path -LiteralPath "ChromiumExtension/"
$zip = Join-Path $publish "sonarr-radarr-lidarr-autosearch-chromium-$version.zip"

Add-Type -assembly "system.io.compression.filesystem"

[io.compression.zipfile]::CreateFromDirectory($extension, $zip)