command=
    funct:litteral params:(_ param)*
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
        componentProperty
    /   keywords
    /   flags
    /   componentPath
    /   componentRef
    /   complexValue
    /   value
    /   output
    /   varRef

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
    value:litteral
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
    ">" name:litteral
    {
        return {
            type : 'output',
            name:name
        }
    }
    
componentProperty=
    component:(thisRef / componentPath / componentRef  )  "." property:litteral
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

litteral=
    $[a-zA-Z0-9\-:]+

complexLitteral=
    $[a-zA-Z0-9\-:/?#._]+    

Integer "integer"
  = [0-9]+ { return parseInt(text(), 10); }
    
_ "whitespace"
  = [ \t]+