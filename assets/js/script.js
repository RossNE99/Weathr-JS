$(document).ready(function() { //Wait untill everything is loaded and then run this file
    var APIKey = "b417359692c82a9e4c2d44064c15cf54";    //API key for OpenWeatherMap
    var baseURL = "https://api.openweathermap.org/data/2.5/"    //Base URL for OpenWeatherMap weather

    function fetchData(city, endpoint, successCallback, errorCallback) {    //Function that is used to fetch the data for the forcast and city lat & long
    fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${APIKey}`) //retreve lat and long for a city name
        .then(response => { //if responce isnt okay then throw and error
            if (!response.ok) {
                throw new Error('Something went wrong :(');
            }
        return response.json(); //return the responce in a parsed form
        })
        .then(data => {
            var latitude = data[0].lat; //extract lat and long fromn the reponce
            var longitude = data[0].lon;
            return fetch(`${baseURL}${endpoint}?lat=${latitude}&lon=${longitude}&units=metric&appid=${APIKey}`) //use the lat and long to retrive forcast info. 
            })
        .then(response => { //if responce isnt okay then throw and error
            if (!response.ok) {
                throw new Error('Something went wrong :(');
            }
            return response.json(); //return the responce in a parsed form
        })
        .then(data => successCallback(data))   //call the passed in successCallback function
        .catch(error => errorCallback(error)); //if an error is thrown the call the passed In Error Function
    }

    function showError(e){ //function to dispay an error message when  there is an error 99.9% of the time this will be because a invalid city was enterd
        $("#today").empty(); //clear the currently displayed forcasts
        $("#forecast").empty();
        $("#forecast").append($("<h2>", {class: "m-3", text: "Something went wrong, did you enter a valid city?"})) //dispaly a user friendly error message to the page
    }

    function build5DayForcast(data){  //function to format the data from the api in a way that can be used to display a 5 day forcast 
        var fiveDayForcast = []
        var unixTimeStampsToBuilForcast = []
        var CurrentDayItteration = dayjs().add(1, "day").set('hour', 12).set('minute', 0).set('second', 0); //get the current time, add 1 day onto it and set the hour to 12, this will mean we always get the forcast for midday
        for(let i=0; i <=5; i++){ //loop 5 times to get 5 unixtime stamps (1 per day) for the next 5 days at midday
            unixTimeStampsToBuilForcast.push(CurrentDayItteration.unix()) //add that unix time stamp to an array, ready to be compirted in the next step
            CurrentDayItteration = CurrentDayItteration.add(1, "day").set('hour', 12).set('minute', 0).set('second', 0); //add one day onto the CurrentDayItteration
        }

        data.list.forEach(element => { //for each forcast that the api sent look thru each one and extract the ones that we need. (1 per day, as 12 noon, for the next 5 days) 
            if(unixTimeStampsToBuilForcast.includes(element.dt)){
                fiveDayForcast.push(element) //if the unix date time matches then add it the to fiveDayForcast array
            }
        });

        if(fiveDayForcast.length<5){                               //A bit of a hacky fix but depending on what time it is there might not be enough data returned from the api to display all days 12 noon,
            fiveDayForcast.push(data.list[data.list.length-1])     //If this is the case then just make the 5th day the last element in the retuned data. it will always be the correct day but it might not always be at 12 noon
        }
        
        display5DayForcast(fiveDayForcast) // call the function that will display the 5 day forcast we just created
        return
    }

    function display5DayForcast(data){  //function to display the 5 day forcast to the page
        $("#forecast").empty(); //remove anything thats currently in the forecast div
        var sectionTitle = $("<h3>", {class: "mt-4", text: "Five Day Forecast:"}) //add h3 title for this section
        $($("#forecast").append(sectionTitle))  //add the title to the page
        $.each(data, function(index, dayForcast){   //for each day create a forecast card
            var {temp, humidity} = dayForcast.main  //destructute temp & humidity from dayForcast.main
            var {speed: windSpeed} = dayForcast.wind    //destructute speed as windSpeed
            var iconLink = `https://openweathermap.org/img/wn/${dayForcast.weather[0].icon}@2x.png` //create the link for the weather icon
            var forcastCard = $("<div>", { //create the parent div for the forecast card
                class:"card m-2 col-sm-12 col-md", // add classes to the forecast card
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

            $("#forecast").append(forcastCard) //add forcast card to the forecast div
        })
    }

    function displayTodayForcast(dayForcast){   //function to display the today forcecast to the page
        if(dayForcast.cod !== 200) return //return if status code isnt ok

        $("#today").empty(); //remove anything thats currently in the today div
        var sectionTitle = $("<h3>", {class: "mt-4", text: "Today:"}) //create a title for the today section
        $($("#today").append(sectionTitle)) //show the title
        var {temp, humidity} = dayForcast.main //destructute temp & humidity from dayForcast.main
        var {speed: windSpeed} = dayForcast.wind //destructute speed as windSpeed
        var iconLink = `https://openweathermap.org/img/wn/${dayForcast.weather[0].icon}@2x.png`//create the link for the weather icon
        // <img class="card-img" src="..." alt="Card image">  <-- code to add a background image to the card (didnt get time to imperlment this)
        var todayForcast = $("<div>", {     //create the today card
            class: "card bg-dark text-white",
            style: "height: 215px",
            html: `
            <div class="card-img-overlay">
                <p class="mb-0">${dayjs.unix(dayForcast.dt).format("D/M/YYYY")}</p>
                <h5 class="card-title">${dayForcast.name}</h5>
                <img style="margin: -10px" height=65 src="${iconLink}" />
                <p class="card-text mb-2">Temp: ${Math.floor(temp)}°C</p>
                <p class="card-text mb-2">Wind: ${windSpeed}</p>
                <p class="card-text mb-2">Humidity: ${humidity}</p>
            </div>`
        })
        $("#today").append(todayForcast)    //add the today card to he today div
    }

    function displaySearchHistory(){    //function to render the search history to the page
        var searchHistory = getLocalStorage("searchHistory")    //get the search history 

        $("#history").empty(); //remove anythibng thats currently in the history div
        $.each(searchHistory, function(index, searchedCity){    //for each item thats in the search histoey create a button
            var searchHistoryBtn = $("<button>", {
                class: "btn btn-secondary m-1", //add classes
                text: searchedCity  //make the button text the name of the city that was searched
            })
            $("#history").append(searchHistoryBtn) //add eaach button the the history div
        })
    }

    function handelButtonClick(e){  //function to handel button presses
        if(!$(e.target).hasClass('btn')) return //if a button wasnt clicked then do nothing
        e.preventDefault()  //prevent page refresh
        var searchTerm;
        
        if(e.target.id === "search-button"){    //if it was the search button that was clicked
            searchTerm = $("#search-input").val()   //get the text from the search box
        } else if($(e.target).hasClass("btn-secondary")) {  //if it was a search history button clicked
            searchTerm = $(e.target).text() //get the text from the button
        }

        if(!searchTerm || searchTerm === "") return //if there is no search term or if search term is an empty string then do nothing 

        var currentSeatchHistory = getLocalStorage("searchHistory")
        if(currentSeatchHistory.includes(searchTerm)){  //if search term is already in search history then remove it as we dont want duplacates
            const indexToBeRemovedAndReaddedToTopOfList = currentSeatchHistory.indexOf(searchTerm);
            currentSeatchHistory.splice(indexToBeRemovedAndReaddedToTopOfList, 1)
        }
        localStorage.setItem("searchHistory", JSON.stringify([searchTerm, ...currentSeatchHistory])) //add the new search term to the top of the list (first item in the array) and save to local storage

        fetchData(searchTerm, "forecast", build5DayForcast, showError)  //fetch data for the 5 day forcast
        fetchData(searchTerm, "weather", displayTodayForcast, showError)    //fetch data for the current weather

        displaySearchHistory()  //render the search history buttons
    }

    function getLocalStorage(key){  //function to get local storage, if its null then return an empty array
        var data = JSON.parse(localStorage.getItem(key))
        if(!data) data = []
        return data
    }


    function initPage(){    //function to handel inital page load
        var searchHistory = getLocalStorage("searchHistory");
        if(searchHistory.length>0){ //if there is search history then load the weather for the last location searched
            fetchData(searchHistory[0], "forecast", build5DayForcast, showError)
            fetchData(searchHistory[0], "weather", displayTodayForcast, showError)
        } else {    //if there is no search history then dispay the message below 
            $("#today").append($("<h2>", {class: "m-3", text: "Oh no, looks like you haven't searched for anything yet..."}))
        }
        displaySearchHistory()  //load search history buttons onto the page
    }

    initPage()  //run the initPage function when the page is loaded
    $("aside").on("click", handelButtonClick)   //add event listener to the aside section
})