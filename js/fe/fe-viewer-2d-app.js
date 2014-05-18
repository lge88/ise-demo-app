
var FeViewer2D = fe.FeViewer2D;
var FeModel = fe.FeModel;

function FeViewer2dAPP() {
  var canvas = this.canvas = document.getElementById('canvas');
  var fem = this.fem = new FeModel();

  this.fev = new FeViewer2D(canvas, fem);
}

FeViewer2dAPP.prototype.buildModel = function() {
  var m = this.fem;

  var n1 = m.createNode(0, 0, 0).setTag('n1');
  var n2 = m.createNode(2, 0, 0).setTag('n2');
  var n3 = m.createNode(2, 1, 0).setTag('n3');
  var n4 = m.createNode(0, 1, 0).setTag('n4');

  var e1 = m.createElement([n1, n2]).setTag('e1');
  var e2 = m.createElement([n2, n3]).setTag('e2');
  var e3 = m.createElement([n3, n1]).setTag('e3');
  var e4 = m.createElement([n3, n4]).setTag('e4');
  var e5 = m.createElement([n4, n1]).setTag('e5');

  var A = 10, E = 2000;
  var p1 = m.createElementProperty('truss', A, E);

  m.assignElementProperty([e1, e2, e3, e4, e5], p1);

};

var app = new FeViewer2dAPP();
app.buildModel();
