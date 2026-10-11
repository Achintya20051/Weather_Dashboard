const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const searchButton = document.getElementById("searchButton");
const statusMessage = document.getElementById("statusMessage");
const weatherPanel = document.getElementById("weatherPanel");

const ui = {
  cityName: document.getElementById("cityName"),
  localTime: document.getElementById("localTime"),
  weatherIcon: document.getElementById("weatherIcon"),
  temperature: document.getElementById("temperature"),
  condition: document.getElementById("condition"),
  feelsLike: document.getElementById("feelsLike"),
  humidity: document.getElementById("humidity"),
  windSpeed: document.getElementById("windSpeed"),
  pressure: document.getElementById("pressure"),
  updatedAt: document.getElementById("updatedAt")
};

// Open-Meteo weather codes mapped to readable conditions and icons.
const weatherCodes = {
  0: ["Clear sky", "☀️"],
  1: ["Mainly clear", "🌤️"],
  2: ["Partly cloudy", "⛅"],
  3: ["Overcast", "☁️"],
  45: ["Fog", "🌫️"],
  48: ["Depositing rime fog", "🌫️"],
  51: ["Light drizzle", "🌦️"],
  53: ["Moderate drizzle", "🌦️"],
  55: ["Dense drizzle", "🌧️"],
  56: ["Light freezing drizzle", "🌧️"],
  57: ["Dense freezing drizzle", "🌧️"],
  61: ["Slight rain", "🌦️"],
  63: ["Moderate rain", "🌧️"],
  65: ["Heavy rain", "🌧️"],
  66: ["Light freezing rain", "🌧️"],
  67: ["Heavy freezing rain", "🌧️"],
  71: ["Slight snow", "🌨️"],
  73: ["Moderate snow", "🌨️"],
  75: ["Heavy snow", "❄️"],
  77: ["Snow grains", "❄️"],
  80: ["Slight rain showers", "🌦️"],
  81: ["Moderate rain showers", "🌧️"],
  82: ["Violent rain showers", "⛈️"],
  85: ["Slight snow showers", "🌨️"],
  86: ["Heavy snow showers", "❄️"],
  95: ["Thunderstorm", "⛈️"],
  96: ["Thunderstorm with hail", "⛈️"],
  99: ["Thunderstorm with heavy hail", "⛈️"]
};

function setStatus(message, type = "") {
  statusMessage.textContent = message;
  statusMessage.className = `status ${type}`.trim();
}

function formatLocalTime(value) {
  if (!value) return "Local time unavailable";
  // API local time is returned as an ISO-like string without a timezone suffix.
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString([], {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit"
  });
}

async function getWeather(city) {
  searchButton.disabled = true;
  searchButton.textContent = "Searching…";
  setStatus(`Searching for ${city}…`);

  try {
    // Step 1: Convert city name to latitude and longitude.
    const geoUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
    geoUrl.search = new URLSearchParams({
      name: city,
      count: "1",
      language: "en",
      format: "json"
    });

    const geoResponse = await fetch(geoUrl);
    if (!geoResponse.ok) {
      throw new Error(`City search failed (HTTP ${geoResponse.status}).`);
    }

    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error(`We couldn't find "${city}". Check the spelling and try again.`);
    }

    const place = geoData.results[0];

    // Step 2: Fetch current weather using the coordinates.
    const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
    weatherUrl.search = new URLSearchParams({
      latitude: String(place.latitude),
      longitude: String(place.longitude),
      current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,surface_pressure",
      timezone: "auto"
    });

    const weatherResponse = await fetch(weatherUrl);
    if (!weatherResponse.ok) {
      throw new Error(`Weather service failed (HTTP ${weatherResponse.status}).`);
    }

    const weatherData = await weatherResponse.json();

    // Validate the nested JSON before trying to render it.
    const current = weatherData.current;
    if (!current || typeof current.temperature_2m !== "number") {
      throw new Error("Weather data was incomplete. Please try again.");
    }

    renderWeather(place, weatherData);
    setStatus(`Showing current weather for ${place.name}.`, "success");
  } catch (error) {
    console.error("Weather request error:", error);
    setStatus(
      error instanceof TypeError
        ? "Unable to connect. Check your internet connection and try again."
        : error.message || "Something went wrong. Please try again.",
      "error"
    );
    if (!weatherPanel.hidden) {
      // Keep the last successful result visible if a new search fails.
    }
  } finally {
    searchButton.disabled = false;
    searchButton.textContent = "Search";
  }
}

function renderWeather(place, data) {
  const current = data.current;
  const units = data.current_units || {};
  const [condition, icon] = weatherCodes[current.weather_code] || ["Unknown conditions", "🌡️"];
  const locationParts = [place.admin1, place.country].filter(Boolean);

  ui.cityName.textContent = place.name;
  ui.localTime.textContent = `${locationParts.join(", ")} · ${formatLocalTime(current.time)}`;
  ui.weatherIcon.textContent = icon;
  ui.temperature.textContent = `${Math.round(current.temperature_2m)}°`;
  ui.condition.textContent = condition;
  ui.feelsLike.textContent = `Feels like ${Math.round(current.apparent_temperature)}${units.apparent_temperature || "°C"}`;
  ui.humidity.textContent = `${current.relative_humidity_2m}${units.relative_humidity_2m || "%"}`;
  ui.windSpeed.textContent = `${current.wind_speed_10m} ${units.wind_speed_10m || "km/h"}`;
  ui.pressure.textContent = `${Math.round(current.surface_pressure)} ${units.surface_pressure || "hPa"}`;
  ui.updatedAt.textContent = new Date().toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });

  weatherPanel.hidden = false;
}

searchForm.addEventListener("submit", event => {
  event.preventDefault();
  const city = cityInput.value.trim();

  if (!city) {
    setStatus("Please enter a city name.", "error");
    cityInput.focus();
    return;
  }

  getWeather(city);
});

// Load a default city so the dashboard is populated on first visit.
cityInput.value = "Delhi";
getWeather("Delhi");
