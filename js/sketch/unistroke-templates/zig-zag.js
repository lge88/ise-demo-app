
var Stroke = require( '../stroke' ).Stroke;

var pointsArray = [307,216,333,186,356,215,375,186,399,216,418,186];

var s1 = new Stroke();
s1.fromOneDArray( pointsArray );

function parametrize( params ) {

  return params;
}

var t1 = {
  name: 'zig-zag',
  stroke: s1,
  parametrize: parametrize
};

exports.templates = [ t1 ];
