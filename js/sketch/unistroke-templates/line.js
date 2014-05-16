
var threshold = 7;
exports.templates = [
  {
    name: 'line',
    distanceToStroke: function( stroke, options ) {
      var s = options.sampledStrokeAfterRotate;
      var b = s.getBoundingBox();
      if ( b.width / b.height > threshold ) {
        return 0;
      } else {
        return +Infinity;
      }
    },
    parametrize: function( params ) {
      params.x1 = params.firstPoint.x;
      params.y1 = params.firstPoint.y;
      params.x2 = params.lastPoint.x;
      params.y2 = params.lastPoint.y;
      return params;
    }
  }
];
