/*
                                        ^
        n4(0,1)            e4           |  n3(2,1)
             o.............<............o
             .                    ..    .
             .                 ..       .
             .              ..          .
             .           ..             ^
          e5 .     |   .    e3          . e2
             V     |/__                 .
             .   ..                     .
             . .                        .
             o............>.............o
            /\                          /\
        n1(0,0)             e1           n2(2,0)
*/

var fe = typeof require !== 'undefined' ?
  require('../lib/fe-core') : window.fe;
var FeModel = fe.FeModel;

var m = new FeModel();

var n1 = m.createNode(0, 0, 0).setLabel('n1');
var n2 = m.createNode(2, 0, 0).setLabel('n2');
var n3 = m.createNode(2, 1, 0).setLabel('n3');
var n4 = m.createNode(0, 1, 0).setLabel('n4');

var e1 = m.createElement([n1, n2]).setLabel('e1');
var e2 = m.createElement([n2, n3]).setLabel('e2');
var e3 = m.createElement([n3, n1]).setLabel('e3');
var e4 = m.createElement([n3, n4]).setLabel('e4');
var e5 = m.createElement([n4, n1]).setLabel('e5');

// var spc1 = m.createSPC([0, 1], [0, 0]);
// m.assignSPC([n1, n2], spc1);


// FeModel::toJSON()/FeModel.fromJSON()
var str = JSON.stringify(m.toJSON(), null, 2);
console.log(str);

var m2 = FeModel.createFromJSON(JSON.parse(str));
var str2 = JSON.stringify(m2.toJSON(), null, 2);
console.log(str2);


// FeNode::getLabel/FeElement::getLabel
console.assert(n1.getLabel() === 'n1');
console.assert(e4.getLabel() === 'e4');

// FeNode::getElements
function byId(a, b) { return a.id() < b.id(); }
var n1_eles = n1.getElements().sort(byId);
var n1_elesExpected = [e1, e3, e5].sort(byId);
console.assert(n1_eles.length === n1_elesExpected.length);
n1_eles.forEach(function(e, i) {
  console.assert(e === n1_elesExpected[i]);
});

var n4_eles = n4.getElements().sort(byId);
var n4_elesExpected = [e5, e4].sort(byId);
console.assert(n4_eles.length === n4_elesExpected.length);
n4_eles.forEach(function(e, i) {
  console.assert(e === n4_elesExpected[i]);
});

// FeNode::isInElement
console.assert(n1.isInElement(e1) === true);
console.assert(n2.isInElement(e1) === true);
console.assert(n1.isInElement(e5) === true);
console.assert(n2.isInElement(e3) === false);

// FeNode::isAdjacentTo
console.assert(n1.isAdjacentTo(n1) === false);
console.assert(n1.isAdjacentTo(n2) === true);
console.assert(n3.isAdjacentTo(n1) === true);
console.assert(n2.isAdjacentTo(n4) === false);

// FeNode::getAdjacentNodes
var n1_nbs = n1.getAdjacentNodes().sort(byId);
var n1_nbsExpected = [n2, n3, n4].sort(byId);
console.assert(n1_nbs.length === n1_nbsExpected.length);
n1_nbs.forEach(function(e, i) {
  console.assert(e === n1_nbsExpected[i]);
});

var n2_nbs = n2.getAdjacentNodes().sort(byId);
var n2_nbsExpected = [n1, n3].sort(byId);
console.assert(n2_nbs.length === n2_nbsExpected.length);
n2_nbs.forEach(function(e, i) {
  console.assert(e === n2_nbsExpected[i]);
});

// FeElement::hasNode
console.assert(e1.hasNode(n1) === true);
console.assert(e1.hasNode(n2) === true);
console.assert(e3.hasNode(n1) === true);
console.assert(e3.hasNode(n2) === false);
console.assert(e5.hasNode(n1) === true);

// FeElement::getAdjacentElements
var e1_nbs = e1.getAdjacentElements().sort(byId);
var e1_nbsExpected = [e2, e3, e5].sort(byId);
console.assert(e1_nbs.length === e1_nbsExpected.length);
e1_nbs.forEach(function(e, i) {
  console.assert(e === e1_nbsExpected[i]);
});

var e3_nbs = e3.getAdjacentElements().sort(byId);
var e3_nbsExpected = [e1, e2, e4, e5].sort(byId);
console.assert(e3_nbs.length === e3_nbsExpected.length);
e3_nbs.forEach(function(e, i) {
  console.assert(e === e3_nbsExpected[i]);
});

// FeElement::isAdjacentTo
console.assert(e1.isAdjacentTo(e2) === true);
console.assert(e1.isAdjacentTo(e3) === true);
console.assert(e1.isAdjacentTo(e4) === false);
console.assert(e2.isAdjacentTo(e5) === false);

// FeElement::getObject
console.assert(m.getObject(n4.id()) === n4);
console.assert(m.getObject(e3.id()) === e3);

// FeElement::forEachNode
var nTags = [];
var nTags_expected = ['n1', 'n2', 'n3', 'n4'];
m.forEachNode(function(n) {
  nTags.push(n.getLabel());
});
nTags.sort();
console.assert(nTags.length === nTags_expected.length);
nTags.forEach(function(e, i) {
  console.assert(e === nTags_expected[i]);
});

// FeElement::forEachElement
var eTags = [];
var eTags_expected = ['e1', 'e2', 'e3', 'e4', 'e5'];
m.forEachElement(function(e) {
  eTags.push(e.getLabel());
});
eTags.sort();
console.assert(eTags.length === eTags_expected.length);
eTags.forEach(function(e, i) {
  console.assert(e === eTags_expected[i]);
});

// FeElement::getNodes
var nodes = m.getNodes().sort(byId);
var nodes_expected = [n1, n2, n3, n4].sort(byId);
console.assert(nodes.length === nodes_expected.length);
nodes.forEach(function(e, i) {
  console.assert(e === nodes_expected[i]);
});

// FeElement::getAABB
var aabb = m.getAABB();
var aabb_expected = [0, 2, 0, 1, 0, 0];
console.assert(aabb.length === aabb_expected.length);
aabb.forEach(function(x, i) {
  console.assert(x === aabb_expected[i]);
});

// FeElement::getXDiff/getYDiff/getZDiff
console.assert(m.getXDiff() === 2);
console.assert(m.getYDiff() === 1);
console.assert(m.getZDiff() === 0);

// FeElement::getDimension
console.assert(m.getDimension() === 2);

console.log('All test passed!');
