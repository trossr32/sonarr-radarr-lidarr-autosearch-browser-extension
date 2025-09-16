 var integrations = [
        /* sonarr imdb */
        {
            id: 'imdb',
            rules: [
                {
                    siteId: 'sonarr',
                    match: {
                        pattern: /(tv_show|other)/i,
                        operator: 'eq'
                    }
                }
            ],
            search: {
                containerSelector: 'link[rel="canonical"]',
                selectorType: 'href',
                modifiers: [
                    {
                        type: 'regex-match',
                        pattern: /(?<search>tt\d{5,10})/i
                    }, {
                        type: 'prepend',
                        var: 'imdb:'
                    }
                ]
            },
            match: {
                terms: ['imdb.com'],
                containerSelector: 'meta[property="og:type"]',
                attribute: 'content',
            },
            icon: {
                containerSelector: 'h1',
                locator: 'prepend',
                imgStyles: 'width: 35px; margin: -8px 10px 0 0;'
            }
        },
        /* radarr imdb */
        {
            id: 'imdb',
            rules: [
                {
                    siteId: 'radarr',
                    match: {
                        pattern: /(movie|other)/i,
                        operator: 'eq'
                    }
                }
            ],
            search: {
                containerSelector: 'link[rel="canonical"]',
                selectorType: 'href',
                modifiers: [
                    {
                        type: 'regex-match',
                        pattern: /(?<search>tt\d{5,10})/i
                    }, {
                        type: 'prepend',
                        var: 'imdb:'
                    }
                ]
            },
            match: {
                terms: ['imdb.com'],
                containerSelector: 'meta[property="og:type"]',
                attribute: 'content',
            },
            icon: {
                containerSelector: 'h1',
                locator: 'prepend',
                imgStyles: 'width: 35px; margin: -8px 10px 0 0;'
            }
        },
        // tmdb id doesn't work with sonarr
        {
            id: 'tmdb',
            rules: [
                {
                    siteId: 'sonarr',
                    match: {
                        pattern: /themoviedb\.org\/tv\//i,
                        operator: 'eq'
                    }
                }
            ],
            search: {
                containerSelector: '.header .title h2 a',
                selectorType: 'text',
                modifiers: []
            },
            match: {
                terms: ['themoviedb.org'],
                containerSelector: 'link[rel="canonical"]',
                attribute: 'href'
            },
            icon: {
                containerSelector: '.header .title h2',
                locator: 'prepend',
                imgStyles: 'width: 25px; margin: -8px 10px 0 0;'
            }
        },
        // radarr works with tmdb id
        {
            id: 'tmdb',
            rules: [
                {
                    siteId: 'radarr',
                    match: {
                        pattern: /themoviedb\.org\/movie\//i,
                        operator: 'eq'
                    }
                }
            ],
            search: {
                containerSelector: 'link[rel="canonical"]',
                selectorType: 'href',
                modifiers: [
                    {
                        type: 'regex-match',
                        pattern: /\/(?<search>\d{2,10})-/i
                    }, {
                        type: 'prepend',
                        var: 'tmdb:'
                    }
                ]
            },
            match: {
                terms: ['themoviedb.org'],
                containerSelector: 'link[rel="canonical"]',
                attribute: 'href'
            },
            icon: {
                containerSelector: '.header .title h2',
                locator: 'prepend',
                imgStyles: 'width: 25px; margin: -8px 10px 0 0;'
            }
        },
        // tvdb for sonarr, uses tvdb:xxxxx type search
        {
            id: 'tvdb',
            rules: [
                {
                    siteId: 'sonarr',
                    match: {
                        pattern: /thetvdb\.com\sseries/i,
                        operator: 'eq'
                    }
                }
            ],
            search: {
                containerSelector: '#series_basic_info > ul > li:first-of-type > span',
                selectorType: 'text',
                modifiers: [
                    {
                        type: 'prepend',
                        var: 'tvdb:'
                    }
                ]
            },
            match: {
                terms: ['thetvdb.com'],
                containerSelector: '#series_basic_info',
                attribute: 'text'
            },
            icon: {
                containerSelector: '#series_title',
                locator: 'prepend',
                imgStyles: 'width: 25px; margin: -8px 10px 0 0;'
            }
        },
        // tvdb for radarr, uses text search as id search not working as tested (v0.9)
        {
            id: 'tvdb',
            rules: [
                {
                    siteId: 'radarr',
                    match: {
                        pattern: /thetvdb\.com\smovie/i,
                        operator: 'eq'
                    }
                }
            ],
            search: {
                containerSelector: '#series_title',
                selectorType: 'text',
                modifiers: []
            },
            match: {
                terms: ['thetvdb.com'],
                containerSelector: '#series_basic_info',
                attribute: 'text'
            },
            icon: {
                containerSelector: '#series_title',
                locator: 'prepend',
                imgStyles: 'width: 25px; margin: -8px 10px 0 0;'
            }
        },
        // trakt for sonarr, uses tvdb id
        // instance for tv series view
        {
            id: 'trakt',
            deferMs: 3000,
            rules: [
                {
                    siteId: 'sonarr',
                    match: {
                        pattern: /video\.tv_show/i,
                        operator: 'eq'
                    }
                }
            ],
            search: {
                containerSelector: '.external > li > a[id="external-link-imdb"]',
                selectorType: 'href',
                modifiers: [
                    {
                        type: 'regex-match',
                        pattern: /(?<search>tt\d{5,10})/i
                    }, {
                        type: 'prepend',
                        var: 'imdb:'
                    }
                ]
            },
            match: {
                terms: ['trakt.tv/shows'],
                containerSelector: 'meta[property="og:type"]',
                attribute: 'content'
            },
            icon: {
                containerSelector: '.container h1',
                locator: 'prepend',
                imgStyles: 'width: 25px; margin: -8px 10px 0 0;'
            }
        },
        // instance for tv series group view
        {
            id: 'trakt',
            deferMs: 3000,
            defaultSite: 'sonarr',
            search: {
                containerSelector: '.titles-link > h3',
                selectorType: 'text',
                modifiers: []
            },
            match: {
                terms: [
                    'trakt.tv/shows/trending',
                    'trakt.tv/shows/popular',
                    'trakt.tv/shows/favorited/weekly',
                    'trakt.tv/shows/watched/weekly',
                    'trakt.tv/shows/collected/weekly',
                    'trakt.tv/shows/anticipated'
                ],
            },
            icon: {
                containerSelector: '.quick-icons > .actions',
                locator: 'append',
                imgStyles: 'width: 23px; margin: 0 0 2px 10px;'
            }
        },
        // trakt for radarr, uses tmdb id
        {
            id: 'trakt',
            deferMs: 3000,
            rules: [
                {
                    siteId: 'radarr',
                    match: {
                        pattern: /video\.movie/i,
                        operator: 'eq'
                    }
                }
            ],
            search: {
                containerSelector: '.external > li > a[id="external-link-tmdb"]',
                selectorType: 'href',
                modifiers: [
                    {
                        type: 'regex-match',
                        pattern: /\/(?<search>\d{2,10})/i
                    }, {
                        type: 'prepend',
                        var: 'tmdb:'
                    }
                ]
            },
            match: {
                terms: ['trakt.tv/movies'],
                containerSelector: 'meta[property="og:type"]',
                attribute: 'content'
            },
            icon: {
                containerSelector: '.container h1',
                locator: 'prepend',
                imgStyles: 'width: 25px; margin: -8px 10px 0 0;'
            }
        },
        // instance for trakt movies group view
        {
            id: 'trakt',
            deferMs: 3000,
            defaultSite: 'radarr',
            search: {
                containerSelector: '.titles-link > h3',
                selectorType: 'text',
                modifiers: []
            },
            match: {
                terms: [
                    'trakt.tv/movies/trending',
                    'trakt.tv/movies/popular',
                    'trakt.tv/movies/favorited/weekly',
                    'trakt.tv/movies/watched/weekly',
                    'trakt.tv/movies/collected/weekly',
                    'trakt.tv/movies/anticipated',
                    'trakt.tv/movies/boxoffice'
                ]
            },
            icon: {
                containerSelector: '.quick-icons > .actions',
                locator: 'append',
                imgStyles: 'width: 23px; margin: 0 0 2px 10px;'
            }
        },
        {
            id: 'tvmaze',
            defaultSite: 'sonarr',
            search: {
                containerSelector: 'h1.show-for-medium',
                selectorType: 'text',
                modifiers: []
            },
            match: {
                terms: ['tvmaze.com/shows/']
            },
            icon: {
                containerSelector: 'h1.show-for-medium',
                locator: 'prepend',
                imgStyles: 'width: 32px; margin: -8px 10px 0 0;'
            }
        },
        {
            id: 'tvmaze',
            defaultSite: 'sonarr',
            search: {
                containerSelector: 'div.show-name',
                selectorType: 'text',
                modifiers: []
            },
            match: {
                terms: ['tvmaze.com/countdown']
            },
            icon: {
                containerSelector: 'div.show-name',
                locator: 'prepend',
                imgStyles: 'width: 24px; margin: -8px 10px 0 0;'
            }
        },
        {
            id: 'musicbrainz',
            defaultSite: 'lidarr',
            search: {
                containerSelector: '.artistheader > h1 > a',
                selectorType: 'href',
                modifiers: [
                    {
                        type: 'replace',
                        from: '/artist/',
                        to: 'lidarr:'
                    }
                ]
            },
            match: {
                terms: ['musicbrainz.org/artist']
            },
            icon: {
                containerSelector: '.artistheader > h1',
                locator: 'prepend',
                imgStyles: 'width: 26px; margin: 0 5px -4px 0;'
            }
        },
        { 
            id: 'musicbrainz', 
            defaultSite: 'lidarr', 
            search: { 
                containerSelector: '.rgheader > h1 > a', 
                selectorType: 'href', 
                modifiers: [ 
                    { 
                        type: 'replace', 
                        from: '/release-group/', 
                        to: 'lidarr:' 
                    } 
                ] 
            }, 
            match: { 
                terms: ['musicbrainz.org/release-group']
            }, 
            icon: { 
                containerSelector: '.rgheader > h1', 
                locator: 'prepend', 
                imgStyles: 'width: 26px; margin: 0 5px -4px 0;' 
            } 
        }, 
        { 
            id: 'musicbrainz', 
            defaultSite: 'lidarr', 
            search: { 
                containerSelector: '.releaseheader > h1 > a', 
                selectorType: 'href', 
                modifiers: [ 
                    { 
                        type: 'replace', 
                        from: '/release/', 
                        to: 'lidarr:' 
                    } 
                ] 
            }, 
            match: { 
                terms: ['musicbrainz.org/release'] 
            }, 
            icon: { 
                containerSelector: '.releaseheader > h1', 
                locator: 'prepend', 
                imgStyles: 'width: 26px; margin: 0 5px -4px 0;' 
            } 
        },
        {
            id: 'letterboxd',
            defaultSite: 'radarr',
            search: {
                containerSelector: 'body',
                selectorType: 'data-tmdb-id',
                modifiers: [
                    {
                        type: 'prepend',
                        var: 'tmdb:'
                    }
                ]
            },
            match: {
                terms: ['letterboxd.com/film/']
            },
            icon: {
                containerSelector: '.details > h1',
                locator: 'prepend',
                imgStyles: 'width: 25px; margin: 8px 10px 0 0; float: left;'
            }
        },
        {
            id: 'tvcalendar',
            defaultSite: 'sonarr',
            search: {
                containerSelector: 'p[data-episode] > a:first-of-type',
                selectorType: 'text',
                modifiers: []
            },
            match: {
                terms: ['pogdesign.co.uk/cat']
            },
            icon: {
                containerSelector: 'p[data-episode]',
                locator: 'append',
                imgStyles: 'width: 18px; margin: -22px 0 0 0; float: right;'
            }
        },
        {
            id: 'rottentomatoes',
            defaultSite: 'radarr',
            search: {
                containerSelector: 'meta[property="og:title"]',
                selectorType: 'content',
                modifiers: [
                    {
                        type: 'replace',
                        from: / \| Rotten Tomatoes/i,
                        to: ''
                    }
                ]
            },
            match: {
                terms: ['rottentomatoes.com/m']
            },
            icon: {
                containerSelector: '#hero-wrap [context="heading"]',
                locator: 'prepend',
                imgStyles: 'width: 30px; margin: -4px 10px 0 0;'
            }
        },
        {
            id: 'rottentomatoes',
            defaultSite: 'sonarr',
            search: {
                containerSelector: 'meta[property="og:title"]',
                selectorType: 'content',
                modifiers: [
                    {
                        type: 'replace',
                        from: / \| Rotten Tomatoes/i,
                        to: ''
                    }
                ]
            },
            match: {
                terms: ['rottentomatoes.com/tv']
            },
            icon: {
                containerSelector: '#hero-wrap [context="heading"]',
                locator: 'prepend',
                imgStyles: 'width: 30px; margin: -4px 10px 0 0;'
            }
        },
        {
            id: 'metacritic',
            rules: [
                {
                    siteId: 'sonarr',
                    match: {
                        pattern: /type=tv/i,
                        operator: 'eq'
                    }
                },
                {
                    siteId: 'radarr',
                    match: {
                        pattern: /type=movie/i,
                        operator: 'eq'
                    }
                }
            ],
            search: {
                containerSelector: 'meta[property="og:title"]',
                selectorType: 'content',
                modifiers: [
                    {
                        type: 'replace',
                        from: ' reviews',
                        to: ''
                    }
                ]
            },
            match: {
                terms: ['metacritic.com'],
                containerSelector: 'meta[name="adtags"]',
                attribute: 'content'
            },
            icon: {
                containerSelector: 'div[class*="productHero_title"] > :last-child',
                locator: 'prepend',
                imgStyles: 'width: 32px; margin: 0px 10px 0 0;'
            }
        },
        // simkl tv
        {
            id: 'simkl',
            deferMs: 1000,
            defaultSite: 'sonarr',
            search: {
                containerSelector: 'h1',
                selectorType: 'text',
                modifiers: []
            },
            match: {
                terms: ['simkl.com/tv'],
            },
            icon: {
                containerSelector: 'td.SimklTVDetailPoster div:nth-of-type(1)',
                wrapLinkWithContainer: '<div style="position: absolute; top: 5px; left: 5px; width: 50px; z-index: 1;"></div>',
                locator: 'prepend',
                imgStyles: 'width: 40px;'
            }
        },
        // simkl tv calendar
        {
            id: 'simkl',
            //deferMs: 1000,
            defaultSite: 'sonarr',
            search: {
                containerSelector: 'table.SimklTVCalendarDayList > tbody > tr > td > div > div.SimklTVCalendarDayListLink:nth-of-type(1) > a',
                selectorType: 'text',
                modifiers: []
            },
            match: {
                terms: ['simkl.com/tv/calendar'],
            },
            icon: {
                containerSelector: 'table.SimklTVCalendarDayList > tbody > tr > td > div > div.SimklTVCalendarDayListLink:nth-of-type(1)',
                wrapLinkWithContainer: '<section style="float: left; margin: 5px 10px 0 0"></section>',
                locator: 'prepend',
                imgStyles: 'width: 12px;'
            }
        },
        // simkl movies
        {
            id: 'simkl',
            deferMs: 1000,
            defaultSite: 'radarr',
            search: {
                containerSelector: 'h1',
                selectorType: 'text',
                modifiers: []
            },
            match: {
                terms: ['simkl.com/movie']
            },
            icon: {
                containerSelector: 'td.SimklTVDetailPoster div:nth-of-type(1)',
                wrapLinkWithContainer: '<div style="position: absolute; top: 5px; left: 5px; width: 50px; z-index: 1;"></div>',
                locator: 'prepend',
                imgStyles: 'width: 40px;'
            }
        },
        // iptorrent tv
        {
            id: 'iptorrents',
            defaultSite: 'sonarr',
            search: {
                containerSelector: 'b.MovieTitle > a',
                selectorType: 'text',
                modifiers: []
            },
            match: {
                terms: ['iptorrents.com/tv']
            },
            icon: {
                containerSelector: 'b.MovieTitle',
                wrapLinkWithContainer: '<div></div>',
                locator: 'append',
                imgStyles: 'width: 20px; margin: 5px 0 0 0;'
            }
        },
        // iptorrent movies
        {
            id: 'iptorrents',
            defaultSite: 'radarr',
            search: {
                containerSelector: 'b.MovieTitle > a',
                selectorType: 'href',
                modifiers: [
                    {
                        type: 'regex-match',
                        pattern: /(?<search>tt\d{5,10})/i
                    }, {
                        type: 'prepend',
                        var: 'imdb:'
                    }
                ]
            },
            match: {
                terms: ['iptorrents.com/movies']
            },
            icon: {
                containerSelector: 'b.MovieTitle',
                wrapLinkWithContainer: '<div></div>',
                locator: 'append',
                imgStyles: 'width: 20px; margin: 5px 0 0 0;'
            }
        },
        {
            id: 'lastfm',
            defaultSite: 'lidarr',
            search: {
                containerSelector: '.header-new-title',
                selectorType: 'text',
                modifiers: []
            },
            match: {
                terms: ['last.fm/music']
            },
            icon: {
                containerSelector: '.header-new-title',
                locator: 'prepend',
                imgStyles: 'width: 35px; margin: 0 10px 6px 0;'
            }
        },
        {
            id: 'lastfm',
            defaultSite: 'lidarr',
            search: {
                containerSelector: '.header-new-crumb > span',
                selectorType: 'text',
                modifiers: []
            },
            match: {
                terms: ['last.fm/music']
            },
            icon: {
                containerSelector: '.header-new-crumb > span',
                locator: 'prepend',
                imgStyles: 'width: 25px; margin: 0 10px 6px 0;'
            }
        },
        // allocine sonarr
        {
            id: 'allocine',
            defaultSite: 'sonarr',
            search: {
                containerSelector: 'meta[property="og:title"]',
                selectorType: 'content',
                modifiers: 
				[
					{
						type: 'replace',
						from: 'critiques de la série ',
						to: ''
					},
					{
						type: 'replace',
						from: 'les saisons de ',
						to: ''
					},
					{
						type: 'replace',
						from: 'casting ',
						to: ''
					},
					{
						type: 'replace',
						from: 'actus de la série ',
						to: ''
					},
					{
						type: 'replace',
						from: 'vidéos ',
						to: ''
					},
					{
						type: 'replace',
						from: ' en streaming',
						to: ''
					},
					{
						type: 'replace',
						from: ' en vod',
						to: ''
					}
				]
            },
            where: [
                {
                    selector: 'meta[property="og:type"]',
                    attribute: 'content',
                    operator: 'eq',
                    value: 'video.tv_show'
                }
            ],
            match: {
                terms: ['allocine.fr/series']
            },
            icon: {
                containerSelector: '.titlebar-page .titlebar-title',
                locator: 'prepend',
                imgStyles: 'width: 32px; margin: -8px 10px 0 0;'
            }
        },
        // allocine radarr
        {
            id: 'allocine',
            defaultSite: 'radarr',
            search: {
                containerSelector: 'meta[property="og:title"]',
                selectorType: 'content',
                modifiers: 
				[
					{
						type: 'replace',
						from: 'avis sur le film ',
						to: ''
					},
					{
						type: 'replace',
						from: 'séances ',
						to: ''
					},
					{
						type: 'replace',
						from: 'actus du film ',
						to: ''
					},
					{
						type: 'replace',
						from: 'bande-annonce vo ',
						to: ''
					},
					{
						type: 'replace',
						from: 'tout le casting du film ',
						to: ''
					},
					{
						type: 'replace',
						from: 'avis sur le film ',
						to: ''
					},
					{
						type: 'replace',
						from: ': les critiques presse',
						to: ''
					},
					{
						type: 'replace',
						from: 'photos et affiches du film ',
						to: ''
					},
					{
						type: 'replace',
						from: 'les secrets de tournage du film ',
						to: ''
					},
					{
						type: 'replace',
						from: 'les films similaires à ',
						to: ''
					}
					
				]
            },
            where: [
                {
                    selector: 'meta[property="og:type"]',
                    attribute: 'content',
                    operator: 'eq',
                    value: 'video.movie'
                }
            ],
            match: {
                terms: ['allocine.fr/film']
            },
            icon: {
                containerSelector: '.titlebar-page .titlebar-title',
                locator: 'prepend',
                imgStyles: 'width: 32px; margin: -2px 10px 0 0;'
            }
        },
        // senscritique sonarr
        {
            id: 'senscritique',
            defaultSite: 'sonarr',
            search: {
                containerSelector: 'h1',
                selectorType: 'title',
                modifiers: []
            },
            match: {
                terms: ['senscritique.com/serie']
            },
            icon: {
                containerSelector: 'h1',
                locator: 'prepend',
                imgStyles: 'width: 30px; margin: 0 10px 0 0;'
            }
        },
        // senscritique radarr
        {
            id: 'senscritique',
            defaultSite: 'radarr',
            search: {
                containerSelector: 'h1',
                selectorType: 'title',
                modifiers: []
            },
            match: {
                terms: ['senscritique.com/film']
            },
            icon: {
                containerSelector: 'h1',
                locator: 'prepend',
                imgStyles: 'width: 30px; margin: 0 10px 0 0;'
            }
        },
        // betaseries sonarr
        {
            id: 'betaseries',
            defaultSite: 'sonarr',
            search: {
                containerSelector: 'h1[class^="blockInformations__title"]',
                selectorType: 'text',
                modifiers: []
            },
            where: [
                {
                    selector: 'meta[property="og:type"]',
                    attribute: 'content',
                    operator: 'eq',
                    value: 'video.tv_show'
                }
            ],
            match: {
                terms: [
                    'betaseries.com/serie',
                    'betaseries.com/en/show'
                ]
            },
            icon: {
                containerSelector: 'h1[class^="blockInformations__title"]',
                locator: 'prepend',
                imgStyles: 'width: 25px;margin: 0;vertical-align: baseline;'
            }
        },
        // betaseries radarr
        {
            id: 'betaseries',
            defaultSite: 'radarr',
            search: {
                containerSelector: 'h1[class^="blockInformations__title"]',
                selectorType: 'text',
                modifiers: []
            },
            where: [
                {
                    selector: 'meta[property="og:type"]',
                    attribute: 'content',
                    operator: 'eq',
                    value: 'video.movie'
                }
            ],
            match: {
                terms: [
                    'betaseries.com/film',
                    'betaseries.com/en/movie'
                ]
            },
            icon: {
                containerSelector: 'h1[class^="blockInformations__title"]',
                locator: 'prepend',
                imgStyles: 'width: 25px;margin: 0;vertical-align: baseline;'
            }
        },
	    // primevideo sonarr
        {
            id: 'primevideo',
            deferMs: 2000,
            defaultSite: 'sonarr',
            search: {
                containerSelector: 'head > title',
                selectorType: 'text',
                modifiers: [
                    {
                        type: 'replace',
                        from: /^Prime video: /i,
                        to: ''
                    }
                ]
            },
            where: [
                {
                    selector: 'input[name=titleType]',
                    attribute: 'value',
                    operator: 'eq',
                    value: 'season'
                }
            ],
            match: {
                terms: ['www.primevideo.com/detail']
            },
            icon: {
                containerSelector: 'h1',
                locator: 'append',
                imgStyles: 'width: 30px;margin: 8px 0 0 8px;'
            }
        },
        // primevideo radarr
        {
            id: 'primevideo',
            deferMs: 2000,
            defaultSite: 'radarr',
            search: {
                containerSelector: 'head > title',
                selectorType: 'text',
                modifiers: [
                    {
                        type: 'replace',
                        from: /^Prime video: /i,
                        to: ''
                    }
                ]
            },
            where: [
                {
                    selector: 'input[name=titleType]',
                    attribute: 'value',
                    operator: 'eq',
                    value: 'movie'
                }
            ],
            match: {
                terms: ['www.primevideo.com/detail']
            },
            icon: {
                containerSelector: 'h1',
                locator: 'append',
                imgStyles: 'width: 30px;margin: 8px 0 0 8px;'
            }
        },
	    // myanimelist sonarr
        {
            id: 'myanimelist',
            defaultSite: 'sonarr',
            search: {
                containerSelector: 'meta[property="og:title"]',
                selectorType: 'content',
                modifiers: []
            },
            where: [
                {
                    selector: 'meta[property="og:type"]',
                    attribute: 'content',
                    operator: 'eq',
                    value: 'video.tv_show'
                }
            ],
            match: {
                terms: ['myanimelist.net/anime']
            },
            icon: {
                containerSelector: 'h1',
                locator: 'prepend',
                imgStyles: 'width: 16px; margin-right: 5px;'
            }
        },
        // myanimelist radarr
        {
            id: 'myanimelist',
            defaultSite: 'radarr',
            search: {
                containerSelector: 'meta[property="og:title"]',
                selectorType: 'content',
                modifiers: []
            },
            where: [
                {
                    selector: 'meta[property="og:type"]',
                    attribute: 'content',
                    operator: 'eq',
                    value: 'video.movie'
                }
            ],
            match: {
                terms: ['myanimelist.net/anime']
            },
            icon: {
                containerSelector: 'h1',
                locator: 'prepend',
                imgStyles: 'width: 16px; margin-right: 5px;'
            }
        },
        // rateyourmusic lidarr album page
        {
            id: 'rateyourmusic',
            defaultSite: 'lidarr',
            search: {
                containerSelector: '.album_title',
                selectorType: 'text',
                modifiers: []
            },
            match: {
                terms: ['https://rateyourmusic.com/release/album']
            },
            icon: {
                containerSelector: '.album_title',
                locator: 'prepend',
                imgStyles: 'width: 20px; margin-right: 5px;'
            }
        },
        // rateyourmusic lidarr artist page
        {
            id: 'rateyourmusic',
            defaultSite: 'lidarr',
            search: {
                containerSelector: '.artist_name_hdr',
                selectorType: 'text',
                modifiers: []
            },
            match: {
                terms: ['https://rateyourmusic.com/artist']
            },
            icon: {
                containerSelector: '.artist_name_hdr',
                locator: 'prepend',
                imgStyles: 'width: 20px; margin-right: 5px;'
            }
        }
        // {
        //     id: 'nextepisode',
        //     defaultSite: 'radarr',
        //     search: {
        //         containerSelector: 'a[href*="moviedb.org"]',
        //         selectorType: 'href',
        //         modifiers: [
        //             {
        //                 type: 'regex-match',
        //                 pattern: /\/(?<search>\d{2,10})/i
        //             }, {
        //                 type: 'prepend',
        //                 var: 'tmdb:'
        //             }
        //         ]
        //     },
        //     match: {
        //         terms: ['next-episode.net/movies']
        //     },
        //     icon: {
        //         containerSelector: 'div[id^="title_"]',
        //         locator: 'prepend',
        //         imgStyles: 'width: 25px; margin: 0px 10px -5px 0;'
        //     }
        // },
        // {
        //     id: 'nextepisode',
        //     rules: [
        //         {
        //             siteId: 'sonarr',
        //             match: {
        //                 pattern: /TVSeries/i,
        //                 operator: 'eq'
        //             }
        //         }
        //     ],
        //     search: {
        //         containerSelector: 'a[href*="imdb.com"]',
        //         selectorType: 'href',
        //         modifiers: [
        //             {
        //                 type: 'regex-match',
        //                 pattern: /(?<search>tt\d{5,10})/i
        //             }, {
        //                 type: 'prepend',
        //                 var: 'imdb:'
        //             }
        //         ]
        //     },
        //     match: {
        //         terms: ['next-episode.net'],
        //         containerSelector: 'body',
        //         selectorType: 'itemType'
        //     },
        //     icon: {
        //         containerSelector: '#show_name > h1',
        //         locator: 'prepend',
        //         imgStyles: 'width: 25px; margin: 0px 10px -5px 0;'
        //     }
        // }
    ];

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
 * Add a custom icon and inject into the body.
 * @param {InjectedIconConfig} injectedIconConfig - injected icon config
 * @param {string} iconDataUri - icon data uri
 * @param {string} siteId - id of the servarr site; sonarr, radarr, lidarr, etc.
 * @returns {string} - HTML to inject
 */
 function addCustomIconMarkup(injectedIconConfig, siteId, linkHref) {
    let styles = `<style id="servarr-ext_custom-icon-style">
.servarr-ext_icon a {
  position: absolute;
  background-color: ${injectedIconConfig.backgroundColor};
  text-decoration: none;
  height: 52px;
  z-index: 9999999;
}

.servarr-ext_anchored-icon a {
  padding: 0 15px;
  width: 60px;
}

.servarr-ext_floating-icon a {
  width: 52px;
  border-radius: 50px;
}

.servarr-ext_anchored-left-icon a {
  left: 0;
  border-radius: 0 50px 50px 0;
}

.servarr-ext_anchored-right-icon a {
  right: 0;
  border-radius: 50px 0 0 50px;
}

.servarr-ext_anchored-left-icon .servarr-ext_anchor-label {
  margin-top: 8px;
}

.servarr-ext_anchored-right-icon .servarr-ext_anchor-label {
  margin: 8px 0 0 50px;
}

.servarr-ext_icon-image {
  width: 40px;
  height: 40px;
}

.servarr-ext_anchored-icon .servarr-ext_icon-image {
  top: 6px;
}

.servarr-ext_anchored-left-icon .servarr-ext_icon-image {
  float: right;
}

.servarr-ext_anchored-right-icon .servarr-ext_icon-image {
  float: left;
}
</style>`;

    let siteStyles = `.servarr-ext_icon-image-${siteId} {
    background: url('${base64Icons.find(i => i.id == siteId).fortyPx}') no-repeat;
}

.servarr-ext_floating-icon .servarr-ext_icon-image-${siteId} {
    margin: ${(siteId == 'radarr' ? '6px 0px 0px 8px' : '6px 0px 0px 6px')};
}

.servarr-ext_anchored-left-icon .servarr-ext_icon-image-${siteId} {
    margin: ${(siteId == 'radarr' ? '6px -10px 0 0' : '6px -10px 0 0')};
}

.servarr-ext_anchored-right-icon .servarr-ext_icon-image-${siteId} {
    margin: ${(siteId == 'radarr' ? '6px 0px 0px -5px' : '6px 0px 0px -9px')};
}`;

    // anchor tag
    let anchor = `<a href="${linkHref}" target="_blank" data-servarr-icon="true" class="servarr-ext_anchor-${siteId} servarr-ext_${injectedIconConfig.type}-anchor-${siteId}">
    <div class="servarr-ext_icon-image servarr-ext_icon-image-${siteId}"></div>
    <!-- ${(injectedIconConfig.type == 'anchored' ? ('<div class="servarr-ext_anchor-label">Search<br />' + title(siteId, true) + '</div>') : '')} -->
</a>`;

    // check if the wrapper already exists
    if ($('#servarr-ext_custom-icon-wrapper').length) {
        log(['found servarr-ext_custom-icon-wrapper']);

        let positionOffset = injectedIconConfig.type == 'anchored' ? `calc(${injectedIconConfig.positionOffset} ${(injectedIconConfig.position === 'top' ? '+' : '-')} 57px)` : injectedIconConfig.positionOffset;
        let sideOffset = injectedIconConfig.type == 'anchored' ? injectedIconConfig.sideOffset : `calc(${injectedIconConfig.sideOffset} ${(injectedIconConfig.position === 'left' ? '+' : '-')} 57px)`;

        siteStyles += `.servarr-ext_anchor-${siteId} { ${injectedIconConfig.position}: ${positionOffset}; }
.servarr-ext_floating-anchor-${siteId} { ${injectedIconConfig.side}: ${sideOffset}; }`;

        $('body').prepend(`<style id="servarr-ext_custom-icon-style-${siteId}">${siteStyles}</style>`);

        $('#servarr-ext_custom-icon-wrapper').append(anchor);

        return;
    }

    // anchor doesn't exist, create the wrapper
    let wrapper = `<div id="servarr-ext_custom-icon-wrapper" class="servarr-ext_icon servarr-ext_${injectedIconConfig.type}-icon ${(injectedIconConfig.type == 'anchored' ? ('servarr-ext_anchored-' + injectedIconConfig.side + '-icon') : '')}">
    ${anchor}
</div>`;

    siteStyles += `.servarr-ext_anchor-${siteId} { ${injectedIconConfig.position}: ${injectedIconConfig.positionOffset}; }
.servarr-ext_floating-anchor-${siteId} { ${injectedIconConfig.side}: ${injectedIconConfig.sideOffset}; }`;

    $('body').prepend(`${styles}<style id="servarr-ext_custom-icon-style-${siteId}">${siteStyles}</style>${wrapper}`);
}

