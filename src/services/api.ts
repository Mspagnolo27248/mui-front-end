import axios from 'axios';
import { RollingForecastInputParams, ModelOutputParams } from '../types/dto';

const API_BASE_URL = 'http://localhost:8001/forecast-model'; // adjust this to match your API URL

export const ForecastModelAPI = {
  saveModel: async (id: string | undefined, data: RollingForecastInputParams) => {
    const url = id ? `${API_BASE_URL}/save/${id}` : `${API_BASE_URL}/save`;
    const response = await axios.post(url, data);
    return response.data;
  },

  loadModel: async (id: string) => {
    const response = await axios.post(`${API_BASE_URL}/load/${id}`);
    return response.data as RollingForecastInputParams;
  },

  runModel: async (data: RollingForecastInputParams) => {
    const response = await axios.post(`${API_BASE_URL}/run`, data);
    return response.data as ModelOutputParams;
  }
}; 