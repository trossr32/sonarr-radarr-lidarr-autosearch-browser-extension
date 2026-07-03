/* arrsearch.app — progressive enhancements only.
   The site is fully functional without this file. */
(function () {
    'use strict';

    var root = document.documentElement;
    root.classList.add('js');

    /* ---- Theme toggle (persisted; falls back to prefers-color-scheme) ---- */
    var toggle = document.querySelector('.theme-toggle');

    function currentTheme() {
        var stored = null;
        try { stored = localStorage.getItem('theme'); } catch (e) { /* private mode */ }
        if (stored === 'light' || stored === 'dark') { return stored; }
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }

    if (toggle) {
        toggle.addEventListener('click', function () {
            var next = currentTheme() === 'light' ? 'dark' : 'light';
            root.setAttribute('data-theme', next);
            try { localStorage.setItem('theme', next); } catch (e) { /* ignore */ }
        });
    }

    /* ---- Respect reduced motion for autoplaying video ---- */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.querySelectorAll('video[autoplay]').forEach(function (v) {
            v.removeAttribute('autoplay');
            v.pause();
        });
    }

    /* ---- Reveal-on-scroll ---- */
    if ('IntersectionObserver' in window) {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -8% 0px' });

        document.querySelectorAll('.reveal').forEach(function (el) {
            revealObserver.observe(el);
        });
    } else {
        document.querySelectorAll('.reveal').forEach(function (el) {
            el.classList.add('in-view');
        });
    }

    /* ---- TOC scroll-spy (user guide) ---- */
    var tocLinks = document.querySelectorAll('.toc a[href^="#"]');
    if (tocLinks.length && 'IntersectionObserver' in window) {
        var linkById = {};
        tocLinks.forEach(function (a) {
            linkById[a.getAttribute('href').slice(1)] = a;
        });

        var active = null;
        var spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) { return; }
                var link = linkById[entry.target.id];
                if (!link) { return; }
                if (active) { active.classList.remove('active'); }
                link.classList.add('active');
                active = link;
            });
        }, { rootMargin: '-15% 0px -75% 0px' });

        Object.keys(linkById).forEach(function (id) {
            var el = document.getElementById(id);
            if (el) { spy.observe(el); }
        });
    }

    /* ---- Latest version from GitHub (silent fallback to hard-coded text) ---- */
    var versionEls = document.querySelectorAll('[data-version]');
    if (versionEls.length && window.fetch) {
        fetch('https://api.github.com/repos/trossr32/sonarr-radarr-lidarr-autosearch-browser-extension/releases/latest')
            .then(function (res) { return res.ok ? res.json() : null; })
            .then(function (data) {
                if (data && data.tag_name) {
                    versionEls.forEach(function (el) { el.textContent = data.tag_name; });
                }
            })
            .catch(function () { /* keep the hard-coded version */ });
    }
})();
