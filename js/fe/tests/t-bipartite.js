
var Bipartite = typeof require === 'function' ?
  require('../fe-data-structures').Bipartite : window.Bipartite;

function arrEq(a, b) {
  if (a.length !== b.length) { return false; }

  var i = 0, len = a.length;
  for (; i < len; ++i) {
    if (a[i] !== b[i]) { return false; }
  }
  return true;
}

function t1() {
  var g = new Bipartite([
    [ 'A', '1' ],
    [ 'A', '2' ],
    [ 'A', '3' ],
    [ 'B', '1' ],
    [ 'B', '3' ],
    [ 'C', '2' ],
    [ 'C', '3' ]
  ]);

  console.assert(g.hasNode('A') === true);
  console.assert(g.hasNode('3') === true);
  console.assert(g.hasNode('d') === false);

  console.assert(g.hasEdge('1', 'B') === false);
  console.assert(g.hasPair('1', 'B') === true);

  console.assert(g.hasEdge('B', '1') === true);
  console.assert(g.hasPair('B', '1') === true);

  console.assert(g.hasPair('C', '3') === true);
  console.assert(g.hasPair('C', '1') === false);

  console.assert(g.getDegree('A') === 3);
  console.assert(g.getDegree('2') === 2);

  console.assert(arrEq(g.getNeighbors('1').sort(), ['A', 'B']));
  console.assert(arrEq(g.getNeighbors('C').sort(), ['2', '3']));

  console.assert(g.isAdjacent('1', 'B') === true);
  console.assert(g.isAdjacent('1', '2') === false);

  console.assert(g.belongsTo('1') === 'right');
  console.assert(g.belongsTo('A') === 'left');
  console.assert(g.belongsTo('d') === 'none');

  // console.log(g.toDot());
}

function t2() {
  g = new Bipartite([
    [ 'A', '1' ],
    [ 'A', '2' ],
    [ 'A', '3' ],
    [ 'B', '1' ],
    [ 'B', '3' ],
    [ 'C', '2' ],
    [ 'C', '3' ]
  ], null, true);

  g.removeNode('1');
  console.assert(g.hasNode('1') === false);

  g.removeEdge('A', '2');
  g.removeEdge('A', '3');
  console.assert(g.hasNode('A') === false);

  // console.log(g.toDot());
}

function t3() {
  var g = new Bipartite([
    [ 'A', '1' ],
    [ 'A', '2' ],
    [ 'A', '3' ],
    [ 'B', '1' ],
    [ 'B', '3' ],
    [ 'C', '2' ],
    [ 'C', '3' ]
  ], null, false);

  g.removeNode('1');
  console.assert(g.hasNode('1') === true);

  console.assert(g.getDegree('1') === 0);
  console.assert(g.getDegree('A') === 2);
  console.assert(g.getDegree('B') === 1);

  console.assert(g.isAdjacent('B', '1') === false);

  console.assert(arrEq(g.getNeighbors('1').sort(), []));

  // console.log(g.toDot());
}

t1();
t2();
t3();

console.log('All tests passed!');
