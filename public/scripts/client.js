var myApp = angular.module( 'myApp', [] );


myApp.controller( 'VideoController',[ '$scope', '$http', function( $scope, $http ){
// global list of video searches
  $scope.everySearch=[];

//displays JavaScript valus on HTML page
function showResponse(response){
  var responseString = JSON.stringify(response, " ", 2);

  document.getElementById('response').inner.HML += responseString;
}
//called automatically when JavaScript client library is loaded
function onClientLoad(){
  gapi.client.load("proof", onProofApiLoad);

}

function onProofApiLoad(){
  gapi.client.setApiKey("")
}
  // test get user input
  $scope.videoSearch = function(){

    console.log( 'invideoSearch: ' + $scope.videoIn );
    // assemble API URL
    var apiURL = 'https://proofapi.herokuapp.com/users/497c1918-21b7-4766-9f71-00dc0473fbf7' + $scope.videoIn;
    console.log( "apiURL: " + apiURL );

    // make an http call to the API url
    $http({
      method: 'GET',
      url: apiURL
    }).then( function( response ){
      // log the response from the http call
      console.log( 'retrieved info for ' + response.data.Title );
      var videoToDisplay={
        id: response.data.Id,
        title: response.data.Title,
        url: response.data.Url,
        slug: response.data.Slug,
        view_tally: response.data.Views,
        vote_tally: response.data.Votes,
        created: response.data.Created,
        updated: response.data.Updated
      }; // end object

      $scope.everySearch.push( videoToDisplay );

      console.log( 'videoToDisplay: ' + videoToDisplay.id + " " + videoToDisplay.title + " " + videoToDisplay.slug + " " + videoToDisplay.view_tally + " " + videoToDisplay.vote_tally + " " + videoToDisplay.created + " " + videoToDisplay.updated);
      console.log( 'everySearch: ' + $scope.everySearch );
    }); // end http, then

    // clear input field
    $scope.videoIn='';
  };
}]);
