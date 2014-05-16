
var templates = [
  'line',
  'triangle',
  'x',
  'rectangle',
  'circle',
  'check',
  'caret',
  'zig-zag',
  'arrow',
  'left-square-bracket',
  'right-square-bracket',
  'v',
  'delete',
  'left-curly-brace',
  'right-curly-brace',
  'star',
  'pigtail'
];

var all = [];

templates.forEach( function( t ) {
  all = all.concat( require( './' + t ).templates );
} );

exports.templates = all;
