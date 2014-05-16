window.requestAnimationFrame = (function(){
  var dt = 1000 / 60;
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function(callback) {
      window.setTimeout(callback, dt);
    };
})();

var Stroke = window.Stroke;

function getOffsetToWindow(el) {
  var x = el.offsetLeft, y = el.offsetTop;

  el = el.offsetParent;
  while (el) {
    x += el.offsetLeft;
    y += el.offsetTop;
    el = el.offsetParent;
  }
  return { left: x, top: y };
}

function Cycler(arr) {
  var i = 0, choices = [], len = 0;
  this.reset = function(arr) {
    i = 0;
    if (Array.isArray(arr)) { choices = arr.slice(); }
    len = choices.length;
  };
  this.next = function() {
    var res = arr[i];
    i = (i + 1) % len;
    return res;
  };
  this.reset(arr);
  return this;
}

function StrokeEditor(can) {

  var canvas = this.canvas = typeof can === 'string' ?
    document.getElementById(can) : can;

  var scope = this;

  this.getPointFromTouchEvent= function(ev) {
    var offset = getOffsetToWindow(canvas);
    var w = canvas.width, h = canvas.height;
    var left = ev.touches[0].clientX - offset.left;
    var top = ev.touches[0].clientY - offset.top;
    var x = left - 0.5 * w;
    var y = 0.5 * h - top;
    return { x: x, y: y };
  };

  this.getPointFromMouseEvent= function(ev) {
    var offset = getOffsetToWindow(canvas);
    var w = canvas.width, h = canvas.height;
    var left = ev.clientX - offset.left;
    var top = ev.clientY - offset.top;
    var x = left - 0.5 * w;
    var y = 0.5 * h - top;
    return { x: x, y: y };
  };

  this.colorCycler = Cycler([
    'blue',
    'red',
    'green',
    'yellow',
    'black',
    'purple'
  ]);

  this.stroke = new Stroke();
  this.transformedStroke = new Stroke();

  this.ctx = this.canvas.getContext('2d');

  this.showCentroid = true;
  this.showBoundingBox = true;
  this.showCorners = true;
  this.useTimeStamp = true;

  this.lineWidth = 3;
  this.strokeColor = this.colorCycler.next();
  this.cornerColor = this.colorCycler.next();
  this.cornerSize = 10;
  this.cornerTagColor = this.colorCycler.next();
  this.boundingBoxColor = 'rgba(255, 255, 0, 0.7)';
  this.centroidColor = 'rgb(255, 0, 0)';
  this.centroidRadius = 20;

  this.transform = null;

  var w = canvas.width, h = canvas.height;
  this.ctx.setTransform(1, 0, 0, -1, 0.5 * w, 0.5 * h);

  this.render = function() {
    this.applyTransformToStroke();
    this.renderStroke();

    if (this.showCorners === true) { this.renderCorners(); }
    if (this.showBoundingBox === true) { this.renderBoundingBox(); }
    if (this.showCentroid === true) { this.renderCentroid(); }
  };

  var noop = function() {};
  var animate = noop;
  this.startRenderLoop = function() {
    animate = function() {
      scope.clearCanvas();
      scope.render();
      scope.updateOutput();
      requestAnimationFrame(animate);
    };
    animate();
  };

  this.stopRenderLoop = function() {
    animate = noop;
  };

  var startTime = 0;
  function handleMouseDown(ev) {
    ev.preventDefault();

    var can = scope.canvas;
    var stroke = scope.stroke;
    startTime = Date.now();
    stroke.clear();

    can.addEventListener('mousemove', handleMouseMove);
  }

  function handleTouchStart(ev) {
    ev.preventDefault();

    var can = scope.canvas;
    var stroke = scope.stroke;
    startTime = Date.now();
    stroke.clear();

    can.addEventListener('touchmove', handleTouchMove);
  }

  function handleMouseMove(ev) {
    ev.preventDefault();

    var stroke = scope.stroke;
    var t = Date.now() - startTime;
    var p = scope.getPointFromMouseEvent(ev);
    stroke.appendPoint(p.x, p.y, t);
  }


  function handleTouchMove(ev) {
    ev.preventDefault();

    var stroke = scope.stroke;
    var t = Date.now() - startTime;
    var p = scope.getPointFromTouchEvent(ev);
    stroke.appendPoint(p.x, p.y, t);
  }

  function handleMouseUp(ev) {
    ev.preventDefault();

    var can = scope.canvas;
    can.removeEventListener('mousemove', handleMouseMove);
    scope.updateOutput();
  }

  function handleTouchEnd(ev) {
    ev.preventDefault();

    var can = scope.canvas;
    can.removeEventListener('touchend', handleTouchMove);
    scope.updateOutput();
  }

  this.initCanvasHanlders = function() {
    var can = this.canvas;
    can.addEventListener('mousedown', handleMouseDown);
    can.addEventListener('mouseup', handleMouseUp);

    can.addEventListener('touchstart', handleTouchStart);
    can.addEventListener('touchend', handleTouchEnd);
  };

  this.clearCanvas = function() {
    var can = this.canvas;
    var ctx = this.ctx;
    var w = can.width, h = can.height;
    ctx.clearRect(-0.5*w, -0.5*h, w, h);
    return this;
  };

  this.transforms = [
    {
      name: "original",
      btnId: "original-btn",
      transform: function(s) {
        return s;
      }
    },
    {
      name: "sampled",
      btnId: "sampled-btn",
      transform: function(s) {
        return s.clone().resample();
      }
    },
    {
      name: "reverse",
      btnId: "reverse-btn",
      transform: function(s) {
        return s.clone().reverse();
      }
    },
    {
      name: "flipX",
      btnId: "flipX-btn",
      transform: function(s) {
        return s.clone().flipX();
      }
    },
    {
      name: "flipY",
      btnId: "flipY-btn",
      transform: function(s) {
        return s.clone().flipY();
      }
    },
    {
      name: "normalize",
      btnId: "normalize-btn",
      transform: function(s) {
        var squareSize = w * 0.6;
        s = s.clone();
        s.resample();
        if (s.getNumOfPoints() >= 2) {
          s.rotateBy(-s.getIndicativeAngle());
          s.scaleTo(squareSize);
          s.translateTo({ x: 0, y: 0 });
        }
        return s;
      }
    }
  ].reduce(function(obj, item) {
    obj[item.name] = item;
    return obj;
  }, {});

  this.applyTransformToStroke = function() {
    var item = this.transforms[this.transform];
    if (item && typeof item.transform === 'function') {
      this.transformedStroke = item.transform(this.stroke);
    } else {
      this.transformedStroke = this.stroke;
    }
    return this;
  };

  this.renderStroke = function() {
    var ctx = this.ctx, points = this.transformedStroke._points;

    var i, p, len = points.length;
    if (len <= 1) { return this; }

    ctx.strokeStyle = this.strokeColor;
    ctx.lineWidth = this.lineWidth;

    ctx.beginPath();
    p = points[0];
    ctx.moveTo(p.x, p.y);

    for (i = 1; i < len; ++i) {
      p = points[i];
      ctx.lineTo(p.x, p.y);
      ctx.moveTo(p.x, p.y);
    }
    ctx.stroke();

    return this;
  };

  this.renderCorners = function() {
    var ctx = this.ctx, corners = this.transformedStroke.getCorners();

    var s = this.cornerSize, halfS = 0.5 * s;
    ctx.fillStyle = this.cornerColor;
    corners.forEach(function(p) {
      var x = p.x, y = p.y;
      ctx.fillRect(x - halfS, y - halfS, s, s);
    });

    ctx.fillStyle = this.cornerTagColor;
    corners.forEach(function(p, i) {
      var x = p.x, y = p.y, textOffset = halfS * 1.5;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(1, -1);
      ctx.fillText('' + i, - textOffset, - textOffset);
      ctx.restore();
    });

    return this;
  };

  this.renderCentroid = function() {
    var ctx = this.ctx, center = this.transformedStroke.getCentroid();
    if (!center) { return this; }

    var x = center.x, y = center.y;
    var r = this.centroidRadius;
    var color = this.centroidColor;

    ctx.save();
    ctx.beginPath();

    ctx.strokeStyle = color;
    ctx.translate(x, y);
    ctx.arc(0, 0, r, 0, Math.PI*2);

    var dx = r * Math.sqrt(2) / 2;
    ctx.moveTo(dx, dx);
    ctx.lineTo(-dx, -dx);
    ctx.moveTo(-dx, dx);
    ctx.lineTo(dx, -dx);

    ctx.stroke();
    ctx.restore();
    return this;
  };

  this.renderBoundingBox = function() {
    var ctx = this.ctx, aabb = this.transformedStroke.getBoundingBox();
    if (!aabb) { return this; }

    ctx.strokeStyle = this.boundingBoxColor;
    ctx.strokeRect(aabb.x, aabb.y, aabb.width, aabb.height);

    return this;
  };

  this.updateOutput = function() {
    var arr = scope.transformedStroke.toArray()
    if (this.useTimeStamp === false) {
      arr = arr.map(function(p) { return {x: p.x, y: p.y}; });
    }
    var str = JSON.stringify(arr);
    scope.outputBox.value = str;
  };


  this.initUI = function() {

    // options checkbox

    var options = ['showCentroid', 'showBoundingBox', 'showCorners', 'useTimeStamp'];
    options.forEach(function(opt) {
      var checkbox = document.getElementById(opt);
      var _this = this;
      checkbox.addEventListener('change', function() {
        _this[opt] = checkbox.checked;
      });
    }, this);

    Object.keys(this.transforms).forEach(function(k) {
      var item = this.transforms[k];
      var btn = document.getElementById(item.btnId);
      var _this = this;
      btn.addEventListener('change', function() {
        _this.transform = btn.value;
      });
    }, this);

    var clearBtn = this.clearBtn = document.getElementById('clear-btn');
    var updateBtn = this.updateBtn = document.getElementById('update-btn');
    var reloadBtn = this.updateBtn = document.getElementById('reload-btn');
    var loadBtn = this.loadBtn = document.getElementById('load-btn');
    var loadFileInput = this.loadFileInput = document.getElementById('load-input');
    var saveBtn = this.saveBtn = document.getElementById('save-btn');
    var outputBox = this.outputBox = document.getElementById('stroke-output');

    clearBtn.addEventListener('click', function() {
      scope.stroke.clear();
      outputBox.value = '';
    });

    updateBtn.addEventListener('click', function() {
      scope.clearCanvas();
      scope.render();
      scope.updateOutput();
    });

    reloadBtn.addEventListener('click', function() {
      var str = outputBox.value;
      scope.stroke.setFromJSON(str);
    });

    saveBtn.addEventListener('click', function() {
      var blob = new Blob([outputBox.value], { type: 'text/plain' });
      saveAs(blob, 'points.txt');
    });

    loadBtn.addEventListener('click', function() {
      fireEvent(loadFileInput, 'click');
      loadFileInput.addEventListener('change', function(ev) {
        var file = ev.target.files[0];
        var reader = new FileReader();
        reader.onload = function(e) {
          var str = e.target.result;
          var points;

          outputBox.value = str;
          try {
            points = JSON.parse(str);
            scope.stroke.setFromJSON(points);
          } catch(err) {
            alert('Not valid json file!');
          }
        };
        reader.readAsText(file);
      });
    });
  };

  this.initUI();
  this.initCanvasHanlders();

}

function fireEvent(element, type) {
  var evt;
  if (document.createEvent) {
    // dispatch for firefox + others
    evt = document.createEvent('HTMLEvents');
    // event type,bubbling,cancelable
    evt.initEvent(type, true, true );
    return !element.dispatchEvent(evt);
  } else {
    // dispatch for IE
    evt = document.createEventObject();
    return element.fireEvent('on' + type, evt);
  }
}

var editor = new StrokeEditor('canvas');
editor.startRenderLoop();
