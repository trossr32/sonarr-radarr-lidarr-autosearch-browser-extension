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
	
# install web-ext if not already installed
try {
	if (-Not (Get-Command web-ext)) { 
		npm i -g web-ext
	}
} catch {
	npm i -g web-ext
}

# build Firefox add on

$buildConfigs = @(
    @{ Path = "firefox"; Extension = "xpi" },
    @{ Path = "chromium"; Extension = "zip" }
)

foreach ($config in $buildConfigs) {
    $addon = Resolve-Path -LiteralPath "dist/$($config.Path)"
    web-ext build -s $addon -a $publish -o --filename "sonarr_radarr_lidarr_autosearch-{version}.$($config.Extension)"
}

# Set-Location $publish

# $zip = Get-Childitem -Include *zip* -File -Recurse -ErrorAction SilentlyContinue

# Copy-Item -Path $zip -Destination ($zip.FullName -replace "zip", "xpi") -Force