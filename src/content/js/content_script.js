//  var integrations = [
//         /* sonarr imdb */
//         {
//             id: 'imdb',
//             rules: [
//                 {
//                     siteId: 'sonarr',
//                     match: {
//                         pattern: /(tv_show|other)/i,
//                         operator: 'eq'
//                     }
//                 }
//             ],
//             search: {
//                 containerSelector: 'link[rel="canonical"]',
//                 selectorType: 'href',
//                 modifiers: [
//                     {
//                         type: 'regex-match',
//                         pattern: /(?<search>tt\d{5,10})/i
//                     }, {
//                         type: 'prepend',
//                         var: 'imdb:'
//                     }
//                 ]
//             },
//             match: {
//                 terms: ['imdb.com'],
//                 containerSelector: 'meta[property="og:type"]',
//                 attribute: 'content',
//             },
//             icon: {
//                 containerSelector: 'h1',
//                 locator: 'prepend',
//                 imgStyles: 'width: 35px; margin: -8px 10px 0 0;'
//             }
//         },
//         /* radarr imdb */
//         {
//             id: 'imdb',
//             rules: [
//                 {
//                     siteId: 'radarr',
//                     match: {
//                         pattern: /(movie|other)/i,
//                         operator: 'eq'
//                     }
//                 }
//             ],
//             search: {
//                 containerSelector: 'link[rel="canonical"]',
//                 selectorType: 'href',
//                 modifiers: [
//                     {
//                         type: 'regex-match',
//                         pattern: /(?<search>tt\d{5,10})/i
//                     }, {
//                         type: 'prepend',
//                         var: 'imdb:'
//                     }
//                 ]
//             },
//             match: {
//                 terms: ['imdb.com'],
//                 containerSelector: 'meta[property="og:type"]',
//                 attribute: 'content',
//             },
//             icon: {
//                 containerSelector: 'h1',
//                 locator: 'prepend',
//                 imgStyles: 'width: 35px; margin: -8px 10px 0 0;'
//             }
//         },
//         // tmdb id doesn't work with sonarr
//         {
//             id: 'tmdb',
//             rules: [
//                 {
//                     siteId: 'sonarr',
//                     match: {
//                         pattern: /themoviedb\.org\/tv\//i,
//                         operator: 'eq'
//                     }
//                 }
//             ],
//             search: {
//                 containerSelector: '.header .title h2 a',
//                 selectorType: 'text',
//                 modifiers: []
//             },
//             match: {
//                 terms: ['themoviedb.org'],
//                 containerSelector: 'link[rel="canonical"]',
//                 attribute: 'href'
//             },
//             icon: {
//                 containerSelector: '.header .title h2',
//                 locator: 'prepend',
//                 imgStyles: 'width:1em; height:1em; display:inline-block; vertical-align:-0.15em; margin:0 .4em 0 0;'
//             }
//         },
//         // radarr works with tmdb id
//         {
//             id: 'tmdb',
//             rules: [
//                 {
//                     siteId: 'radarr',
//                     match: {
//                         pattern: /themoviedb\.org\/movie\//i,
//                         operator: 'eq'
//                     }
//                 }
//             ],
//             search: {
//                 containerSelector: 'link[rel="canonical"]',
//                 selectorType: 'href',
//                 modifiers: [
//                     {
//                         type: 'regex-match',
//                         pattern: /\/(?<search>\d{2,10})-/i
//                     }, {
//                         type: 'prepend',
//                         var: 'tmdb:'
//                     }
//                 ]
//             },
//             match: {
//                 terms: ['themoviedb.org'],
//                 containerSelector: 'link[rel="canonical"]',
//                 attribute: 'href'
//             },
//             icon: {
//                 containerSelector: '.header .title h2',
//                 locator: 'prepend',
//                 imgStyles: 'width:1em; height:1em; display:inline-block; vertical-align:-0.15em; margin:0 .4em 0 0;'
//             }
//         },
//         // tvdb for sonarr, uses tvdb:xxxxx type search
//         {
//             id: 'tvdb',
//             rules: [
//                 {
//                     siteId: 'sonarr',
//                     match: {
//                         pattern: /thetvdb\.com\sseries/i,
//                         operator: 'eq'
//                     }
//                 }
//             ],
//             search: {
//                 containerSelector: '#series_basic_info > ul > li:first-of-type > span',
//                 selectorType: 'text',
//                 modifiers: [
//                     {
//                         type: 'prepend',
//                         var: 'tvdb:'
//                     }
//                 ]
//             },
//             match: {
//                 terms: ['thetvdb.com'],
//                 containerSelector: '#series_basic_info',
//                 attribute: 'text'
//             },
//             icon: {
//                 containerSelector: '#series_title',
//                 locator: 'prepend',
//                 imgStyles: 'width: 25px; margin: -8px 10px 0 0;'
//             }
//         },
//         // tvdb for radarr, uses text search as id search not working as tested (v0.9)
//         {
//             id: 'tvdb',
//             rules: [
//                 {
//                     siteId: 'radarr',
//                     match: {
//                         pattern: /thetvdb\.com\smovie/i,
//                         operator: 'eq'
//                     }
//                 }
//             ],
//             search: {
//                 containerSelector: '#series_title',
//                 selectorType: 'text',
//                 modifiers: []
//             },
//             match: {
//                 terms: ['thetvdb.com'],
//                 containerSelector: '#series_basic_info',
//                 attribute: 'text'
//             },
//             icon: {
//                 containerSelector: '#series_title',
//                 locator: 'prepend',
//                 imgStyles: 'width: 25px; margin: -8px 10px 0 0;'
//             }
//         },
//         // trakt for sonarr, uses tvdb id
//         // instance for tv series view
//         {
//             id: 'trakt',
//             deferMs: 3000,
//             rules: [
//                 {
//                     siteId: 'sonarr',
//                     match: {
//                         pattern: /video\.tv_show/i,
//                         operator: 'eq'
//                     }
//                 }
//             ],
//             search: {
//                 containerSelector: '.external > li > a[id="external-link-imdb"]',
//                 selectorType: 'href',
//                 modifiers: [
//                     {
//                         type: 'regex-match',
//                         pattern: /(?<search>tt\d{5,10})/i
//                     }, {
//                         type: 'prepend',
//                         var: 'imdb:'
//                     }
//                 ]
//             },
//             match: {
//                 terms: ['trakt.tv/shows'],
//                 containerSelector: 'meta[property="og:type"]',
//                 attribute: 'content'
//             },
//             icon: {
//                 containerSelector: '.container h1',
//                 locator: 'prepend',
//                 imgStyles: 'width: 25px; margin: -8px 10px 0 0;'
//             }
//         },
//         // instance for tv series group view
//         {
//             id: 'trakt',
//             deferMs: 3000,
//             defaultSite: 'sonarr',
//             search: {
//                 containerSelector: '.titles-link > h3',
//                 selectorType: 'text',
//                 modifiers: []
//             },
//             match: {
//                 terms: [
//                     'trakt.tv/shows/trending',
//                     'trakt.tv/shows/popular',
//                     'trakt.tv/shows/favorited/weekly',
//                     'trakt.tv/shows/watched/weekly',
//                     'trakt.tv/shows/collected/weekly',
//                     'trakt.tv/shows/anticipated'
//                 ],
//             },
//             icon: {
//                 containerSelector: '.quick-icons > .actions',
//                 locator: 'append',
//                 imgStyles: 'width: 25px; margin: 0 0 -4px 10px;'
//             }
//         },
//         // trakt for radarr, uses tmdb id
//         {
//             id: 'trakt',
//             deferMs: 3000,
//             rules: [
//                 {
//                     siteId: 'radarr',
//                     match: {
//                         pattern: /video\.movie/i,
//                         operator: 'eq'
//                     }
//                 }
//             ],
//             search: {
//                 containerSelector: '.external > li > a[id="external-link-tmdb"]',
//                 selectorType: 'href',
//                 modifiers: [
//                     {
//                         type: 'regex-match',
//                         pattern: /\/(?<search>\d{2,10})/i
//                     }, {
//                         type: 'prepend',
//                         var: 'tmdb:'
//                     }
//                 ]
//             },
//             match: {
//                 terms: ['trakt.tv/movies'],
//                 containerSelector: 'meta[property="og:type"]',
//                 attribute: 'content'
//             },
//             icon: {
//                 containerSelector: '.container h1',
//                 locator: 'prepend',
//                 imgStyles: 'width: 25px; margin: -8px 10px 0 0;'
//             }
//         },
//         // instance for trakt movies group view
//         {
//             id: 'trakt',
//             deferMs: 3000,
//             defaultSite: 'radarr',
//             search: {
//                 containerSelector: '.titles-link > h3',
//                 selectorType: 'text',
//                 modifiers: []
//             },
//             match: {
//                 terms: [
//                     'trakt.tv/movies/trending',
//                     'trakt.tv/movies/popular',
//                     'trakt.tv/movies/favorited/weekly',
//                     'trakt.tv/movies/watched/weekly',
//                     'trakt.tv/movies/collected/weekly',
//                     'trakt.tv/movies/anticipated',
//                     'trakt.tv/movies/boxoffice'
//                 ]
//             },
//             icon: {
//                 containerSelector: '.quick-icons > .actions',
//                 locator: 'append',
//                 imgStyles: 'width: 23px; margin: 0 0 2px 10px;'
//             }
//         },
//         {
//             id: 'tvmaze',
//             defaultSite: 'sonarr',
//             search: {
//                 containerSelector: 'h1.show-for-medium',
//                 selectorType: 'text',
//                 modifiers: []
//             },
//             match: {
//                 terms: ['tvmaze.com/shows/']
//             },
//             icon: {
//                 containerSelector: 'h1.show-for-medium',
//                 locator: 'prepend',
//                 imgStyles: 'width: 32px; margin: -8px 10px 0 0;'
//             }
//         },
//         {
//             id: 'tvmaze',
//             defaultSite: 'sonarr',
//             search: {
//                 containerSelector: 'div.show-name',
//                 selectorType: 'text',
//                 modifiers: []
//             },
//             match: {
//                 terms: ['tvmaze.com/countdown']
//             },
//             icon: {
//                 containerSelector: 'div.show-name',
//                 locator: 'prepend',
//                 imgStyles: 'width: 24px; margin: -8px 10px 0 0;'
//             }
//         },
//         {
//             id: 'musicbrainz',
//             defaultSite: 'lidarr',
//             search: {
//                 containerSelector: '.artistheader > h1 > a',
//                 selectorType: 'href',
//                 modifiers: [
//                     {
//                         type: 'replace',
//                         from: '/artist/',
//                         to: 'lidarr:'
//                     }
//                 ]
//             },
//             match: {
//                 terms: ['musicbrainz.org/artist']
//             },
//             icon: {
//                 containerSelector: '.artistheader > h1',
//                 locator: 'prepend',
//                 imgStyles: 'width: 26px; margin: 0 5px -4px 0;'
//             }
//         },
//         { 
//             id: 'musicbrainz', 
//             defaultSite: 'lidarr', 
//             search: { 
//                 containerSelector: '.rgheader > h1 > a', 
//                 selectorType: 'href', 
//                 modifiers: [ 
//                     { 
//                         type: 'replace', 
//                         from: '/release-group/', 
//                         to: 'lidarr:' 
//                     } 
//                 ] 
//             }, 
//             match: { 
//                 terms: ['musicbrainz.org/release-group']
//             }, 
//             icon: { 
//                 containerSelector: '.rgheader > h1', 
//                 locator: 'prepend', 
//                 imgStyles: 'width: 26px; margin: 0 5px -4px 0;' 
//             } 
//         }, 
//         { 
//             id: 'musicbrainz', 
//             defaultSite: 'lidarr', 
//             search: { 
//                 containerSelector: '.releaseheader > h1 > a', 
//                 selectorType: 'href', 
//                 modifiers: [ 
//                     { 
//                         type: 'replace', 
//                         from: '/release/', 
//                         to: 'lidarr:' 
//                     } 
//                 ] 
//             }, 
//             match: { 
//                 terms: ['musicbrainz.org/release'] 
//             }, 
//             icon: { 
//                 containerSelector: '.releaseheader > h1', 
//                 locator: 'prepend', 
//                 imgStyles: 'width: 26px; margin: 0 5px -4px 0;' 
//             } 
//         },
//         {
//             id: 'letterboxd',
//             defaultSite: 'radarr',
//             search: {
//                 containerSelector: 'body',
//                 selectorType: 'data-tmdb-id',
//                 modifiers: [
//                     {
//                         type: 'prepend',
//                         var: 'tmdb:'
//                     }
//                 ]
//             },
//             match: {
//                 terms: ['letterboxd.com/film/']
//             },
//             icon: {
//                 containerSelector: '.details > h1',
//                 locator: 'prepend',
//                 imgStyles: 'width: 25px; margin: 8px 10px 0 0; float: left;'
//             }
//         },
//         {
//             id: 'tvcalendar',
//             defaultSite: 'sonarr',
//             search: {
//                 containerSelector: 'p[data-episode] > a:first-of-type',
//                 selectorType: 'text',
//                 modifiers: []
//             },
//             match: {
//                 terms: ['pogdesign.co.uk/cat']
//             },
//             icon: {
//                 containerSelector: 'p[data-episode]',
//                 locator: 'append',
//                 imgStyles: 'width:18px; height:18px; display:inline-block; vertical-align:middle; margin:0 6px 0 6px;'
//             }
//         },
//         {
//             id: 'rottentomatoes',
//             defaultSite: 'radarr',
//             search: {
//                 containerSelector: 'meta[property="og:title"]',
//                 selectorType: 'content',
//                 modifiers: [
//                     {
//                         type: 'replace',
//                         from: / \| Rotten Tomatoes/i,
//                         to: ''
//                     }
//                 ]
//             },
//             match: {
//                 terms: ['rottentomatoes.com/m']
//             },
//             icon: {
//                 containerSelector: '#hero-wrap [context="heading"]',
//                 locator: 'prepend',
//                 imgStyles: 'width: 30px; margin: 0 10px 0 0;'
//             }
//         },
//         {
//             id: 'rottentomatoes',
//             defaultSite: 'sonarr',
//             search: {
//                 containerSelector: 'meta[property="og:title"]',
//                 selectorType: 'content',
//                 modifiers: [
//                     {
//                         type: 'replace',
//                         from: / \| Rotten Tomatoes/i,
//                         to: ''
//                     }
//                 ]
//             },
//             match: {
//                 terms: ['rottentomatoes.com/tv']
//             },
//             icon: {
//                 containerSelector: '#hero-wrap [context="heading"]',
//                 locator: 'prepend',
//                 imgStyles: 'width: 30px; margin: 0 10px 0 0;'
//             }
//         },
//         {
//             id: 'metacritic',
//             rules: [
//                 {
//                     siteId: 'sonarr',
//                     match: {
//                         pattern: /type=tv/i,
//                         operator: 'eq'
//                     }
//                 },
//                 {
//                     siteId: 'radarr',
//                     match: {
//                         pattern: /type=movie/i,
//                         operator: 'eq'
//                     }
//                 }
//             ],
//             search: {
//                 containerSelector: 'meta[property="og:title"]',
//                 selectorType: 'content',
//                 modifiers: [
//                     {
//                         type: 'replace',
//                         from: ' reviews',
//                         to: ''
//                     }
//                 ]
//             },
//             match: {
//                 terms: ['metacritic.com'],
//                 containerSelector: 'meta[name="adtags"]',
//                 attribute: 'content'
//             },
//             icon: {
//                 containerSelector: 'div[class*="productHero_title"] > :last-child',
//                 locator: 'prepend',
//                 imgStyles: 'width: 32px; margin: 0px 10px 0 0;'
//             }
//         },
//         // simkl tv
//         {
//             id: 'simkl',
//             deferMs: 1000,
//             defaultSite: 'sonarr',
//             search: {
//                 containerSelector: 'h1',
//                 selectorType: 'text',
//                 modifiers: []
//             },
//             match: {
//                 terms: ['simkl.com/tv'],
//             },
//             icon: {
//                 containerSelector: 'td.SimklTVDetailPoster div:nth-of-type(1)',
//                 wrapLinkWithContainer: '<div style="position: absolute; top: 5px; left: 5px; width: 50px; z-index: 1;"></div>',
//                 locator: 'prepend',
//                 imgStyles: 'width: 40px;'
//             }
//         },
//         // simkl tv calendar
//         {
//             id: 'simkl',
//             //deferMs: 1000,
//             defaultSite: 'sonarr',
//             search: {
//                 containerSelector: 'table.SimklTVCalendarDayList > tbody > tr > td > div > div.SimklTVCalendarDayListLink:nth-of-type(1) > a',
//                 selectorType: 'text',
//                 modifiers: []
//             },
//             match: {
//                 terms: ['simkl.com/tv/calendar'],
//             },
//             icon: {
//                 containerSelector: 'table.SimklTVCalendarDayList > tbody > tr > td > div > div.SimklTVCalendarDayListLink:nth-of-type(1)',
//                 wrapLinkWithContainer: '<section style="float: left; margin: 5px 10px 0 0"></section>',
//                 locator: 'prepend',
//                 imgStyles: 'width: 12px;'
//             }
//         },
//         // simkl movies
//         {
//             id: 'simkl',
//             deferMs: 1000,
//             defaultSite: 'radarr',
//             search: {
//                 containerSelector: 'h1',
//                 selectorType: 'text',
//                 modifiers: []
//             },
//             match: {
//                 terms: ['simkl.com/movie']
//             },
//             icon: {
//                 containerSelector: 'td.SimklTVDetailPoster div:nth-of-type(1)',
//                 wrapLinkWithContainer: '<div style="position: absolute; top: 5px; left: 5px; width: 50px; z-index: 1;"></div>',
//                 locator: 'prepend',
//                 imgStyles: 'width: 40px;'
//             }
//         },
//         // iptorrent tv
//         {
//             id: 'iptorrents',
//             defaultSite: 'sonarr',
//             search: {
//                 containerSelector: 'b.MovieTitle > a',
//                 selectorType: 'text',
//                 modifiers: []
//             },
//             match: {
//                 terms: ['iptorrents.com/tv']
//             },
//             icon: {
//                 containerSelector: 'b.MovieTitle',
//                 wrapLinkWithContainer: '<div></div>',
//                 locator: 'append',
//                 imgStyles: 'width: 20px; margin: 5px 0 0 0;'
//             }
//         },
//         // iptorrent movies
//         {
//             id: 'iptorrents',
//             defaultSite: 'radarr',
//             search: {
//                 containerSelector: 'b.MovieTitle > a',
//                 selectorType: 'href',
//                 modifiers: [
//                     {
//                         type: 'regex-match',
//                         pattern: /(?<search>tt\d{5,10})/i
//                     }, {
//                         type: 'prepend',
//                         var: 'imdb:'
//                     }
//                 ]
//             },
//             match: {
//                 terms: ['iptorrents.com/movies']
//             },
//             icon: {
//                 containerSelector: 'b.MovieTitle',
//                 wrapLinkWithContainer: '<div></div>',
//                 locator: 'append',
//                 imgStyles: 'width: 20px; margin: 5px 0 0 0;'
//             }
//         },
//         {
//             id: 'lastfm',
//             defaultSite: 'lidarr',
//             search: {
//                 containerSelector: '.header-new-title',
//                 selectorType: 'text',
//                 modifiers: []
//             },
//             match: {
//                 terms: ['last.fm/music']
//             },
//             icon: {
//                 containerSelector: '.header-new-title',
//                 locator: 'prepend',
//                 imgStyles: 'width: 35px; margin: 0 10px 6px 0;'
//             }
//         },
//         {
//             id: 'lastfm',
//             defaultSite: 'lidarr',
//             search: {
//                 containerSelector: '.header-new-crumb > span',
//                 selectorType: 'text',
//                 modifiers: []
//             },
//             match: {
//                 terms: ['last.fm/music']
//             },
//             icon: {
//                 containerSelector: '.header-new-crumb > span',
//                 locator: 'prepend',
//                 imgStyles: 'width: 25px; margin: 0 10px 6px 0;'
//             }
//         },
//         // allocine sonarr
//         {
//             id: 'allocine',
//             defaultSite: 'sonarr',
//             search: {
//                 containerSelector: 'meta[property="og:title"]',
//                 selectorType: 'content',
//                 modifiers: 
// 				[
// 					{
// 						type: 'replace',
// 						from: 'critiques de la série ',
// 						to: ''
// 					},
// 					{
// 						type: 'replace',
// 						from: 'les saisons de ',
// 						to: ''
// 					},
// 					{
// 						type: 'replace',
// 						from: 'casting ',
// 						to: ''
// 					},
// 					{
// 						type: 'replace',
// 						from: 'actus de la série ',
// 						to: ''
// 					},
// 					{
// 						type: 'replace',
// 						from: 'vidéos ',
// 						to: ''
// 					},
// 					{
// 						type: 'replace',
// 						from: ' en streaming',
// 						to: ''
// 					},
// 					{
// 						type: 'replace',
// 						from: ' en vod',
// 						to: ''
// 					}
// 				]
//             },
//             where: [
//                 {
//                     selector: 'meta[property="og:type"]',
//                     attribute: 'content',
//                     operator: 'eq',
//                     value: 'video.tv_show'
//                 }
//             ],
//             match: {
//                 terms: ['allocine.fr/series']
//             },
//             icon: {
//                 containerSelector: '.titlebar-page .titlebar-title',
//                 locator: 'prepend',
//                 imgStyles: 'width: 32px; margin: -8px 10px 0 0;'
//             }
//         },
//         // allocine radarr
//         {
//             id: 'allocine',
//             defaultSite: 'radarr',
//             search: {
//                 containerSelector: 'meta[property="og:title"]',
//                 selectorType: 'content',
//                 modifiers: 
// 				[
// 					{
// 						type: 'replace',
// 						from: 'avis sur le film ',
// 						to: ''
// 					},
// 					{
// 						type: 'replace',
// 						from: 'séances ',
// 						to: ''
// 					},
// 					{
// 						type: 'replace',
// 						from: 'actus du film ',
// 						to: ''
// 					},
// 					{
// 						type: 'replace',
// 						from: 'bande-annonce vo ',
// 						to: ''
// 					},
// 					{
// 						type: 'replace',
// 						from: 'tout le casting du film ',
// 						to: ''
// 					},
// 					{
// 						type: 'replace',
// 						from: 'avis sur le film ',
// 						to: ''
// 					},
// 					{
// 						type: 'replace',
// 						from: ': les critiques presse',
// 						to: ''
// 					},
// 					{
// 						type: 'replace',
// 						from: 'photos et affiches du film ',
// 						to: ''
// 					},
// 					{
// 						type: 'replace',
// 						from: 'les secrets de tournage du film ',
// 						to: ''
// 					},
// 					{
// 						type: 'replace',
// 						from: 'les films similaires à ',
// 						to: ''
// 					}
					
