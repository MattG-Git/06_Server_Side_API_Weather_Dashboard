var apiKey = "e86b179d43162dab6c1815a17e287ea2";
var city = ""; 
var currentEl = $("#current");
var daily1El = $("#daily1");
var searchBarEl = $("#searchBar");
var srchBtnEl = $("button");
var rightNow = moment().format('l');
var latitude = 0;
var longitude = 0;
var date = 0;
var searchHistory = $("#searchHistory");
var cityList = []; 

getStoredInput(); 
console.log(cityList); 

function getStoredInput() {
    var citiesSearched = JSON.parse(localStorage.getItem("cityList"));

    if (citiesSearched !== null) {
        cityList = citiesSearched;
    }
    displaySearch();
};

function displaySearch() {
    searchHistory.empty();
    for (var i =0; i < cityList.length; i++) {
        var cities = cityList[i];

        var list = $("<button>").text(cities);
        //list.attr("id",`previousSearch" ${[i]}`);
        list.attr("id", cities); 
        list.attr("city-info", cities);
        list.attr("class", "pastSearchList");
        console.log(list); 
        console.log(list.attr("id"))
        searchHistory.prepend(list);
    };
};

function fetchLatLong(){
    fetch("http://api.openweathermap.org/geo/1.0/direct?q=" + city + "&appid=" + apiKey)
    .then(function(resp) {return resp.json() })
    .then(function(data) {
        //console.log(data);
        latitude = data[0].lat;
        longitude = data[0].lon;
        fetchCurrentWeather(latitude, longitude);
    })
    .catch(function() {
    // catch any errors
    });
};

function fetchCurrentWeather(latitude, longitude) {
    //console.log(latitude, longitude)
    fetch("http://api.openweathermap.org/data/3.0/onecall?lat=" + latitude + "&lon=" + longitude + "&appid=" + apiKey) 
    // the following code converts to json
    .then(function(resp) { return resp.json() }) 
    .then(function(data) {
    currentWeather(data);
    //console.log(data);
    })
    .catch(function() {
    // catch any errors
    });
  };

  function fetchForecast() {
    //console.log(city);
    fetch("http://api.openweathermap.org/data/2.5/forecast?q=" + city + "&appid=" + apiKey)
    // the following code converts to json
    .then(function(resp) { return resp.json() }) 
    .then(function(data) {
    //console.log(data);
    dailyWeather(data);
    })
    .catch(function() {
      // catch any errors
    });
  };
 
//this function displays the current weather information
function currentWeather(d) {
    $("#current").empty();
    var currentHeader = $("<h2>").text(city);
    var date = $("<h2>").text(rightNow);
    var iconCode = d.current.weather[0].icon;
    var iconUrl = "http://openweathermap.org/img/wn/" + iconCode + ".png"
    var weatherIcon = $("<img>").attr("src",iconUrl);
    var far = Math.round(((parseFloat(d.current.temp)-273.15)*1.8)+32);
    var tempF = $("<p>").text(`Temperature: ${far} F`);
    var windSpd = $("<p>").text(`Wind: ${d.current.wind_speed}`);
    var humidCurrent = $("<p>").text(`Humidity: ${d.current.humidity} %`);
    var uvCurrent = $("<p>").text(`UV Index: ${d.current.uvi}`);
    var uv = parseFloat(d.current.uvi);
    //console.log(uv);
    //console.log(tempF);

    //this makes the background on the UV index change colors depending on if it's above 6 or not
    if (uv < 6) {
        uvCurrent.css("background-color", "green");
    } else {
        uvCurrent.css("background-color", "red"); 
    }; 

    //this appends to the html doc
    currentEl.append(
        currentHeader,
        date,
        weatherIcon,
        tempF,
        windSpd,
        humidCurrent,
        uvCurrent
    );  
}; 

//this function displays the 5 day weather forecast information
function dailyWeather(d) {
    $("#daily1").empty();
    //console.log(d)
    date = 0; 
    for (let i =0; i < d.list.length; i = i + 8){
        //console.log(i,d.list[i])
        date++;
        var dailyOne = moment().add(date, 'd').format("l");
        var dailyIconCode = d.list[i].weather[0].icon;
        var dailyIconUrl = "http://openweathermap.org/img/wn/" + dailyIconCode + ".png"
        var dailyWeatherIcon = $("<img>").attr("src",dailyIconUrl);
        var dailyFar = Math.round(((parseFloat(d.list[i].main.temp)-273.15)*1.8)+32);
        var dailyTempF = $("<p>").text(`Temp: ${dailyFar} F`);
        var dailyWind = $("<p>").text(`wind: ${d.list[i].wind.speed}`);
        var dailyhumid = $("<p>").text(`Humidity: ${d.list[i].main.humidity} %`)
        var cardForecast = $("<div>")

        //this appends to the html doc
        cardForecast.append(
            dailyOne,
            dailyWeatherIcon,
            dailyTempF,
            dailyWind,
            dailyhumid
        );

        //this utilizes bootstrap's cards to inline style the 5 day forecast
        $("#daily1").append(
            `<div class="card" style="width: 9rem; background-color: #152238!important";>
                <h5 class="card-title text-center" style=" color: white!important">${dailyOne}</h5>
                
            <div class="card-body" style=" color: white!important">
                <img class="mx-auto d-block" src="${dailyIconUrl}">
                <p class="card-text text-center" style=" color: white!important">Temp: ${dailyFar} F</p>
                <p class="text-center" style=" color: white!important" >wind: ${d.list[i].wind.speed}</p>
                <p class="text-center" style=" color: white!important" >Humidity: ${d.list[i].main.humidity} %</p>
            </div>
            </div>`
        )
    }
};

function userSearch() {
    var cityInput = searchBarEl.val().trim();
    city = cityInput;
    
   function storedSearch() {
        cityList.push(city)
        localStorage.setItem("cityList", JSON.stringify(cityList));
        console.log(localStorage, cityList);
    };

    storedSearch(); 
    fetchLatLong();
    fetchCurrentWeather();
    fetchForecast();
    getStoredInput();
};

function storeButton () {
    //var listCity = $(this).text();
    var listCity = "";
    listCity = this.textContent; 
    performPrevious(listCity);
     $(".pastSearchList").off("click");
     $(".pastSearchList").on("click", storeButton); 

};

function performPrevious(listCity) { 
    city = listCity; 
    console.log(listCity);   
    fetchLatLong();
    fetchCurrentWeather();
    fetchForecast();
    getStoredInput();
};

$(".pastSearchList").on("click", storeButton) 

srchBtnEl.on("click", userSearch);