var APIKey = "b417359692c82a9e4c2d44064c15cf54";

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

function build5DayForcast(data){
    console.log(data)
    var fiveDayForcast = []
    var unixTimeStampsToBuilForcast = []
    var CurrentDayItteration = dayjs().add(1, "day").set('hour', 12).set('minute', 0).set('second', 0);
    for(let i=0; i <=5; i++){
        unixTimeStampsToBuilForcast.push(CurrentDayItteration.unix())
        CurrentDayItteration = CurrentDayItteration.add(1, "day").set('hour', 12).set('minute', 0).set('second', 0);
    }

    data.list.forEach(element => {
        if(unixTimeStampsToBuilForcast.includes(element.dt)){
            fiveDayForcast.push(element)
        }
    });

    if(fiveDayForcast.length<5){                               //A bit of a hacky fix but depending on what time it is there might not be enough data returned from the api to display all days 12 noon,
        fiveDayForcast.push(data.list[data.list.length-1])     //If this is the case then just make the 5th day the last element in the retuned data. it will always be the correct day but it might not always be at 12 noon
    }

    console.log(fiveDayForcast)
    return fiveDayForcast
}

function display5DayForcast(data){

}

function displayTodayForcast(data){

}

fetchData("https://api.openweathermap.org/data/2.5/forecast?q=Bradford&appid=" + APIKey, display5DayForcast, showError)
fetchData("https://api.openweathermap.org/data/2.5/weather?q=Bradford&appid=" + APIKey, displayTodayForcast, showError)