const WEATHER_API_KEY = "e1ebc168bf3404e44192a12d0e5d0587";
const cityCards = document.getElementById("cityCards");
const loadingIndicator = document.getElementById("loadingIndicator");
const searchButton = document.getElementById("searchButton");
const searchInput = document.getElementById("searchInput");
const errorMessage = document.getElementById("errorMessage");
const refreshButton = document.getElementById("refreshButton");
const themeToggleButton = document.getElementById("themeToggleButton");

let countryData = [];
let weatherCache = {};

// Fetch countries from REST Countries API
fetch("https://restcountries.com/v3.1/all")
    .then(response => response.json())
    .then(countries => {
        countryData = countries
            .filter(country => country.capital && country.capital.length > 0)
            .map(country => ({
                capital: country.capital[0],
                countryName: country.name.common,
            }));
        displayRandomCards();
    })
    .catch(() => console.error("Failed to fetch country data"));

// Display 9 random country weather cards
function displayRandomCards() {
    const randomCountries = getRandomCountries(9);
    cityCards.innerHTML = "";
    loadingIndicator.classList.remove("hidden");

    Promise.all(randomCountries.map(fetchWeatherForCity))
        .finally(() => {
            loadingIndicator.classList.add("hidden");
        });
}

// Get 9 random countries
function getRandomCountries(count) {
    const shuffled = [...countryData].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Search event listener
searchButton.addEventListener("click", () => {
    const searchQuery = searchInput.value.trim().toLowerCase();
    if (searchQuery) {
        const country = countryData.find(({ countryName }) =>
            countryName.toLowerCase() === searchQuery
        );
        if (country) {
            errorMessage.classList.add("hidden");
            cityCards.innerHTML = "";
            loadingIndicator.classList.remove("hidden");
            fetchWeatherForCity(country).finally(() => {
                loadingIndicator.classList.add("hidden");
            });
        } else {
            cityCards.innerHTML = "";
            errorMessage.classList.remove("hidden");
            loadingIndicator.classList.add("hidden");
        }
    }
});

// Refresh event listener
refreshButton.addEventListener("click", () => {
    searchInput.value = '';
    displayRandomCards();
});

// Fetch weather data for a city
function fetchWeatherForCity({ capital, countryName }) {
    if (weatherCache[capital]) {
        displayCityWeather(weatherCache[capital], countryName);
        return Promise.resolve();
    }

    return fetch(`https://api.openweathermap.org/data/2.5/weather?q=${capital}&appid=${WEATHER_API_KEY}&units=metric`)
        .then(response => response.json())
        .then(data => {
            weatherCache[capital] = data;
            displayCityWeather(data, countryName);
        })
        .catch(() => console.error(`Failed to fetch weather for ${capital}`));
}

// Display weather card
function displayCityWeather(data, countryName) {
    const card = document.createElement("div");
    card.className = `bg-gradient-to-r from-blue-50 via-white to-blue-50 shadow-lg rounded-lg p-6 flex flex-col items-center text-center border border-gray-200 transition-transform transform hover:scale-105 hover:shadow-xl hover:transition-all duration-300 dark:bg-gray-800 dark:border-gray-700`;
    card.innerHTML = `
        <h3 class="text-2xl font-bold text-blue-800 dark:text-blue-400 mb-3">${data.name}, ${countryName}</h3>
        <div class="bg-white dark:bg-gray-700 p-2 rounded-full shadow-sm mb-4">
            <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather Icon" class="weather-icon w-16 h-16">
        </div>
        <div class="text-gray-700 dark:text-gray-300 space-y-2">
            <p class="text-lg">
                🌡️ <span class="font-medium">Temperature:</span> <span class="font-semibold">${data.main.temp}°C</span>
            </p>
            <p class="text-lg">
                🌤️ <span class="font-medium">Weather:</span> <span class="capitalize font-semibold">${data.weather[0].description}</span>
            </p>
            <p class="text-lg">
                💧 <span class="font-medium">Humidity:</span> <span class="font-semibold">${data.main.humidity}%</span>
            </p>
        </div>
    `;
    cityCards.appendChild(card);
}