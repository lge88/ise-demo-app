// FUNCTIONS:
//   Bipartite(edges, getKey, autoRemoveIsolatedNodes)
//   Bimap(pairs, getKey)
//   SetStore(items, getKeyOf, setKeyOf, getTypeOf)
//   _helpers_()
//   identity(x)
//   getTypeOf(obj)
// //
// [Bipartite] constructor:
//   Bipartite(edges, getKey, autoRemoveIsolatedNodes)
// //
// [Bipartite] instance methods:
//   Bipartite::addNode(group, n)
//   Bipartite::addLeftNode(l)
//   Bipartite::addRightNode(r)
//   Bipartite::addEdges(edges)
//   Bipartite::addEdge(l, r)
//   Bipartite::removeEdge(l, r)
//   Bipartite::removeNode(node)
//   Bipartite::hasNode(node)
//   Bipartite::hasEdge(l, r)
//   Bipartite::isAdjacent(a, b)
//   Bipartite::getNeighbors(node)
//   Bipartite::getDegree(node)
//   Bipartite::belongsTo(node)
//   Bipartite::getNodes(group)
//   Bipartite::getLeftNodes()
//   Bipartite::getRightNodes()
//   Bipartite::forEachNode(group, fn, scope)
//   Bipartite::forEachLeftNode(fn, scope)
//   Bipartite::forEachRightNode(fn, scope)
//   Bipartite::toDot()
// //
// [Bimap] constructor:
//   Bimap(pairs, getKey)
// //
// [Bimap] instance methods:
//   Bimap::insert(l, r)
//   Bimap::size()
//   Bimap::empty()
//   Bimap::insertSafe(l, r)
//   Bimap::belongsTo(obj)
//   Bimap::leftFind(l)
//   Bimap::rightFind(r)
//   Bimap::find(obj)
//   Bimap::inLeft(obj)
//   Bimap::inRight(obj)
//   Bimap::containsObject(obj)
//   Bimap::containsPair(l, r)
//   Bimap::contains()
//   Bimap::leftRemove(l)
//   Bimap::rightRemove(r)
//   Bimap::removePair(l, r)
//   Bimap::remove()
//   Bimap::getNodes(group)
//   Bimap::getLeftNodes()
//   Bimap::getRightNodes()
//   Bimap::forEachNode(group, fn, scope)
//   Bimap::forEachLeftNode(fn, scope)
//   Bimap::forEachRightNode(fn, scope)
//   Bimap::printLeft(sorted, comp)
//   Bimap::printRight(sorted, comp)
//   Bimap::print(direction, sorted, comp)
// //
// [SetStore] constructor:
//   SetStore(items, getKeyOf, setKeyOf, getTypeOf)
// //
// [SetStore] instance methods:
//   SetStore::size()
//   SetStore::empty()
//   SetStore::contains(item)
//   SetStore::insert(item)
//   SetStore::erase(item)
//   SetStore::find(key)
//   SetStore::findInType(key, type)
//   SetStore::getTypes()
//   SetStore::forEach(fn, scope)
//   SetStore::setKeyOf(item, key)
//   SetStore::setLabelOf(item, label)
//   SetStore::getLabelOf(item)
//   SetStore::findByLabel(label)
//   SetStore::getItems()
//   SetStore::getItemsOfType(t)

function Bipartite(edges, getKey, autoRemoveIsolatedNodes) {
  if (typeof edges === 'undefined') { edges = []; }
  if (typeof getKey === 'function') { this._getKey = getKey; }
  if (typeof autoRemoveIsolatedNodes === undefined) {
    this._autoRemoveIsolatedNodes = true;
  } else {
    this._autoRemoveIsolatedNodes = autoRemoveIsolatedNodes;
  }

  this._l2r = {};
  this._r2l = {};

  this.addEdges(edges);
}

Bipartite.prototype._getKey = identity;

Bipartite.prototype.addNode = function(group, n) {
  var k = this._getKey(n);
  var table = /[lL](eft)?/.test(group) ? this._l2r :this._r2l;
  table[k] = { node: n, neighbors: {} };
  return this;
};

Bipartite.prototype.addLeftNode = function(l) { return this.addNode('l', l); };
Bipartite.prototype.addRightNode = function(r) { return this.addNode('r', r); };

Bipartite.prototype.addEdges = function(edges) {
  edges.forEach(function(edge) {
    var l = edge[0], r = edge[1];
    this.addEdge(l, r);
  }, this);
  return this;
};

