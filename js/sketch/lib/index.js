var dollar = require('./dollar');
// var DollarRecognizer = require('./DollarRecognizer');

var api = require( './api' );
exports.api = api;
exports.Stroke = require( './stroke' ).Stroke;
exports.Point = require( './stroke' ).Point;

exports.createUnistrokeRecognizer =
exports.Recognizer = function( options ) {
  options || ( options = {} );
  options.type || ( options.type = 'dollar' );

  switch( options.type ) {
  case 'dollar':
    return new dollar.DollarRecognizer( options );
    break;
  default:
    throw new Error( 'unknown uni-stroke recognizer of type ' + options.type );
  }
}

exports.createGestureManager =
exports.GestureManager = function( options ) {
  return new api.UnistrokeGestureManager( options );
}
