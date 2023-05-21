`use strict`
var city = 'Atlanta';
var cityDetails = {};
var apiKey = "035cffd3ea47ecfd9f5df831bf486032";
var baseAPIUrl = "https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&units=imperial&appid=" + apiKey;
var geoAPIUrl = "http://api.openweathermap.org/geo/1.0/direct?q={search}&appid=" + apiKey;
var userForm = $('#user-form');



var displayWeather = function () {
    city = 'Atlanta';
    alert(dayjs().unix());
    getCityDetails(city).then(results => {
        var cityDetails = results[0];

        if (cityDetails === undefined || cityDetails === null) {
            alert('No details found for this city. Please add some other city');
            return;
        }
        var search = cityDetails.city + "," + cityDetails.state + "," + cityDetails.country;
        geoAPIUrl = geoAPIUrl.replace('{search}', search);
        console.log("hi", geoAPIUrl);
        fetch(geoAPIUrl).then((results) => results.json()).then((data) => {
            var lat = data[0].lat;
            var lon = data[0].lon;
            baseAPIUrl = baseAPIUrl.replace('{lat}', lat).replace('{lon}', lon);
            console.log(baseAPIUrl);
            fetch(baseAPIUrl).then(results => results.json()).then(data => console.log(data.list));
            var weatherDetails = [];

        });
    })
};

userForm.on('submit', displayWeather);
