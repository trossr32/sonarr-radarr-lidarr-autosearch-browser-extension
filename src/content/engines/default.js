/**
 * @typedef {'sonarr'|'radarr'|'lidarr'|'readarr_ebook'|'readarr_audiobook'} ServarrSiteType A normalized Servarr target type.
 */

/**
 * @typedef {Object} EngineSiteIcon
 * @property {string} type Icon base type (usually same as site type, e.g. "sonarr" or "readarr").
 * @property {string} [fg] Foreground hex colour (e.g. "#ffffff").
 * @property {string} [bg] Background hex colour (e.g. "#000000").
 */

/**
 * @typedef {Object} EngineSite
 * @property {string} id Site instance id (unique per user-configured instance).
 * @property {ServarrSiteType|string} type Servarr type for this instance.
 * @property {string} [name] Friendly display name (e.g. "Sonarr 4K").
 * @property {EngineSiteIcon} [icon] Colour/icon overrides for this instance.
 * @property {string} [domain] Base URL of the instance (e.g. "http://localhost:8989").
 * @property {string} [searchPath] Path appended to domain for search/add (e.g. "/add/new/").
 */

/**
 * @typedef {Object} SiteRoutingRule
 * @property {ServarrSiteType|string} siteId Target Servarr type if the pattern matches.
 * @property {RegExp} pattern Case-insensitive pattern tested against a DOM-derived value.
 */

/**
 * @typedef {Object} DefaultEngineConfig
 * @property {string} id Unique engine id (e.g. "imdb", "tmdb").
 * @property {ServarrSiteType|string} [siteType] Fixed target type; omit if using {@link DefaultEngineConfig.resolveSiteType}.
 * @property {string[]} urlIncludes Substrings; engine runs when any is found in location.href.
 * @property {(document: Document, url: string) => boolean} [match] Optional custom matcher (DOM+URL). Overrides default matcher.
 * @property {string} containerSelector CSS selector for elements to receive icons (insertion container).
 * @property {(el: Element, doc: Document) => string} getSearch Function that returns the search string to send to Servarr (may include prefixes like "imdb:" or "tmdb:"). Return an empty string to skip injecting for that element.
 * @property {(document: Document, url: string, settings: any) => (ServarrSiteType|string|null)} [resolveSiteType] Optional dynamic resolver. If provided, it overrides {@link DefaultEngineConfig.siteType}. Return null to skip the engine on this page.
 * @property {'prepend'|'append'|'before'|'after'} [insertWhere='prepend'] Where to place the icon relative to each container element.
 * @property {string} [wrapLinkWithContainer] Optional HTML string used to wrap the generated <a> link (helps with tricky layouts).
 * @property {string} [iconStyle='width:25px; margin:-8px 10px 0 0;'] Inline CSS applied to the <svg> element that displays the icon.
 * @property {number} [deferMs=0] Optional delay (ms) before running this engine (useful for SPA pages).
 */

/**
 * @typedef {Object} CandidatesContext
 * @property {Document} document The current page document.
 * @property {string} url The current page URL.
 * @property {any} settings Extension settings object (shape defined by the options code).
 */

/**
 * @typedef {Object} InsertArgs
 * @property {Element} el The container element where the icon/link will be inserted.
 * @property {string} link Fully built destination URL (instance domain + search path + encoded term).
 * @property {EngineSite} site The Servarr instance this link targets.
 * @property {string} [styles] Optional inline styles to override {@link DefaultEngineConfig.iconStyle}.
 */

/**
 * @typedef {Object} EngineCandidates
 * @property {ServarrSiteType|string|null} siteType Computed site type for this page (or null to skip).
 * @property {Element[]} elements Container elements that can receive icons.
 * @property {(el: Element) => string} getSearch Returns the search text/ID for a given element.
 * @property {(args: InsertArgs) => void} insert Performs the DOM insertion of the icon link.
 */

/**
 * @typedef {Object} EngineInstance
 * @property {string} id Engine id.
 * @property {number} deferMs Optional delay before execution.
 * @property {(url: string) => boolean} match Quick URL test to decide whether to run the engine.
 * @property {(ctx: CandidatesContext) => EngineCandidates} candidates Produces the candidate elements and the helpers to extract terms and insert icons.
 */

