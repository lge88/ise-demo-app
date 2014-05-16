
var Stroke = require( '../stroke' ).Stroke;

var pointsArray = [127,141,124,140,120,139,118,139,116,139,111,140,109,141,104,144,100,147,96,152,93,157,90,163,87,169,85,175,83,181,82,190,82,195,83,200,84,205,88,213,91,216,96,219,103,222,108,224,111,224,120,224,133,223,142,222,152,218,160,214,167,210,173,204,178,198,179,196,182,188,182,177,178,167,170,150,163,138,152,130,143,129,140,131,129,136,126,139];

var s1 = new Stroke();
s1.fromOneDArray( pointsArray );

function parametrize( params ) {

  return params;
}

var t1 = {
  name: 'circle',
  stroke: s1,
  parametrize: parametrize
};

exports.templates = [ t1 ];
