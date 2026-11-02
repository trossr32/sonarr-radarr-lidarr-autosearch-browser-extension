const { buildServarrSearchUrl } = require('../../src/content/js/core.js');

describe('buildServarrSearchUrl', () => {
    test.each`
      domain                        | searchPath        | term             | expected
      ${'http://host:8989'}         | ${'/add/new/'}    | ${'fringe'}      | ${'http://host:8989/add/new?term=fringe'}
      ${'http://host:8989/'}        | ${'/add/new/'}    | ${'fringe'}      | ${'http://host:8989/add/new?term=fringe'}
      ${'https://host:7878/'}       | ${'/add/new'}     | ${'the%20matrix'}| ${'https://host:7878/add/new?term=the%20matrix'}
      ${'http://host/sonarr'}       | ${'/add/new/'}    | ${'S.W.A.T.'}    | ${'http://host/sonarr/add/new?term=S.W.A.T.'}
      ${'http://host:8686/'}        | ${'/add/search/'} | ${'abba'}        | ${'http://host:8686/add/search/abba'}
      ${'http://host:8989/'}        | ${'/addseries/'}  | ${'fringe'}      | ${'http://host:8989/addseries/fringe'}
    `('$domain + $searchPath + $term -> $expected', ({ domain, searchPath, term, expected }) => {
        expect(buildServarrSearchUrl(domain, searchPath, term)).toBe(expected);
    });
});