Bipartite.prototype.addEdge = function(l, r) {
  var lk = this._getKey(l), rk = this._getKey(r);

  if (!this._l2r[lk]) { this._l2r[lk] = { node: l, neighbors: {} }; }
  if (!this._r2l[rk]) { this._r2l[rk] = { node: r, neighbors: {} }; }

  this._l2r[lk].neighbors[rk] = r;
  this._r2l[rk].neighbors[lk] = l;

  return this;
};

Bipartite.prototype.removeEdge = function(l, r) {
  if (this.hasPair(l, r)) {
    var lk = this._getKey(l), rk = this._getKey(r);
    delete this._l2r[lk].neighbors[rk];
    delete this._r2l[rk].neighbors[lk];

    if (this._autoRemoveIsolatedNodes === true ) {
      if (Object.keys(this._l2r[lk].neighbors).length === 0) {
        delete this._l2r[lk];
      }
      if (Object.keys(this._r2l[rk].neighbors).length === 0) {
        delete this._r2l[rk];
      }
    }
  }
  return this;
};

Bipartite.prototype.removeNode = function(node) {
  var group = this.belongsTo(node);
  if (group === 'none') { return this; }

  this.getNeighbors(node).forEach(function(nb) {
    var l, r;
    if (group === 'left') {
      l = node; r = nb;
    } else {
      l = nb; r = node;
    }
    this.removeEdge(l, r);
  }, this);
  return this;
};

Bipartite.prototype.hasNode = function(node) {
  var key = this._getKey(node);
  if (this._l2r[key]) { return true; }
  if (this._r2l[key]) { return true; }
  return false;
};

Bipartite.prototype.hasEdge = function(l, r) {
  var lk = this._getKey(l), rk = this._getKey(r);
  if (this._l2r[lk]) {
    var flag1 = typeof this._l2r[lk].neighbors[rk] !== 'undefined';
    var flag2 = typeof this._r2l[rk].neighbors[lk] !== 'undefined';
    console.assert(flag1 === flag2);
    return flag1;
  }
  return false;
};

Bipartite.prototype.isAdjacent = function(a, b) {
  return this.hasEdge(a, b) || this.hasEdge(b, a);
};

Bipartite.prototype.hasPair = Bipartite.prototype.isAdjacent;

Bipartite.prototype.getNeighbors = function(node) {
  var key = this._getKey(node);
  var nb = null;
  if (this._l2r[key]) { nbs = this._l2r[key].neighbors; }
  if (this._r2l[key]) { nbs = this._r2l[key].neighbors; }
  if (nbs === null) { throw new Error(node + ' is not in the graph.'); }
  return Object.keys(nbs).map(function(k) { return nbs[k]; });
};

Bipartite.prototype.getDegree = function(node) {
  var key = this._getKey(node);
  if (this._l2r[key]) { return Object.keys(this._l2r[key].neighbors).length; }
  if (this._r2l[key]) { return Object.keys(this._r2l[key].neighbors).length; }
  throw new Error(node + ' is not in the graph.');
};

// Reture 'left' || 'right' || 'none'
Bipartite.prototype.belongsTo = function(node) {
  var key = this._getKey(node);
  if (this._l2r[key]) { return 'left'; }
  if (this._r2l[key]) { return 'right'; }
  return 'none';
};

Bipartite.prototype.getNodes = function(group) {
  if (!group) { return this.getLeftNodes().concat(this.getRightNodes()); }
  var table = /[lL](eft)?/.test(group) ? this._l2r : this._r2l;
  return Object.keys(table).map(function(k) { return table[k].node; });
};

Bipartite.prototype.getLeftNodes = function() { return this.getNodes('left'); };
Bipartite.prototype.getRightNodes = function() { return this.getNodes('right'); };

Bipartite.prototype.forEachNode = function(group, fn, scope) {
  var nodes = this.getNodes(group);
  nodes.forEach(fn, scope || this);
};

Bipartite.prototype.forEachLeftNode = function(fn, scope) { this.forEachNode('left', fn, scope); };
Bipartite.prototype.forEachRightNode = function(fn, scope) { this.forEachNode('right', fn, scope); };

Bipartite.prototype.toDot = function() {
  var strs = ['graph g {'];
  this.forEachLeftNode(function(l) {
    this.getNeighbors(l).forEach(function(r) {
      var lk = this._getKey(l), rk = this._getKey(r);
      strs.push('  ' + lk + ' -- ' + rk);
    }, this);
  }, this);
  strs.push('}');
  return strs.join('\n');
};

