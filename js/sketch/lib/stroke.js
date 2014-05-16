// FUNCTIONS:
//   deg2rad
//   rad2deg
//   num
//   StrokePoint
//   Rectangle
//   diff
//   Stroke
//   shortStraw
//   median
// //
// [StrokePoint] class methods:
//   StrokePoint.create(x, y, t)
//   StrokePoint.distance(a, b)
// //
// [StrokePoint] instance methods:
//   StrokePoint::clone()
//   StrokePoint::getDistanceTo(other)
// //
// [Stroke] instance methods:
//   Stroke::hasTimestamp()
//   Stroke::setFromOneDArray(arr, hasTimestamp)
//   Stroke::clear()
//   Stroke::setFromJSON(json)
//   Stroke::setFromArray(arr)
//   Stroke::toArray()
//   Stroke::clearCache()
//   Stroke::clone()
//   Stroke::copy(stroke)
//   Stroke::getFirstPoint()
//   Stroke::getLastPoint()
//   Stroke::getResampled(n)
//   Stroke::getCentroid()
//   Stroke::getBoundingBox()
//   Stroke::getIndicativeAngle()
//   Stroke::getVectorRep()
//   Stroke::getAngles()
//   Stroke::getAnglesInDeg()
//   Stroke::getAnglesDiff()
//   Stroke::getAnglesDiffInDeg()
//   Stroke::getDiff()
//   Stroke::getPathLength(i, j)
//   Stroke::getNumOfPoints()
//   Stroke::getPointAt(ind)
//   Stroke::getCorners()
//   Stroke::getDistanceTo(stroke)
//   Stroke::getDistanceAtAngle(stroke, angleInRadians)
//   Stroke::getDistanceAtBestAngle(stroke, a, b, threshold)
//   Stroke::getOptimalCosineDistance(stroke)
//   Stroke::appendPoint(x, y, t)
//   Stroke::reverse()
//   Stroke::flipX()
//   Stroke::flipY()
//   Stroke::resample(n)
//   Stroke::rotateBy(angleInRadians)
//   Stroke::scaleTo(w, h)
//   Stroke::translateTo(p)
// //
// [shortStraw] class methods:
//   shortStraw.determineNumOfResamplePoints(stroke, diagInterval)
//   shortStraw.getCorners(stroke, strawWin, medThres, lineThres)
//   shortStraw.isLine(stroke, i, j, lineThres)
//   shortStraw.halfwayCorner(straws, strawWin, i, j)
//   shortStraw.postProcessCorners(stroke, corners, straws, strawWin, lineThres)

var DEG2RAD_RATIO = Math.PI / 180.0;
var RAD2DEG_RATIO = 180.0 / Math.PI;
function deg2rad(x) { return x * DEG2RAD_RATIO; }
function rad2deg(x) { return x * RAD2DEG_RATIO; }

function num(x, defaultVal) {
  if (typeof x === 'number'
      && !isNaN(x)) {
    return x;
  } else {
    if (typeof defaultVal !== 'undefined') {
      return defaultVal;
    } else {
      throw new Error('x is not a number!');
    }
  }
}

function StrokePoint(x, y, t) {
  this.x = num(x);
  this.y = num(y);
  this.t = num(t, null);
  return this;
}

StrokePoint.create = function(x, y, t) {
  return new StrokePoint(x, y, t);
};

StrokePoint.distance = function(a, b) {
  return a.getDistanceTo(b);
};

StrokePoint.prototype.clone = function() {
  return new StrokePoint(this.x, this.y, this.t);
};

StrokePoint.prototype.getDistanceTo = function(other) {
  var dx = this.x - other.x, dy = this.y - other.y;
  return Math.sqrt(dx * dx + dy * dy);
};

function Rectangle(x, y, w, h) {
  this.x = x;
  this.y = y;
  this.width = w;
  this.height = h;
}

function diff(arr, substract) {
  substract || (substract = function(a, b) { return a - b; });
  var len = arr.length;
  var i, p0, p1, out = [];
  for (i = 1; i < len; ++i) {
    p0 = arr[i-1];
    p1 = arr[i];
    out.push(substract(p1, p0));
  }
  return out;
}

function Stroke(points) {
  this._cache = {};
  this._points = [];

  if (points instanceof Stroke) { return this.copy(points); }
  if (!Array.isArray(points)) { return this; }

  var createStrokePoint = this.createStrokePoint;
  points.forEach(function(p) {
    var newPoint = createStrokePoint(p.x, p.y, p.t);
    this._points.push(newPoint);
  }, this);

  return this;
}

