
var Stroke = require( '../stroke' ).Stroke;

var pointsArray = [81,219,84,218,86,220,88,220,90,220,92,219,95,220,97,219,99,220,102,218,105,217,107,216,110,216,113,214,116,212,118,210,121,208,124,205,126,202,129,199,132,196,136,191,139,187,142,182,144,179,146,174,148,170,149,168,151,162,152,160,152,157,152,155,152,151,152,149,152,146,149,142,148,139,145,137,141,135,139,135,134,136,130,140,128,142,126,145,122,150,119,158,117,163,115,170,114,175,117,184,120,190,125,199,129,203,133,208,138,213,145,215,155,218,164,219,166,219,177,219,182,218,192,216,196,213,199,212,201,211];

var s1 = new Stroke();
s1.fromOneDArray( pointsArray );

function parametrize( params ) {

  return params;
}

var t1 = {
  name: 'pigtail',
  stroke: s1,
  parametrize: parametrize
};

exports.templates = [ t1 ];