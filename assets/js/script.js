// Add your own API key between the ""
var APIKey = "b417359692c82a9e4c2d44064c15cf54";

// Here we are building the URL we need to query the database
var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=Bradford&appid=" + APIKey;

function fetchData(apiUrl, successCallback, errorCallback) {
fetch(apiUrl)
    .then(response => {
    return response.json();
    })
    .then(data => successCallback(data))
    .catch(error => errorCallback(error));
}

function showError(e){
    console.log(e)
}

function displayData(data){
    $("#forecast").text(JSON.stringify(data))
}

fetchData(queryURL, displayData, showError)