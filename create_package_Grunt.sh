#!/usr/bin/env bash
set -euo pipefail

# Mirrors CreatePackage_Grunt.ps1 for non-Windows release builds.
# web-ext is a devDependency, so `npx` resolves the locally installed binary
# (run `npm install` / `npm ci` first). No global install or PATH changes required.

root="$(pwd)"
publish="$root/Publish"

# Create Publish folder or clear any existing release packages
mkdir -p "$publish"
find "$publish" -type f -delete

# build Firefox (xpi) and Chromium (zip) packages from their respective dist folders
build_package() {
    local path="$1"
    local extension="$2"

    echo "###########################"
    echo "# Building $path package"
    echo "###########################"
    echo

    npx web-ext build -s "$root/dist/$path" -a "$publish" -o --filename "sonarr_radarr_lidarr_autosearch-{version}.$extension"
}

build_package firefox xpi
build_package chromium zip
