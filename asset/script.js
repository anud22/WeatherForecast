'use strict';


var apiKey = "035cffd3ea47ecfd9f5df831bf486032";
$(document).ready(function () {
    var userForm = $('#user-form');
    var searchHistoryContainer = $('.searchHistory-container');

    var getCityDetails = function (city) {
        return fetch('Assets/cityList.json')
            .then(response => response.json())
            .then(data => {
                var results = data.filter(item => item.city === city);
                return results;
            });
    }

    var getAPIResponse = function (response) {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error(response.statusText);
        }
    }
    var saveToLocalStorage = function (city) {
        var list = JSON.parse(localStorage.getItem('searchedCities')) || [];
        if (!list.includes(city.trim())) {
            list.push(city.trim());
        }
        localStorage.setItem('searchedCities', JSON.stringify(list));
    }

    var saveAndDisplaySearchHistory = function (city) {
        saveToLocalStorage(city);
        displaySearchHistory();
    }

    var displaySearchHistory = function () {
        var cityListLS = JSON.parse(localStorage.getItem('searchedCities')) || [];
        $.each(cityListLS, function (index, cityName) {
            var cityDiv = searchHistoryContainer.find('button:contains(' + cityName + ')');
            if (cityDiv.length === 0) {
                var button = $('<button id="' + cityName + '" class="btn btn-block btn-secondary text-right w-20 mb-3"> ' + cityName + '</button>');
                searchHistoryContainer.append(button);
            }
        })
    }

    var weatherDetails = function (url) {
        return fetch(url).then(response => getAPIResponse(response)).then(data => {
            var city = data.city.name;
            var detail = {};
            var details = [];
            var date = dayjs(data.list[0].dt_txt).format("M/DD/YYYY HH:mm:ss");
            detail.date = date;
            detail.temp = data.list[0].main.temp;
            detail.humidity = data.list[0].main.humidity;
            detail.wind = data.list[0].wind.speed;
            detail.icon = data.list[0].weather[0].icon;
            details.push(detail);
            detail = {};
            for (var i = 1; i < data.list.length; ++i) {
                var date = dayjs(data.list[i].dt_txt).format("M/DD/YYYY HH:mm:ss");
                if (data.list[i].dt_txt.includes('12:00:00')) {
                    detail.date = date;
                    detail.temp = data.list[i].main.temp;
                    detail.humidity = data.list[i].main.humidity;
                    detail.wind = data.list[i].wind.speed;
                    detail.icon = data.list[i].weather[0].icon;
                    details.push(detail);
                    detail = {};
                }

            }
            var futureWeather = $('.5day-weather');
            futureWeather.empty();
            var currWeather = $('.current-weather');
            currWeather.empty();
            currWeather.addClass('border border-dark');
            var heading = $('#days');
            heading.text('5-Day Forecast');
            var iconBaseUrl = "http://openweathermap.org/img/wn/";
            for (var i = 0; i < details.length; ++i) {
                var iconUrl = iconBaseUrl + details[i].icon + '.png';
                var weatherIcon = $('<img>').attr('src', iconUrl);
                var weatherIconFuture = $('<img class="w-25 h-25">').attr('src', iconUrl);
                var cityDate = $('<h3>' + city + ' (' + details[i].date + ') </h3>');
                var date = $('<h5 class=mb-3>' + details[i].date + '</h4>');
                var temp = $('<h5 class=mb-3> Temp: ' + details[i].temp + ' \u00B0F</h5>');
                var wind = $('<h5 class=mb-3> Wind: ' + details[i].wind + ' MPH</h5>');
                var humidity = $('<h5 class=mb-5> Humidity: ' + details[i].humidity + ' %</h5>');
                if (i == 0) {
                    currWeather.append(cityDate);
                    cityDate.append(weatherIcon);
                    currWeather.append(temp);
                    currWeather.append(wind);
                    currWeather.append(humidity);
                } else {
                    var card = $('<div class="card bg-primary text-white p-3"> </div>');
                    futureWeather.append(card);
                    card.append(date);
                    card.append(weatherIconFuture);
                    card.append(temp);
                    card.append(wind);
                    card.append(humidity);
                }
            }
            return city;
        }).then(city => saveAndDisplaySearchHistory(city));
    }

    var displayWeather = function (event) {
        var baseAPIUrl = "https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&units=Imperial&appid=" + apiKey;
        var geoAPIUrl = "http://api.openweathermap.org/geo/1.0/direct?q={search}&appid=" + apiKey;
        event.preventDefault();
        var city = $('#city').val().trim();
        if (!city) {
            alert('Please enter a city value');
            return;
        }

        getCityDetails(city)
            .then(results => {
                var cityDetails = results[0];
                if (cityDetails === undefined || cityDetails === null) {
                    alert('No details found for this city. Please add some other city');
                    throw new Error('Invalid city');
                }
                var search = cityDetails.city + "," + cityDetails.state + "," + cityDetails.country;
                geoAPIUrl = geoAPIUrl.replace('{search}', search);
                return geoAPIUrl;
            })
            .then(url => {
                return fetch(url);
            })
            .then(response => getAPIResponse(response))
            .then(data => {
                var lat = data[0].lat;
                var lon = data[0].lon;
                baseAPIUrl = baseAPIUrl.replace('{lat}', lat).replace('{lon}', lon);
                return baseAPIUrl;
            }).then(url => weatherDetails(url));
        $('#city').val('');
    }

    userForm.on('submit', displayWeather);
    searchHistoryContainer.on('click', '.btn', function (event) {
        var city = $(this).attr('id');
        $('#city').val(city);
        displayWeather(event);
    })
    displaySearchHistory();
});