// 				]
//             },
//             where: [
//                 {
//                     selector: 'meta[property="og:type"]',
//                     attribute: 'content',
//                     operator: 'eq',
//                     value: 'video.movie'
//                 }
//             ],
//             match: {
//                 terms: ['allocine.fr/film']
//             },
//             icon: {
//                 containerSelector: '.titlebar-page .titlebar-title',
//                 locator: 'prepend',
//                 imgStyles: 'width: 32px; margin: -2px 10px 0 0;'
//             }
//         },
//         // senscritique sonarr
//         {
//             id: 'senscritique',
//             defaultSite: 'sonarr',
//             search: {
//                 containerSelector: 'h1',
//                 selectorType: 'title',
//                 modifiers: []
//             },
//             match: {
//                 terms: ['senscritique.com/serie']
//             },
//             icon: {
//                 containerSelector: 'h1',
//                 locator: 'prepend',
//                 imgStyles: 'width: 30px; margin: 0 10px 0 0;'
//             }
//         },
//         // senscritique radarr
//         {
//             id: 'senscritique',
//             defaultSite: 'radarr',
//             search: {
//                 containerSelector: 'h1',
//                 selectorType: 'title',
//                 modifiers: []
//             },
//             match: {
//                 terms: ['senscritique.com/film']
//             },
//             icon: {
//                 containerSelector: 'h1',
//                 locator: 'prepend',
//                 imgStyles: 'width: 30px; margin: 0 10px 0 0;'
//             }
//         },
//         // betaseries sonarr
//         {
//             id: 'betaseries',
//             defaultSite: 'sonarr',
//             search: {
//                 containerSelector: 'h1[class^="blockInformations__title"]',
//                 selectorType: 'text',
//                 modifiers: []
//             },
//             where: [
//                 {
//                     selector: 'meta[property="og:type"]',
//                     attribute: 'content',
//                     operator: 'eq',
//                     value: 'video.tv_show'
//                 }
//             ],
//             match: {
//                 terms: [
//                     'betaseries.com/serie',
//                     'betaseries.com/en/show'
//                 ]
//             },
//             icon: {
//                 containerSelector: 'h1[class^="blockInformations__title"]',
//                 locator: 'prepend',
//                 imgStyles: 'width: 25px;margin: 0;vertical-align: baseline;'
//             }
//         },
//         // betaseries radarr
//         {
//             id: 'betaseries',
//             defaultSite: 'radarr',
//             search: {
//                 containerSelector: 'h1[class^="blockInformations__title"]',
//                 selectorType: 'text',
//                 modifiers: []
//             },
//             where: [
//                 {
//                     selector: 'meta[property="og:type"]',
//                     attribute: 'content',
//                     operator: 'eq',
//                     value: 'video.movie'
//                 }
//             ],
//             match: {
//                 terms: [
//                     'betaseries.com/film',
//                     'betaseries.com/en/movie'
//                 ]
//             },
//             icon: {
//                 containerSelector: 'h1[class^="blockInformations__title"]',
//                 locator: 'prepend',
//                 imgStyles: 'width: 25px;margin: 0;vertical-align: baseline;'
//             }
//         },
// 	    // primevideo sonarr
//         {
//             id: 'primevideo',
//             deferMs: 2000,
//             defaultSite: 'sonarr',
//             search: {
//                 containerSelector: 'head > title',
//                 selectorType: 'text',
//                 modifiers: [
//                     {
//                         type: 'replace',
//                         from: /^Prime video: /i,
//                         to: ''
//                     }
//                 ]
//             },
//             where: [
//                 {
//                     selector: 'input[name=titleType]',
//                     attribute: 'value',
//                     operator: 'eq',
//                     value: 'season'
//                 }
//             ],
//             match: {
//                 terms: ['www.primevideo.com/detail']
//             },
//             icon: {
//                 containerSelector: 'h1',
//                 locator: 'append',
//                 imgStyles: 'width: 30px;margin: 8px 0 0 8px;'
//             }
//         },
//         // primevideo radarr
//         {
//             id: 'primevideo',
//             deferMs: 2000,
//             defaultSite: 'radarr',
//             search: {
//                 containerSelector: 'head > title',
//                 selectorType: 'text',
//                 modifiers: [
//                     {
//                         type: 'replace',
//                         from: /^Prime video: /i,
//                         to: ''
//                     }
//                 ]
//             },
//             where: [
//                 {
//                     selector: 'input[name=titleType]',
//                     attribute: 'value',
//                     operator: 'eq',
//                     value: 'movie'
//                 }
//             ],
//             match: {
//                 terms: ['www.primevideo.com/detail']
//             },
//             icon: {
//                 containerSelector: 'h1',
//                 locator: 'append',
//                 imgStyles: 'width: 30px;margin: 8px 0 0 8px;'
//             }
//         },
// 	    // myanimelist sonarr
//         {
//             id: 'myanimelist',
//             defaultSite: 'sonarr',
//             search: {
//                 containerSelector: 'meta[property="og:title"]',
//                 selectorType: 'content',
//                 modifiers: []
//             },
//             where: [
//                 {
//                     selector: 'meta[property="og:type"]',
//                     attribute: 'content',
//                     operator: 'eq',
//                     value: 'video.tv_show'
//                 }
//             ],
//             match: {
//                 terms: ['myanimelist.net/anime']
//             },
//             icon: {
//                 containerSelector: 'h1',
//                 locator: 'prepend',
//                 imgStyles: 'width: 16px; margin-right: 5px;'
//             }
//         },
//         // myanimelist radarr
//         {
//             id: 'myanimelist',
//             defaultSite: 'radarr',
//             search: {
//                 containerSelector: 'meta[property="og:title"]',
//                 selectorType: 'content',
//                 modifiers: []
//             },
//             where: [
//                 {
//                     selector: 'meta[property="og:type"]',
//                     attribute: 'content',
//                     operator: 'eq',
//                     value: 'video.movie'
//                 }
//             ],
//             match: {
//                 terms: ['myanimelist.net/anime']
//             },
//             icon: {
//                 containerSelector: 'h1',
//                 locator: 'prepend',
//                 imgStyles: 'width: 16px; margin-right: 5px;'
//             }
//         },
//         // rateyourmusic lidarr album page
//         {
//             id: 'rateyourmusic',
//             defaultSite: 'lidarr',
//             search: {
//                 containerSelector: '.album_title',
//                 selectorType: 'text',
//                 modifiers: []
//             },
//             match: {
//                 terms: ['https://rateyourmusic.com/release/album']
//             },
//             icon: {
//                 containerSelector: '.album_title',
//                 locator: 'prepend',
//                 imgStyles: 'width: 20px; margin-right: 5px;'
//             }
//         },
//         // rateyourmusic lidarr artist page
//         {
//             id: 'rateyourmusic',
//             defaultSite: 'lidarr',
//             search: {
//                 containerSelector: '.artist_name_hdr',
//                 selectorType: 'text',
//                 modifiers: []
//             },
//             match: {
//                 terms: ['https://rateyourmusic.com/artist']
//             },
//             icon: {
//                 containerSelector: '.artist_name_hdr',
//                 locator: 'prepend',
//                 imgStyles: 'width: 20px; margin-right: 5px;'
//             }
//         }
//         // {
//         //     id: 'nextepisode',
//         //     defaultSite: 'radarr',
//         //     search: {
//         //         containerSelector: 'a[href*="moviedb.org"]',
//         //         selectorType: 'href',
//         //         modifiers: [
//         //             {
//         //                 type: 'regex-match',
//         //                 pattern: /\/(?<search>\d{2,10})/i
//         //             }, {
//         //                 type: 'prepend',
//         //                 var: 'tmdb:'
//         //             }
//         //         ]
//         //     },
//         //     match: {
//         //         terms: ['next-episode.net/movies']
//         //     },
//         //     icon: {
//         //         containerSelector: 'div[id^="title_"]',
//         //         locator: 'prepend',
//         //         imgStyles: 'width: 25px; margin: 0px 10px -5px 0;'
//         //     }
//         // },
//         // {
//         //     id: 'nextepisode',
//         //     rules: [
//         //         {
//         //             siteId: 'sonarr',
//         //             match: {
//         //                 pattern: /TVSeries/i,
//         //                 operator: 'eq'
//         //             }
//         //         }
//         //     ],
//         //     search: {
//         //         containerSelector: 'a[href*="imdb.com"]',
//         //         selectorType: 'href',
//         //         modifiers: [
//         //             {
//         //                 type: 'regex-match',
//         //                 pattern: /(?<search>tt\d{5,10})/i
//         //             }, {
//         //                 type: 'prepend',
//         //                 var: 'imdb:'
//         //             }
//         //         ]
//         //     },
//         //     match: {
//         //         terms: ['next-episode.net'],
//         //         containerSelector: 'body',
//         //         selectorType: 'itemType'
//         //     },
//         //     icon: {
//         //         containerSelector: '#show_name > h1',
//         //         locator: 'prepend',
//         //         imgStyles: 'width: 25px; margin: 0px 10px -5px 0;'
//         //     }
//         // }
//     ];

