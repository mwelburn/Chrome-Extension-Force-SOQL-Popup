// TODO - If not on a SF page, display a message and hide UI

var $jq = jQuery.noConflict();
$jq(document).ready(function()
{
  var tabUrl;

  // leverage for stripping out everything but the domain
  function url_domain(data) 
  {
    var a = document.createElement('a');
    a.href = data;
    return a.hostname;
  }

  function buildResults(results)
  {
    // clear previous results
    $jq('#query-results').html('');

    if (results == null || results.error)
    {
      var errorMsg = 'Sorry, your query failed.';
      for (responseJSON in results.response.responseJSON)
      {
        errorMsg += '\n\tError Code: ' + responseJSON.errorCode;
        errorMsg += '\n\tMessage: ' + responseJSON.message;
      }
      // TODO - escape html
      $jq('#query-results').html(errorMsg);
    }
    else
    {
      // build table header
      if (results.queryResults.records.length > 0)
      {
        // TODO - need to get the pretty labels
        var fields = Object.keys(results.queryResults.records[0]);
        // get rid of attributes, its not an actual field
        fields.splice(0, 1);

        // TODO - need to HTML escape the values
        var tableHtml = '<table><tr>';
        fields.forEach(function(field_name)
        {
          tableHtml += '<th>' + field_name + '</th>';
        });
        tableHtml += '</tr>';

        results.queryResults.records.forEach(function(record)
        {
          // TODO - need to more smartly show join fields (right now its an object)

          tableHtml += '<tr>';

          fields.forEach(function(field_name)
          {
            tableHtml += '<td>';
            if (field_name === 'Id' || field_name === 'Name')
            {
              // TODO - clean this up
              // want to keep the "/" in order to build the URL
              var record_id = record['attributes']['url'].substring(record['attributes']['url'].lastIndexOf('/'));
              tableHtml += '<a href="' + tabUrl + record_id + '" target="_blank">' + record[field_name] + '</a>';
            }
            else
            {
              tableHtml += record[field_name];
            }
            tableHtml + '</td>';
          });

          tableHtml += '</tr>';
        });
        tableHtml += '</table>';

        $jq('#query-results').html(tableHtml);
      }
    }
  };

  function queryClient(queryString)
  {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
    {
      chrome.tabs.sendMessage(tabs[0].id, {name: "forcequery", queryString: queryString}, function(response)
      {
        console.log('msg posted', response);
        buildResults(response);
      });
    });
  };

  // build salesforce domain for hyperlinks later
  chrome.tabs.getSelected(null, function(tab)
  {
    tabUrl = 'https://' + url_domain(tab.url);
  });

  $jq('#submit-query').click(function(event)
  {
    var query = $jq('#query').val();
    queryClient(query);   
  });
});