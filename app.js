//fetching data
function fetchingWeather(city) {
    return new Promise((resolve, reject) => {
        resolve(fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=metric&key=EJ6UBL2JEQGYB3AA4ENASN62J&contentType=json`));
    });
}

function cityIdentification() {
    return new Promise((resolve, reject) => {
        resolve(fetch("https://geolocation-db.com/json/"));
    });
}

(function () {
    getLocation();
})()

function validate() {
    let val = document.getElementById("location").value.trim();
    if (val.length == 0) {
        alert("Please enter a valid location");
    }
    else {
        getWeatherInfo(val);
    }
    document.getElementById("location").value = val.toUpperCase();
}

searchButton.addEventListener("click", () => {
    validate();
});

document.getElementById("location").onkeydown = (e) => {
    if (e.key === 'Enter') {
        console.log("enter pressed");

        validate();
    }
}

const todayButton = document.getElementById('todayButton');
const weekButton = document.getElementById('weekButton');

const todayCards = document.querySelector('.hourlyInfo');
const weekCards = document.querySelector('.weakweatherReports');


function showToday() {
    todayCards.style.display = 'flex';
    weekCards.style.display = 'none';
    todayButton.style.color = "rgba(85,152,253,255)";
    weekButton.style.color = "silver";
}


function showWeek() {
    todayCards.style.display = 'none';
    weekCards.style.display = 'flex';
    weekButton.style.color = "rgba(85,152,253,255)";
    todayButton.style.color = "silver";
}

todayButton.addEventListener('click', showToday);
weekButton.addEventListener('click', showWeek);

showWeek();

document.getElementById("centigradeButton").addEventListener("click", () => {
    document.getElementById("centigradeButton").classList.add("unitActive");
    document.getElementById("farenheitButton").classList.remove("unitActive");

    let unit = document.querySelector(".unit");
    let presentTemp = document.querySelector(".presentTemp");
    let temperature = document.querySelectorAll(".temperature");
    let weekTemps = document.querySelectorAll("[id^='weakdayTemp']");


    if (unit.innerHTML != "°C") {
        temperature.forEach((value) => {
            let val = value.innerHTML;
            value.innerHTML = `${fahTocel(val.substring(0, val.length - 2))}°C`;
        })
        weekTemps.forEach((value) => {
            let val = value.innerHTML;
            value.innerHTML = `${fahTocel(val.substring(0, val.length - 2))}°C`;
        });
        presentTemp.innerHTML = fahTocel(presentTemp.childNodes[0].data) + "<sup class='unit'>°C</sup>";
    }
    else {
        console.log("Already in celcius");
    }

});

document.getElementById("farenheitButton").addEventListener("click", () => {
    document.getElementById("farenheitButton").classList.add("unitActive");
    document.getElementById("centigradeButton").classList.remove("unitActive");

    let unit = document.querySelector(".unit");
    let presentTemp = document.querySelector(".presentTemp");
    let temperature = document.querySelectorAll(".temperature");
    let weekTemps = document.querySelectorAll("[id^='weakdayTemp']");

    if (unit.innerHTML != "°F") {
        temperature.forEach((value) => {
            let val = value.innerHTML;
            value.innerHTML = `${celTofah(val.substring(0, val.length - 2))}°F`;
        });

        weekTemps.forEach((value) => {
            let val = value.innerHTML;
            value.innerHTML = `${celTofah(val.substring(0, val.length - 2))}°F`;
        });

        presentTemp.innerHTML = celTofah(presentTemp.childNodes[0].data) + "<sup class='unit'>°F</sup>";
    } else {
        console.log("Already in Fahrenheit");
    }
});

//CONVERT DATE TIME
function convertDateTime(year, month, day, hour, minute, second) {
    let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let date = new Date(year, month, day, hour, minute, second);
    let hours12 = ((parseInt(hour)) % 12) || 12;
    let suffix = ((parseInt(hour) >= 12) ? "PM" : "AM");

    return `${days[date.getDay()]} ${hours12}:${minute} ${suffix}`;
}

//INSERTING TODAY DATA
function insertingTodayData(jsonData) {
    let eachHour = document.querySelectorAll("[id^='eachHour']");
    let eachConditon = document.querySelectorAll("[id^='eachConditon']");
    let eachTemp = document.querySelectorAll("[id^='eachTemp']");

    let i = 0;
    eachHour.forEach((value) => {
        let time = jsonData.days[0].hours[i].datetime.split(":")[0] + ":00";
        value.innerHTML = convertTo12(jsonData.days[0].hours[i].datetime);
        i++;
    })

    i = 0;
    eachConditon.forEach((value) => {
        let [backgroundURL, currentWeatherIconSRC] = linksOnTime(jsonData, jsonData.days[0].hours[i].datetime.split(":"), jsonData.days[0].sunset.split(":"));
        value.setAttribute("src", currentWeatherIconSRC);
        i++;
    });

    i = 0;
    eachTemp.forEach((value) => {
        value.innerHTML = jsonData.days[0].hours[i].temp + "°C";
        i++;
    });

    insertingWeekData(jsonData);
    insertHighlights(jsonData)

    document.getElementById("centigradeButton").classList.add("unitActive");
    document.getElementById("farenheitButton").classList.remove("unitActive");

    document.querySelector(".weakweatherReports").classList.add("hideTemp");
    document.querySelector(".Hours").classList.remove("hideTemp");
}

//INSERTING WEEK DATA
function insertingWeekData(jsonData) {
    let dayName = document.querySelectorAll("[id^='dayName']");
    let weathercondIcon = document.querySelectorAll("[id^='weathercondIcon']");
    let weakdayTemp = document.querySelectorAll("[id^='weakdayTemp']");

    let ymd = jsonData.days[0].datetime.split("-");
    let date = new Date(ymd[0], ymd[1] - 1, ymd[2]);
    let weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    let i = 0;
    dayName.forEach((value) => {
        value.innerHTML = weekDays[(date.getDay() + i) % 7];
        i++;
    });

    i = 0;
    weathercondIcon.forEach((value) => {
        let dayWeatherIconSRC = linksOnWeek(jsonData, i);
        value.setAttribute("src", dayWeatherIconSRC);
        i++;
    });

    i = 0;
    weakdayTemp.forEach((value) => {
        value.innerHTML = jsonData.days[i].temp + "°C";
        i++;
    });

}


async function getWeatherInfo(city) {
    try {
        let rawData = await fetchingWeather(city);
        let jsonData = await rawData.json();

        if (jsonData.error || !jsonData.resolvedAddress) {
            throw new Error("Invalid city name");
        }

        let locationDetails = jsonData.resolvedAddress;
        let locationDetailsElement = document.querySelector(".urlLocationDetails");
        locationDetailsElement.innerText = locationDetails;

        let time1 = jsonData.currentConditions.datetime.split(":");
        let time2 = jsonData.currentConditions.sunset.split(":");
        let [backgroundURL, currentWeatherIconSRC] = linksOnTime(jsonData, time1, time2);

        let temp = jsonData.currentConditions.temp;
        let curCondition = jsonData.currentConditions.conditions;
        let presipitation = jsonData.currentConditions.precip;
        let presentTemp = document.getElementById("presentTemp");
        let presentDayTime = document.getElementById("presentDayTime");
        let preCondition = document.getElementById("preCondition");
        let prePresp = document.getElementById("prePresp");

        presentTemp.innerHTML = `${temp}<sup class="unit">°C</sup>`;

        let date1 = jsonData.days[0].datetime.split('-');
        presentDayTime.innerText = convertDateTime(date1[0], date1[1] - 1, date1[2], ...time1);

        preCondition.innerText = curCondition;
        prePresp.innerText = `Precipitation:${presipitation ? presipitation : 0}%`;
        document.body.style.backgroundImage = backgroundURL;
        document.getElementById("currentWeatherImage").innerHTML = `<img src=${currentWeatherIconSRC} alt="weatherImg">`

        insertingTodayData(jsonData);
    }catch(error){
        alert("please enter valid location")
    }
    
}

document.addEventListener("DOMContentLoaded", () => {
    getWeatherInfo("Pune");
});

async function getLocation() {
    try {
        let rawData = await cityIdentification();
        let jsonData = await rawData.json();
        getWeatherInfo(jsonData.city || "Pune");
    }
    catch (error) {
        console.error("Geolocation failed,using default city");
        getWeatherInfo("Pune")
    }
}

//UNIT CONVERIONS
function celTofah(val) {
    let fahrenheitVal = (val * (9 / 5)) + 32;
    return fahrenheitVal.toFixed(1);
}
function fahTocel(val) {
    let celciusVal = (val - 32) * (5 / 9);
    return celciusVal.toFixed(1);
}

function convertTo12(time) {
    let [hour, minute, seconds] = time.split(":");

    let snippet = (hour >= 12) ? "PM" : "AM";
    let hourInt = parseInt(hour);
    let minutesInt = parseInt(minute);

    let hour12 = hourInt % 12 || 12;
    let minutefor = (minutesInt < 10) ? '0' + minutesInt : minutesInt;

    return `${hour12}:${minutefor} ${snippet}`;
}

function linksOnTime(jsonData, time1, time2) {
    let date1 = jsonData.days[0].datetime.split('-');
    let dateStamp1 = new Date(date1[0], date1[1] - 1, date1[2], ...time1);

    let dateStamp2 = new Date(date1[0], date1[1] - 1, date1[2], ...time2);

    let condition = jsonData.currentConditions.conditions.toLowerCase();
    let backgroundURL = "";
    let currentWeatherIconSRC = "";
    if (dateStamp1 < dateStamp2) {
        if (condition.includes("clear")) {
            backgroundURL = 'url("https://i.ibb.co/WGry01m/cd.jpg")';
            currentWeatherIconSRC = "https://i.ibb.co/rb4rrJL/26.png";

        }
        else if (condition.includes("rain")) {
            backgroundURL = 'url("https://i.ibb.co/h2p6Yhd/rain.webp")';
            currentWeatherIconSRC = "https://i.ibb.co/kBd2NTS/39.png";
        }
        else {
            backgroundURL = 'url("https://i.ibb.co/qNv7NxZ/pc.webp")';
            currentWeatherIconSRC = "https://i.ibb.co/PZQXH8V/27.png";
        }
    }
    else {
        if (condition.includes("clear")) {
            backgroundURL = 'url("https://i.ibb.co/kqtZ1Gx/cn.jpg")';
            currentWeatherIconSRC = "https://i.ibb.co/1nxNGHL/10.png";
        }
        else if (condition.includes("rain")) {
            backgroundURL = 'url("https://i.ibb.co/h2p6Yhd/rain.webp")';
            currentWeatherIconSRC = "https://i.ibb.co/kBd2NTS/39.png";
        }
        else {
            backgroundURL = 'url("https://i.ibb.co/RDfPqXz/pcn.jpg")';
            currentWeatherIconSRC = "https://i.ibb.co/Kzkk59k/15.png";
        }
    }


    return [backgroundURL, currentWeatherIconSRC]
}

function linksOnWeek(jsonData, dayNum) {
    let dayWeatherIconSRC = "";
    let condition = jsonData.days[dayNum].conditions.toLowerCase();
    if (condition.includes("clear")) {
        dayWeatherIconSRC = "https://i.ibb.co/rb4rrJL/26.png";
    }
    else if (condition.includes("rain")) {
        dayWeatherIconSRC = "https://i.ibb.co/kBd2NTS/39.png";
    }
    else {
        dayWeatherIconSRC = "https://i.ibb.co/PZQXH8V/27.png";
    }
    return dayWeatherIconSRC;
}

//INSERTING HIGH LIGHTS
function insertHighlights(jsonData) {

    //UV INDEX DATA
    let uvIndexValue = document.getElementById("hightLightValue1");
    let uvIndexStatus = document.getElementById("hightLightResult1");
    uvIndexValue.innerHTML = jsonData.currentConditions.uvindex;
    uvIndexStatus.innerHTML = uvStatus(jsonData);

    //WIND SPEED DATA
    let windValue = document.getElementById("hightLightValue2");
    windValue.innerHTML = jsonData.currentConditions.windspeed;

    //SUNRISE AND SUNSET DATA
    let sunrise = document.getElementById("hightLightValue3");
    let sunset = document.getElementById("hightLightResult3");
    sunrise.innerHTML = convertTo12(jsonData.currentConditions.sunrise);
    sunset.innerHTML = convertTo12(jsonData.currentConditions.sunset);

    // HUMIDITY DATA
    let humidityValue = document.getElementById("hightLightValue4");
    let humidStatus = document.getElementById("hightLightResult4");
    humidityValue.innerHTML = jsonData.currentConditions.humidity;
    humidStatus.innerHTML = humidityStatus(jsonData)

    // VISIBILITY DATA
    let visibilityValue = document.getElementById("hightLightValue5");
    let visibleStatus = document.getElementById("hightLightResult5");
    visibilityValue.innerHTML = jsonData.currentConditions.visibility;
    visibleStatus.innerHTML = visibilityStatus(jsonData);

    //AIR QUALITY DATA
    let airQualityValue = document.getElementById("hightLightValue6");
    let airQuaStatus = document.getElementById("hightLightResult6");
    let stationName = jsonData.currentConditions.stations[0];
    airQualityValue.innerHTML = jsonData.stations[stationName].quality;
    airQuaStatus.innerHTML = airQualityStatus(jsonData);
}


//AIR QUALITY STATUS CONDITIONS
function airQualityStatus(jsonData) {
    let stationName = jsonData.currentConditions.stations[0];
    let val = jsonData.stations[stationName].quality;

    let status = "";
    if (val >= 0 && val <= 0.03) {
        status = "Good 👌";
    }
    else if (val > 0.03 && val <= 0.16) {
        status = "Moderate 😐";
    }
    else if (val > 0.16 && val <= 0.35) {
        status = "Unhealthy for Sensitive Groups 😷";
    }
    else if (val > 0.35 && val <= 1.13) {
        status = "Unhealthy 😷";
    }
    else if (val > 1.13 && val <= 2.16) {
        status = "Very Unhealthy 😨";
    }
    else {
        status = "Hazardous 😱";
    }
    return status;
}
//HUMIDITY STATUS CONDITIONS
function humidityStatus(jsonData) {
    let val = jsonData.currentConditions.humidity;
    let status = "";
    if (val < 30) {
        status = "Low";
    }
    else if (val >= 30 && val <= 60) {
        status = "Moderate";
    }
    else if (val > 60 && val <= 80) {
        status = "High";
    }
    else if (val > 80 && val <= 95) {
        status = "Very High";
    }
    else {
        status = "Extreme";
    }
    return status;
}
//VISIBILITTY STATUS CONDITIONS
function visibilityStatus(jsonData) {
    let val = jsonData.currentConditions.visibility;

    let status = "";
    if (val >= 0 && val <= 0.03) {
        status = "Dense Fog";
    }
    else if (val > 0.03 && val <= 0.16) {
        status = "Moderate Fog";
    }
    else if (val > 0.16 && val <= 0.35) {
        status = "Light Fog";
    }
    else if (val > 0.35 && val <= 1.13) {
        status = "Very Light Fog";
    }
    else if (val > 1.13 && val <= 2.16) {
        status = "Light Mist";
    }
    else if (val > 2.16 && val <= 5.4) {
        status = "Very Light Mist";
    }
    else if (val > 5.4 && val <= 10.8) {
        status = "Clear Air";
    }
    else {
        status = "Very Clear Air";
    }

    return status;
}
//UVINDEX STATUS CONDITIONS
function uvStatus(jsonData) {
    let val = jsonData.currentConditions.uvindex;
    let status = "";
    if (val <= 2) {
        status = "Low";
    }
    else if (val >= 3 && val <= 5) {
        status = "Moderate";
    }
    else if (val >= 6 && val <= 7) {
        status = "High";
    }
    else if (val >= 8 && val <= 10) {
        status = "Very High";
    }
    else {
        status = "Extreme";
    }
    return status;
}

function updateTime() {
    let presentDayTime = document.getElementById("presentDayTime");
    let date = new Date();


    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let day = days[date.getDay()];


    let hours = date.getHours();
    let minutes = date.getMinutes().toString().padStart(2, "0");
    let seconds = date.getSeconds().toString().padStart(2, "0");
    let time = convertTo12(`${hours}:${minutes}:${seconds}`);

    presentDayTime.innerText = `${day}, ${time}`;
}
setInterval(updateTime, 1000);