function Bimap(pairs, getKey) {
  this._l2r = {};
  this._r2l = {};
  if (typeof getKey === 'function') { this._getKey = this._getKey; }
  if (Array.isArray(pairs)) {
    pairs.forEach(function(pair) {
      this.insert(pair[0], pair[1]);
    }, this);
  }
}

Bimap.prototype.insert= function(l, r) {
  if (Array.isArray(l)) { r = l[1]; l = l[0]; }
  var lk = this._getKey(l), rk = this._getKey(r);
  this._l2r[lk] = r;
  this._r2l[rk] = l;
  return this;
};
Bimap.prototype.add= Bimap.prototype.insert;

Bimap.prototype.size= function() { return Object.keys(this._l2r).length; };
Bimap.prototype.empty= function() { return this.size() === 0; };

Bimap.prototype.insertSafe= function(l, r) {
  if (Array.isArray(l)) { r = l[1]; l = l[0]; }
  var lk = this._getKey(l);
  if (typeof this._l2r[lk] !== 'undefined') {
    throw new Error(l + ' with key' + lk + ' exists!');
  }
  this.add(l, r);
  return this;
};

Bimap.prototype._getKey = identity;

Bimap.prototype.belongsTo = function(obj) {
  var k = this._getKey(obj);
  if (typeof this._l2r[k] !== 'undefined') { return 'left'; }
  if (typeof this._r2l[k] !== 'undefined') { return 'right'; }
  return 'none';
};

Bimap.prototype.leftFind = function(l) { return this._l2r[this._getKey(l)]; };
Bimap.prototype.rightFind = function(r) { return this._r2l[this._getKey(r)]; };
Bimap.prototype.find = function(obj) { return this.leftFind(obj) || this.rightFind(obj); };
Bimap.prototype.lookup = Bimap.prototype.find;
Bimap.prototype.inLeft = function(obj) { return typeof this.leftFind(obj) !== 'undefined'; };
Bimap.prototype.inRight = function(obj) { return typeof this.rightFind(obj) !== 'undefined'; };
Bimap.prototype.containsObject = function(obj) { return typeof this.find(obj) !== 'undefined'; };
Bimap.prototype.containsPair = function(l, r) {
  if (Array.isArray(l)) { r = l[1]; l = l[0]; }
  var _r = this.leftFind(l);
  if (typeof _r !== 'undefined') {
    return this._getKey(r) === this._getKey(_r);
  }
  return false;
};
Bimap.prototype.contains = function() {
  var args = Array.prototype.slice.call(arguments), argc = args.length;
  if (argc <= 1) { return this.containsObject(args[0]); }
  else { return this.containsPair(args[0], args[1]); }
};

Bimap.prototype.leftRemove = function(l) {
  var r = this.leftFind(l);
  if (typeof r !== 'undefined') {
    delete this._l2r[this._getKey(l)];
    this.rightRemove(r);
  }
  return this;
};

Bimap.prototype.rightRemove = function(r) {
  var l = this.rightFind(r);
  if (typeof l !== 'undefined') {
    delete this._r2l[this._getKey(r)];
    this.leftRemove(l);
  }
  return this;
};

Bimap.prototype.removePair = function(l, r) {
  if (this.containsPair(l, r)) {
    delete this._l2r[this._getKey(l)];
    delete this._r2l[this._getKey(r)];
  }
  return this;
};

Bimap.prototype.remove = function() {
  var args = Array.prototype.slice.call(arguments), argc = args.length;
  if (argc <= 1) {
    var obj = args[0];
    if (this.inLeft(obj)) { this.leftRemove(obj); }
    else if (this.inRight(obj)) { this.rightRemove(obj); }
  } else {
    this.removePair(args[0], args[1]);
  }
  return this;
};

Bimap.prototype.erase = Bimap.prototype.remove;

Bimap.prototype.getNodes =  function(group) {
  if (!group) { return this.getLeftNodes().concat(this.getRightNodes()); }
  var table = /[lL](eft)?/.test(group) ? this._r2l : this._l2r;
  return Object.keys(table).map(function(k) { return table[k]; });
};
Bimap.prototype.getLeftNodes = function() { return this.getNodes('left'); };
Bimap.prototype.getRightNodes = function() { return this.getNodes('right'); };

Bimap.prototype.forEachNode = function(group, fn, scope) {
  var nodes = this.getNodes(group);
  nodes.forEach(fn, scope || this);
};
Bimap.prototype.forEachLeftNode = function(fn, scope) { this.forEachNode('left', fn, scope); };
Bimap.prototype.forEachRightNode = function(fn, scope) { this.forEachNode('right', fn, scope); };

