

(function() {
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame || window.msRequestAnimationFrame ||
        function(/* function */ callback, /* DOMElement */ element){
          window.setTimeout(callback, 1000 / 30);
        };
  window.requestAnimationFrame = requestAnimationFrame;
})();

var can, strokeBox, tokenBox, clearButton, clearButLatestButton;
var context;
var recognizer = require( 'unistroke-recognize' ).createUnistrokeRecognizer();
var Stroke = require( 'unistroke-recognize' ).Stroke;
var mouseX, mouseY;
var stroke = [];
var strokes = [];
var corners = [];
var token;
var rotatedSketch = [];
var normalizedSketch = [];

var colors = [ 'red', 'green', 'yellow', 'black', 'purple' ];

// var colors = arrGen( 5, function() {
//   return '#'+Math.floor(Math.random()*16777215).toString(16);
// } );

var renderTasks = [
  clearCanvas,
  drawTemplate,
  drawSketch,
  // drawRotatedSketch,
  drawNormalizdeSketch,
  drawCorners
];


init();
update();
animate();

var getPointFromTouchEvent = function( ev ) {
  var offset = getOffsetToWindow( can );
  var left = offset.left, top = offset.top;

  return function( ev ) {
    var x = ev.touches[0].clientX - left, y = ev.touches[0].clientY - top;
    return {
      x: x,
      y: y
    };
  };
}();

function getOffsetToWindow( el ) {
  var x = el.offsetLeft, y = el.offsetTop;

  el = el.offsetParent;

  while ( el )  {
    x += el.offsetLeft;
    y += el.offsetTop;
    el = el.offsetParent;
  }
  return {
    left: x,
    top: y
  };
}

function init() {
  can = document.getElementById( 'canvas' );
  strokeBox = document.getElementById( 'stroke-output' );
  tokenBox = document.getElementById( 'token-output' );
  // clearButton = document.getElementById( 'clear-btn' );
  // clearButLatestButton = document.getElementById( 'clear-but-latest-btn' );

  context = can.getContext( '2d' );
  context.strokeStyle = 'black';

  can.addEventListener( 'mousedown', onMouseDown );
  can.addEventListener( 'mouseup', onMouseUp );
  can.addEventListener( 'touchstart', onTouchStart );
  can.addEventListener( 'touchend', onTouchEnd );

  document.getElementById( 'clear-btn' ).addEventListener( 'click', clearStrokes );
  // clearButLatestButton.addEventListener( 'click', clearButLatestStroke );
  // document.getElementById( 'refresh-btn' ).addEventListener( 'click', update );
  document.getElementById( 'upload-btn' ).addEventListener( 'click', uploadTemplate );
  // document.getElementById( 'template-name' ).addEventListener( 'change', update );
  document.getElementById( 'reverse-btn' ).addEventListener( 'click', reverseStroke );
  document.getElementById( 'flipX-btn' ).addEventListener( 'click', flipXStroke );
  document.getElementById( 'flipY-btn' ).addEventListener( 'click', flipYStroke );
  document.getElementById( 'normalize-btn' ).addEventListener( 'click', normalizeStroke );
  document.getElementById( 'eval-btn' ).addEventListener( 'click', evalPoints );


  initTemplateList();
}


function update() {
  var stroke = getUserSketch();
  if ( stroke ) {
    var sampled = ( new Stroke( stroke ) ).getSample();
    var a = sampled.getIndicativeAngle();
    var cc = sampled.getCentroid();
    var rotated = sampled.clone().rotateBy( -a );
    rotatedSketch = rotated.points;
    normalizedSketch = rotated.clone().scaleTo( 250 ).translateTo( { x: 0, y: 0 } ).points;
    printTemplateCode( stroke );
    token = recognizeOneStroke( stroke ).getValue();
    corners = token.corners.slice();
    printToken( token );
  }
  updateTemplateList();
}

function diff( array, substract ) {
  substract || ( substract = function( a, b ) { return a - b; } );
  var len = array.length;
  var i, p0, p1, out = [];
  for ( i = 1; i < len; ++i ) {
    p0 = array[i-1];
    p1 = array[i];
    out.push( substract( p1, p0 ) );
  }
  return out;
}


function animate() {
  requestAnimationFrame( animate );
  render();
}

