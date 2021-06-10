//NOTE: this function is similar to a Node relay: 
// https://www.youtube.com/watch?v=uk9pviyvrtg

const fetch = require("node-fetch");

//pull in from netlify using netlify environment variables
const {WEATHER_API_KEY} = process.env;
//NOTE: the api key must be given to netlify in the dashboard so it can be pulled in from the .env

exports.handler = async(event, context)=> {
    const params = JSON.parse(event.body);
    const {lat, lon, units} = params;
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=${units}&appid=${WEATHER_API_KEY}`;
    try{
        const weatherStream = await fetch(url);
        const weatherJson = await weatherStream.json();
        return{
            statusCode: 200,
            body: JSON.stringify(weatherJson),
        };
    }catch(err){
        return {
            statusCode: 422,
            body: err.stack,
        }; //NOTE: the err.stack can be processed in the frontend code
    }
};
