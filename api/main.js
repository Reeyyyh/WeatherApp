const WEATHER_API_KEY = "e1ebc168bf3404e44192a12d0e5d0587";
const cityCards = document.getElementById("cityCards");
const loadingIndicator = document.getElementById("loadingIndicator");
const searchButton = document.getElementById("searchButton");
const searchInput = document.getElementById("searchInput");
const errorMessage = document.getElementById("errorMessage");
const refreshButton = document.getElementById("refreshButton");

let countryData = [];
let weatherCache = {};

// Fetch countries from REST Countries API
fetch("https://restcountries.com/v3.1/all")
    .then(response => response.json())
    .then(countries => {
        countryData = countries
            .filter(country => country.capital && country.capital.length > 0) // Ensure capital exists
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

// Add event listener for search
searchButton.addEventListener("click", () => {
    const searchQuery = searchInput.value.trim().toLowerCase();
    if (searchQuery) {
        const country = countryData.find(({ countryName }) =>
            countryName.toLowerCase() === searchQuery
        );
        if (country) {
            errorMessage.classList.add("hidden"); // Hide error message if country is found
            cityCards.innerHTML = ""; // Clear previous cards before showing search result
            loadingIndicator.classList.remove("hidden"); // Show loading indicator
            fetchWeatherForCity(country).finally(() => {
                loadingIndicator.classList.add("hidden"); // Hide loading indicator after fetch
            });
        } else {
            cityCards.innerHTML = ""; // Clear previous cards
            errorMessage.classList.remove("hidden"); // Show error message if no country is found
            loadingIndicator.classList.add("hidden"); // Hide loading indicator in case of error
        }
    }
});

// Add event listener for refresh
refreshButton.addEventListener("click", () => {
    searchInput.value = '';
    displayRandomCards();
});

function fetchWeatherForCity({ capital, countryName }) {
    // Check if the weather data for the city is already in cache
    if (weatherCache[capital]) {
        displayCityWeather(weatherCache[capital], countryName); // Use cached data
        return Promise.resolve(); // Return a resolved promise since data is already fetched
    }

    // Fetch weather data if not in cache
    return fetch(`https://api.openweathermap.org/data/2.5/weather?q=${capital}&appid=${WEATHER_API_KEY}&units=metric`)
        .then(response => response.json())
        .then(data => {
            weatherCache[capital] = data; // Cache the weather data
            displayCityWeather(data, countryName);
        })
        .catch(() => console.error(`Failed to fetch weather for ${capital}`));
}

function displayCityWeather(data, countryName) {
    const card = document.createElement("div");
    card.className = `bg-gradient-to-r from-blue-50 via-white to-blue-50 shadow-lg rounded-lg p-6 flex flex-col items-center text-center border border-gray-200 transition-transform transform hover:scale-105 hover:shadow-xl hover:transition-all duration-300`;
    card.innerHTML = `
                <h3 class="text-2xl font-bold text-blue-800 mb-3">${data.name}, ${countryName}</h3>
                <div class="bg-white p-2 rounded-full shadow-sm mb-4">
                    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather Icon" class="weather-icon w-16 h-16">
                </div>
                <div class="text-gray-700 space-y-2">
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

const themeToggleButton = document.getElementById('themeToggleButton');

// Toggle dark mode
themeToggleButton.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    themeToggleButton.textContent = isDark ? 'Light Mode' : 'Dark Mode';
});