function render() {
  renderTasks.forEach( function( t ) {
    t();
  } );
}

function drawSketch() {
  var i = 0, len = strokes.length;

  if ( len >= 1 ) {

    context.save();
    context.strokeStyle = 'black';
    context.lineWidth = 1;

    while ( i < len -1 ) {
      drawOneStroke( strokes[i] );
      i = i + 1;
    }

    context.strokeStyle = 'blue';
    context.lineWidth = 3;
    context.fillStyle = 'red';

    var p0 = strokes[i][0];
    drawSquare( p0.x, p0.y, 20 );
    drawOneStroke( strokes[i] );

    context.restore();
  }
}

function drawRotatedSketch() {
  context.save();
  context.strokeStyle = 'black';
  context.lineWidth = 2;

  drawOneStroke( rotatedSketch );

  context.restore();

}

function drawNormalizdeSketch() {
  context.save();
  context.strokeStyle = 'green';
  context.lineWidth = 2;

  context.translate( 250, 250 );
  drawOneStroke( normalizedSketch );

  context.restore();

}

function drawCorners() {
  context.save();
  context.font = '20px Georgia';
  corners.forEach( function( c, ind ) {
    context.fillText( ind, c.x, c.y );
  } );
  context.restore();
}


function drawTemplate() {
  var tmpl = getSelectedTemplate();

  tmpl
    .filter( function( t, ind ) { return ind ===0; } )
    .forEach( function( t, ind ) {
    context.save();

    context.strokeStyle = colors[ind % 5];
    context.fillStyle = 'red';
    context.lineWidth = 2;

    context.translate( 250, 250 );
    if ( t.stroke ) {
      var p0 = t.stroke.points[0];
      drawSquare( p0.x, p0.y, 20 );
      drawOneStroke( t.stroke.points );
    } else if ( t.name === 'line' ){
      drawSquare( -125, 0, 10 );
      context.beginPath();
      context.moveTo( -125, 0 );
      context.lineTo( 125, 0 );
      context.stroke();
    }
    context.restore();
  } );
}


function drawSquare( x, y, size ) {
  var d = size/2;
  context.fillRect( x-d, y-d, size, size );
}

function __stroke__transforms() {}

function evalPoints() {
  var str = strokeBox.value;
  debugger;
  var points = JSON.parse( str ).points;
  setUserSketch( points );
  update();
}

function setUserSketch( points ) {
  if ( strokes.length === 0 ) {
    strokes.push( points );
  } else {
    strokes[ strokes.length-1 ] = points;
  }
}

function reverseStroke() {
  getUserSketch().reverse();
  update();
}

function flipXStroke() {
  getUserSketch().forEach( function( p ) {
    p.x = -p.x;
  } );
  update();
}

function flipYStroke() {
  getUserSketch().forEach( function( p ) {
    p.y = -p.y;
  } );
  update();
}

function normalizeStroke() {
  var sketch = getUserSketch();
  if ( sketch ) {
    var tmpl = recognizer.createTemplate( {
      name: 'tmp',
      points: sketch
    } );
    var normalized = tmpl.stroke.points.map( function( p ) {
      return {
        x: p.x + 250,
        y: p.y + 250
      };
    } );
    setUserSketch( normalized );
    update();
  }
}




function getSelectedTemplate() {
  var name = document.getElementById( 'template-list' ).value;
  return recognizer.templates.filter( function( t ) {
    return t.name === name;
  } );
}


function debug( msg ) {
  strokeBox.innerHTML += msg;
}

function drawOneStroke( stroke ) {
  var i, len = stroke.length;
  if ( len > 2 ) {
    context.beginPath();
    context.moveTo( stroke[0].x, stroke[0].y );
    for ( i = 1; i < len; ++i ) {
      context.lineTo( stroke[i].x, stroke[i].y );
    }
    context.stroke();
  }
}


function clearCanvas() {
  context.clearRect( 0, 0, context.canvas.width, context.canvas.height ) ;
}

function clearStrokes() {
  corners = [];
  stroke = [];
  strokes = [];
  clearCanvas();
}

function clearButLatestStroke() {
  strokes = strokes.slice( -1 );
  clearCanvas();
}

function getTemplateName() {
  return document.getElementById( 'template-name' ).value;
}