async function init() {
	const settings = await getSettings();

    if (!settings.config.enabled) {
        return;
    }

    log(['settings.sites: ', settings.sites]);

    $.each(settings.sites,
        function (i, site) {
            // remove user and password from domain for urls looking like https://user:password@domain/path
            let domain = site.domain.replace(/^(https?:\/\/)(.+):(.+)@/, '$1');
            if (window.location.href.includes(domain)) {
                log(['servarr site match found: ', site]);

                if (window.location.href.indexOf(site.searchPath) === -1) {
                    return;
                }
            
                let search = window.location.href.replace(/(.+\/)/g, '');
                let sdef = site.searchPath.replace(/(\/)/g, '');

                search = search.replace(sdef, '');

                if (search.trim() !== '') {
                    waitForEl(site.searchInputSelector, function() {
                        // use jquery selector and then retrieve the DOM element
                        let searchInput = $(site.searchInputSelector)[0];
                    
                        if (searchInput) {
                            // jquery can't be used to trigger the input event here so rely on vanilla js for event triggering
                            searchInput.value = decodeURIComponent(search.trim());
    
                            let event = document.createEvent('Event');
                            event.initEvent('input', true, true);
    
                            searchInput.dispatchEvent(event);
                        }
                    }, settings.config.searchInputMaxAttempts, settings.config.searchInputWaitForMs);
                }
            }
        });
        
    log(['integrations: ', integrations]);

    /* iterate all integrations that are enabled in the settings */
    $.each(settings.integrations.filter(integration => { return integration.enabled; }), 
        function (i, settingsIntegration) {
            /* iterate all integrations that match the current setting integration */
            $.each(integrations.filter(_i => { return _i.id == settingsIntegration.id; }),
                function (ii, integration) {
                    /* test the integration should be used by matching against the url */
                    if (integration.match.terms
                            .map(t => window.location.href.includes(t))
                            .includes(true)) {

                        log([`integration[${ii}] ${integration.id} matched to domain: `, integration]);

                        var matchContainer = $(integration.match.containerSelector),
                            site = null;

                        var matchValue = null;

                        if (integration.hasOwnProperty('defaultSite')) {
                            site = settings.sites
                                .filter(s => { return s.enabled; })
                                .find(s => s.id == integration.defaultSite);
                        } else {
                            log('iterating rules');

                            $.each(integration.rules, 
                                function (ir, r) {
                                    matchValue = getElementValue(matchContainer, integration.match.attribute);

                                    var isMatch = r.match.pattern.test(matchValue);

                                    var hasMatch = r.match.operator === 'eq' ? isMatch : !isMatch; // 'ne', convert to switch if other values are required

                                    log('matchContainer', matchContainer, 'integration.match.attribute', integration.match.attribute, 'matchValue', matchValue, 'isMatch', isMatch, 'hasMatch', hasMatch);

                                    if (hasMatch) {
                                        site = settings.sites
                                            .filter(s => { return s.enabled; })
                                            .find(s => s.id == r.siteId);

                                        return false;
                                    }
                                });
                        }

                        if (site == null) {
                            log([`integration ${integration.id} site not found`, 'integration', integration]);
                            return;
                        }
                        
                        log([`integration ${integration.id} site found: ${site.id}`, 'site', site, 'integration', integration]);

                        // if the site integration has a where property, then the rules within the where must be evaluated
                        // and asserted to be correct before the integration is used
                        if (integration.hasOwnProperty('where')) {
                            $.each(integration.where, function(i, rule) {
                                switch (rule.operator){
                                    case 'eq':
                                        log([`integration ${integration.id} site found: ${site.id} rule: ${rule.attribute} ${rule.operator} ${rule.value}, found: ${getElementValue($(rule.selector), rule.attribute)}`]);

                                        if (rule.value !== getElementValue($(rule.selector), rule.attribute)) {
                                            site = null;
                                        }                                                   
                                        break;  
                                }
                            });

                            if (site == null) {
                                log([`integration ${integration.id} where rules failed`]);
                                return;
                            }

                            log([`integration ${integration.id} site ${site.id} where rules succeeded`]);
                        }

                        // This is a bit janky, but some sites (looking at you trakt) load quite slowly and need the processing to be deferred otherwise the
                        // containers aren't available. Integrations can therefore have a deferMs setting which will be used here to delay execution. 
                        // In the case of trakt, page refreshes and tab activations work fine, but page to page navigations don't   ¯\_(ツ)_/¯
                        let deferMs = integration.hasOwnProperty('deferMs') ? integration.deferMs : 0;

                        log([`integration ${integration.id} site ${site.id}, in ${deferMs}ms, will look for ${integration.search.containerSelector}`, $(integration.search.containerSelector)]);

                        setTimeout(() => { 
                            /* iterate all the containers */
                            $.each($(integration.search.containerSelector), function(i_el, container) {
                                let containerEl = $(container);

                                // Check if the container is a servarr icon. For example, on musicbrainz the container is an anchor in an h1, and the icon 
                                // will be an anchor inserted prior to container. In subsequent lookups, the container selector will pick up both the relevant 
                                // container and the icon. Icons have a data-servarr-icon attribute added so they can be skipped in this scenario.
                                if (containerEl.attr('data-servarr-icon')) {
                                    log(`element '${container}' picked up an existing icon, so skipping`);
                                    
                                    return;
                                }

                                // We always want to display only one icon except when the integration is imbd and the match was made on a
                                // media type of 'other'. It's impossible to know whether these media types are movies or tv shows so show both icons.
                                var iconCheckAttributeName = integration.id == 'imdb' && matchValue.indexOf('other') ? `data-${site.id}-ext-completed` : 'data-servarr-ext-completed';

                                // Check if the container has already been processed and had an icon added.
                                if (containerEl.attr(iconCheckAttributeName)) {
                                    log(`element '${container}' already has an icon attributed, so skipping`);
                                    
                                    return;
                                }

                                var searchTerm = getElementValue(containerEl, integration.search.selectorType);
                                
                                if (integration.search.modifiers.length == 0){
                                    searchTerm = searchTerm.trim();
                                } else {
                                    $.each(integration.search.modifiers, function(i, modifier) {
                                        switch (modifier.type) {
                                            case 'replace':
                                                searchTerm = searchTerm.toLowerCase().replace(modifier.from, modifier.to).trim();
                                                break;

                                            case 'regex-match':
                                                // in a try catch in case there's mutiple integration configs matched and the match fails
                                                try {
                                                    searchTerm = searchTerm.match(modifier.pattern).groups.search;
                                                }
                                                catch(e){
                                                    return;
                                                }
                                                break;

                                            case 'prepend':
                                                searchTerm = modifier.var + searchTerm;
                                                break;
                                        }
                                    });
                                }

                                searchTerm = searchTerm.replace(/\s\s+/g, ' ');

                                log(['search term: ', searchTerm]);

                                let searchUrl = site.domain.replace(/\/$/, '') + site.searchPath + encodeURIComponent(searchTerm).replace(/\./g, ' ').replace(/%3A/g, ':');

                                log(['search url: ', searchUrl]);

                                // Either add an icon to it's configured container or add a custom icon to the page
                                if (!settings.config.customIconPosition || $(integration.icon.containerSelector).length > 1) {
                                    // add an icon to the configured container
                                    let icon = base64Icons.find(i => i.id == site.id),
                                        linkEl = $(`<a href="${searchUrl}" target="_blank" tooltip="${site.menuText}" title="${site.menuText}" data-servarr-icon="true"></a>`)
                                            .append($(`<img src="${icon.default}" style="${integration.icon.imgStyles}">`));

                                    let el = integration.icon.hasOwnProperty('wrapLinkWithContainer') ? $(integration.icon.wrapLinkWithContainer).append(linkEl) : linkEl;

                                    if (integration.icon.locator == "append") {
                                        $(integration.icon.containerSelector).eq(i_el).append(el);
                                    } else {
                                        $(integration.icon.containerSelector).eq(i_el).prepend(el);
                                    }
                                } else {
                                    // show a custom icon based on the icon config
                                    addCustomIconMarkup(settings.injectedIconConfig, site.id, searchUrl);
                                }

                                containerEl.attr(iconCheckAttributeName, true);
                            });
                        }, deferMs);
                    }
                });            
        });
}

init();

// (() => {
//     if (window.hasRun === true)
//     {
//         console.log('window has run');

//         return;
//     }

//     console.log('window has not run');

//     window.hasRun = true;

//     init();
// })();
