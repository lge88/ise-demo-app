
var Stroke = require( '../stroke' ).Stroke;

var pointsArray = [112,138,112,136,115,136,118,137,120,136,123,136,125,136,128,136,131,136,134,135,137,135,140,134,143,133,145,132,147,132,149,132,152,132,153,134,154,137,155,141,156,144,157,152,158,161,160,170,162,182,164,192,166,200,167,209,168,214,168,216,169,221,169,223,169,228,169,231,166,233,164,234,161,235,155,236,147,235,140,233,131,233,124,233,117,235,114,238,112,238];

var s1 = new Stroke();
s1.fromOneDArray( pointsArray );

function parametrize( params ) {

  return params;
}

var t1 = {
  name: 'right-square-bracket',
  stroke: s1,
  parametrize: parametrize
};

exports.templates = [ t1 ];