/**
 * Attempts to find a jQuery element using the supplied selector every n milliseconds 
 * (defined by waitForMs param) until found or the max number of attempts is reached.
 * Wait interval and max attempts are defined in settings.
 * @param {string} selector - jQuery selector
 * @param {function} callback - callback function
 * @param {int32} maxAttempts - max attempts
 * @param {int32} waitForMs - time in ms to wait between attempts
 * @param {int32} count - attempt iterator
 */
var waitForEl = function(selector, callback, maxAttempts, waitForMs, count) {
    if (!count || count === 0) {
        log('waiting for search input element to be available...');
    }    

    if ($(selector).length) {
        if (!count || count === 0) {
            log('found search input without any retry attempts');
        } else {
            log(`took ${count * waitForMs} ms for the search input to be found`);
        }

        callback();
    } else {     
        setTimeout(function() {
            if (!count) {
                count = 0;
            }

            count++;
            
            if (count < maxAttempts) {
                waitForEl(selector, callback, maxAttempts, waitForMs, count);
            } else {
                log('Failed to find the input search element. Try refreshing the page or increasing the wait time in the debug settings. If neither of these work the jQuery selectors for the search input element may be incorrect.', 'error');

                return;
            }
        }, waitForMs);
    }
};

/**
 * gets a value from an element based on the supplied selector
 * @param {any} el - jQuery element
 * @param {string} selector - selector type
 * @returns {string}
 */
