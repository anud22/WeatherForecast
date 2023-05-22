'use strict';

var city = 'Atlanta';
var apiKey = "035cffd3ea47ecfd9f5df831bf486032";
var baseAPIUrl = "https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&units=Imperial&appid=" + apiKey;
var geoAPIUrl = "http://api.openweathermap.org/geo/1.0/direct?q={search}&appid=" + apiKey;
var userForm = $('#user-form');

var getCityDetails = function (city) {
    return fetch('cityList.json')
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

var weatherDetails = function (url) {

    var details = [];
    return fetch(url).then(response => getAPIResponse(response)).then(data => {
        console.log(data.list);
        var dateSet = new Set();
        var detail = {};

        for (var i = 0; i < data.list.length; ++i) {
            var date = data.list[i].dt_txt.split(" ")[0];
            if (!dateSet.has(date)) {
                if (i == 0) {
                    detail.date = date;
                    detail.temp = data.list[i].main.temp;
                    detail.humidity = data.list[i].main.humidity;
                    detail.wind = data.list[i].wind.speed;
                    detail.icon = data.list[i].weather[0].icon;
                    details.push(detail);
                    detail = {};
                } else if (data.list[i].dt_txt.includes('12:00:00')) {
                    detail.date = date;
                    detail.temp = data.list[i].main.temp;
                    detail.humidity = data.list[i].main.humidity;
                    detail.wind = data.list[i].wind.speed;
                    detail.icon = data.list[i].weather[0].icon;
                    details.push(detail);
                    detail = {};
                }
            }
        }
        details.push(detail);
        console.log(details);

    })

}

var displayWeather = function (event) {
    event.preventDefault();
    var city = $('#city').val().trim();
    if (!city) {
        alert('Please enter a city value');
        return;
    }

    getCityDetails(city)
        .then(results => {
            console.log('City details:', results);
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

}


userForm.on('submit', displayWeather);
