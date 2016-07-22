command=
    funct:litteral params:(_ param)* end?
    {
         var res = {
             funct:funct,
            params:[]
         }
        for (var i = 0; i < params.length; i++) {
            res.params.push(params[i][1]);
        }
        return res;
    }

param=
  simpleParam
  / composedParam

simpleParam=
        componentProperty
    /   keywords
    /   flags
    /   componentPath
    /   componentRef
    /   complexValue
    /   value
    /   output
    /   varRef
   

composedParam=
     multilineWrapper
    / array

keywords=
      thisRef
    / lastOutput

thisRef=
    "@this"
    {
        return {
            type : 'this'
        }
    }

lastOutput=
    "@#"
    {
        return{
            type : 'lastOutput'
        }
    }

flags=
    "-" flags:[a-zA-Z]+
    {
        return {
            type:'flags',
            values:flags
        }
    }

value=
    value:litteralPath
    {
        return {
            type:'value',
            value:value
        }
    }

complexValue=
    value:complexLitteral
    {
        return {
            type:'value',
            value:value
        }
    }
   
varRef=
    "$" name:litteral
    {
        return {
            type : 'varRef',
            name:name
        }
    }

output=
    ">" name:litteral index:('#' Integer)? format:(objectDef/singlePath)?
    {
      var idx = null;
        if(index !=null){
            idx=index[1];
        }
        return {
            type : 'output',
            name:name,
            index:idx,
            format:format
        }
    }
    
singlePath=
  ":" path:value
    {
      return path
    }
    
componentProperty=
    component:(thisRef / componentPath / componentRef / varRef )  "." property:(value/varRef)
    {
         return {
            type : 'componentProperty',
            component:component,
            property:property,
        } 
    }
    
componentRef=
    "@" name:litteral index:('#' Integer)?
    {
        var idx = null;
        if(index !=null){
            idx=index[1];
        }
        return {
            type : 'componentRef',
            name:name,
            index:idx
        }
    }

componentPath=
    path:componentName
    {
        return {
            type : 'componentPath',
            path:path
        }
    }  
  
componentName=
     $("/"litteral)+
     
multilineWrapper=
  "{" lines:multiline "}"
    {
      return {
          type: 'multiline',
            value: lines
          }
    }
multiline=
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
  end
  /value:[^{}\n]+ end?
    {
      return value.join('');
    }
    
objectDef=
  "("  l1:objectLine l2:("," objectLine)* ")"
  {
    var arr = [];
        arr.push(l1);
        for (var i = 0; i < l2.length; i++) {
          var v = l2[i];
           arr.push(v[1]);
        }
        return {type:'objectDef',value:arr};
  }
    
objectLine= 
     __? v:(litteral __ ":" __ litteralPath) _?
    {
      if(v!=null){
          return {name:v[0],path:v[4]}
        }else{
          return null;
        }
        
    }
   
array=
  "[" _? value:simpleParam values:( _? "," _? simpleParam)* _? "]"
    {
      var arr = [];
        arr.push(value);
        for (var i = 0; i < values.length; i++) {
          var v = values[i];
           arr.push(v[3]);
        }
        return { type: 'array',
            value: arr
           };
    }
   
    
complexLitteral=
  withspace
    / spacelessCplx

withspace=
  "\"" _? value:$( complexLitteral (_ complexLitteral)*) _? "\""
  {
      return value;
    }
   
litteral=
    $[a-zA-Z0-9\-]+
    
litteralPath=
    $[a-zA-Z0-9\-.]+
    
spacelessCplx=
    $[a-zA-Z0-9\-:/?#._]+    

Integer "integer"
  = [0-9]+ { return parseInt(text(), 10); }
    
_ "whitespace"
  = [ \t]+

__ "extended whitespace"
  =[ \t\n]*

end
  =[;\n]