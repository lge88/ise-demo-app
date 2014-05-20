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
  require('./lib/fe-core') : window.fe;
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

var spc1 = m.createSPC([0, 1], [0, 0]);
m.assignSPC([n1, n2], spc1);

var l1 = m.createNodalForce([1], [1]);
m.assignNodalLoads([n1, n2], l1);

// FeModel::toJSON()/FeModel.fromJSON()
var str = JSON.stringify(m.toJSON(), null, 2);
console.log(str);

var m2 = FeModel.fromJSON(JSON.parse(str));
var str2 = JSON.stringify(m2.toJSON(), null, 2);
console.log(str2);
