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
    display5DayForcast(fiveDayForcast)
    return
}

function display5DayForcast(data){
    $.each(data, function(index, dayForcast){
        var {temp, humidity} = dayForcast.main
        var {speed: windSpeed} = dayForcast.wind
        var forcastCard = $("<div>", {
            class:"card m-2 col-sm-12 col-md",
            html: `
                <div class="card-body">
                <h5 class="card-title">${dayjs.unix(dayForcast.dt).format("D/M/YYYY")}</h5>
                <p class="card-text"></p>
                </div>
                <ul class="list-group list-group-flush">
                    <li class="list-group-item">Temp: ${Math.floor(temp)}°C</li>
                    <li class="list-group-item">Wind: ${windSpeed}</li>
                    <li class="list-group-item">Humidity: ${humidity}%</li>
                </ul>`,
        })

        $("#forecast").append(forcastCard)
    })
}

function displayTodayForcast(data){
    console.log("tt")
    console.log(data)

    var {temp, humidity} = data.main
    var {speed: windSpeed} = data.wind
    //        <img class="card-img" src="..." alt="Card image">
    var todayForcast = $("<div>", {
        class: "card bg-dark text-white",
        style: "height: 170px",
        html: `
        <div class="card-img-overlay">
            <h5 class="card-title">${data.name}</h5>
            <p class="card-text">Temp: ${temp}</p>
            <p class="card-text">Wind: ${windSpeed}</p>
            <p class="card-text">Humidity: ${humidity}</p>
        </div>`
    })
    $("#today").append(todayForcast)
}

function displaySearchHistory(){
    var searchHistory = ["asdasda", "adasdasd", "sdasdasd", "wsadasd"]

    $.each(searchHistory, function(index, searchedCity){
        var searchHistoryBtn = $("<button>", {
            class: "btn btn-secondary m-1",
            text: searchedCity
        })
        $("#history").append(searchHistoryBtn)
    })
}


displaySearchHistory()



fetchData("https://api.openweathermap.org/data/2.5/forecast?q=Bradford&units=metric&appid=" + APIKey, build5DayForcast, showError)
fetchData("https://api.openweathermap.org/data/2.5/weather?q=Bradford&appid=" + APIKey, displayTodayForcast, showError)