command=
		setter
	/	getter
	/	none

// set /a/b/c/DefGhi.foo bar

setter=
	"set" " "+ component:[a-zA-Z/]+ "." property:[a-zA-Z/]+ " "+ value:[a-zA-Z/]+
	"set" " "+ component:componentName "." property:name " "+ value:name
    { 
      return {
    	type:'set',
        component:component.join(""),
        property:property.join(""),
        value:value.join("")
        }
    }

// get /a/b/c/DefGhi.foo bar >var

getter=
	"get" " "+ component:componentName "." property:name " "+ ">"? variable:name
    { return {
    	type:'get',
        component:component,
        property:name,
        variable:variable
        }
}

componentName=
	value:("/"name)+
	{
		return value.join("")
	}

name=
	value:[a-zA-Z]+
	{
		return value.join("")
	}

none=""