// Override this method can change the StrokePoint type
Stroke.prototype.createStrokePoint = StrokePoint.create;

Stroke.prototype.hasTimestamp = function() {
  if (this._points.length <= 0) return false;
  var t = this._points[0].t;
  return typeof t === 'number' && !isNaN(t);
};

Stroke.prototype.setFromOneDArray = function(arr, hasTimestamp) {
  var points = [], i = 0, len = arr.length;
  var Point = this.createStrokePoint, point;
  if (hasTimestamp) {
    while (i + 2 < len) {
      point = Point(arr[i], arr[i + 1], arr[i + 2]);
      points.push(point);
      i += 3;
    }
  } else {
    while (i + 1 < len) {
      point = Point(arr[i], arr[i + 1]);
      points.push(point);
      i += 2;
    }
  }

  this._points = points;
  this.clearCache();
  return this;
};

Stroke.prototype.clear = function() {
  this._points = [];
  this.clearCache();
  return this;
};

Stroke.prototype.setFromJSON = function(json) {
  var points;
  if (typeof json === 'string') {
    points = JSON.parse(json);
  } else {
    points = json;
  }

  this._points = points.map(function(p) {
    return this.createStrokePoint(p.x, p.y, p.t);
  }, this);
  this.clearCache();
};

Stroke.prototype.setFromArray = function(arr) {
  var createPoint = this.createStrokePoint;
  this._points = arr.map(function(item) {
    return createPoint.apply(null, item);
  });

  this.clearCache();
  return this;
};

Stroke.prototype.toArray = function() {
  if (this.hasTimestamp()) {
    return this._points.map(function(p) {
      return {x: p.x, y: p.y, t: p.t};
    });
  } else {
    return this._points.map(function(p) {
      return {x: p.x, y: p.y};
    });
  }
};

Stroke.prototype.clearCache = function() {
  delete this._cache;
  this._cache = {};
  return this;
};

Stroke.prototype.clone = function() {
  var newStroke = new Stroke();
  newStroke.copy(this);
  return newStroke;
};

Stroke.prototype.copy = function(stroke) {
  this._points = stroke._points.map(function(p) {
    return StrokePoint.create(p.x, p.y, p.t);
  });

  // TODO: deep copy maybe?
  this._cache = {};
  return this;
};

Stroke.prototype.getFirstPoint = function() {
  if (this._points.length <= 0) { return null; }
  return this._points[0].clone();
};

Stroke.prototype.getLastPoint = function() {
  if (this._points.length <= 0) { return null; }
  var points = this._points;
  return points[points.length - 1];
};

Stroke.prototype.getResampled = function(n) {
  n || (n = Stroke.DEFAULT_NUM_OF_SAMPLE_POINTS);
  if (!this._cache.resampled) {
    this._cache.resampled = {};
    if (!this._cache.resampled[n]) {
      var sample = this.clone().resample(n);
      this._cache.resampled[n] = sample;
    }
  }
  return this._cache.resampled[n];
};

Stroke.prototype.getCentroid = function() {
  if (!this._cache.centroid) {
    var x = 0.0, y = 0.0, points = this._points;
    var i, len = points.length;
    if (len <= 0) { return null; }

    for (i = 0; i < len; i++) {
	    x += points[i].x;
	    y += points[i].y;
    }
    x /= len;
    y /= len;
    this._cache.centroid = this.createStrokePoint(x, y);
  }
  return this._cache.centroid;
};

Stroke.prototype.getBoundingBox = function() {
  if (!this._cache.boundingBox) {
    var len = this._points.length;
    if (len <= 0) { return null; }

    var minX = +Infinity, maxX = -Infinity, minY = +Infinity, maxY = -Infinity;
    var points = this._points, i;
    for (i = 0; i < len; ++i) {
	    minX = Math.min(minX, points[i].x);
	    minY = Math.min(minY, points[i].y);
	    maxX = Math.max(maxX, points[i].x);
	    maxY = Math.max(maxY, points[i].y);
    }
    this._cache.boundingBox = new Rectangle(minX, minY, maxX - minX, maxY - minY);
  }
  return this._cache.boundingBox;
};

Stroke.prototype.getIndicativeAngle = function() {
  if (!this._cache.indicativeAngle) {
    var c = this.getCentroid(), points = this._points;
    if (points.length === 0) {
      this._cache.indicativeAngle = 0;
    } else {
      this._cache.indicativeAngle = Math.atan2(c.y - points[0].y, c.x - points[0].x);
    }
  }
  return this._cache.indicativeAngle;
};

