import { useState, useEffect } from "react";
import Axios from "axios";
import homeimg from "../src/assets/homeimg.jpg";

// Debouncing function for search input
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("Kozhikode"); // Default city
  const [error, setError] = useState(""); // State to manage errors
  const [loading, setLoading] = useState(false); // State for loading
  const cities = [
    "Kozhikode",
    "Vadakara",
    "Thiruvananthapuram",
    "Kochi",
    "Kollam",
    "Alappuzha",
    "Palakkad",
    "Kannur",
    "Malappuram",
  ]; // Kerala cities

  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // Delay of 300ms

  useEffect(() => {
    // Use geolocation to set the default city based on the user's current location
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          const apiKey = "8da5f8e6c3ad993cc64c2bad1c75d4bd";
          const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

          try {
            const response = await Axios.get(apiUrl);
            setSelectedCity(response.data.name); // Set the city based on geolocation
          } catch (err) {
            console.error(err);
            setError("Failed to fetch current location weather data.");
          }
        });
      } else {
        console.error("Geolocation is not supported by this browser.");
      }
    };

    getLocation();
  }, []);

  useEffect(() => {
    // Fetch weather data for selected city whenever it changes
    const fetchWeatherData = async () => {
      const apiKey = "8da5f8e6c3ad993cc64c2bad1c75d4bd"; // Your API Key
      const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${selectedCity},IN&appid=${apiKey}&units=metric`;

      try {
        setLoading(true); // Start loading
        const response = await Axios.get(apiUrl);
        setWeatherData(response.data);
        console.log(response.data);
        setError(""); // Clear errors on successful fetch
      } catch (err) {
        console.error(err);
        setError("Failed to fetch weather data. Please try again.");
      } finally {
        setLoading(false); // Stop loading
      }
    };

    if (selectedCity) {
      fetchWeatherData();
    }
  }, [selectedCity]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleCityClick = (city) => {
    setSelectedCity(city); // Select the city when it's clicked
    setSearchTerm(""); // Clear the search term after selecting a city
  };

  // Filter cities based on the debounced search term (show results that include the input text)
  const filteredCities = cities.filter((city) =>
    city.toLowerCase().includes(debouncedSearchTerm)
  );

  return (
    <>
      <div>
        <div className="w-36"></div>
        <div className="fixed">
          <img className="h-[100vh] w-[100vw]" src={homeimg} alt="background" />

          {/* Show filtered cities only when search term is not empty */}
          {debouncedSearchTerm && filteredCities.length > 0 && (
            <div className=" left-[35%] top-[26%] absolute bg-white pl-3 rounded-md z-30 md:w-[25vw] w-64 max-h-60 overflow-auto">
              {filteredCities.map((city) => (
                <div
                  key={city}
                  className="p-2 cursor-pointer hover:bg-gray-200"
                  onClick={() => handleCityClick(city)} // Select city on click
                >
                  {city}
                </div>
              ))}
            </div>
          )}

          {/* Show error message if any */}
          {error && (
            <div className="md:left-1/3 left-[15%] top-[20%] absolute bg-red-200 rounded-md p-4 text-red-700">
              {error}
            </div>
          )}

          {/* Show loading spinner */}
          {loading && (
            <div className="md:left-1/3 left-[15%] top-[18%] w-72 absolute bg-white/30 rounded-md z-10 font-bold text-xl items-center flex-col flex">
              <p>Loading weather data...</p>
            </div>
          )}

          {/* Show weather data */}
          {weatherData && !loading && !error && (
            <div className="container md:left-1/3 left-[20%] top-[18%] w-96 h-96 absolute bg-white/40 rounded-md z-10 font-bold text-xl items-center flex-col flex">
              <input
                type="text"
                placeholder="Type a city name"
                className="left-[5%]  top-[5%] h-[10%] w-[90%] absolute bg-white pl-3 rounded-full z-10 "
                onChange={handleSearchChange}
                value={searchTerm}
              />
              <h1 className="pl-52 pt-16 text-3xl text-gray-600">
                {`${Math.round(weatherData.main.temp)}`}&deg;C
              </h1>
              <img
                className="w-40 absolute top-12"
                src={`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                alt="weather icon"
              />

              <h2 className="pt-24 italic text-4xl text-slate-700 ">
                {weatherData.name}
              </h2>

              <h3 className="pl-56 pt-6 text-slate-600">
                {weatherData.weather[0].main}
              </h3>
              <h4 className=" text-slate-600 pt-16">
                {weatherData.weather[0].description}
              </h4>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
