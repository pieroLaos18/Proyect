import axios from 'axios';

const API_URL = 'http://localhost:5000/api/sales';

export default {
  getAll() {
    return axios.get(API_URL);
  },
  getById(id) {
    return axios.get(`${API_URL}/${id}`);
  },
  create(data) {
    return axios.post(API_URL, data);
  },
  anular(id, data) {
    return axios.put(`${API_URL}/anular/${id}`, data);
  }
};