Stroke.prototype.getVectorRep = function() {
  if (!this._cache.vectorRep) {
    var points = this._points;
    var sum = 0.0;
    var vector = [];

    points.forEach(function(p) {
      var x = p.x, y = p.y;
      vector.push(x);
      vector.push(y);
      sum += x*x + y*y;
    });

    var magnitude = Math.sqrt(sum);

    this._cache.vectorRep = vector.map(function(el) {
      return el / magnitude;
    });
  }

  return this._cache.vectorRep;
};

Stroke.prototype.getAngles = function() {
  if (!this._cache.angles) {
    var atan2 = Math.atan2;
    var diff = this.getDiff();
    this._cache.angles = diff.map(function(p) {
      return atan2(p.y, p.x);
    });
  }
  return this._cache.angles;
};

Stroke.prototype.getAnglesInDeg = function() {
  return this.getAngles().map(rad2Deg);
};

Stroke.prototype.getAnglesDiff = function() {
  if (!this._cache.anglesDiff) {
    this._cache.anglesDiff = diff(this.geAngles());
  }
  return this._cache.anglesDiff;
};

Stroke.prototype.getAnglesDiffInDeg = function() {
  return this.getAnglesDiff().map(rad2Deg);
};

Stroke.prototype.getDiff = function() {
  if (!this._cache.diff) {
    this._cache.diff = diff(this._points, function(a, b) {
      return {
        x: a.x - b.x,
        y: a.y - b.y
      };
    });
  }
  return this._cache.diff;
};

Stroke.prototype.getPathLength = function(i, j) {
  if (!this._cache.pathLengths) {
    this._cache.pathLengths = {};
  }

  var numOfPoints = this.getNumOfPoints();
  if (typeof i === 'undefined') { i = 0; }
  if (typeof j === 'undefined') { j = numOfPoints - 1; }
  if (j < i) { var tmp = i; i = j; j = tmp; }
  if (i < 0 || j + 1 > numOfPoints) { return 0.0; }

  var key = i + '_' + j;
  if (!this._cache.pathLengths[key]) {
    var d = 0.0, points = this._points;
    var k = i + 1;
    for (; k <= j; k++) { d += points[k - 1].getDistanceTo(points[k]); }
    this._cache.pathLengths[key] = d;
  }
  return this._cache.pathLengths[key];
};

Stroke.prototype.getNumOfPoints = function() { return this._points.length; };

Stroke.prototype.getPointAt = function(ind) { return this._points[ind]; };

Stroke.prototype.getCorners = function() {
  if (!this._cache.corners) {
    this._cache.corners = shortStraw(this);
  }
  return this._cache.corners;
};

// shortStraw algorithm to detect corners
function shortStraw(points, diagInterval, strawWin, medThres, lineThres) {
  diagInterval || (diagInterval = shortStraw.DIAGONAL_INTERVAL);
  strawWin || (strawWin = shortStraw.STRAW_WINDOW);
  medThres || (medThres = shortStraw.MEDIAN_THRESHOLD);
  lineThres || (lineThres = shortStraw.LINE_THRESHOLD);

  var stroke = new Stroke(points);
  if (stroke.getNumOfPoints() <= 2) {
    return stroke._points.slice();
  }

  var n = shortStraw.determineNumOfResamplePoints(stroke, diagInterval);
  var resampled = stroke.getResampled(n);
  var corners = shortStraw.getCorners(resampled, strawWin, medThres, lineThres);
  corners = corners.map(function(i) { return resampled.getPointAt(i); });

  return corners;
}

shortStraw.DIAGONAL_INTERVAL = 40;
shortStraw.STRAW_WINDOW = 3;
shortStraw.MEDIAN_THRESHOLD = 0.95;
shortStraw.LINE_THRESHOLD = 0.95;

shortStraw.determineNumOfResamplePoints = function(stroke, diagInterval) {
  var aabb = stroke.getBoundingBox();
  var w = aabb.width, h = aabb.height;
  var diag = Math.sqrt(w * w + h * h);
  var s = diag / diagInterval;
  var pLen = stroke.getPathLength();
  return Math.ceil(pLen / s);
};

function median(arr) {
  var len = arr.length;
  var sorted = arr.slice().sort(function(a, b) { return a - b; });
  if (len % 2 === 0) {
    var l = len >> 1, r = l + 1;
    return 0.5 * (sorted[l] + sorted[r]);
  } else {
    var mid = len >> 1;
    return sorted[mid];
  }
}
shortStraw.median = median;

