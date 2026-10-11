# SkyCast — Weather Dashboard

SkyCast is a responsive weather dashboard built with HTML, CSS, and asynchronous JavaScript. It fetches live weather information from the Open-Meteo public REST API.

## Features
- Search current weather by city name
- Uses Fetch API with `async`/`await`
- Displays temperature, feels-like temperature, humidity, wind speed, pressure, and conditions
- Handles invalid cities, HTTP errors, incomplete responses, and network failures
- Dynamically renders nested JSON data
- Responsive design for desktop and mobile
- No API key required

## Files
- `index.html` — dashboard structure
- `style.css` — layout and responsive styling
- `script.js` — API requests, JSON parsing, error handling, and DOM updates

## Run locally
Keep all three files in the same folder and open `index.html` in a modern browser with internet access. If local browser restrictions interfere with requests, run the folder using VS Code Live Server.

## API
- Geocoding: https://geocoding-api.open-meteo.com/v1/search
- Forecast/current conditions: https://api.open-meteo.com/v1/forecast
- Provider: https://open-meteo.com/
