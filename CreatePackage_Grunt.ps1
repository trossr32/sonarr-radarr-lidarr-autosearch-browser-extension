$root = (Get-Location).Path
$publish = Join-Path $root "Publish/"

# Create Publish folder or remove any existing release packages
if (!(Test-Path $publish)) {
	mkdir $publish | Out-Null
} else {
	Set-Location $publish

	Get-ChildItem -File -Recurse -ErrorAction SilentlyContinue | ForEach-Object { Remove-Item $_ }

	Set-Location $root
}

# build Firefox and Chromium packages
# xpi for Firefox, zip for Chromium
# web-ext is a devDependency, so `npx` resolves the locally installed binary
# (run `npm install` / `npm ci` first). No global install or PATH changes required.

$buildConfigs = @(
    @{ Path = "firefox"; Extension = "xpi" },
    @{ Path = "chromium"; Extension = "zip" }
)

foreach ($config in $buildConfigs) {
    $addon = Resolve-Path -LiteralPath "dist/$($config.Path)"
    npx web-ext build -s $addon -a $publish -o --filename "sonarr_radarr_lidarr_autosearch-{version}.$($config.Extension)"
}
