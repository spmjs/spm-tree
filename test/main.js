
var tree = require('../index');
var Tree = tree.Tree;

describe('tree', function() {

  it('deep deps', function() {
    var data = tree('./test/fixtures/deep-deps');
    JSON.stringify(data).should.be.eql('{"name":"deep-deps","version":"0.1.0","deps":[{"name":"move","version":"0.3.3","deps":[{"name":"has-translate3d","version":"0.0.3","deps":[{"name":"transform-property","version":"0.0.1","deps":[]}]},{"name":"after-transition","version":"0.0.1","deps":[{"name":"has-transitions","version":"0.0.1","deps":[]},{"name":"css-emitter","version":"0.1.1","deps":[{"name":"event","version":"0.1.3","deps":[]}]},{"name":"once","version":"0.0.1","deps":[]}]},{"name":"emitter","version":"1.1.2","deps":[]},{"name":"css-ease","version":"0.0.1","deps":[]},{"name":"query","version":"0.0.3","deps":[]}]}]}');
  });

  it('shallow deps', function() {
    var data = tree('./test/fixtures/shallow-deps');
    JSON.stringify(data).should.be.eql('{"name":"shallow-deps","version":"0.1.0","deps":[{"name":"indexof","version":"0.0.3","deps":[]}]}');
  });

  it('js deps', function() {
    var tree = new Tree('./test/fixtures/shallow-deps');
    var deps = tree.getJSDeps('require(\'./a\');require(\'indexof\');');
    JSON.stringify(deps).should.be.eql('[{"name":"indexof","version":"0.0.3","deps":[]}]');
  });

  it('flat js deps', function() {
    var tree = new Tree('./test/fixtures/deep-deps');
    var deps = tree.getJSDeps('require(\'move\');', {flat:true});
    deps.map(function(dep){return dep.name}).join(',').should.be.equal('move,has-translate3d,transform-property,after-transition,has-transitions,css-emitter,event,once,emitter,css-ease,query');
  });

  it('css deps', function() {
    var tree = new Tree('./test/fixtures/css-deps');
    var deps = tree.getCSSDeps('@import \'./a\';@import \'normalize.css\';');
    JSON.stringify(deps).should.be.eql('[{"name":"normalize.css","version":"3.0.1","deps":[]}]');
  });
});
