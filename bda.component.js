/*
Utility library to access component properties
*/

/*<form method="POST" action="/dyn/admin/nucleus/vuitton/ecommerce/repository/CatalogItemOverrideRepository/" id="logDebugFormCatalogItemOverrideRepository"><input type="hidden" value="loggingDebug" name="propertyName"><input type="hidden" value="" name="newValue">logDebug : <a href="javascript:void(0)" class="logdebug" id="logDebugCatalogItemOverrideRepository">true</a>&nbsp; | &nbsp;<a href="javascript:void(0)" class="logdebug" id="logDebugCatalogItemOverrideRepository">false</a></form>*/

BDA_COMPONENT = {

  propertiesSelector : 'h1:contains("Properties")',
  setProperty : function(component,property,value,callback,errCallback){
    var url = '/dyn/admin/nucleus{0}/'.format(component);
    
    $.ajax(
      {
        type : 'POST',
        url : url,
        data : {
          propertyName : property,
          newValue : value
        },
        success : function(data,status, jqXHR){
          BDA_COMPONENT.extractValueFromPropertyPage(data,callback);
        } ,
        error : errCallback
      }
    )
  },
  getProperty : function(component,property,callback,errCallback){
    console.log('getProperty {0} {1}'.format(component,property));

    var url = '/dyn/admin/nucleus{0}/?propertyName={1}'.format(component,property);
    $.ajax(
      {
        type : 'GET',
        url : url,
        success : function(result, status, jqXHR){
          BDA_COMPONENT.extractValueFromPropertyPage(result,callback);
        },
        error : errCallback
      }
    )
  },
  extractValueFromPropertyPage : function(result,callback){
    var newvalue = $('<div></div>').html(result).find('h3:contains("Value")').next().text()
    console.log(newvalue);
    callback(newvalue);
  }
}