shortStraw.getCorners = function(stroke, strawWin, medThres, lineThres) {
  var corners = [0];
  var straws = [];
  var w = strawWin;
  var i, len = stroke.getNumOfPoints() - w;
  var p1, p2, d;

  for (i = w; i < len; ++i) {
    p1 = stroke.getPointAt(i - w);
    p2 = stroke.getPointAt(i + w);
    d = StrokePoint.distance(p1, p2);
    straws.push(d);
  }

  var t = shortStraw.median(straws) * medThres;

  var indx, localMinIndx, localMinVal;
  var strawsLen = straws.length;

  for (i = w; i < len; ++i) {
    indx = i - w;
    if (straws[indx] < t) {
      localMinIndx = null;
      localMinVal = Infinity;
      while (indx < strawsLen && straws[indx] < t) {
        if (straws[indx] < localMinVal) {
          localMinVal = straws[indx];
          localMinIndx = i;
        }
        ++i;
        indx = i - w;
      }
      corners.push(localMinIndx);
    }
  }
  corners.push(stroke.getNumOfPoints() - 1);

  corners = shortStraw.postProcessCorners(stroke, corners, straws, w, lineThres);
  return corners;
};

shortStraw.isLine = function(stroke, i, j, lineThres) {
  var pi = stroke.getPointAt(i);
  var pj = stroke.getPointAt(j);
  var d = StrokePoint.distance(pi, pj);
  var l = stroke.getPathLength(i, j);
  return d / l > lineThres;
};

shortStraw.halfwayCorner = function(straws, strawWin, i, j) {
  var w = strawWin;
  var q = (j - i) / 4;
  var minVal = Infinity;
  var minIndx = null;
  var k, start = Math.round(i + q), end = Math.round(j - q);
  var indx;

  for (k = start; k <= end; ++k) {
    indx = k - w;
    if (straws[indx] < minVal) {
      minVal = straws[indx];
      minIndx = k;
    }
  }
  return minIndx;
};

shortStraw.postProcessCorners = function(stroke, corners, straws, strawWin, lineThres) {
  var i, len = corners.length, c1, c2;
  var updated = true;

  while (updated) {
    updated = false;
    for (i = 1; i < len; ++i) {
      c1 = corners[i - 1];
      c2 = corners[i];
      if (!shortStraw.isLine(stroke, c1, c2, lineThres)) {
        var newCorner = shortStraw.halfwayCorner(straws, strawWin, c1, c2);
        if (newCorner > c1 && newCorner < c2) {
          corners.splice(i, 0, newCorner);
          updated = true;
        }
      }
    }
  }

  // len = corners.length - 2 won't work
  // corners.length is changing.
  for (i = 1; i < corners.length - 1; ++i) {
    c1 = corners[i - 1];
    c2 = corners[i + 1];
    if (shortStraw.isLine(stroke, c1, c2, lineThres)) {
      corners.splice(i, 1);
      --i;
    }
  }

  return corners;
};

Stroke.prototype.getDistanceTo = function(stroke) {
  var d = 0.0, pts1 = this._points;
  var newStroke = new Stroke(stroke);

  // Ensure pts1.length == pts2.length
  if (pts1.length !== newStroke.points.length) {
    newStroke.resample(pts1.length);
  }
  var pts2 = newStroke.points;

  for (var i = 0; i < pts1.length; ++i) {
	  d += pts1[i].getDdistanceTo(pts2[i]);
  }

  return d / pts1.length;
};

Stroke.ANGLE_RANGE = deg2rad(45.0);
Stroke.ANGLE_PRECISION = deg2rad(2.0);
Stroke.PHI = 0.5 * (-1.0 + Math.sqrt(5.0));

Stroke.prototype.getDistanceAtAngle = function(stroke, angleInRadians) {
  var newStroke = this.clone().rotateBy(angleInRadians);
  return newStroke.getDistanceTo(stroke);
};

Stroke.prototype.getDistanceAtBestAngle = function(stroke, a, b, threshold) {
  a || (a = -Stroke.ANGLE_RANGE);
  b || (b = Stroke.ANGLE_RANGE);
  threshold || (threshold = Stroke.ANGLE_PRECISION);
  var phi = Stroke.PHI;

  var x1 = phi * a + (1.0 - phi) * b;
  var f1 = this.getDistanceAtAngle(stroke, x1);

  var x2 = (1.0 - phi) * a + phi * b;
  var f2 = this.getDistanceAtAngle(stroke, x2);

  while (Math.abs(b - a) > threshold) {
	  if (f1 < f2) {
	    b = x2;
	    x2 = x1;
	    f2 = f1;
	    x1 = phi * a + (1.0 - phi) * b;
	    f1 = this.getDistanceAtAngle(stroke, x1);
	  } else {
	    a = x1;
	    x1 = x2;
	    f1 = f2;
	    x2 = (1.0 - phi) * a + phi * b;
	    f2 = this.getDistanceAtAngle(stroke, x2);
	  }
  }
  return Math.min(f1, f2);
};

