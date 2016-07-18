commands=
  command*
    
    
command=
  nonnull
    /eol
   
    
nonnull=
  elem:elem+ eol?
    { return elem.join('')}
    
elem=
   multWrapper
    /singleElem
    
    
singleElem=
  value:[^{};\n]+
    {return value.join('')}
   
    
multWrapper=
  $ ("{" multLines "}")
 
  
multLines=
  lines:line*
  {
      var linesArray = []
        for (var i = 0; i < lines.length; i++) {
          var l = lines[i];
            if(l.length > 0 && l !="\n"){
              linesArray.push(l);
            }
        }
      return linesArray.join('\n'); 
    }
    
line=
  eol
  /value:[^{};\n]+ eol?
    {
      return value.join('');
    }   
    
eol=
  [;\n]+