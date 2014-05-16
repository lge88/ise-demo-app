
var Stroke = require( '../stroke' ).Stroke;

var pointsArray = [137,139,135,141,133,144,132,146,130,149,128,151,126,155,123,160,120,166,116,171,112,177,107,183,102,188,100,191,95,195,90,199,86,203,82,206,80,209,75,213,73,213,70,216,67,219,64,221,61,223,60,225,62,226,65,225,67,226,74,226,77,227,85,229,91,230,99,231,108,232,116,233,125,233,134,234,145,233,153,232,160,233,170,234,177,235,179,236,186,237,193,238,198,239,200,237,202,239,204,238,206,234,205,230,202,222,197,216,192,207,186,198,179,189,174,183,170,178,164,171,161,168,154,160,148,155,143,150,138,148,136,148];

var s1 = new Stroke();
s1.fromOneDArray( pointsArray );

var s2 = s1.clone().reverse();

function parametrize( params ) {

  var corners = params.originalStroke.getCorners();

  if ( corners.length !== 3 ) {
    var stroke = params.sampledStroke, len = stroke.getNumOfPoints();
    var i1 = Math.round( len / 3 ), i2 = Math.round( len * 2 / 3 );
    corners = [];
    corners.push( stroke.getPointAt( 0 ) );
    corners.push( stroke.getPointAt( i1 ) );
    corners.push( stroke.getPointAt( i2 ) );
  }

  params.corners = corners;
  params.x1 = corners[ 0 ].x, params.x2 = corners[ 1 ].x, params.x3 = corners[ 2 ].x;
  params.y1 = corners[ 0 ].y, params.y2 = corners[ 1 ].y, params.y3 = corners[ 2 ].y;

  return params;
}

var t1 = {
  name: 'triangle',
  stroke: s1,
  parametrize: parametrize
};

var t2 = {
  name: 'triangle',
  stroke: s2,
  parametrize: parametrize
};

exports.templates = [ t1, t2 ];
