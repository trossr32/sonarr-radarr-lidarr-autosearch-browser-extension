param([string]$BrowserType)

$publish = Join-Path (Get-Location).Path "Publish/"
		
If (!(Test-path $publish)) {
	mkdir $publish
}

switch ($BrowserType) {
	"Chromium" {
		$extension = Resolve-Path -LiteralPath "ChromiumExtension/"
		$zip = Join-Path $publish "sonarr-radarr-lidarr-autosearch-chromium.zip"

		print
		
		If (Test-path $zip) {
			Remove-item $zip
		}
		
		Add-Type -assembly "system.io.compression.filesystem"
		
		[io.compression.zipfile]::CreateFromDirectory($extension, $zip) 
	}
	"Firefox" {
		$addon = Resolve-Path -LiteralPath "FirefoxAddOn/"
		
		npm i -g web-ext

		web-ext build -s $addon -a $publish -o --filename "sonarr_radarr_lidarr_autosearch-firefox-{version}.zip"
	}
}