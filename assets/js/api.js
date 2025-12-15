const API_URL = 'http://localhost:5000/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API Error');
    }

    return await response.json();
  }

  async register(firstName, lastName, email, password, confirmPassword) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ firstName, lastName, email, password, confirmPassword }),
    });
  }

  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async getOlympiads() {
    return this.request('/olympiad');
  }

  async getOlympiad(id) {
    return this.request(`/olympiad/${id}`);
  }

  async createOlympiad(data) {
    return this.request('/olympiad', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOlympiad(id, data) {
    return this.request(`/olympiad/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteOlympiad(id) {
    return this.request(`/olympiad/${id}`, {
      method: 'DELETE',
    });
  }

  async registerForOlympiad(id) {
    return this.request(`/olympiad/${id}/register`, {
      method: 'POST',
    });
  }

  async unregisterFromOlympiad(id) {
    return this.request(`/olympiad/${id}/unregister`, {
      method: 'POST',
    });
  }

  async getUsers() {
    return this.request('/user');
  }

  async getUser(id) {
    return this.request(`/user/${id}`);
  }

  async updateUser(id, data) {
    return this.request(`/user/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id) {
    return this.request(`/user/${id}`, {
      method: 'DELETE',
    });
  }

  async updateUserRole(id, role) {
    return this.request(`/user/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  logout() {
    localStorage.removeItem('token');
    this.token = null;
  }
}

const api = new ApiClient();
