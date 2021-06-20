$root = (Get-Location).Path
$publish = Join-Path (Get-Location).Path "Publish/"
$src = Join-Path (Get-Location).Path "src/"
		
# Create Publish directory or remove any existing release packages
if (!(Test-path $publish)) {
	mkdir $publish
} else {
	Set-Location $publish

	Get-Childitem -File -Recurse -ErrorAction SilentlyContinue | 
		ForEach-Object { 
			Remove-Item $_ 
		}

	Set-Location $root
}

# Build dist directories from src and create publish packages
@('firefox', 'chromium') |
	ForEach-Object {
		# create dist-instance dir or remove contents if already exists
		$path = Join-Path (Get-Location).Path "dist-$_/"

		if (!(Test-path $path)) {
			mkdir $path
		} else {
			Set-Location $path
		
			Get-Childitem -Force -Recurse -ErrorAction SilentlyContinue | ForEach-Object {  Remove-Item $_ -Force -Recurse }
		}
		
		# copy files from src dir
		Copy-Item -Path "$src\*" -Destination $path -Recurse

		# rename instance manifest to manifest.json
		Rename-Item -Path "$path\manifest-$_.json" -NewName "manifest.json"

		# delete other instance manifest files
		Remove-Item 'manifest-*.json'

		# build packages based on instance type. chromium dist relies on firefox package file name version so run firefox first
		switch ($_) {
			'firefox' { 
				# npm install and run web-ext
				npm i -g web-ext

				web-ext build -s $path -a $publish -o --filename "sonarr_radarr_lidarr_autosearch-firefox-{version}.zip"

				Set-Location $publish

				$zip = Get-Childitem -Include *firefox* -File -Recurse -ErrorAction SilentlyContinue

				Copy-Item -Path $zip -Destination ($zip.FullName -replace "zip", "xpi") -Force
			}

			'chromium' { 
				# get package version from Firefox zip
				Set-Location $publish

				$version = ''

				Get-Childitem -Include *firefox* -File -Recurse -ErrorAction SilentlyContinue | 
					Where-Object { $_ -match '.+zip' } | 
						ForEach-Object { 
							if ($_ -match '.+(?<Version>\d+\.\d+\.\d+\.\d+)\.zip') { 
								$version = $Matches.Version 
							} 
						}

				# create a zip
				$zip = Join-Path $publish "sonarr-radarr-lidarr-autosearch-chromium-$version.zip"

				Add-Type -assembly "system.io.compression.filesystem"

				[io.compression.zipfile]::CreateFromDirectory($path, $zip)
			}
		}

		Set-Location $root
	}
