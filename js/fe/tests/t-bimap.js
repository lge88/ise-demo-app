
var Bimap = typeof require === 'function' ?
  require('../lib/fe-data-structures').Bimap : window.Bimap;

function arrEq(a, b) {
  if (a.length !== b.length) { return false; }

  var i = 0, len = a.length;
  for (; i < len; ++i) {
    if (a[i] !== b[i]) { return false; }
  }
  return true;
}

function printBimap(bm) {
  console.log();
  bm.printLeft();
  console.log();
  bm.printRight();
}

function t1() {
  var bm = new Bimap([
    [ 'A', '1' ],
    [ 'B', '2' ],
    [ 'C', '3' ],
    [ 'D', '4' ],
    [ 'E', '5' ]
  ]);
  // printBimap(bm);

  console.assert(bm.find('A') === '1');
  console.assert(bm.find('D') === '4');
  console.assert(bm.find('4') === 'D');
  console.assert(bm.find('5') === 'E');

  console.assert(bm.inLeft('C') === true);
  console.assert(bm.inLeft('1') === false);
  console.assert(bm.inRight('C') === false);
  console.assert(bm.inRight('2') === true);

  console.assert(bm.contains('5') === true);
  console.assert(bm.contains('B') === true);
  console.assert(bm.contains('F') === false);
  console.assert(bm.contains('A', '1') === true);
  console.assert(bm.contains('1', 'A') === false);
  console.assert(bm.contains('A', '2') === false);

  console.assert(bm.size() === 5);

  bm.remove('A');
  // printBimap(bm);

  console.assert(bm.size() === 4);
  console.assert(bm.contains('A', '1') === false);
  console.assert(bm.contains('A') === false);
  console.assert(bm.contains('1') === false);

  bm.remove('B', '3');
  console.assert(bm.size() === 4);
  console.assert(bm.contains('B') === true);
  console.assert(bm.contains('B', '2') === true);
  console.assert(bm.contains('2') === true);
  // printBimap(bm);

}

t1();

console.log('All tests passed!');
