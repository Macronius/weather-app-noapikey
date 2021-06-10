export const setPlaceholderText = ()=> {
    //look at page width
    const input = document.getElementById("searchBar__text"); //look at width of window, and based on width set placeholder text //NOTE: cannot do with CSS
    window.innerWidth < 400 
        ? (input.placeholder = "City, State, Country") 
        : (input.placeholder = "City, State, Country, or Zip Code");
};


//NOTE: element refers to the icon, should probably be called 'icon' instead

export const addSpinner = (element)=> {
    animateButton(element);
    setTimeout(animateButton, 1000, element);
};

//helper function
const animateButton = (element)=> {
    element.classList.toggle("none");
    element.nextElementSibling.classList.toggle("block");
    element.nextElementSibling.classList.toggle("none");
};
//NOTE: first element is either shown or hidden, depending on what needs to be done
//NOTE: the sibling is the animated icon, shown or hidden, depending on what needs to be done


//NOTE: header and screen reader
export const displayError = (headerMsg, srMsg)=> {
    updateWeatherLocationHeader(headerMsg);
    updateScreenReaderConfirmation(srMsg);
};

export const displayApiError = (statusCode)=> {
    const properMsg = toProperCase(statusCode.message);
    updateWeatherLocationHeader(properMsg);
    updateScreenReaderConfirmation(`${properMsg}. Please try again.`);
};

//capitalize the first word
const toProperCase = (text)=> {
    const words = text.split(" ");
    const properWords = words.map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    });
    return properWords.join(" ");
}

//displayError helper functions
const updateWeatherLocationHeader = (message)=> {
    console.log("Original message: " + message);
    const h1 = document.getElementById("currentForecast__location");
    //only format if lat and lon exist, not if city
    if (message.indexOf("Lat:") !== -1 && message.indexOf("Long:") !== -1) {
        const msgArray = message.split(" ");
        console.log("msgArray: " + msgArray);
        const mapArray = msgArray.map( (msg)=> {
            return msg.replace(":", ": ");
        });
        // console.log("new mapArray: " + mapArray);
        // console.log(" ");
        // console.log("troubleshoot lat: " + mapArray[0].indexOf("-"));
        // console.log("else option: " + mapArray[0].slice(0,11) + "||");
        const lat = 
            mapArray[1].indexOf("-") === -1 
            ? mapArray[1].slice(0,5) 
            : mapArray[1].slice(0,6);
        console.log(lat);
        const lon = 
            mapArray[3].indexOf("-") === -1
            ? mapArray[3].slice(0,5) 
            : mapArray[3].slice(0,6); 
        console.log(lon);

        h1.textContent = `${mapArray[0]}${lat} ∙ ${mapArray[2]}${lon}`;
        console.log(h1.textContent);
    }else{
        h1.textContent = message;
    }
};

export const updateScreenReaderConfirmation = (message)=> {
    document.getElementById("confirmation").textContent = message;
};

export const updateDisplay = (weatherJson, locationObj)=> {
    //call helper functions
    fadeDisplay();
    clearDisplay();
    const weatherClass = getWeatherClass(weatherJson.current.weather[0].icon);
    setBGImage(weatherClass);
    const screenReaderWeather = buildScreenReaderWeather(weatherJson, locationObj);
    updateScreenReaderConfirmation(screenReaderWeather);
    updateWeatherLocationHeader(locationObj.getName());
    //current conditions
    const ccArray = createCurrentConditionsDivs(weatherJson, locationObj.getUnit());
    displayCurrentConditions(ccArray);
    displaySixDayForecast(weatherJson);
    setFocusOnSearch();
    fadeDisplay();
};

const fadeDisplay = ()=> {
    const cc = document.getElementById("currentForecast"); //cc = current conditions
    cc.classList.toggle("zero-vis");
    cc.classList.toggle("fade-in");
    const sixDay = document.getElementById("dailyForecast");
    sixDay.classList.toggle("zero-vis");
    sixDay.classList.toggle("fade-in");
};

