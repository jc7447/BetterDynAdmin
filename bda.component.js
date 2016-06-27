/*
Utility library to access component properties
*/

/*<form method="POST" action="/dyn/admin/nucleus/vuitton/ecommerce/repository/CatalogItemOverrideRepository/" id="logDebugFormCatalogItemOverrideRepository"><input type="hidden" value="loggingDebug" name="propertyName"><input type="hidden" value="" name="newValue">logDebug : <a href="javascript:void(0)" class="logdebug" id="logDebugCatalogItemOverrideRepository">true</a>&nbsp; | &nbsp;<a href="javascript:void(0)" class="logdebug" id="logDebugCatalogItemOverrideRepository">false</a></form>*/

BDA_COMPONENT = {

	propertiesSelector : 'h1:contains("Properties")',
	setProperty : function(component,property,value,callback){
		var url = '/dyn/admin/nucleus'+component;
		
		$.ajax(
			{
				type : 'POST',
				url : url,
				data : {
					propertyName : property,
					newValue : value
				},
				success : function(data){
					BDA_COMPONENT.extractValueFromPropertyPage(data,callback);
				} 
					
			}
		)
	},
	//get /atg/commerce/order/OrderRepository.repositoryName
	getProperty : function(component,property,callback){
		console.log('getProperty {0} {1}'.format(component,property));

		var url = '/dyn/admin/nucleus{0}/?propertyName={1}'.format(component,property);
		$.ajax(
			{
				type : 'GET',
				url : url,
				success : function(data){
					BDA_COMPONENT.extractValueFromPropertyPage(data,callback);
				} 
			}
		)
	},
	extractValueFromPropertyPage : function(data,callback){
		var $res = $(data);
		console.log($res);
		var valueTitle = $res.find('<h3>Value</h3>');
		console.log(valueTitle);
		var newvalue = valueTitle.next().find('pre').innerHtml();
		console.log(newvalue);
		callback(newvalue);
	}
}