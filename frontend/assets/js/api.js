const api = {
  token() {
    return localStorage.getItem('comprasmart_token');
  },

  async request(path, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const token = this.token();
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${CONFIG.API_BASE_URL}${path}`, {
      ...options,
      headers
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || result.ok === false) {
      throw new Error(result.message || result.error || 'Error al consumir el backend');
    }

    return result.data ?? result;
  },

  get(path) {
    return this.request(path);
  },

  post(path, body = {}) {
    return this.request(path, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  put(path, body = {}) {
    return this.request(path, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  },

  patch(path, body = {}) {
    return this.request(path, {
      method: 'PATCH',
      body: JSON.stringify(body)
    });
  },

  delete(path) {
    return this.request(path, {
      method: 'DELETE'
    });
  }
};
