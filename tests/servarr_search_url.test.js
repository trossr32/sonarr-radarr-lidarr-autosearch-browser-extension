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