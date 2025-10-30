import apiHelper from '../utils/apiHelper';

export const getTours = async () => {
  return await apiHelper.get('/tours');
};

export const getTourById = async (id) => {
  return await apiHelper.get(`/tours/${id}`);
};

export const createTour = async (data) => {
  return await apiHelper.post('/tours', data);
};

export const updateTour = async (id, data) => {
  return await apiHelper.put(`/tours/${id}`, data);
};

export const deleteTour = async (id) => {
  return await apiHelper.delete(`/tours/${id}`);
};