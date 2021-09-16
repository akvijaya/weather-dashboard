
var searchCityEl = document.querySelector("#city");
var APIkey = "b46496118ac326bb6e72860bde0c90c2";
var queryURL= "https://api.openweathermap.org/data/2.5/weather?q=";
var previousCities = [];


var getCoordinates = function(city) {
    // format the github api url
    var apiURL= `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${APIkey}`;

    // make a request to the url
    fetch(apiURL).then(function(response) {
        if (response.ok) {
          response.json().then(function(data) {

            var lon = data.coord['lon'];
            var lat = data.coord['lat'];
            getCityForecast(city, lon, lat);
            console.log(lon);
            console.log(lat);

          });
        } else {
          alert("Error: City Not Found");
        }
    })
    .catch(function(error) {
        // Notice this `.catch()` getting chained onto the end of the `.then()` method
        alert("Unable to connect to Weather Hub");
    });
};

var getCityForecast = function(city, lon, lat) {
  // format the github api url
  var oneCallApi = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely,hourly,alerts&appid=${APIkey}`;

  // make a request to the url
  fetch(oneCallApi).then(function(response) {
      if (response.ok) {
        response.json().then(function(data) {
          // identifies city name in forecast
          var current = document.querySelector('#currentCity');
          current.textContent = city + " " + moment().format("M/D/YYYY");

          var currentPicture = document.querySelector('#currentIcon');
          currentIconPictureUrl = "https://openweathermap.org/img/wn/"+data.current.weather[0].icon+"@2x.png";
          currentPicture.setAttribute("src", currentIconPictureUrl);


          previousSearched(city);

          getForecast(data);
          getFiveDayForecast (data);
          //fiveDayForecast(data);
        });
      } else {
        alert("Error: City Not Found");
      }
  })
  .catch(function(error) {
      // Notice this `.catch()` getting chained onto the end of the `.then()` method
      alert("Unable to connect to Weather Hub");
  });
};

var getForecast =  function(forecast) {
    var tempEl = document.querySelector('#currentTemp');
    tempEl.textContent = forecast.current.temp + " °C";

    var windEl = document.querySelector('#currentWind');
    windEl.textContent = forecast.current.wind_speed + " m/s";

    var humidityEl= document.querySelector('#currentHumidity');
    humidityEl.textContent = forecast.current.humidity + "%";

    var uvIndexEl= document.querySelector('#currentUVIndex');
    uvIndexEl.textContent = forecast.current.uvi;

    // add appropriate background color to current uv index number
    //if (forecast.current.uvi <= 2) {
    //  var uvIndexEl= document.querySelector('#currentUVIndex');
    //   uvIndexEl.addClass("favorable");
    // } else if (forecast.current.uvi >= 3 && forecast.current.uvi <= 7) {
    //  var uvIndexEl= document.querySelector('#currentUVIndex');
    //   uvIndexEl.className("moderate");
    // } else {
    //   var uvIndexEl= document.querySelector('#currentUVIndex');
    //   uvIndexEl.className("severe");
    // }
};


var getFiveDayForecast =  function(response) {
  for (var i = 1; i <= 5; i++) {
    // add class to future cards to create card containers
    var futureCard = $(".future-card");
    futureCard.addClass("future-card-details");

    // add date to 5 day forecast
    var futureDate = $("#future-date-" + i);
    date = moment().add(i, "d").format("M/D/YYYY");
    futureDate.text(date);

    // add icon to 5 day forecast
    var futureIcon = $("#future-icon-" + i);
    futureIcon.addClass("future-icon");
    var futureIconCode = response.daily[i].weather[0].icon;
    futureIcon.attr("src", `https://openweathermap.org/img/wn/${futureIconCode}@2x.png`);

    // add temp to 5 day forecast
    var futureTemp = $("#future-temp-" + i);
    futureTemp.text("Temp: " + response.daily[i].temp.day + " \u00B0F");

    // add humidity to 5 day forecast
    var futureHumidity = $("#future-humidity-" + i);
    futureHumidity.text("Humidity: " + response.daily[i].humidity + "%");
  }
};

var previousSearched = function (cityName){
  // create entry with city name
  var searchHistoryEntry = document.createElement('button');
  
  searchHistoryEntry.className='btn col-xl-12';
  searchHistoryEntry.innerHTML=cityName;

  // append entry container to search history container
  var searchHistoryContainerEl = $("#search-history-container");
  searchHistoryContainerEl.append(searchHistoryEntry);

  if (previousCities.length > 0){
    // update savedSearches array with previously saved searches
    var previousSavedSearches = localStorage.getItem("previousCities");
    savedSearches = JSON.parse(previousSavedSearches);
  }

  // add city name to array of saved searches
  previousCities.push(cityName);
  localStorage.setItem("savedSearches", JSON.stringify(previousCities));

  // reset search input
  $("#search-input").val("");
}

var loadSearchHistory = function() {
  // get saved search history
  var savedSearchHistory = localStorage.getItem("previousCities");

  // return false if there is no previous saved searches
  if (!savedSearchHistory) {
      return false;
  }

  // turn saved search history string into array
  savedSearchHistory = JSON.parse(savedSearchHistory);

  // go through savedSearchHistory array and make entry for each item in the list
  for (var i = 0; i < savedSearchHistory.length; i++) {
      previousSearched(savedSearchHistory[i]);
  }
};

$("#search").click(function () {
	var cityTextValue = $("#cityInput")
    .val()
    .trim()
    .toLowerCase()
    .split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
    .join(' ');
	getCoordinates(cityTextValue);
});

// called when a search history entry is clicked
$("#search-history-container").on("click", "button", function() {
  event.preventDefault();

  // get text (city name) of entry and pass it as a parameter to display weather conditions
  var previousCityName = event.target.textContent.trim();
  getCoordinates(previousCityName);
  console.log(previousCityName);

  //
  var previousCityClicked = $(this);
  previousCityClicked.remove();
});



loadSearchHistory();