var getElementValue = function(el, selector) {
    switch (selector) {
        case 'text':
            return el.text();
            
        default: // attribute
            return el.attr(selector);
    }
};

/**
 * Convert string to title case
 * @param {string} s - string to convert
 * @param {boolean} removeUnderscore - whether to replace underscore
 * @returns {string} - converted string
 */
var title = (s, removeUnderscore) => {
    if (s.indexOf('_') > 0 && removeUnderscore) {
        let split = s.split('_');

        s = `${split[0]} (${split[1]})`;
    }

    return s.replace(/(^|\s)\S/g, (t) => t.toUpperCase());
};

/**
 * Add/update the floating/anchored custom icon row and inject one clickable icon
 * for the given site instance.
 * Uses siteIconConfig to pick the correct image and siteId to keep classes/IDs unique.
 * Multiple calls simply append another <a> into the same row with a small gap.
 * @param {InjectedIconConfig} injectedIconConfig
 * @param {SiteSetting} site
 * @param {string} linkHref
 */
function addCustomIconMarkup(injectedIconConfig, site, linkHref) {
    const isAnchored = injectedIconConfig.type === 'anchored';
    const side = injectedIconConfig.side;                 // 'left' | 'right'
    const sideOffset = injectedIconConfig.sideOffset;     // '12px' | '12%'
    const pos = injectedIconConfig.position;              // 'top' | 'bottom'
    const posOffset = injectedIconConfig.positionOffset;  // '12px' | '12%'

    // Base style only once (generic, no per-site background rules)
    if (!document.getElementById('servarr-ext_custom-icon-style')) {
        const base = document.createElement('style');
        base.id = 'servarr-ext_custom-icon-style';
        base.textContent = `
/* Positioned click-row that holds N anchors side-by-side */
#servarr-ext_custom-icon-row {
  position: absolute;
  height: 52px;
  display: inline-flex;
  align-items: center;
  z-index: 9999999;
}

/* Floating vs anchored look & feel */
.servarr-ext_floating-icon #servarr-ext_custom-icon-row {
  border-radius: 50px;
}
.servarr-ext_anchored-icon #servarr-ext_custom-icon-row {
  padding: 0 0 0 15px;
}
.servarr-ext_anchored-left-icon #servarr-ext_custom-icon-row  { left: 0;  border-radius: 0 50px 50px 0; }
.servarr-ext_anchored-right-icon #servarr-ext_custom-icon-row { right: 0; border-radius: 50px 0 0 50px; }

/* Per-anchor sizing */
#servarr-ext_custom-icon-row > a {
  width: 50px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

/* Icon image box */
#servarr-ext_custom-icon-row .servarr-ext_icon-image {
  width: 40px;
  height: 40px;
  background-size: 40px 40px;
  background-repeat: no-repeat;
}
`;
        document.head.appendChild(base);
    }

    // Create wrapper and row once
    let $wrapper = $('#servarr-ext_custom-icon-wrapper');
    if (!$wrapper.length) {
        const anchoredSideClass = isAnchored ? `servarr-ext_anchored-${side}-icon` : '';
        $('body').prepend(`
<div id="servarr-ext_custom-icon-wrapper"
     class="servarr-ext_icon servarr-ext_${injectedIconConfig.type}-icon ${anchoredSideClass}">
  <div id="servarr-ext_custom-icon-row"></div>
</div>`);
        $wrapper = $('#servarr-ext_custom-icon-wrapper');
    }

    // Keep row styled/positioned from latest config
    const $row = $('#servarr-ext_custom-icon-row');
    $row.css({
        backgroundColor: injectedIconConfig.backgroundColor,
        // vertical position, match previous anchored offset behavior
        [pos]: isAnchored ? `calc(${posOffset} ${pos === 'top' ? '+' : '-'} 57px)` : posOffset,
        // horizontal position, anchored row hugs left/right via wrapper class
        ...(isAnchored ? {} : { [side]: sideOffset })
    });

    // Append one clickable icon for this specific site instance if not already present
    if (!$row.find(`.servarr-ext_anchor-${site.id}`).length) {
        const iconUrl = getIconAsDataUri(site.icon.type, site.icon.fg, site.icon.bg);
        const $a = $(`<a href="${linkHref}" target="_blank" rel="noopener" class="servarr-ext_anchor-${site.id}" data-servarr-icon="true" title="Search ${site.name}"></a>`);
        $a.append(
            $(`<div class="servarr-ext_icon-image" style="background-image:url('${iconUrl}')"></div>`)
        );
        $row.append($a);
    }
}