const clearDisplay = ()=> {
    const currentConditions = document.getElementById("currentForecast__conditions");
    deleteContents(currentConditions);
    const sixDayForecast = document.getElementById("dailyForecast__contents");
    deleteContents(sixDayForecast);
};

//feed an element, then this deletes everything inside that element
const deleteContents = (parentElement)=> {
    console.log(parentElement);
    // console.log(parentElement.lastElementChild);
    let child = parentElement.lastElementChild;
    // console.log(parentElement.lastElementChild);
    while(child){
        parentElement.removeChild(child);
        child = parentElement.lastElementChild;
        console.log(child);
    }
};

const getWeatherClass = (icon)=> {
    const firstTwoChars = icon.slice(0,2);  //bc I know icon is 3 characters, 2 #s and a letter
    const lastChar = icon.slice(2);
    const weatherLookup = {
        "09": "snow", //shower rain
        "10": "rain",
        "11": "rain", //thunderstorm
        "13": "snow",
        "50": "fog", //mist
    }
    let weatherClass;
    if(weatherLookup[firstTwoChars]){
        weatherClass = weatherLookup[firstTwoChars];
    }else if(lastChar === "d") {
        weatherClass = "clouds";
    }else{
        weatherClass = "night";
    }
    return weatherClass;
};

const setBGImage = (weatherClass)=> {
    document.documentElement.classList.add(weatherClass);
    document.documentElement.classList.forEach( (img)=> {
        if(img !== weatherClass) document.documentElement.classList.remove(img);
        //NOTE: we only want the image applied to the html element if it matches the weatherClass that we determined
    });
};

const buildScreenReaderWeather = (weatherJson, locationObj)=> {
    const location = locationObj.getName();
    const unit = locationObj.getUnit();
    const tempUnit = unit === "imperial" ? "Fahrenheit" : "Celsius"; //REMEMBER: spell it out for screenreader
    return `${weatherJson.current.weather[0].description} and ${Math.round(Number(weatherJson.current.temp))}° ${tempUnit} in ${location}`
}

const setFocusOnSearch = ()=> {
    document.getElementById("searchBar__text").focus();
};

const createCurrentConditionsDivs = (weatherObj, unit)=> {
    const tempUnit = unit === "imperial" ? "F" : "C";
    const windUnit = unit === "imperial" ? "mph" : "m/s";
    const icon = createMainImgDiv(
        weatherObj.current.weather[0].icon, 
        weatherObj.current.weather[0].description
    );
    const temp = createElem(
        "div", 
        "temp", 
        `${Math.round(Number(weatherObj.current.temp))}°`
    );
    const properDesc = toProperCase(weatherObj.current.weather[0].description);
    const desc = createElem("div", "desc", properDesc);
    const feels = createElem(
        "div", 
        "feels", 
        `Feels like ${Math.round(Number(weatherObj.current.feels_like))}°`
    );
    const maxTemp = createElem(
        "div", 
        "maxtemp", 
        `High ${Math.round(Number(weatherObj.daily[0].temp.max))}°`
    );
    const minTemp = createElem(
        "div", 
        "mintemp", 
        `Low ${Math.round(Number(weatherObj.daily[0].temp.min))}°`
    );
    const humidity = createElem(
        "div", 
        "humidity",
        `Humidity ${weatherObj.current.humidity}%`
    );
    const wind = createElem(
        "div",
        "wind",
        `Wind ${Math.round(Number(weatherObj.current.wind_speed))} ${windUnit}`
    );
    return [icon, temp, desc, feels, maxTemp, minTemp, humidity, wind];
};

const createMainImgDiv = (icon, altText)=> {
    const iconDiv = createElem("div", "icon");
    iconDiv.id = "icon";
    const faIcon = translateIconToFontAwesome(icon);
    faIcon.ariaHidden = true;
    faIcon.title = altText;
    iconDiv.appendChild(faIcon);
    return iconDiv;
};

