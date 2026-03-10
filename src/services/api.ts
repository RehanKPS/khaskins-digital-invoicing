// This file is no longer used - all data is managed via DataContext
// Keeping for future real API integration with axios
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});
