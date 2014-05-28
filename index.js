
var detective = require('detective');
var imports = require('css-imports');
var path = require('path');
var fs = require('fs');
var exists = fs.existsSync;
var read = fs.readFileSync;
var join = path.join;

//////////////////////
// Tree.

function Tree(root) {
  this.root = root;
}

Tree.prototype.getJSDeps = function(content, opt) {
  var deps = detective(content).filter(function(dep) {
    return !isRelative(dep);
  });
  deps = this.formatDeps(this.addVersion(deps));
  if (opt && opt.flat) deps = this.flat(deps);
  return deps;
};

Tree.prototype.getCSSDeps = function(content, opt) {
  var deps = imports(content);
  deps = deps.map(function(dep) {
    return dep.path;
  });
  deps = deps.filter(function(dep) {
    return !isRelative(dep);
  });
  deps = this.formatDeps(this.addVersion(deps));
  if (opt && opt.flat) deps = this.flat(deps);
  return deps;
};

Tree.prototype.getInfo = function(filepath) {
  var pkg = readJSON(filepath);
  return {
    name: pkg.name,
    version: pkg.version,
    deps: this.getDeps(pkg)
  };
};

Tree.prototype.addVersion = function(deps) {
  var pkg = readJSON(join(this.root, 'package.json'));
  var ret = {};
  deps.forEach(function(dep) {
    var v = (pkg.spm.dependencies || {})[dep];
    if (!v) {
      throw new Error('dep not found: ' + dep);
    }
    ret[dep] = v;
  });
  return ret;
};

Tree.prototype.getDeps = function(pkg) {
  if (isPath(pkg)) {
    pkg = readJSON(pkg);
  }
  return this.formatDeps(pkg.spm.dependencies || {});
}

Tree.prototype.formatDeps = function(deps) {
  var ret = [];
  for (var k in deps) {
    var v = deps[k];
    var filepath = join(this.root,
      'sea-modules', k, v, 'package.json');
    ret.push(this.getInfo(filepath));
  }
  return ret;
};

Tree.prototype.flat = function(deps) {
  var ret = [];
  deps.forEach(function(dep) {
    ret.push({name:dep.name,version:dep.version});
    if (dep.deps) {
      var depdeps = this.flat(dep.deps);
      ret = Array.prototype.concat.apply(ret, depdeps);
    }
  }.bind(this));
  return ret;
};

//////////////////////
// Helpers.

function readJSON(filepath) {
  if (!exists(filepath)) {
    throw new Error('not found: ' + f);
  }
  return JSON.parse(read(filepath, 'utf-8'));
}

function isPath(str) {
  return typeof str === 'string'
    && str.charAt(0) === '/';
}

function isRelative(filepath) {
  return filepath.charAt(0) === '.';
}


//////////////////////
// Exports.

var o = module.exports = function(root) {
  var tree = new Tree(root);
  return tree.getInfo(join(root, 'package.json'));
};

o.Tree = Tree;
