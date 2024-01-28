var APIKey = "b417359692c82a9e4c2d44064c15cf54";
var baseURL = "https://api.openweathermap.org/data/2.5/"

function fetchData(city, endpoint, successCallback, errorCallback) {
fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${APIKey}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
    return response.json();
    })
    .then(data => {
        var latitude = data[0].lat;
        var longitude = data[0].lon;
        return fetch(`${baseURL}${endpoint}?lat=${latitude}&lon=${longitude}&units=metric&appid=${APIKey}`)
        })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => successCallback(data))
    .catch(error => errorCallback(error));
}

function showError(e){
    console.log(e)
    $("#today").empty();
    $("#forecast").empty();
    $("#forecast").append($("<h2>", {class: "m-3", text: "Something went wrong, did you enter a valid city?"}))
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
    $("#forecast").empty();
    var sectionTitle = $("<h3>", {class: "mt-4", text: "Five Day Forecast:"})
    $($("#forecast").append(sectionTitle))
    $.each(data, function(index, dayForcast){
        var {temp, humidity} = dayForcast.main
        var {speed: windSpeed} = dayForcast.wind
        var iconLink = `https://openweathermap.org/img/wn/${dayForcast.weather[0].icon}@2x.png`
        var forcastCard = $("<div>", {
            class:"card m-2 col-sm-12 col-md",
            html: `
                <div class="card-body">
                <h6 class="mb-1">${dayjs.unix(dayForcast.dt).format("dddd")}</h6>
                <h5 class="card-title">${dayjs.unix(dayForcast.dt).format("D/M/YYYY")}</h5>
                <img height=65 src="${iconLink}" style="margin-bottom: -13px" />
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

function displayTodayForcast(dayForcast){
    if(dayForcast.cod !== 200) return
    console.log("tt")
    console.log(dayForcast)

    $("#today").empty();
    var sectionTitle = $("<h3>", {class: "mt-4", text: "Today:"})
    $($("#today").append(sectionTitle))
    var {temp, humidity} = dayForcast.main
    var {speed: windSpeed} = dayForcast.wind
    var iconLink = `https://openweathermap.org/img/wn/${dayForcast.weather[0].icon}@2x.png`
    //        <img class="card-img" src="..." alt="Card image">
    var todayForcast = $("<div>", {
        class: "card bg-dark text-white",
        style: "height: 190px",
        html: `
        <div class="card-img-overlay">
            <h5 class="card-title">${dayForcast.name}</h5>
            <img style="margin: -10px" height=65 src="${iconLink}" />
            <p class="card-text mb-2">Temp: ${Math.floor(temp)}°C</p>
            <p class="card-text mb-2">Wind: ${windSpeed}</p>
            <p class="card-text mb-2">Humidity: ${humidity}</p>
        </div>`
    })
    $("#today").append(todayForcast)
}

function displaySearchHistory(){
    var searchHistory = getLocalStorage("searchHistory")

    $("#history").empty();
    $.each(searchHistory, function(index, searchedCity){
        var searchHistoryBtn = $("<button>", {
            class: "btn btn-secondary m-1",
            text: searchedCity
        })
        $("#history").append(searchHistoryBtn)
    })
}

function handelButtonClick(e){
    if(!$(e.target).hasClass('btn')) return
    e.preventDefault()
    var searchTerm;
    
    if(e.target.id === "search-button"){
        searchTerm = $("#search-input").val()
    } else if($(e.target).hasClass("btn-secondary")) {
        searchTerm = $(e.target).text()
    }

    if(!searchTerm || searchTerm === "") return

    var currentSeatchHistory = getLocalStorage("searchHistory")
    if(currentSeatchHistory.includes(searchTerm)){
        const indexToBeRemovedAndReaddedToTopOfList = currentSeatchHistory.indexOf(searchTerm);
        currentSeatchHistory.splice(indexToBeRemovedAndReaddedToTopOfList, 1)
    }
    localStorage.setItem("searchHistory", JSON.stringify([searchTerm, ...currentSeatchHistory]))

    fetchData(searchTerm, "forecast", build5DayForcast, showError)
    fetchData(searchTerm, "weather", displayTodayForcast, showError)

    displaySearchHistory()

}

function getLocalStorage(key){
    var data = JSON.parse(localStorage.getItem(key))
    if(!data) data = []
    console.log(data)
    return data
}


function initPage(){
    var searchHistory = getLocalStorage("searchHistory");
    console.log(searchHistory)
    if(searchHistory.length>0){
        fetchData(searchHistory[0], "forecast", build5DayForcast, showError)
        fetchData(searchHistory[0], "weather", displayTodayForcast, showError)
    } else {
        $("#today").append($("<h2>", {class: "m-3", text: "Oh no, looks like you haven't searched for anything yet..."}))
    }
    displaySearchHistory()
}

initPage()

$("aside").on("click", handelButtonClick)