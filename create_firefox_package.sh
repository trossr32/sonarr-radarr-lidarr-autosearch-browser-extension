#!/usr/bin/env bash

echo "###########################"
echo "# Building firefox package"
echo "###########################"
echo

mkdir -p dist-firefox
cp -rf src/* dist-firefox/
rm dist-firefox/manifest-chromium.json
mv dist-firefox/manifest-firefox.json dist-firefox/manifest.json

if ! command -v web-ext &> /dev/null
then
    echo "web-ext command could not be found, installing globally from npm"
    npm i -g web-ext    
fi

mkdir -p Publish
web-ext build -s dist-firefox/ -a Publish/ -o --filename "sonarr_radarr_lidarr_autosearch-firefox.xpi"
