function arrGen() {
  var args =  Array.prototype.slice.call( arguments );
  var fn = args.pop();
  var sizes = Array.isArray( args[0] ) ? args[0] : args;
  var dim = sizes.length;
  var indices = sizes.map( function() { return 0; } );
  var total = sizes.reduce( function( a, b ) { return a*b; } );
  var i, j, out = [], target, index, len = indices.length;

  for ( i = 0; i < total; ++i ) {
    // 1) find target:
    {
      j = 1, index = indices[0];
      target = out;
      while ( j < len ) {
        if ( !Array.isArray( target[index] ) ) {
          target[index] = [];
        }
        target = target[index];
        index = indices[j];
        ++j;
      }
    }

    // 2) assign value:
    {
      target[index] = fn.apply( null, indices );
    }

    // 3) update indices:
    {
      indices[ len-1 ] += 1;
      for ( j = len - 1; j >= 0; --j ) {
        if ( indices[j] === sizes[j] ) {
          indices[j] = 0;
          indices[j-1] += 1;
        } else {
          break;
        }
      }
    }

  }

  return out;
}
