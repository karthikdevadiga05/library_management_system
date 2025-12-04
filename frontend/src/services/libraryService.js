import api from './api';

export const libraryService = {
  async getNearbyLibraries(latitude, longitude) {
    const response = await api.get(`/libraries/get_nearby.php?lat=${latitude}&lon=${longitude}`);
    return response.data;
  }
};