Stroke.prototype.getOptimalCosineDistance = function(stroke) {
  var v1 = this.getVectorRep();
  stroke = new Stroke(stroke);
  var v2 = stroke.getVectorRep();

  var a = 0.0;
  var b = 0.0;
  for (var i = 0; i < v1.length; i += 2) {
	  a += v1[i] * v2[i] + v1[i + 1] * v2[i + 1];
    b += v1[i] * v2[i + 1] - v1[i + 1] * v2[i];
  }
  var angle = Math.atan(b / a);
  return Math.acos(a * Math.cos(angle) + b * Math.sin(angle));
};

Stroke.prototype.appendPoint = function(x, y, t) {
  if (typeof x === 'object') {
    y = x.y;
    t = x.t;
    x = x.x;
  }

  var p = new StrokePoint(x, y, t);
  this._points.push(p);
  this.clearCache();
  return this;
};

Stroke.prototype.reverse = function() {
  this._points.reverse();
  this.clearCache();
  return this;
};

Stroke.prototype.flipX = function() {
  this._points.forEach(function(p) {
    p.x = -p.x;
  });
  this.clearCache();
  return this;
};

Stroke.prototype.flipY = function() {
  this._points.forEach(function(p) {
    p.y = -p.y;
  });
  this.clearCache();
  return this;
};

Stroke.DEFAULT_NUM_OF_SAMPLE_POINTS = 64;
Stroke.prototype.resample = function(n) {
  n || (n = Stroke.DEFAULT_NUM_OF_SAMPLE_POINTS);

  var points = this._points, len = points.length;
  if (len <= 0) return this;

  var Point = this.createStrokePoint;
  var I = this.getPathLength() / (n - 1);
  var D = 0.0;

  var newPoints = [points[0]];

  for (var i = 1; i < points.length; i++) {
	  var d = points[i - 1].getDistanceTo(points[i]);
	  if ((D + d) >= I) {
	    var qx = points[i - 1].x + ((I - D) / d) * (points[i].x - points[i - 1].x);
	    var qy = points[i - 1].y + ((I - D) / d) * (points[i].y - points[i - 1].y);
	    var qt = points[i - 1].t + ((I - D) / d) * (points[i].t - points[i - 1].t);
	    var q = Point(qx, qy, qt);
	    newPoints.push(q);
	    points.splice(i, 0, q);
	    D = 0.0;
	  } else {
      D += d;
    }
  }

  // somtimes we fall a rounding-error short of adding the last point, so add it if so
  if (newPoints.length === n - 1) {
	  newPoints.push(Point(points[points.length - 1].x, points[points.length - 1].y, points[points.length - 1].t));
  }

  this._points = newPoints;

  this.clearCache();
  return this;
};


Stroke.prototype.rotateBy = function(angleInRadians) {

  var points = this._points;
  var c = this.getCentroid(points);
  var cos = Math.cos(angleInRadians);
  var sin = Math.sin(angleInRadians);

  points.forEach(function(p) {
    var newX = (p.x - c.x) * cos - (p.y - c.y) * sin + c.x;
	  var newY = (p.x - c.x) * sin + (p.y - c.y) * cos + c.y;
    p.x = newX;
    p.y = newY;
  });

  this.clearCache();
  return this;
};

Stroke.prototype.scaleTo = function(w, h) {
  if (arguments.length === 1) {
    return this.scaleTo(w, w);
  }

  var points = this._points;
  var box = this.getBoundingBox(points);

  // avoid divide by zero trouble
  var bw = box.width === 0 ? 0.1 : box.width;
  var bh = box.height === 0 ? 0.1 : box.height;

  points.forEach(function(p) {
    p.x = p.x * (w / bw);
    p.y = p.y * (h / bh);
  });

  this.clearCache();
  return this;
};

Stroke.prototype.translateTo = function(p) {
  var points = this._points;
  var c = this.getCentroid();
  var dx = p.x - c.x, dy = p.y - c.y;

  points.forEach(function(p) {
    p.x += dx;
    p.y += dy;
  });

  this.clearCache();
  return this;
};

if (typeof exports !== 'undefined') {
  exports.Stroke = Stroke;
  exports.shortStraw = shortStraw;
  exports.Point = Point;
  exports.Rectangle = Rectangle;
  exports.deg2Rad = deg2Rad;
  exports.rad2deg = rad2deg;
}
