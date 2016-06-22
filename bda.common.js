//Primary anonymous wrapper to ensure that this section will be executed only once.

try{

  console.log('bda.common.js start');

  // ----- Configuration -----

  // ----- Standard Javascript override -----

  // Change Array.toString() default behavior, will display array content.
  //
  // @return String representation of the array.
  Array.prototype.toString = function() {
    return this.join(', ');
  };

  // Utility function to display formated Strings (avoid bad '+'
  // combinations).
  //
  // Example:
  // 'Say {0} to {1} !'.format('hello', 'Toto') -> 'Say hello to Toto !'.
  //
  // @param args: array of arguments.
  //
  // @return Formatted string, original string if no argument is provided.
  if (!String.prototype.format) {

    String.prototype.format = function() {

      var args = arguments;

      return this.replace(/{(\d+)}/g,
          function(match, number) {
        return typeof args[number] !== undefined ? args[number]
        : match;
      });
    };
  }

  // simple is Null fct
  this.isNull = function(object) {
    if(null === object || undefined === object) {
      return true;
    }
    return false;
  };

  // ----- JQuery plugin functions -----

  // Standard function to create a JQuery plugin entry point.
  //
  // @param methods Plugin methods.
  // @param plugin Plugin name.
  this.basePlugin = function(methods, plugin) {

    var result = function(method) {

      if (methods[method] && !/^_/.test(method)) {
        return methods[method].apply(this, Array.prototype.slice.call(
            arguments, 1));
      } else if (typeof method === 'object' || !method) {
        // Default to "init"
        return methods.init.apply(this, arguments);
      } else {
        alert('Method "' + method + '" does not exist on jQuery.' + plugin);
      }
    };

    return result;
  };



  console.log('bda.common.js initialized');
}catch(e){
  console.log(e);
}
