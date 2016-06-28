commands=
    main:command other:(_ command)*
    {
        var res = []
        res.push(main);
        for (var i = 0; i < other.length; i++) {
            res.push(other[i][1]);
        }
        return res;
    }

command=
        setter
    /   getter
    /   help
    /   rql
    /   echo
    /   go

// set /a/b/c/DefGhi.foo bar

setter=
    "set" _ component:componentName "." property:name _ value:name
    { 
      return {
        type:'set',
        component:component,
        property:property,
        value:value
        }
    }

// get /a/b/c/DefGhi.foo bar >var

getter=
    "get" _ component:componentName "." property:name _ out:output?
    { return {
        type:'get',
        component:component,
        property:property,
        output:out
        }
}

help=
    "help"
    {
        return {type:'help'}
    }

rql=
    print
    /query
    
print=
    "print"  _ component:componentName _ itemdesc:name _ id:name
    {
        return {
            type:"rql-print",
            component:component,
            itemDescriptor:itemdesc,
            id:id
        }
    }
    
query=
    "query"

echo=
    "echo" _ "$" name:name
    {
        return {
                type:"echo",
                name:name
            }
    }

go=
    "go" _ component:componentName
    {
        return {
            type :'go',
            component:component
        }
    }

output=
    ">" value:name
    {
        return value
    }
componentName=
    value:(chunk)+
    {
        return value.join("")
    }
    
chunk=
    "/" value:name
    {
        return "/"+value
    }

name=
    value:[a-zA-Z-:]+
    {
        return value.join("")
    }
    

_ "whitespace"
  = [ \t\n\r]*