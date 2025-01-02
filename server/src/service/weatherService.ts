import dotenv from 'dotenv';
dotenv.config();

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}
// TODO: Define a class for the Weather object
class Weather {
  city: string;
  tempF: number;
  wind: number;
  humidity: number;
  date: Date;
  icon: string;

  constructor(
    city: string,
    tempF: number,
    wind: number,
    humidity: number,
    date: Date,
    icon: string
  ) {
    this.city = city;
    this.tempF = tempF;
    this.wind = wind;
    this.humidity = humidity;
    this.date = date;
    this.icon = icon;
  }
}

// TODO: Complete the WeatherService class
class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  private baseURL: string;
  private apiKey: string;
  private cityName: string;

  constructor() {
    this.baseURL = process.env.API_BASE_URL || '';
    this.apiKey = process.env.API_KEY || '';
    this.cityName = '';
  }
  // TODO: Create fetchLocationData method
  private async fetchLocationData(query: string) {
    try {
      if (!this.baseURL || !this.apiKey) {
        throw new Error('Key or URL not found');
      }
      const response: Coordinates = await fetch(query).then((res) =>
        res.json()
      );
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  //
  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: Coordinates): Coordinates {
    // returns lat and lon
    if (!locationData) {
      throw new Error('Please pass in a location');
    }
    const { lat, lon } = locationData;
    const coordinates: Coordinates = {
      lat,
      lon,
    };
    return coordinates;
  }
  // TODO: Create buildGeocodeQuery method
  private buildGeocodeQuery(): string {
    const geoQuery = `${this.baseURL}/geo/1.0/direct?q=${this.cityName}&appid${this.apiKey}`;
    return geoQuery;
  }

  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    const weatherQuery = `api.openweathermap.org/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}`;
    return weatherQuery;
  }

  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData() {
    return await this.fetchLocationData(this.buildGeocodeQuery()).then((data) =>
      this.destructureLocationData(data)
    );
  }

  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates) {
    try {
      const response = await fetch(this.buildWeatherQuery(coordinates)).then(
        (res) => res.json()
      );
      // used for now
      return response;
      // FIXME: circle back
      // const weatherData: Weather =

      // We should get current weather
      // We should get weather over next 5 days
    } catch {}
  }

  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(response: any) {
    const parsedTime = response.list.dt_txt;
    console.log(parsedTime);
    const currentWeather = new Weather(
      this.city,
      response.main.temp,
      response.wind.speed,
      humidity,
      icon,
      date
    );
  }

  // TODO: Complete buildForecastArray method
  private buildForecastArray(currentWeather: Weather, weatherData: any[]) {
    const filteredWeatherData = weatherData.filter((data: any) => {
      return data.dt_txt.includes('12:00:00');
    });
  }

  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string) {}
}

export default new WeatherService();
