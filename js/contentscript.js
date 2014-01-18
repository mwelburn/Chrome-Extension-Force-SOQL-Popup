/* 
 *  Get the cookie values
 *   - courtesy of http://th3silverlining.com/2013/09/14/developing-chrome-extensions-for-salesforce/
 */
function getValueFromCookie(b) {
    var a, c, d, e = document.cookie.split(";");
    for (a = 0; a < e.length; a++)
        if (c = e[a].substr(0, e[a].indexOf("=")), d = e[a].substr(e[a].indexOf("=") + 1), c = c.replace(/^\s+|\s+$/g, ""), c == b) return unescape(d)
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
	if (request.name == "forcequery" && request.queryString != "")
	{
    // bringing to current scope to use in callbacks
    var sendResponse = sendResponse;
		var client = new forcetk.Client();
  	client.setSessionToken(getValueFromCookie("sid"));

		client.query(request.queryString, function(response)
		{
			console.log('results: ', response);
      // TODO - do something more elegant with the response
			sendResponse({queryString: request.queryString, queryResults: response});
		}, function(response)
    {
      console.log('error: ', response);
      // TODO - do something more elegant with the response
      sendResponse({queryString: request.queryString, queryResults: {}, error: true, response: response});
    });

    // Needed so the callbacks can return a response when they complete
    return true;
	}
});
  
