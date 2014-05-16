
var strokeLib = require( './stroke' );

var Stroke = strokeLib.Stroke;

/**
 * An abstract class
 * @constructor
 * @param {Array} templates array of UnistrokeTemplate
 */

function UnistrokeRecognizer( options ) {
  throw new Error( 'UnistrokeRecognizer::constructor is not implemented' );
}

/**
 *
 * @param {Array} pionts array of Point in [ {x:x1, y:y1}, {}, ...]
 * @return {UnistrokeToken}
 */

UnistrokeRecognizer.prototype.recognize = function( points ) {
  throw new Error( 'UnistrokeRecognizer::recognize is not implemented' );
};

/**
 *
 * @param {UnistrokeTemplate} template
 * @return {Object} thisArg
 */

UnistrokeRecognizer.prototype.addTemplate = function( template ) {
  throw new Error( 'UnistrokeRecognizer::addTemplate is not implemented' );
};


/**
 *
 * @param {UnistrokeTemplate} template
 * @return {Object} thisArg
 */

UnistrokeRecognizer.prototype.removeTemplate = function( template ) {
  throw new Error( 'UnistrokeRecognizer::removeTemplate is not implemented' );
};

/**
 *
 * @param {String} name
 * @return {Object} thisArg
 */

UnistrokeRecognizer.prototype.removeTemplatesByName = function( name ) {
  throw new Error( 'UnistrokeRecognizer::addTemplatesByName is not implemented' );
};


/**
 *
 * @return {Object} thisArg
 */

UnistrokeRecognizer.prototype.clearTemplates = function() {
  throw new Error( 'UnistrokeRecognizer::clearTemplates is not implemented' );
};

/**
 *
 * @param {String} name
 * @return {Object} thisArg
 */

UnistrokeRecognizer.prototype.getNumberOfTemplates = function() {
  throw new Error( 'UnistrokeRecognizer::getNumberOfTemplates is not implemented' );
};

/**
 *
 * @param {Object} json
 * @return {Object} thisArg
 */

UnistrokeRecognizer.prototype.createTemplate = function( json ) {
  throw new Error( 'UnistrokeRecognizer::createTemplate is not implemented' );
};

/**
 *
 * @param {Number} d distance
 * @return {Number}
 */

UnistrokeRecognizer.prototype.getScore = function( d ) {
  throw new Error( 'UnistrokeRecognizer::getScore is not implemented' );
};

/**
 * @constructor
 * @param {String} name
 * @param {Array} points array of Points
 * @param {Function} parametrizeFn
 * @return {String}
 */

function UnistrokeTemplate( options ) {
  options || ( options = {} );
  if ( !options.name ) {
    throw new Error( 'UnistrokeTemplate::constructor can\'t init without name' );
  }
  this.name = options.name;

  options.stroke && ( this.stroke = options.stroke );
  ( typeof options.distanceToStroke === 'function' ) && ( this.distanceToStroke = options.distanceToStroke );
  ( typeof options.parametrize === 'function' ) && ( this.parametrize = options.parametrize );
}


/**
 * Override this function to redefine the distance between template and input stroke
 * @param {Stroke} stroke
 * @param {UnistrokeRecognizer} recognizer
 * @return {Number}
 */


UnistrokeTemplate.prototype.distanceToStroke = function( stroke, recognizer ) {
  throw new Error( 'UnistrokeTemplate::distanceToStroke is not implemented' );
};


/**
 * @param {Object} parameters
 * @return {Object}
 */

function identity( obj ) { return obj; }
UnistrokeTemplate.prototype.parametrize = identity;


/**
 * @constructor
 * @param {UnistrokeTemplate} template
 * @param {Stroke} stroke
 * @param {Number} score a number indicates how well the match is
 * @param {Object} options
 */

function UnistrokeToken( template, originalStroke, score, options ) {
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

  this._parameters = this._template.parametrize( params );
}


/**
 * @return {Object}
 */

UnistrokeToken.prototype.getValue =
UnistrokeToken.prototype.getParameters = function() {
  return this._parameters;
};

/**
 * @constructor
 * @param {Object} options
 */


function UnistrokeGesture( options ) {
  options || ( options = {} );

  if ( !options.tokenName ) {
    throw new Error( 'UnistrokeGesture:: constructor init without options.tokenName' );
  }

  this.tokenName = options.tokenName;
  this.name = options.name || this.tokenName;

  this.parameters = null;

  this._enabled = true;
  // pre callback is used to filter depends on context
  this._pre = options.pre || function( domain ) { return true; };
  this._priority = options.priority || 0;

  var _this = this;
  // command callback is used to generate domain specific request object
  this._command = options.command || function( domain ) { return _this.parameters; };
}

/**
 * @constructor
 * @return {String} unistroke token name of this gesture
 */
UnistrokeGesture.prototype.isInitialized = function() {
  return null !== this.parameters;
};


UnistrokeGesture.prototype.enable = function() {
  this._enabled = true;
};

UnistrokeGesture.prototype.disable = function() {
  this._enabled = false;
};


/**
 * @constructor
 * @return {String} unistroke token name of this gesture
 */
UnistrokeGesture.prototype.getTokenName = function() {
  return this.tokenName;
};

/**
 * @constructor
 * @return {String} return gesture name
 */
UnistrokeGesture.prototype.getName = function() {
  return this.name;
};

/**
 * @constructor
 * @return {number} return gesture's priority number
 */
UnistrokeGesture.prototype.priority = function( domain ) {
  if ( typeof this._priority === 'function' ) {
    return this._priority( domain );
  } else {
    return this._priority;
  }
};