const createElem = (elemType, divClassName, divText, unit)=> {
    const div = document.createElement(elemType);
    div.className = divClassName;
    if(divText){
        div.textContent = divText;
    }
    if(divClassName === "temp"){
        const unitDiv = document.createElement("div");  //NOTE: document.createElement is js built-in function
        unitDiv.classList.add("unit");
        // unitDiv.className.add("unit");  //note: this would also work
        unitDiv.textContent = unit;
        div.appendChild(unitDiv);
    }
    return div;
};

//in current conditions section, graphics will come from fa rather than the weather api in order to match the font
const translateIconToFontAwesome = (icon)=> {
    const i = document.createElement("i");
    const firstTwoChars = icon.slice(0,2);
    const lastChar = icon.slice(2);
    switch(firstTwoChars){
        case "01":
            if(lastChar === 'd') {
                i.classList.add("far", "fa-sun");
            }else{
                i.classList.add("far", "fa-moon");
            }
            break;
        case "02":
            if(lastChar === 'd') {
                i.classList.add("far", "fa-cloud-sun");
            }else{
                i.classList.add("far", "fa-cloud-moon");
            }
            break;
        case "03":
            i.classList.add("fas", "fa-cloud");
            break;
        case "04":
            i.classList.add("fas", "fa-cloud-meatball");
            break;
        case "09":
            i.classList.add("fas", "fa-cloud-rain");
            break;
        case "10":
            if(lastChar === 'd') {
                i.classList.add("far", "fa-cloud-sun-rain");
            }else{
                i.classList.add("far", "fa-cloud-moon-rain");
            }
            break;
        case "11":
            i.classList.add("fas", "fa-poo-storm");
            break;
        case "13":
            i.classList.add("fas", "fa-snowflake");
            break;
        case "50":
            i.classList.add("fas", "fa-smog");
            break;
        default:
            i.classList.add("far", "fa-question-circle");
    }
    return i;
};

//NOTE: parameter currentConditionsArray here is ccArray above
const displayCurrentConditions = (currentConditionsArray)=> {
    const ccContainer = document.getElementById("currentForecast__conditions");
    currentConditionsArray.forEach( (cc)=> {
        ccContainer.appendChild(cc);
    });
};

const displaySixDayForecast = (weatherJson)=> {
    for(let i=1; i <= 6; i++){
        const dfArray = createDailyForecastDivs(weatherJson.daily[i]); //NOTE: i=0 was already called for current weather conditions
        displayDailyForecast(dfArray);  //NOTE: where df represents daily forecast
    }
};

const createDailyForecastDivs = (dayWeather)=> {
    const dayAbbreviationText = getDayAbbreviation(dayWeather.dt);
    const dayAbbreviation = createElem(
        "p", 
        "dayAbbreviation", 
        dayAbbreviationText
    );
    const dayIcon = createDailyForecastIcon(
        dayWeather.weather[0].icon, 
        dayWeather.weather[0].description
    );
    const dayHigh = createElem(
        'p', 
        'dayHigh', 
        `${Math.round(Number(dayWeather.temp.max))}°`,
    );
    const dayLow = createElem(
        'p',
        'dayLow',
        `${Math.round(Number(dayWeather.temp.min))}°`,
    );
    return [dayAbbreviation, dayAbbreviation, dayIcon, dayHigh, dayLow];
};

const getDayAbbreviation = (data)=> {
    const dateObj = new Date(data * 1000);
    const utcString = dateObj.toUTCString();
    return utcString.slice(0,3).toUpperCase();
};

const createDailyForecastIcon = (icon, altText)=> {
    const img = document.createElement("img");
    //check width of page with js mediaquery to determine size of icon request from api
    if(window.innerWidth < 768 || window.innerHeight < 1025) {
        img.src = `https://openweathermap.org/img/wn/${icon}.png`;
    }else{
        img.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    }
    img.alt = altText;
    return img;
};

const displayDailyForecast = (dfArray)=> {
    const dayDiv = createElem("div", "forecastDay");
    dfArray.forEach( (el)=> {
        dayDiv.appendChild(el);
    });
    const dailyForecastContainer = document.getElementById("dailyForecast__contents");
    dailyForecastContainer.appendChild(dayDiv);
};