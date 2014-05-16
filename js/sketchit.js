if (typeof require !== 'undefined') {
  var fe = require('./fe-core');
  require('./fe-viewer-2d.');
  // var Hammer = window.Hammer;
}

function delegate(el, ev, callback) {
  // Hammer(el).on(ev, callback);
  el.addEventListener(ev, callback);
}

function SketchIT(can) {
  this.canvas = typeof can === "string" ? document.getElementById(can) : can;
  this.feModel = new fe.FeModel();
  this.feViewer = new fe.FeViewer2D(this.canvas, this.feModel);

  var scope = this;

  var shifting = false;
  var startX, startY;
  var startShift;

  delegate(this.canvas, 'mousewheel', function(ev) {
    if (!shifting) {
      var delta = ev.wheelDelta;
      var factor = 1000;
      var s = scope.feViewer.getScale();
      scope.feViewer.setScale(s + delta / factor);
    }
  });

  delegate(this.canvas, 'mousedown', function(ev) {
    if (ev.button === 1) {
      startX = ev.offsetX;
      startY = ev.offsetY;
      startShift = scope.feViewer.getShift();
      shifting = true;
    };
  });

  delegate(this.canvas, 'mousemove', function(ev) {
    if (ev.button === 1 && shifting) {
      var dx = ev.offsetX - startX;
      var dy = -(ev.offsetY - startY);
      var s = scope.feViewer.getScale();
      scope.feViewer.setShift(startShift[0] + dx/s, startShift[1] + dy/s);
    }
  });

  delegate(this.canvas, 'mouseup', function(ev) {
    startX = ev.offsetX;
    startY = ev.offsetY;
    shifting = false;
  });

  delegate(this.canvas, 'touchstart', function(ev) {
    if (ev.touches.length === 1) {
      startX = ev.touches[0].x;
      startY = ev.touches[0].y;
      startShift = scope.feViewer.getShift();
      shifting = true;
    };
  });

  delegate(this.canvas, 'touchmove', function(ev) {
    ev.preventDefault();
    // console.log(ev);

    if (ev.touches.length === 1 && shifting) {
      var dx = ev.touches[0].x - startX;
      var dy = -(ev.touches[0].y - startY);
      scope.feViewer.setShift(startShift[0] + dx, startShift[0] + dy);
    }
  });

  delegate(this.canvas, 'touchend', function(ev) {
    startX = null;
    startY = null;
    shifting = false;
  });

  return this;
}
