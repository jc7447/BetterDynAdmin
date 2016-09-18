command=
    funct:litteral params:(_ param)* eol?
    {
         var res = {
             funct:funct,
            params:[]
         }
         var p;
        for (var i = 0; i < params.length; i++) {
          p =params[i][1];
            if(p !== null) {
              res.params.push(p);
            }
        }
        return res;
    }

param "param" =
  simpleParam
  / composedParam

simpleParam=
    comment
    /   componentProperty
    /   keywords
    /   flags
    /   componentPath
    /   componentRef
    /   value
    /   output
    /   varRef
   
comment "comment" =
"#" [^\n;]* eol
    { return ''}
    
composedParam=
     multiline
    / array

keywords "keyword" =
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

value "value" =
    value:(litteral/quotedValue)
    {
        return {
            type:'value',
            value:value
        }
    }
    
quotedValue "quotedValue" =
  "\"" inVal:(escapedQuote/[^"])+ "\""
    {return inVal.join('')}
    
escapedQuote=
  "\\\"" {return "\""}
    

complexValue=
    value:litteral
    {
        return {
            type:'value',
            value:value
        }
    }
   
varRef=
    "$" name:litteral path:singlePath?
    {
      var vpath = null;
        if(path !=null){
          vpath=path.value;
        }
        return {
            type : 'varRef',
            name:name,
            path:vpath
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
     
multiline=
  eol? "{" lines:line* "}"
    {
      var linesArray = []
        for (var i = 0; i < lines.length; i++) {
          var l = lines[i];
            if(l.length > 0 && l !="\n"){
              linesArray.push(l);
            }
        }
      return {
          type: 'multiline',
            value: linesArray.join('\n')
          }
    }

line=
  eol
  /value:lineChar+ eol?
    {
      return value.join('');
    }
lineChar=
  escapedKeyword / [^{}\n]
    
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
     __? v:(litteral __ ":" __ litteral) _?
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
   
    
   
litteral=
  val:(normChar/escapedKeyword)+
    {
      return val.join('');
    }
    
normChar "normal char" =
    $[^\n @$\.\\#">;{}[\],:]
    
Integer "integer" =
  [0-9]+ { return parseInt(text(), 10); }
  
keychar "keychar" =
  $[@$\.\\#">;{}[\],:]
    
escapedKeyword "escaped special char" =
  "\\" keychar:keychar
    {return keychar}
    
_ "whitespace"
  = [ \t]+

__ "extended whitespace"
  =[ \t\n]*

eol "eol"
  =[;\n]