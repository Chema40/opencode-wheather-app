export type TemperatureUnit = "celsius" | "fahrenheit";

export type CityRecord = {
  id: string;
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
};

export type AppState = {
  cities: CityRecord[];
  defaultCityId: string | null;
  temperatureUnit: TemperatureUnit;
};

export type GeocodingResult = {
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
};

export type GeocodingResponse = {
  results?: GeocodingResult[];
};

export type CurrentWeather = {
  temperature_2m?: number;
  apparent_temperature?: number;
  wind_speed_10m?: number;
  weather_code?: number;
  is_day?: 0 | 1;
  time?: string;
};

export type DailyWeather = {
  time?: string[];
  weather_code?: number[];
  temperature_2m_max?: number[];
  temperature_2m_min?: number[];
  precipitation_sum?: number[];
  wind_speed_10m_max?: number[];
};

export type ForecastResponse = {
  current?: CurrentWeather;
  daily?: DailyWeather;
};
