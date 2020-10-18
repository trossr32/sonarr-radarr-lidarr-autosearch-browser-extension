# docker run -d --name=sonarr-preview -e PUID=1000 -e PGID=1000 -e TZ=Europe/London -p 8989:8989 linuxserver/sonarr:preview
# docker run -d --name=radarr-nightly -e PUID=1000 -e PGID=1000 -e TZ=Europe/London -p 7878:7878 linuxserver/radarr:nightly
# docker run -d --name=lidarr-nightly -e PUID=1000 -e PGID=1000 -e TZ=Europe/London -p 8686:8686 linuxserver/lidarr:nightly

# docker run -d --name=sonarr-latest -e PUID=1000 -e PGID=1000 -e TZ=Europe/London -p 8989:8989 linuxserver/sonarr:latest
# docker run -d --name=radarr-latest -e PUID=1000 -e PGID=1000 -e TZ=Europe/London -p 7878:7878 linuxserver/radarr:latest
# docker run -d --name=lidarr-latest -e PUID=1000 -e PGID=1000 -e TZ=Europe/London -p 8686:8686 linuxserver/lidarr:latest

# docker container stop sonarr-preview
# docker container stop radarr-nightly
# docker container stop lidarr-nightly

# docker container stop sonarr-latest
# docker container stop radarr-latest
# docker container stop lidarr-latest

# docker container start sonarr-preview
# docker container start radarr-nightly
# docker container start lidarr-nightly

# docker container start sonarr-latest
# docker container start radarr-latest
# docker container start lidarr-latest