// CLASS METHODS:

// INSTANCE METHODS:
// Bipartite::addEdges(edges)
// Bipartite::addEdge(l, r)
// Bipartite::removeEdge(l, r)
// Bipartite::removeNode(node)
// Bipartite::hasNode(node)
// Bipartite::hasEdge(l, r)
// Bipartite::isAdjacent(a, b)
// Bipartite::getNeighbors(node)
// Bipartite::getDegree(node)
// Bipartite::belongsTo(node)
// Bipartite::getLeftNodes()
// Bipartite::getRightNodes()
// Bipartite::toDot()

function Bipartite(edges, getKey, autoRemoveIsolatedNodes) {
  if (typeof edges === 'undefined') { edges = []; }
  if (typeof getKey === 'function') { this._getKey = getKey; }
  if (typeof autoRemoveIsolatedNodes === undefined) {
    this._autoRemoveIsolatedNodes = true;
  } else {
    this._autoRemoveIsolatedNodes = autoRemoveIsolatedNodes
  }

  this._l2r = {};
  this._r2l = {};

  this.addEdges(edges);
}

Bipartite.prototype._getKey = function(x) { return x; };

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

// TODO: reuse removeEdge function
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

Bipartite.prototype.getLeftNodes = function() {
  return Object.keys(this._l2r).map(function(k) {
    return this[k].node;
  }, this._l2r);
};

Bipartite.prototype.getRightNodes = function() {
  return Object.keys(this._r2l).map(function(k) {
    return this[k].node;
  }, this._r2l);
};

Bipartite.prototype.toDot = function() {
  var strs = ['graph g {'];
  this.getLeftNodes().forEach(function(l) {
    this.getNeighbors(l).forEach(function(r) {
      var lk = this._getKey(l), rk = this._getKey(r);
      strs.push('  ' + lk + ' -- ' + rk);
    }, this);
  }, this);
  strs.push('}');
  return strs.join('\n');
};

if (typeof exports !== 'undefined') {
  exports.Bipartite = Bipartite;
}
