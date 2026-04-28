const auth = {
  user: null,

  isLoggedIn() {
    return Boolean(localStorage.getItem('comprasmart_token'));
  },

  saveSession(data) {
    const token = data.token || data.accessToken;
    const user = data.user || data.usuario || data;

    if (!token) {
      throw new Error('El backend no devolvió token de sesión');
    }

    localStorage.setItem('comprasmart_token', token);
    localStorage.setItem('comprasmart_user', JSON.stringify(user));
    this.user = user;
  },

  getStoredUser() {
    const user = localStorage.getItem('comprasmart_user');
    return user ? JSON.parse(user) : null;
  },

  async login(correo, contrasena) {
    const data = await api.post('/auth/login', { correo, contrasena });
    this.saveSession(data);
    return this.user;
  },

  async register(payload) {
    return api.post('/auth/register', payload);
  },

  async me() {
    const data = await api.get('/auth/me');
    this.user = data.user || data.usuario || data;
    localStorage.setItem('comprasmart_user', JSON.stringify(this.user));
    return this.user;
  },

  logout() {
    localStorage.removeItem('comprasmart_token');
    localStorage.removeItem('comprasmart_user');
    this.user = null;
    app.renderLogin();
  }
};