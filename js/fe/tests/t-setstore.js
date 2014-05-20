
var SetStore = typeof require === 'function' ?
  require('../lib/fe-data-structures').SetStore : Window.SetStore;

function ClassA(val) { this._id = 'a' + (++ClassA.count); this.val = val; }
ClassA.prototype.getType = function() { return 'A'; };
ClassA.count = 0;

function ClassB(val) { this._id = 'b' + (++ClassB.count); this.val = val; }
ClassB.prototype.getType = function() { return 'B'; };
ClassB.count = 0;

function getKeyOf(o) { return o._id; }
function setKeyOf(item, key) {
  if (this.contains(item)) {
    this.erase(item);
    item._id = key;
    this.insert(item);
  }
}

function getTypeOf(o) { return o.getType(); }

function printStore(ss) {
  ss.getItems().forEach(function(x) {
    console.log(getKeyOf(x) + ': <' + getTypeOf(x) + '> ' + x.val);
  });
}

function printStore2(ss) {
  ss.forEach(function(x, k) {
    console.log(k + ': <' + getTypeOf(x) + '> ' + x.val);
  });
}

function arrEq(a, b) { return a.length === b.length && a.every(function(x, i) { return x === b[i]; }); }

function t1() {

  var a1 = new ClassA(1);
  var a2 = new ClassA(2);
  var a3 = new ClassA(3);
  var b1 = new ClassB('a');
  var b2 = new ClassB('b');
  var b3 = new ClassB('c');

  var b4 = new ClassB('d');

  var ss = new SetStore([a1, a2, a3, b1, b2, b3], getKeyOf, setKeyOf, getTypeOf);

  // printStore(ss);
  // printStore2(ss);

  console.assert(ss.size() === 6);
  console.assert(ss.empty() === false);
  console.assert(ss.contains(a1) === true);
  console.assert(ss.contains(b2) === true);
  console.assert(ss.contains(b4) === false);

  console.assert(ss.find('a1') === a1);
  console.assert(ss.find('b1') === b1);
  console.assert(ss.find('b4') === undefined);

  console.assert(ss.findInType('a1', 'A') === a1);
  console.assert(ss.findInType('a1', 'B') === undefined);
  console.assert(ss.findInType('b4', 'B') === undefined);

  console.assert(arrEq(ss.getTypes().sort(), ['A', 'B']));

  console.assert(ss.getKeyOf(a1) === 'a1');
  console.assert(ss.getKeyOf(b3) === 'b3');

  var byId = function(x, y) { return x._id - y._id; };
  var items = ss.getItems().sort(byId);
  var allAs = ss.getItemsOfType('A').sort(byId);
  console.assert(arrEq(items, [a1, a2, a3, b1, b2, b3]));
  console.assert(arrEq(allAs, [a1, a2, a3]));

  // setKeyOf
  ss.setKeyOf(b3, 'bbb');
  console.assert(ss.getKeyOf(b3) === 'bbb');
  console.assert(ss.find('bbb') === b3);
  console.assert(ss.findInType('bbb', 'B') === b3);

  // erase/insert
  ss.erase(b3);
  ss.erase(a2);
  ss.insert(b4);

  console.assert(ss.size() === 5);
  console.assert(ss.empty() === false);
  console.assert(ss.contains(a1) === true);
  console.assert(ss.contains(a2) === false);
  console.assert(ss.contains(b3) === false);
  console.assert(ss.contains(b4) === true);

  console.assert(ss.find('a1') === a1);
  console.assert(ss.find('b1') === b1);
  console.assert(ss.find('b4') === b4);
  console.assert(ss.find('a2') === undefined);

  console.assert(ss.findInType('a1', 'A') === a1);
  console.assert(ss.findInType('a1', 'B') === undefined);
  console.assert(ss.findInType('b4', 'B') === b4);

  items = ss.getItems().sort(byId);
  console.assert(arrEq(items, [a1, a3, b1, b2, b4]));
  var allBs = ss.getItemsOfType('B').sort(byId);
  console.assert(arrEq(allBs, [b1, b2, b4]));

  ss.erase(a1);
  ss.erase(a3);
  console.assert(arrEq(ss.getTypes().sort(), ['B']));

  ss.clear();
  console.assert(ss.size() === 0);
  console.assert(ss.empty() === true);

}

t1();
console.log('All tests passed!');
