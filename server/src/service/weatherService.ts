// import { timeStamp } from 'console';
// import dayjs from 'dayjs';
import dotenv from 'dotenv';
// import axios from 'axios';
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
  date: string;
  icon: string;
  iconDescription: string;

  constructor(
    city: string,
    tempF: number,
    wind: number,
    humidity: number,
    date: string,
    icon: string,
    iconDescription: string
  ) {
    this.city = city;
    this.tempF = tempF;
    this.wind = wind;
    this.humidity = humidity;
    this.date = date;
    this.icon = icon;
    this.iconDescription = iconDescription;
  }
}

// TODO: Complete the WeatherService class
class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  private baseURL?: string;
  private apiKey?: string;
  private city = '';

  constructor() {
    this.baseURL = process.env.API_BASE_URL || '';
    this.apiKey = process.env.API_KEY || '';
    // this.city = '';
  }
  // TODO: Create fetchLocationData method

  private async fetchLocationData(query: string) {
    try {
      if (!this.baseURL || !this.apiKey) {
        throw new Error('API Key or URL not found');
      }

      const response = await fetch(query);
      const data = await response.json();

      console.log('Geocode API Response:', data); // Debugging log

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Geolocation data not found');
      }

      return data[0]; // Extract first result
    } catch (error) {
      console.error('Error fetching location data:', error);
      throw error;
    }
  }

  // TODO: Create buildGeocodeQuery method
  private buildGeocodeQuery(): string {
    const geoQuery = `${this.baseURL}/geo/1.0/direct?q=${this.city}&appid=${this.apiKey}`;
    return geoQuery;
  }

  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    const weatherQuery = `https://api.openweathermap.org/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&units=imperial&appid=${this.apiKey}`;
    return weatherQuery;
  }

  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData() {
    return await this.fetchLocationData(this.buildGeocodeQuery()).then(
      (data) => data
    );
  }

  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates) {
    try {
      const response = await fetch(this.buildWeatherQuery(coordinates)).then(
        (res) => res.json()
      );

      console.log('Weather API Response:', response); // Add this log

      if (!response || !response.list || response.list.length === 0) {
        throw new Error('Weather data not found or API returned empty list');
      }

      const currentWeather: Weather = this.parseCurrentWeather(
        response.list[0]
      );

      const forecast: Weather[] = this.buildForecastArray(
        currentWeather,
        response.list
      );

      return forecast;
    } catch (error: any) {
      console.error(error);
      throw error;
    }
  }

  // TODO: Build parseCurrentWeather method

  private parseCurrentWeather(response: any): Weather {
    const timestamp: number = Number(response.dt) * 1000;
    const parsedDate: string = new Date(timestamp).toLocaleDateString('en-US');
    const windSpeed = response.wind?.speed ?? 0; // Use wind.speed if it exists, else 0
    console.log('parseCurrentWeather - wind:', response.wind);

    const tempF = Math.round(response.main.temp);

    return new Weather(
      this.city,
      tempF, // already in °F from API (units=imperial)
      windSpeed,
      response.main.humidity,
      parsedDate,
      response.weather[0].icon,
      response.weather[0].main || response.weather[0].description
    );
  }

  private buildForecastArray(
    currentWeather: Weather,
    weatherData: any[]
  ): Weather[] {
    const weatherForecast: Weather[] = [currentWeather];

    const filteredWeatherData = weatherData.filter((data: any) =>
      data.dt_txt.includes('12:00:00')
    );

    for (const day of filteredWeatherData) {
      const timestamp: number = Number(day.dt) * 1000;
      const formattedDate: string = new Date(timestamp).toLocaleDateString(
        'en-US'
      );
      const windSpeed = day.wind?.speed ?? 0;
      console.log('buildForecastArray - day.wind:', day.wind);

      const tempF = Math.round(day.main.temp);

      weatherForecast.push(
        new Weather(
          this.city,
          tempF,
          windSpeed,
          day.main.humidity,
          formattedDate,
          day.weather[0].icon,
          day.weather[0].description || day.weather[0].main
        )
      );
    }

    return weatherForecast;
  }

  // private parseCurrentWeather(response: any): Weather {
  //   const timestamp: number = Number(response.dt) * 1000;
  //   const parsedDate: string = new Date(timestamp).toLocaleDateString('en-US');

  //   console.log(parsedDate);

  //   return new Weather(
  //     this.city,
  //     response.main.temp,
  //     response.wind_speed,
  //     response.main.humidity,
  //     parsedDate,
  //     response.weather[0].icon,
  //     response.weather[0].main || response.weather[0].description
  //   );
  // }

  // // TODO: Complete buildForecastArray method

  // private buildForecastArray(
  //   currentWeather: Weather,
  //   weatherData: any[]
  // ): Weather[] {
  //   const weatherForecast: Weather[] = [currentWeather];

  //   const filteredWeatherData = weatherData.filter((data: any) =>
  //     data.dt_txt.includes('12:00:00')
  //   );

  //   for (const day of filteredWeatherData) {
  //     const timestamp: number = Number(day.dt) * 1000; // Convert to milliseconds
  //     const formattedDate: string = new Date(timestamp).toLocaleDateString(
  //       'en-US'
  //     );

  //     weatherForecast.push(
  //       new Weather(
  //         this.city,
  //         day.main.temp,
  //         day.wind_speed,
  //         day.main.humidity,
  //         formattedDate,
  //         day.weather[0].icon,
  //         day.weather[0].description || day.weather[0].main
  //       )
  //     );
  //   }

  //   return weatherForecast;
  // }

  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string) {
    try {
      this.city = city;
      const coordinates = await this.fetchAndDestructureLocationData();
      if (coordinates) {
        const weather = await this.fetchWeatherData(coordinates);
        return weather;
      }

      throw new Error('Weather data not found');
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export default new WeatherService();