(function () {
    async function runEngines() {
        try {
            const settings = await getSettings();
            if (!settings || !settings.config || !settings.config.enabled) return;

            const url = window.location.href;

            // Figure out which integration IDs are enabled in user settings
            // Expecting: settings.integrations = [{ id: 'imdb', enabled: true }, ...]
            const enabledIds = new Set(
                (settings.integrations || [])
                .filter(it => it && it.id && it.enabled === true)
                .map(it => it.id)
            );

            // Start from all registered engines…
            const allEngines = (window.__servarrEngines && window.__servarrEngines.list) ? window.__servarrEngines.list : [];

            // Build a flat list of engine ids, then dedupe
            const allIds = (allEngines || [])
                .map(e => e && e.id)
                .filter(Boolean);

            const uniqueEngineIds = Array.from(new Set(allIds));

            // Optional: counts per id (handy for debugging)
            const countsById = allIds.reduce((acc, id) => {
                acc[id] = (acc[id] || 0) + 1;
                return acc;
            }, {});

            // Intersections & diffs vs user settings
            const enabledUniqueIds = uniqueEngineIds.filter(id => enabledIds.has(id));
            const missingFromRegistry = Array.from(enabledIds).filter(id => !uniqueEngineIds.includes(id));
            const presentButDisabled = uniqueEngineIds.filter(id => !enabledIds.has(id));

            // Logs
            log(`Engines: ${allEngines.length} instances, ${uniqueEngineIds.length} unique ids.`);
            log(`Enabled in settings: ${enabledIds.size} → [${Array.from(enabledIds).join(', ')}]`);
            log(`Enabled & present: ${enabledUniqueIds.length} → [${enabledUniqueIds.join(', ')}]`);
            if (missingFromRegistry.length) log(`Enabled but no engine registered: [${missingFromRegistry.join(', ')}]`);
            if (presentButDisabled.length) log(`Registered but disabled in settings: [${presentButDisabled.join(', ')}]`);
            log(['Counts per id:', countsById]);

            // If you want to only run engines that are enabled in settings:
            const enginesToRun = allEngines.filter(e => e && enabledIds.has(e.id));
            log(`Will run ${enginesToRun.length} engine instance(s) across ${enabledUniqueIds.length} enabled id(s).`);
            
            // then keep only the enabled ones.
            // If the user has *no* integration settings yet, run all engines so we don't silently disable everything.
            const engines = enabledIds.size > 0 ? allEngines.filter(e => e && enabledIds.has(e.id)) : allEngines;

            log(`Found ${engines.length} matching engines for current URL`);

            if (!engines.length) {
                if (typeof log === 'function') log('No enabled engines registered');
                return;
            }

            const runEngineWork = function (desc, sites, settingsObj) {
                desc.elements.forEach(function (el) {
                    if (!el || (el.hasAttribute && el.hasAttribute('data-servarr-icon'))) return;

                    const term = (desc.getSearch(el) || '').trim();
                    if (!term) return;

                    sites.forEach(function (site) {
                        const perSiteAttr = `data-servarr-ext-${site.id}-completed`;
                        if (el.getAttribute && el.getAttribute(perSiteAttr)) return;

                        const base = (site.domain || '').replace(/\/$/, '');
                        const path = (site.searchPath || '');
                        const link = base + path + encodeURIComponent(term).replace(/%3A/g, ':');

                        try {
                            // same decision you already had: custom floating/anchored vs inline
                            const useCustomIcon = !!settingsObj.config.customIconPosition && desc.elements.length <= 1;
                            if (useCustomIcon) {
                                addCustomIconMarkup(settingsObj.injectedIconConfig, site, link);
                            } else {
                                desc.insert({ el, link, site, styles: null });
                            }
                            if (el.setAttribute) el.setAttribute(perSiteAttr, 'true');
                        } catch (e) {
                            if (typeof log === 'function') log(['injection failed', e], 'error');
                        }
                    });
                });
            };

            // Normal engine loop
            for (let i = 0; i < engines.length; i++) {
                const engine = engines[i];
                
                if (!engine || typeof engine.match !== 'function' || !engine.match(url, document)) continue;

                const desc = engine.candidates({ settings, url, document });
                if (!desc || !desc.siteType || !desc.elements || !desc.getSearch || !desc.insert) continue;

                // Enabled instances for this site type
                const sites = (settings.sites || []).filter(s => s && s.enabled && s.type === desc.siteType);
                if (!sites.length) continue;

                if (engine.deferMs && engine.deferMs > 0) {
                    setTimeout(function () { runEngineWork(desc, sites, settings); }, engine.deferMs);
                } else {
                    runEngineWork(desc, sites, settings);
                }
            }
        } catch (e) {
            if (typeof log === 'function') log(['engine run failed', e], 'error');
        }
    }

    runEngines();
})();