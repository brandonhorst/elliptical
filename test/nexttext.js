var chai = require('chai');
var expect = chai.expect;
var lacona;

chai.use(require('sinon-chai'));

if (typeof window !== 'undefined' && window.lacona) {
  lacona = window.lacona;
} else {
  lacona = require('..');
}

describe('nextText', function () {
  it('can get the text from an inputOption', function (done) {
    var inputOption = {
      match: [
        {string: 'test', category: 'action'},
        {string: '1', category: 'action'}
      ],
      suggestion: {
        charactersComplete: 0,
        words: [
          {string: 'test', category: 'action'},
          {string: '1', category: 'action'}
        ]
      },
      completion: {}
    };

    lacona.nextText(inputOption, function (err, nextText) {
      expect(err).to.not.exist;
      expect(nextText).to.equal('test1test1');
      done();
    });
  });
});
