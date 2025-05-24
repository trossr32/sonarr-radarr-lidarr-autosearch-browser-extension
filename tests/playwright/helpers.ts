/**
 * Get the expected Sonarr URL for a given add new path query
 * @param query 
 * @returns expected Sonarr URL
 */
export const getExpectedSonarrUrl = (query: string): string => `http://my.sonarr-url.domain:8989/add/new/${query}`;

/**
 * Get the expected Radarr URL for a given add new path query
 * @param query
 * @returns expected Radarr URL
 */
export const getExpectedRadarrUrl = (query: string): string => `http://my.radarr-url.domain:7878/add/new/${query}`;

/**
 * Get the expected Lidarr URL for a given search query
 * @param query
 * @returns expected Lidarr URL
 */
export const getExpectedLidarrUrl = (query: string): string => `http://my.lidarr-url.domain:8686/add/search/${query}`;

/**
 * Get the expected Readarr URL for a given search query
 * @param query
 * @returns expected Readarr URL
 */
export const getExpectedReadarrUrl = (query: string): string => `http://my.readarr-url.domain:8787/add/search/${query}`;