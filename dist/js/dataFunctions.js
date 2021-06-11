import fetch from "node-fetch";

export const setLocationObject = (locationObj, coordsObj)=> {

    const {lat, lon, name, unit} = coordsObj;

    locationObj.setLat(lat);
    locationObj.setLon(lon);
    locationObj.setName(name);
    if(unit){
        locationObj.setUnit(unit);
    }
};

export const getHomeLocation = ()=> {
    return localStorage.getItem("defaultWeatherLocation");
}

export const getWeatherFromCoords = async(locationObj)=> {
    //NOTE: code that works without a serverless function
    // const lat = locationObj.getLat();
    // const lon = locationObj.getLon();
    // const units = locationObj.getUnit();
    // const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=${units}&appid=${WEATHER_API_KEY}`;
    // //NOTE: lat, lon, and units received programatically, therefore no encoding required
    // try{
    //     const weatherStream = await fetch(url);
    //     const weatherJson = await weatherStream.json();
    //     return weatherJson;
    // } catch(err) {
    //     console.error(err);
    // }

    //NOTE: pass a url object to the serverless function
    const urlDataObj = {
        lat: locationObj.getLat(),
        lon: locationObj.getLon(),
        units: locationObj.getUnit()
    };
    try{
        const weatherStream = await fetch('./.netlify/functions/get_weather', {
            method: "POST",
            body: JSON.stringyfy(urlDataObj)
        });
        const weatherJson = await weatherStream.json();
        return weatherJson;
    }catch(err){
        console.error(err);
    }
};

export const getCoordsFromApi = async(entryText, units)=> {
    //NOTE: for server function
    // const regex = /^\d+$/g;
    // const flag = regex.test(entryText) ? "zip" : "q";
    // const url = `https://api.openweathermap.org/data/2.5/weather?${flag}=${entryText}&units=${units}&appid=${WEATHER_API_KEY}`;
    // const encodedUrl = encodeURI(url);
    // try{
    //     const dataStream = await fetch(encodedUrl);
    //     const jsonData = await dataStream.json();
    //     // console.log(jsonData);
    //     return jsonData;
    // }catch(err){
    //     console.log(err.stack);
    // }

    //for serverless function
    const urlDataObj = {
        text: entryText,
        units: units,
    };
    try{
        const dataStream = await fetch('./.netlify/functions/get_coords', {
            method: "POST",
            body: JSON.stringify(urlDataObj)
        });
        const jsonData = await dataStream.json();
        return jsonData;
    }catch(err){
        console.error(err);
    }
};



export const cleanText = (text)=> {
    const regex = / {2,}/g; //two or more spaces in a row
    const entryText = text.replaceAll(regex, " ").trim();
    return entryText;
};