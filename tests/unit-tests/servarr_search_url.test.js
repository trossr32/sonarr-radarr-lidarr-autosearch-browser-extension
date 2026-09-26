/**
 * see content_script.js line 740(ish) for code
 * @param {string} searchUrl 
 * @param {string} siteSearchPath 
 * @returns search term
 */
let processServarrUrl = function(searchUrl, siteSearchPath) {
    if (searchUrl.indexOf(siteSearchPath) === -1) {
        return '';
    }

    let search = searchUrl.replace(/(.+\/)/g, '');
    let sdef = siteSearchPath.replace(/(\/)/g, '');

    return search.replace(sdef, '');
}

describe('servarr_search_url', () => {
    test.each`
      searchUrl                                         | siteSearchPath    | expectedResult
      ${'http://192.168.0.1:8989/add/new'}              | ${'/add/new/'}    | ${''}
      ${'https://192.168.0.1:7878/add/new'}             | ${'/add/new/'}    | ${''}
      ${'http://192.168.0.1:8989/add/new/'}             | ${'/add/new/'}    | ${''}
      ${'https://192.168.0.1:7878/add/new/'}            | ${'/add/new/'}    | ${''}
      ${'http://192.168.0.1:8989/add/new/test'}         | ${'/add/new/'}    | ${'test'}
      ${'https://192.168.0.1:7878/add/new/test'}        | ${'/add/new/'}    | ${'test'}
      ${'http://192.168.0.1:8989/addseries'}            | ${'/addseries/'}  | ${''}
      ${'https://192.168.0.1:7878/addmovies'}           | ${'/addmovies/'}  | ${''}
      ${'http://192.168.0.1:8989/addseries/'}           | ${'/addseries/'}  | ${''}
      ${'https://192.168.0.1:7878/addmovies/'}          | ${'/addmovies/'}  | ${''}
      ${'http://192.168.0.1:8989/addseries/test'}       | ${'/addseries/'}  | ${'test'}
      ${'https://192.168.0.1:7878/addmovies/test'}      | ${'/addmovies/'}  | ${'test'}
      ${'http://192.168.0.1:8989/add/new?term=test'}    | ${'/add/new/'}    | ${''}
      ${'https://192.168.0.1:7878/add/new?term=test'}   | ${'/add/new/'}    | ${''}
      ${'http://192.168.0.1:8989/addseries?term=test'}  | ${'/addseries/'}  | ${''}
      ${'https://192.168.0.1:7878/addmovies?term=test'} | ${'/addmovies/'}  | ${''}
    `(`gets search term ('$expectedResult') using search url ('$searchUrl') and site search path ('$siteSearchPath')`, ({ searchUrl, siteSearchPath, expectedResult }) => {
        expect(processServarrUrl(searchUrl, siteSearchPath)).toBe(expectedResult);
    })
  })

/**
 * Sanitize a search term for use in a Servarr URL path segment.
 * Mirrors the implementation in content_script.js.
 * @param {string} term
 * @returns {string}
 */
let sanitizeSearchTerm = function(term) {
    return (term || '').replace(/\./g, '');
};

describe('sanitizeSearchTerm', () => {
    test.each`
      input                    | expected
      ${'S.W.A.T. Exiles'}    | ${'SWAT Exiles'}
      ${'S.W.A.T.'}           | ${'SWAT'}
      ${'Dr. House'}           | ${'Dr House'}
      ${'Mr. Robot'}           | ${'Mr Robot'}
      ${'Fringe'}              | ${'Fringe'}
      ${'Y: The Last Man'}     | ${'Y: The Last Man'}
      ${'S.H.I.E.L.D.'}       | ${'SHIELD'}
      ${'imdb:tt1234567'}      | ${'imdb:tt1234567'}
      ${'tmdb:12345'}          | ${'tmdb:12345'}
      ${''}                    | ${''}
    `(`sanitizes '$input' → '$expected'`, ({ input, expected }) => {
        expect(sanitizeSearchTerm(input)).toBe(expected);
    });
});