function getUserSketch() {
  return strokes[ strokes.length -1 ];
}

function onExportBtn() {
  var name = getTemplateName();

  var stroke = new Stroke( getUserSketch() );
  var points = stroke.getSample( 64 ).points.map( function( p ) {
    return {
      x: Math.round( p.x ),
      y: Math.round( p.y )
    };
  } );

  var code = exportToTemplate( name, points, { reversed: true } );
  console.log( code );
}

function exportToTemplate( name, stroke, options ) {
  // options || ( options = {} );
  // var reversed = options.reversed || false;
  // var flipX = options.flipX || false;
  // var flipY = options.flipY || false;

  stroke = ( new Stroke( stroke ) )
    .getSample( 64 );

  // reversed && stroke.reverse();
  // flipX && stroke.flipX();
  // flipY && stroke.flipY();

  var points = stroke.points
    .map( function( p ) {
      return {
        x: Math.round( p.x ),
        y: Math.round( p.y )
      };
    } );

  var tmpl = {
    name: name,
    points: points
  };

  return tmpl;
  // JSON.stringify( tmpl ).replace( /"%parametrize%"/, 'function( value ) { return value; }' );

}

function getOptions() {
  return {
    reversed: document.getElementById( 'reversed-option' ).checked,
    flipX: document.getElementById( 'flipX-option' ).checked,
    flipY: document.getElementById( 'flipY-option' ).checked
  };
}

function uploadTemplate() {
  var name = getTemplateName();
  var stroke = getUserSketch();
  var options = getOptions();
  var tmpl = exportToTemplate( name, stroke, options );

  superagent
    .post( '/unistroke-templates' )
    .send( tmpl )
    .end( function( err, res ) {
      debug( err );
      alert( JSON.stringify( res.body ) );
    } );

}


function onMouseDown( ev ) {
  ev.preventDefault();

  clearStrokes();

  var x = ev.offsetX, y = ev.offsetY;
  can.addEventListener( 'mousemove', onMouseMove );

  stroke = [];
  stroke.push( { x: x, y: y } );
  strokes.push( stroke );

}

function onTouchStart( ev ) {
  ev.preventDefault();
  clearStrokes();

  if ( ev.touches.length === 1 ) {
    can.addEventListener( 'touchmove', onTouchMove );
    stroke = [];
    stroke.push( getPointFromTouchEvent( ev ) );
    strokes.push( stroke );
  }

}

function onTouchMove( ev ) {
  ev.preventDefault();
  if ( ev.touches.length === 1 ) {
    stroke.push( getPointFromTouchEvent( ev ) );
  }
}

function onTouchEnd( ev ) {
  ev.preventDefault();
  can.removeEventListener( 'touchmove', onTouchMove );
  update();
  stroke = [];
}

function onMouseUp( ev ) {
  ev.preventDefault();
  can.removeEventListener( 'mousemove', onMouseMove );
  update();
  stroke = [];
}

function printTemplateCode( stroke ) {
  var name = getTemplateName();
  strokeBox.innerHTML = JSON.stringify( exportToTemplate( name, stroke ) );
}

function updateTemplateList() {
  if ( token && token.name ) {
    document.getElementById( 'template-list' ).value = token.name;
  }
}

function initTemplateList() {
  var tmpls = recognizer.templates.map( function( t ) {
    return t.name;
  } );
  var list = document.getElementById( 'template-list' );
  tmpls.forEach( function( t ) {
    var item = document.createElement( 'option' );
    item.value = t;
    item.innerHTML = t;
    list.appendChild( item );
  } );
}

function printToken( token ) {
  var val = token;
  var picked = {};
  Object.keys( val )
    .filter( function( key ) {
      var re = /[Ss]troke/;
      return !re.test( key );
    } )
    .forEach( function( key ) {
      picked[key] = val[key];
    } );

  tokenBox.innerHTML = JSON.stringify( picked, function( key, value ) {
    if ( typeof value === 'number' ) {
      return Math.round( value*10000 )/10000;
    } else {
      return value;
    }
  }, 2 );
}

function recognizeOneStroke( stroke ) {
  return recognizer.recognize( stroke );
}

function onMouseMove( ev ) {

  ev.preventDefault();

  var x = ev.offsetX, y = ev.offsetY;
  stroke.push( { x: x, y: y } );

}
