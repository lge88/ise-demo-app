// FUNCTIONS:
//   UnistrokeRecognizer
//   UnistrokeTemplate
//   identity
//   UnistrokeToken
//   DollarTemplate
//   DollarRecognizer
// //
// [UnistrokeRecognizer] instance methods:
//   UnistrokeRecognizer::recognize(points)
// //
// [UnistrokeTemplate] instance methods:
//   UnistrokeTemplate::distanceToStroke(stroke, recognizer)
// //
// [UnistrokeToken] instance methods:
//   UnistrokeToken::getParameters()
// //
// [DollarTemplate] instance methods:
//   DollarTemplate::distanceToStroke( stroke, options )
// //
// [DollarRecognizer] instance methods:
//   DollarRecognizer::getScore( d )
//   DollarRecognizer::createTemplate( json )
//   DollarRecognizer::addTemplate( t )
//   DollarRecognizer::removeTemplate( t )
//   DollarRecognizer::getNumberOfTemplates()
//   DollarRecognizer::clearTemplates()
//   DollarRecognizer::removeTemplatesByName( name )
//   DollarRecognizer::recognize( points )

var Stroke = typeof require === 'function' ?
  require('./stroke').Stroke : window.Stroke;

var templates = require( './unistroke-templates' ).templates;

/**
 * An abstract class
 * @constructor
 * @param {Array} templates array of UnistrokeTemplate
 */

function UnistrokeRecognizer() {
  throw new Error('UnistrokeRecognizer::constructor is not implemented');
}

/**
 *
 * @param {Array} pionts array of Point in [{x:x1, y:y1}, {}, ...]
 * @return {UnistrokeToken}
 */

UnistrokeRecognizer.prototype.recognize = function(points) {
  throw new Error('UnistrokeRecognizer::recognize is not implemented');
};

/**
 * @constructor
 * @param {String} name
 * @param {Array} points array of Points
 * @param {Function} parametrizeFn
 * @return {String}
 */

function UnistrokeTemplate(options) {
  options || (options = {});
  if (!options.name) {
    throw new Error('UnistrokeTemplate::constructor can\'t init without name');
  }
  this.name = options.name;

  options.stroke && (this.stroke = options.stroke);
  (typeof options.distanceToStroke === 'function') && (this.distanceToStroke = options.distanceToStroke);
  (typeof options.parametrize === 'function') && (this.parametrize = options.parametrize);
}


/**
 * Override this function to redefine the distance between template and input stroke
 * @param {Stroke} stroke
 * @param {UnistrokeRecognizer} recognizer
 * @return {Number}
 */


UnistrokeTemplate.prototype.distanceToStroke = function(stroke, recognizer) {
  throw new Error('UnistrokeTemplate::distanceToStroke is not implemented');
};


/**
 * @param {Object} parameters
 * @return {Object}
 */

function identity(obj) { return obj; }
UnistrokeTemplate.prototype.parametrize = identity;


/**
 * @constructor
 * @param {UnistrokeTemplate} template
 * @param {Stroke} stroke
 * @param {Number} score a number indicates how well the match is
 * @param {Object} options
 */

function UnistrokeToken(template, originalStroke, score, options) {
  this._template = template;

  var params = {
    name: template.name,
    score: score
  };

  params.originalStroke = originalStroke;
  var sampledStroke = params.sampledStroke = options.sampledStroke || originalStroke.clone().resample();

  params.firstPoint = sampledStroke.getFirstPoint();
  params.lastPoint = sampledStroke.getLastPoint();
  params.boundingBox = sampledStroke.getBoundingBox();
  params.centroid = sampledStroke.getCentroid();
  params.indicativeAngle = sampledStroke.getIndicativeAngle();
  params.corners = sampledStroke.getCorners();

  this._parameters = this._template.parametrize(params);
}


/**
 * @return {Object}
 */

UnistrokeToken.prototype.getValue =
UnistrokeToken.prototype.getParameters = function() {
  return this._parameters;
};


var algorithms = {
  GOLDEN_SECTION_SEARCH: 0,
  PROTRACTOR: 1
}

function DollarTemplate(name, stroke) {
  this.name = name;
  this.stroke = stroke.clone();
}

DollarTemplate.prototype = Object.create( UnistrokeTemplate.prototype );
DollarTemplate.prototype.constructor = DollarTemplate;
DollarTemplate.prototype.distanceToStroke = function( stroke, options ) {
  switch( options.algorithm ) {
  case algorithms.GOLDEN_SECTION_SEARCH:
    return this.stroke.distanceAtBestAngle(
      stroke,
        -options.angleRange,
      options.angleRange,
      options.anglePrecision
    );
    break;
  case algorithms.PROTRACTOR:
    return this.stroke.optimalCosineDistance( stroke );
    break;
  default:
    throw new Error( 'Unknow algorithm ' + options.algorithm );
  }
};


