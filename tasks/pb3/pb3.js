var sketchit = new SketchIT('canvas');

buildModel1(sketchit.feModel);
sketchit.feViewer.startLoop();

var m = sketchit.feModel;

function buildModel1(m) {
  n1 = m.createNode(-100, -100, 0).setTag('n1');
  n2 = m.createNode(100, -100, 0).setTag('n2');
  n3 = m.createNode(100, 100, 0).setTag('n3');
  n4 = m.createNode(-100, 100, 0).setTag('n4');
  e1 = m.createElement([n1, n2]).setTag('e1');
  e2 = m.createElement([n2, n3]).setTag('e2');
  e3 = m.createElement([n3, n1]).setTag('e3');
  e4 = m.createElement([n3, n4]).setTag('e4');
  e5 = m.createElement([n4, n1]).setTag('e5');
}

buildModel1(m)
