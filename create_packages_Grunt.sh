#!/usr/bin/env bash

## This is just a guess at what this file should look like based on aommm's existing scripts, 
## see create-packages_Grunt.ps1 for working Powershell script that this should emulate

echo "###########################"
echo "# Building firefox package"
echo "###########################"
echo

if ! command -v web-ext &> /dev/null
then
    echo "web-ext command could not be found, installing globally from npm"
    npm i -g web-ext    
fi

mkdir -p Publish

web-ext build -s dist/ -a Publish/ -o --filename "sonarr_radarr_lidarr_autosearch-{version}.xpi"

echo "###########################"
echo "# Building chrome package"
echo "###########################"
echo

## This would be better as a copy of the xpi and simply renamed to have an extension of .zip, but
## I don't really know what I'm doing in .sh files ¯\_(ツ)_/¯

web-ext build -s dist/ -a Publish/ -o --filename "sonarr_radarr_lidarr_autosearch-{version}.zip"