/**
 * @ Filter function get called before gesture generates command
 * @return {Boolean}
 */
UnistrokeGesture.prototype.pre = function( domain ) {
  if ( this._enabled === true ) {
    return this._pre( domain );
  } else {
    return false;
  }
};

/**
 * @ Generate commands object
 * @return {Object}
 */
UnistrokeGesture.prototype.command = function( domain ) {
  return this._command( domain );
};

/**
 * @constructor
 * @return {String} unistroke token name of this gesture
 */
UnistrokeGesture.prototype.init = function( token ) {
  if ( token instanceof UnistrokeToken ) {
    token = token.getParameters();
  }

  if ( token.name !== this.getTokenName() ) {
    throw new Error( 'UnistrokeGesture::init can\'t init with unmatched token' );
    return false;
  }

  this.parameters = token;
  return this;
};

/**
 * @constructor
 * @param {Object} options
 */
function UnistrokeGestureManager( options ) {
  options || ( options = {} );

  this._gestures = {};
  this._gestureNameMap = {};

  this._domain = options.domain;

  var _this = this;
  if ( Array.isArray( options.gestures ) ) {
    options.gestures.forEach( function( ges ) {
      ges = _this.createGesture( ges );
      _this.addGesture( ges );
    } );
  }
}


/**
 * @param {Object} domain a facade object that provides domain info
 */
UnistrokeGestureManager.prototype.setDomain = function( domain ) {
  this._domain = domain;
};

/**
 * @return {Object}
 */
UnistrokeGestureManager.prototype.getDomain = function() {
  return this._domain;
};


/**
 * Return a list of gestures that match the input token
 * @param {UnistrokeToken|obj} token
 * @return {Array} array of gestures
 */

UnistrokeGestureManager.prototype.getGestureByName = function( name ) {
  return this._gestures[ tokenName ];
};


/**
 *
 * @param {UnistrokeToken} token
 * @return {Object} command
 */

UnistrokeGestureManager.prototype.getDomainCommandFromToken = function( token ) {
  // find gesture list;
  // init each gesture with token value;
  // call gesture.pre( domain ) to filter out some gestures;
  // pop the gesture with max priority value;
  // call gesture.command( domain ) to generate command request object;

  var domain = this.getDomain();
  if ( token instanceof UnistrokeToken ) {
    token = token.getParameters();
  }

  var gestures = this.getGesturesByTokenName( token.name );

  if ( !Array.isArray( gestures ) ) {
    gestures = [];
  }

  gestures = gestures.map( function( ges ) {  return ges.init( token ); } )
    .filter( function( ges ) { return ges.pre( domain ); } );

  var gesture = null, priority = -Infinity;

  gestures.forEach( function( ges ) {
    var prio = ges.priority();
    if ( prio > priority ) {
      priority = prio;
      gesture = ges;
    }
  } );

  return gesture && gesture.command( domain );
};


/**
 *
 * @param {Object} json
 * @return {UnistrokeGesture}
 */

UnistrokeGestureManager.prototype.createGesture = function( json ) {
  return new UnistrokeGesture( json );
};


/**
 * Return a list of gestures that match the input token
 * @param {UnistrokeToken|obj} token
 * @return {Array} array of gestures
 */

UnistrokeGestureManager.prototype.getGesturesByTokenName = function( tokenName ) {
  return this._gestures[ tokenName ] || [];
};


/**
 *
 * @param {String} name
 * @return {Object} thisArg
 */

UnistrokeGestureManager.prototype.getGestureByName = function( name ) {
  return this._gestureNameMap[ name ];
};

/**
 *
 * @param {UnistrokeGesture} ges
 * @return {Object} thisArg
 */

UnistrokeGestureManager.prototype.addGesture = function( ges ) {
  var tName = ges.getTokenName(), name = ges.getName();
  if ( !this._gestures[ tName ] ) {
    this._gestures[ tName ] = [];
  }

  this._gestures[ tName ].push( ges );
  this._gestureNameMap[ name ] = ges;
  return this;
};


/**
 *
 * @param {UnistrokeGesture} ges
 * @return {Object} thisArg
 */

UnistrokeGestureManager.prototype.removeGesture = function( ges ) {
  var tName = ges.getTokenName(), name = ges.getName();
  if ( this._gestures[ tName ] ) {
    var ind = this._gestures[ tName ].indexOf( ges );
    this._gestures[ tName ].splice( ind, 1 );
    if ( this._gestures[ tName ].length === 0 ) {
      delete this.gestures[ tName ];
    }
  }
  delete this._gestureNameMap[ name ];

  return this;
};


/**
 *
 * @return {Object} thisArg
 */

UnistrokeGestureManager.prototype.clearGestures = function() {
  this._gestures = {};
  this._gestureNameMap = {};
  return this;
};

/**
 *
 * @return {Number}
 */

UnistrokeGestureManager.prototype.getNumberOfGestures = function() {
  var gestures = this._gestures, num = 0;
  for ( var key in gestures ) {
    if ( gestures.hasOwnProperty( key ) ) {
      num += gestures[ key ].length;
    }
  }
  return num;
};


exports.UnistrokeRecognizer = UnistrokeRecognizer;
exports.UnistrokeTemplate = UnistrokeTemplate;
exports.UnistrokeToken = UnistrokeToken;
exports.UnistrokeGesture = UnistrokeGesture;
exports.UnistrokeGestureManager = UnistrokeGestureManager;
