#!/usr/bin/env bash

echo "############################"
echo "# Building chromium package"
echo "############################"
echo

mkdir -p dist-chromium
cp -rf src/* dist-chromium/
rm dist-chromium/manifest-firefox.json
mv dist-chromium/manifest-chromium.json dist-chromium/manifest.json

mkdir -p Publish
zip Publish/sonarr-radarr-lidarr-autosearch-chromium.zip -r dist-chromium/
