// CLASS METHODS:

// INSTANCE METHODS:
// FeViewer2D::pan(dx, dy)
// FeViewer2D::setShift(x, y)
// FeViewer2D::getShift()
// FeViewer2D::setScale(s)
// FeViewer2D::getScale()
// FeViewer2D::setCanvas(canvas)
// FeViewer2D::setFeModel(feModel)
// FeViewer2D::getWidth()
// FeViewer2D::setWidth(w)
// FeViewer2D::getHeight()
// FeViewer2D::setHeight(h)
// FeViewer2D::clear()
// FeViewer2D::renderNodes()
// FeViewer2D::renderElements()
// FeViewer2D::resetViewport()
// FeViewer2D::applyCamera()
// FeViewer2D::render()
// FeViewer2D::startLoop()

var fe = typeof require !== 'undefined' ?
  require('./fe-core') : window.fe;

// Init with canvas HTML element;
function FeViewer2D(can, fem) {
  if (typeof can !== 'undefined') this.setCanvas(can);
  if (typeof fem !== 'undefined') this.setFeModel(fem);
  this._shiftX = 0.0;
  this._shiftY = 0.0;
  this._scale = 1.0;
}

FeViewer2D.prototype.pan = function(dx, dy) {
  this._shiftX += dx;
  this._shiftY += dy;
  return this;
};

FeViewer2D.prototype.setShift = function(x, y) {
  this._shiftX = x;
  this._shiftY = y;
  return this;
};

FeViewer2D.prototype.getShift = function() {
  return [this._shiftX, this._shiftY];
};

FeViewer2D.prototype.setScale = function(s) {
  this._scale = s;
  return this;
};

FeViewer2D.prototype.getScale = function() {
  return this._scale;
};

FeViewer2D.prototype.setCanvas = function(canvas) {
  if (typeof canvas === 'string')
    canvas = document.getElementById(canvas);
  this.ctx = canvas.getContext('2d');
  return this;
};

FeViewer2D.prototype.setFeModel = function(feModel) {
  this.feModel = feModel;
  return this;
};

FeViewer2D.prototype.getWidth = function() {
  return this.ctx.canvas.width;
};

FeViewer2D.prototype.setWidth = function(w) {
  this.ctx.canvas.width = w;
  return this;
};

FeViewer2D.prototype.getHeight = function() {
  return this.ctx.canvas.height;
};

FeViewer2D.prototype.setHeight = function(h) {
  this.ctx.canvas.height = h;
  return this;
};

FeViewer2D.prototype.clear = function() {
  var w = this.getWidth(), h = this.getHeight();
  var ctx = this.ctx;

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.restore();

  return this;
};

FeViewer2D.prototype.renderNodes = function() {
  var ctx = this.ctx, fem = this.feModel;
  var size = 5;
  var fillStyle = 'red';

  var hs = 0.5 * size;
  ctx.fillStyle = fillStyle;
  fem.forEachNode(function(n) {
    var x = n.x, y = n.y;
    ctx.fillRect(x - hs, y - hs, size, size);
  });
};

FeViewer2D.prototype.renderElements = function() {
  var ctx = this.ctx, fem = this.feModel;
  var lineWidth = 3;
  var strokStyle = 'blue';

  ctx.lineWidth = 3;
  ctx.strokeStyle = 'blue';
  ctx.beginPath();

  fem.forEachElement(function(ele) {
    var nodes = ele.getNodes();
    if (nodes.length <= 0) return;

    var n0 = nodes[0];
    ctx.moveTo(n0.x, n0.y);

    var i = 1, len = nodes.length;
    for (; i < len; ++i) {
      ctx.lineTo(nodes[i].x, nodes[i].y);
      ctx.moveTo(nodes[i].x, nodes[i].y);
    }
    ctx.lineTo(n0.x, n0.y);
  });

  ctx.closePath();
  ctx.stroke();
};

FeViewer2D.prototype.resetViewport = function() {
  var w = this.getWidth();
  var h = this.getHeight();
  this.ctx.setTransform(1, 0, 0, -1, 0.5*w, 0.5*h);
};

FeViewer2D.prototype.applyCamera = function() {
  var s = this._scale;
  var sx = this._shiftX, sy = this._shiftY;
  this.ctx.scale(s, s);
  this.ctx.translate(sx, sy);
};

FeViewer2D.prototype.render = function() {
  this.resetViewport();
  this.applyCamera();
  this.renderElements();
  this.renderNodes();

};

window.requestAnimationFrame = (function(){
  var dt = 1000 / 60;
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function(callback) {
      window.setTimeout(callback, dt);
    };
})();

FeViewer2D.prototype.startLoop = function() {
  var _this = this;
  function animate() {
    _this.clear();
    _this.render();
    requestAnimationFrame(animate);
  }
  this.stopLoop = function() {
    animate = function() {};
    _this.stopLoop = function() {};
  };
  animate();
};

fe.FeViewer2D = FeViewer2D;

if (typeof module !== 'undefined') {
  module.exports = FeViewer2D;
}