Bimap.prototype.printLeft = function(sorted, comp) { this.print('l2r', sorted, comp); };
Bimap.prototype.printRight = function(sorted, comp) { this.print('r2l', sorted, comp); };
Bimap.prototype.print = function(direction, sorted, comp) {
  var nodes;
  if (/[lL]2[rR]/.test(direction)) {
    nodes = this.getLeftNodes();
  } else {
    nodes = this.getRightNodes();
  }

  if (sorted === true) { nodes.sort(comp); }

  nodes.forEach(function(n) {
    var k = this._getKey(n);
    console.log(k + '->' + n);
  }, this);
};


function SetStore(items, getKeyOf, setKeyOf, getTypeOf) {
  this._items = {};
  this._byLabels = new Bimap([], getKeyOf);
  this._byTypes = {};
  if (typeof getKeyOf === 'function') { this.getKeyOf = getKeyOf; }
  if (typeof setKeyOf === 'function') { this.setKeyOf = setKeyOf; }
  if (typeof getTypeOf === 'function') { this.getTypeOf = getTypeOf; }
  if (Array.isArray(items)) { items.forEach(function(x) { this.insert(x); }, this); }
}

SetStore.prototype.size = function() { return Object.keys(this._items).length; };
SetStore.prototype.empty = function() { return this.size() === 0; };
SetStore.prototype.clear = function() {
  this._items = {};
  this._byTypes = {};
  this._byLabels = {};
};
SetStore.prototype.contains = function(item) { return typeof this._items[this.getKeyOf(item)] !== 'undefined'; };

SetStore.prototype.insert = function(item) {
  var k = this.getKeyOf(item), t = this.getTypeOf(item);
  if (typeof this._items[k] !== 'undefined') {
    return false;
  } else {
    this._items[k] = item;
    if (t) {
      if (typeof this._byTypes[t] === 'undefined') { this._byTypes[t] = {}; }
      this._byTypes[t][k] = item;
    }
    return true;
  }
};
SetStore.prototype.add = SetStore.prototype.insert;

SetStore.prototype.erase = function(item) {
  var k = this.getKeyOf(item), t = this.getTypeOf(item);
  if (typeof this._items[k] === 'undefined') {
    return false;
  } else {
    delete this._items[k];
    if (t) {
      delete this._byTypes[t][k];
      if (Object.keys(this._byTypes[t]).length === 0) { delete this._byTypes[t]; }
    }
    return true;
  }
};
SetStore.prototype.remove = SetStore.prototype.erase;

SetStore.prototype.find = function(key) { return this._items[key]; };
SetStore.prototype.get = SetStore.prototype.find;
SetStore.prototype.findInType = function(key, type) {
  var table = this._byTypes[type];
  if (table) { return table[key]; }
  else { return undefined; }
};
SetStore.prototype.getTypes = function() { return Object.keys(this._byTypes); };
SetStore.prototype.getTypeOf = getTypeOf;
SetStore.prototype.forEach = function(fn, scope) {
  var k, items = this._items;
  for (k in items) { fn.call(scope || this, items[k], k, items); }
};

SetStore.prototype.getKeyOf = identity;
SetStore.prototype.setKeyOf = function(item, key) {
  if (this.contains(item)) {
    this.erase(item);
    item._id = key;
    this.insert(item);
  }
};

SetStore.prototype.setLabelOf = function(item, label) {
  if (!this.contains(item)) { throw new Error(item + ' is not in the set store.'); }
  this._byLabels.insert(label, item);
};
SetStore.prototype.getLabelOf = function(item) {
  return this._byLabels.lookup(item);
};
SetStore.prototype.findByLabel = function(label) {
  return this._byLabels.lookup(label);
};

SetStore.prototype.getItems = function() {
  var items = this._items;
  return Object.keys(items).map(function(k) { return items[k]; });
};

SetStore.prototype.getItemsOfType = function(t) {
  var items = this._byTypes[t];
  return Object.keys(items).map(function(k) { return items[k]; });
};

function _helpers_() {}
function identity(x) { return x; }

function getTypeOf(obj) {
  if (obj && typeof obj.getType === 'function') { return obj.getType(); }
  return '';
}

if (typeof exports !== 'undefined') {
  exports.Bipartite = Bipartite;
  exports.Bimap = Bimap;
  exports.SetStore = SetStore;
}