function DollarRecognizer( options ) {
  options || ( options = {} );

  this.numOfSampledPoints = options.numOfSampledPoints || 64;
  this.squareSize = options.squareSize || 250.0;
  this.origin = options.origin || new Point( 0, 0 );
  this.algorithm = options.algorithm || algorithms.GOLDEN_SECTION_SEARCH;

  switch( this.algorithm ) {
  case algorithms.GOLDEN_SECTION_SEARCH:
    var ss = this.squareSize;
    this.halfDiagonal = 0.5 * Math.sqrt( ss*ss + ss*ss );
    this.angleRange = options.angleRange || deg2Rad( 45.0 );
    this.anglePrecision = options.anglePrecision || deg2Rad( 2.0 ) ;
    break;
  case algorithms.PROTRACTOR:
    break;
  default:
    throw new Error( 'Unknow algorithm ' + this.algorithm );
  }

  this.templates = [];
  options.templates || ( options.templates = templates );

  var _this = this;
  if ( Array.isArray( options.templates ) ) {
    options.templates.forEach( function( t ) {
      t = _this.createTemplate( t );
      _this.addTemplate( t );
    } );
  }
  return this;
}

DollarRecognizer.prototype = Object.create( UnistrokeRecognizer.prototype );
DollarRecognizer.prototype.constructor = DollarRecognizer;


DollarRecognizer.prototype.getScore = function( d ) {
  switch( this.algorithm ) {
  case algorithms.GOLDEN_SECTION_SEARCH:
    return 1.0 - d / this.halfDiagonal;
    break;
  case algorithms.PROTRACTOR:
    return 1.0 / d;
    break;
  default:
    throw new Error( 'Unknow algorithm ' + this.algorithm );
  }
}

DollarRecognizer.prototype.createTemplate = function( json ) {

  if ( json.array ) {
    json.stroke = new Stroke();
    json.stroke.fromOneDArray( json.array );
    delete json.array;
  }

  if ( json.points ) {
    json.stroke = new Stroke( json.points );
    delete json.points;
  }

  if ( json.stroke ) {
    var s = json.stroke;
    s.resample( this.numOfSampledPoints );

    var radians = s.getIndicativeAngle();
    s.rotateBy( -radians ).scaleTo( this.squareSize ).translateTo( this.origin );
  }

  return new DollarTemplate( json );
}

DollarRecognizer.prototype.addTemplate = function( t ) {
  this.templates.push( t );
  return this;
};

DollarRecognizer.prototype.removeTemplate = function( t ) {
  var ind = this.templates.indexOf( t );
  this.templates.splice( ind, 1 );
  return this;
};

DollarRecognizer.prototype.getNumberOfTemplates = function() {
  return this.templates.length;
}

DollarRecognizer.prototype.clearTemplates = function() {
  this.templates = [];
  return this;
}

DollarRecognizer.prototype.removeTemplatesByName = function( name ) {
  var _this = this;
  this.templates
    .filter( function( t ) { return t.name === name; } )
    .forEach( function( t ) { _this.removeTemplate( t ); } );

  return this;
};

DollarRecognizer.prototype.recognize = function( points ) {
  var stroke = new Stroke( points );
  var originalStroke = this.originalStroke = stroke.clone();

  var sampledStroke = this.sampledStroke = stroke.getSample();
  stroke.resample();

  var radians = stroke.getIndicativeAngle();
  var cc = stroke.getCentroid();
  stroke.rotateBy( -radians );
  var sampledStrokeAfterRotate = this.sampledStrokeAfterRotate = stroke.clone();

  stroke.scaleTo( this.squareSize );
  stroke.translateTo( this.origin );

  var b = +Infinity, u = -1, d;
  for ( var i = 0, len = this.templates.length; i < len; ++i ) {
    d = this.templates[ i ].distanceToStroke( stroke, this );

	if (d < b) {
	  b = d;
	  u = i;
	}
  }

  if ( u === -1 ) {
    var noMatch = new UnistrokeTemplate( { name: 'no-match' } );
    return new UnistrokeToken(
      noMatch,
      originalStroke,
      0.0,
      { sampledStroke: sampledStroke } );
  } else {
    return new UnistrokeToken(
      this.templates[ u ],
      originalStroke,
      this.getScore( b ),
      { sampledStroke: sampledStroke }
    );
  }
};

exports.algorithms = algorithms;
exports.DollarTemplate = DollarTemplate;
exports.DollarRecognizer = DollarRecognizer;