/**
 * @typedef {Object} EnginesRegistry
 * @property {EngineInstance[]} list
 * @property {{
 *   DefaultEngine: (cfg: DefaultEngineConfig) => EngineInstance,
 *   pickSiteIdFromDocument: (document: Document, selector: string, attr: string|null, rules: SiteRoutingRule[]) => (ServarrSiteType|string|null),
 *   createNodeFromHTML: (html: string) => (Element|null)
 * }} helpers
 */

(function () {
    /** @type {EnginesRegistry} */
    if (!window.__servarrEngines) window.__servarrEngines = { list: [], helpers: {} };

    /**
     * Inspect a DOM node and return the first matching rule's siteId.
     * Mirrors the old `rules` behavior from the integrations array.
     * @param {Document} document
     * @param {string} selector           - CSS selector for the node to read.
     * @param {string|null} attr          - Attribute name to read (e.g. 'content' / 'href'), or null to read textContent.
     * @param {SiteRoutingRule[]} rules   - Rules with a regex pattern and a target siteId.
     * @returns {(ServarrSiteType|string|null)} The matched siteId or null if none match/selector not found.
     */
    function pickSiteIdFromDocument(document, selector, attr, rules) {
        log(['Engine.pickSiteIdFromDocument', { selector, attr, rules }]);
        
        try {
            var el = document.querySelector(selector);
            if (!el) return null;

            log(['Engine.pickSiteIdFromDocument.el', el]);

            var val = (attr ? (el.getAttribute ? el.getAttribute(attr) : (el[attr] || '')) : (el.textContent || '')).trim();

            for (var i = 0; i < rules.length; i++) {
                var r = rules[i];
                if (r && r.pattern && r.pattern.test(val)) return r.siteId;
            }
        } catch (e) { /* ignore */ }

        return null;
    }

    window.__servarrEngines.helpers.pickSiteIdFromDocument = pickSiteIdFromDocument;

    /**
     * Create a single root node from an HTML string.
     * Useful to wrap the injected <a> when the target layout needs a container.
     * @param {string} html
     * @returns {Element|null}
     */
    function createNodeFromHTML(html) {
        var t = document.createElement('div');
        t.innerHTML = String(html || '').trim();
        return t.firstElementChild || null;
    }

    window.__servarrEngines.helpers.createNodeFromHTML = createNodeFromHTML;

    /**
     * Build a default engine from a simple declarative config.
     * @param {DefaultEngineConfig} cfg
     * @returns {EngineInstance}
     */
    window.__servarrEngines.helpers.DefaultEngine = function DefaultEngine(cfg) {
        var id = cfg.id; // group/integration id which must match one integration in the user settings integrations array: 'trakt', 'imdb', 'simkl', etc.
        var key = cfg.key || null; // <-- optional unique variant tag for logging
        var staticSiteType = cfg.siteType || null;
        var resolveSiteType = cfg.resolveSiteType || null;
        var matchOverride = typeof cfg.match === 'function' ? cfg.match : null; // optional custom matcher function
        var urlIncludes = cfg.urlIncludes || []; // use url matches if no matchOverride is provided
        var containerSelector = cfg.containerSelector || '';
        var getSearch = cfg.getSearch || function(){ return ''; };
        /** @type {'prepend'|'append'|'before'|'after'} */
        var insertWhere = cfg.insertWhere || 'prepend';
        var wrapHTML = cfg.wrapLinkWithContainer || null;
        var injectStyles = cfg.injectStyles || null;
        var iconStyle = cfg.iconStyle || 'width:25px; margin:-8px 10px 0 0;';
        var deferMs = cfg.deferMs || 0;

        // Default matcher (using urlIncludes) — no need to define per engine
        function defaultMatch(document, url) {
            if (!urlIncludes || urlIncludes.length === 0) return false;
            return urlIncludes.some(function (s) { return url.indexOf(s) >= 0; });
        }

        // Back-compat shim if someone accidentally calls match(url, document)
        function callMatcher(m, document, url) {
            try {
                // Prefer (document, url)
                return m(document, url);
            } catch (_) {
                // Fallback: swap if a legacy matcher was written as (url) only
                return m(url);
            }
        }

        /** @type {EngineInstance} */
        return {
            id: id, // maps to settings.integrations[].id (group id)
            key: key, // optional, for logs only
            deferMs: deferMs,

            /**
             * Quick URL check to decide whether this engine should run.
             * @param {Document} document
             * @param {string} url
             * @returns {boolean}
             */
            match: function (document, url) {
                if (matchOverride) return callMatcher(matchOverride, document, url);
                return defaultMatch(document, url);
            },

            /**
             * Discover elements to decorate and provide helpers to extract terms & insert icons.
             * @param {CandidatesContext} ctx
             * @returns {EngineCandidates}
             */
            candidates: function (ctx) {
                log(['Engine.candidates', { id, ctx }]);

                var document = ctx.document, url = ctx.url, settings = ctx.settings;

                /** @type {(ServarrSiteType|string|null)} */
                var computedSiteType = (typeof resolveSiteType === 'function') ? (resolveSiteType(document, url, settings) || null) : staticSiteType;

                /** @type {Element[]} */
                var elements = Array.prototype.slice.call(document.querySelectorAll(containerSelector));

                return {
                    siteType: computedSiteType,
                    elements: elements,

                    /**
                     * Extract the search string/ID for a specific element.
                     * @param {Element} el
                     * @returns {string}
                     */
                    getSearch: function (el) {
                        log(['Engine.getSearch', { id, el }]);                        

                        return (getSearch ? (getSearch(el, document) || '') : ''); 
                    },

                    /**
                     * Insert the Servarr icon link into the DOM for a given element.
                     * @param {InsertArgs} args
                     * @returns {void}
                     */
                    insert: function (args) {
                        log(['Engine.insert', { id, args }]);

                        var el = args.el, link = args.link, site = args.site, styles = args.styles;

                        if (el.querySelector(`[data-servarr-ext-${site.id}-completed="true"]`)) return;

                        var iconUrl = getIconAsDataUri((site.icon && site.icon.type) || site.type, site.icon && site.icon.fg, site.icon && site.icon.bg);

                        var a = document.createElement('a');
                        a.href = link;
                        a.target = '_blank';
                        a.rel = 'noopener';
                        a.title = (site.name || (typeof title === 'function' ? title(site.type, true) : String(site.type)));
                        a.setAttribute('data-servarr-icon', 'true');
                        a.setAttribute(`data-servarr-ext-${site.id}-completed`, 'true');
                        a.innerHTML = `<svg style="${styles || iconStyle}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><image href="${iconUrl}" width="48" height="48" /></svg>`;

                        var nodeToInsert = a;

                        if (wrapHTML) {
                            var wrapper = createNodeFromHTML(wrapHTML);
                            if (wrapper) {
                                wrapper.appendChild(a);
                                nodeToInsert = wrapper;
                            }
                        }

                        if (injectStyles) {
                            var styleNode = createNodeFromHTML(`<style>${injectStyles}</style>`);
                            if (styleNode) {
                                document.head.appendChild(styleNode);
                            }
                        }

                        switch (insertWhere) {
                            case 'append': {
                                el.appendChild(nodeToInsert);
                                break;
                            }
                            case 'before': {
                                if (el.parentNode) el.parentNode.insertBefore(nodeToInsert, el);
                                break;
                            }
                            case 'after': {
                                if (el.parentNode) el.parentNode.insertBefore(nodeToInsert, el.nextSibling);
                                break;
                            }
                            default: {
                                if (typeof el.insertBefore === 'function' && el.firstChild) {
                                    el.insertBefore(nodeToInsert, el.firstChild);
                                } else if (typeof el.prepend === 'function') {
                                    el.prepend(nodeToInsert);
                                } else {
                                    el.appendChild(nodeToInsert);
                                }
                                break;
                            }
                        }
                    }
                };
            }
        };
    };
})();
