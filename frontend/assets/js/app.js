const app = {
  state: {
    user: null,
    oportunidades: [],
    recomendadas: [],
    guardadas: [],
    alertas: [],
    alertaEditando: null,
    analisis: [],
    perfil: null,
    usuarios: []
  },

  icons: {
    dashboard: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect></svg>',
    search: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>',
    chart: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"></path><path d="M7 16V9"></path><path d="M12 16V5"></path><path d="M17 16v-3"></path></svg>',
    bell: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path><path d="M10 21h4"></path></svg>',
    bookmark: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h12v17l-6-4-6 4V4z"></path></svg>',
    user: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"></circle><path d="M4 21c0-4 3.5-7 8-7s8 3 8 7"></path></svg>',
    logout: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><path d="M16 17l5-5-5-5"></path><path d="M21 12H9"></path></svg>',
    risk: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7l6 6 4-4 8 8"></path><path d="M21 10v7h-7"></path></svg>',
    document: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6"></path></svg>',
    database: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5"></path><path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3"></path></svg>',
    activity: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4l3-8 4 16 3-8h4"></path></svg>',
    alert: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg>'
  },

  async init() {
    if (!auth.isLoggedIn()) {
      this.renderLogin();
      return;
    }

    try {
      this.state.user = await auth.me();
      await this.loadBaseData();
      this.renderLayout();
      this.navigate(this.isAdmin() ? 'admin-dashboard' : 'dashboard');
    } catch (error) {
      console.error('Error iniciando sesión:', error);
      auth.logout();
    }
  },

  normalizeArray(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.rows)) return data.rows;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.oportunidades)) return data.oportunidades;
    if (Array.isArray(data?.guardadas)) return data.guardadas;
    if (Array.isArray(data?.alertas)) return data.alertas;
    if (Array.isArray(data?.analisis)) return data.analisis;
    if (Array.isArray(data?.usuarios)) return data.usuarios;
    return [];
  },

  normalizeText(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  },

  uniqueOptions(items, field) {
    return [...new Set(
      items
        .map(item => item[field])
        .filter(value => value && String(value).trim() !== '')
    )].sort((a, b) => String(a).localeCompare(String(b), 'es'));
  },

  isAdmin() {
    const user = this.state.user || {};
    const rol = String(user.nombre_rol || user.rol || user.tipo_rol || '').toLowerCase();
    return rol.includes('admin');
  },

  userName() {
    const user = this.state.user || {};
    return `${user.nombre || ''} ${user.apellido || ''}`.trim() || user.correo || 'Usuario';
  },

  async loadBaseData() {
    this.state.oportunidades = this.normalizeArray(await api.get('/oportunidades').catch(() => []));
    this.state.guardadas = this.normalizeArray(await api.get('/guardadas').catch(() => []));
    this.state.alertas = this.normalizeArray(await api.get('/alertas').catch(() => []));
    this.state.analisis = this.normalizeArray(await api.get('/analisis').catch(() => []));
    this.state.recomendadas = this.normalizeArray(await api.get('/oportunidades/perfil/recomendadas').catch(() => []));
    this.state.perfil = await api.get('/perfiles/me').catch(() => null);

    if (this.isAdmin()) {
      this.state.usuarios = this.normalizeArray(await api.get('/usuarios').catch(() => []));
    }
  },

  renderLogin() {
    document.getElementById('app').innerHTML = `
      <section class="auth-page">
        <div class="auth-card">
          <img class="auth-logo" src="./assets/img/logo.svg" alt="CompraSmart" />
          <h1>CompraSmart</h1>
          <p>Iniciar sesión</p>

          <form id="loginForm">
            <div class="form-group">
              <label>Correo electrónico</label>
              <input type="email" name="correo" placeholder="correo@ejemplo.cl" required />
            </div>

            <div class="form-group">
              <label>Contraseña</label>
              <input type="password" name="contrasena" placeholder="••••••••" required />
            </div>

            <div class="auth-options">
              <span>Recordar sesión</span>
              <button type="button">Recuperar contraseña</button>
            </div>

            <button type="submit" class="primary-btn">Ingresar</button>
          </form>

          <p class="auth-link">¿No tienes cuenta? <button id="goRegister">Crear cuenta</button></p>
          <div id="authMessage" class="message"></div>
        </div>
      </section>
    `;

    document.getElementById('goRegister').onclick = () => this.renderRegister();

    document.getElementById('loginForm').onsubmit = async (event) => {
      event.preventDefault();
      const form = new FormData(event.target);

      try {
        await auth.login(form.get('correo'), form.get('contrasena'));
        await this.init();
      } catch (error) {
        this.showMessage(error.message);
      }
    };
  },

  renderRegister() {
    document.getElementById('app').innerHTML = `
      <section class="auth-page">
        <div class="auth-card">
          <img class="auth-logo" src="./assets/img/logo.svg" alt="CompraSmart" />
          <h1>CompraSmart</h1>
          <p>Crear cuenta</p>

          <form id="registerForm">
            <div class="form-group">
              <label>Nombre</label>
              <input name="nombre" placeholder="Juan" required />
            </div>

            <div class="form-group">
              <label>Apellido</label>
              <input name="apellido" placeholder="Pérez" required />
            </div>

            <div class="form-group">
              <label>Correo electrónico</label>
              <input type="email" name="correo" placeholder="correo@ejemplo.cl" required />
            </div>

            <div class="form-group">
              <label>Contraseña</label>
              <input type="password" name="contrasena" placeholder="••••••••" required />
            </div>

            <div class="form-group">
              <label>Confirmar contraseña</label>
              <input type="password" name="confirmar" placeholder="••••••••" required />
            </div>

            <button type="submit" class="primary-btn">Crear cuenta</button>
          </form>

          <p class="auth-link">¿Ya tienes cuenta? <button id="goLogin">Volver a iniciar sesión</button></p>
          <div id="authMessage" class="message"></div>
        </div>
      </section>
    `;

    document.getElementById('goLogin').onclick = () => this.renderLogin();

    document.getElementById('registerForm').onsubmit = async (event) => {
      event.preventDefault();
      const form = new FormData(event.target);

      if (form.get('contrasena') !== form.get('confirmar')) {
        this.showMessage('Las contraseñas no coinciden');
        return;
      }

      try {
        await auth.register({
          nombre: form.get('nombre'),
          apellido: form.get('apellido'),
          correo: form.get('correo'),
          contrasena: form.get('contrasena')
        });

        this.renderLogin();
      } catch (error) {
        this.showMessage(error.message);
      }
    };
  },

  renderLayout() {
    const admin = this.isAdmin();

    document.getElementById('app').innerHTML = `
      <section class="layout">
        <aside class="sidebar">
          <div class="sidebar-brand">
            <h2>CompraSmart</h2>
            <p>${admin ? 'Panel Administrativo' : 'Plataforma de Análisis'}</p>
          </div>

          <nav>
            ${admin
        ? `
                  <button data-page="admin-dashboard">${this.icons.dashboard}<span>Dashboard administrativo</span></button>
                  <button data-page="admin-management">${this.icons.user}<span>Gestion Administrativa</span></button>
                `
        : `
                  <button data-page="dashboard">${this.icons.dashboard}<span>Dashboard</span></button>
                  <button data-page="oportunidades">${this.icons.search}<span>Oportunidades</span></button>
                  <button data-page="analisis">${this.icons.chart}<span>Análisis</span></button>
                  <button data-page="alertas">${this.icons.bell}<span>Alertas</span></button>
                  <button data-page="guardadas">${this.icons.bookmark}<span>Oportunidades guardadas</span></button>
                  <button data-page="perfil">${this.icons.user}<span>Perfil empresarial</span></button>
                `
      }
          </nav>

          <button class="logout" id="logoutBtn">${this.icons.logout}<span>Cerrar sesión</span></button>
        </aside>

        <section class="main">
          <header class="topbar">
            <div class="user-pill">
              <span class="notification">${this.icons.bell}</span>
              <span class="avatar">${this.icons.user}</span>
              <span>${this.userName()}</span>
            </div>
          </header>

          <div id="content" class="content"></div>
        </section>
      </section>
    `;

    document.querySelectorAll('[data-page]').forEach((button) => {
      button.onclick = () => this.navigate(button.dataset.page);
    });

    document.getElementById('logoutBtn').onclick = () => auth.logout();
  },

  navigate(page) {
    document.querySelectorAll('[data-page]').forEach((button) => {
      button.classList.toggle('active', button.dataset.page === page);
    });

    const views = {
      dashboard: () => this.renderDashboard(),
      oportunidades: () => this.renderOportunidades(),
      analisis: () => this.renderAnalisis(),
      alertas: () => this.renderAlertas(),
      guardadas: () => this.renderGuardadas(),
      perfil: () => this.renderPerfil(),
      'admin-dashboard': () => this.renderAdminDashboard(),
      'admin-management': () => this.renderAdminManagement()
    };

    views[page]?.();
  },

  formatMoney(value) {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(Number(value || 0));
  },

  formatDate(value) {
    if (!value) return '-';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toISOString().slice(0, 10);
  },

  compraAgilBadge(o) {
    const data = o.clasificacionCompraAgil;

    if (!data) {
      return `<span class="badge gray">Sin cálculo</span>`;
    }

    const riesgo = (data.nivelRiesgo || '').toLowerCase();

    if (riesgo === 'bajo') {
      return `<span class="badge green">Riesgo Bajo</span>`;
    }

    if (riesgo === 'medio') {
      return `<span class="badge orange">Riesgo Medio</span>`;
    }

    if (riesgo === 'alto') {
      return `<span class="badge red">Riesgo Alto</span>`;
    }

    return `<span class="badge gray">Sin cálculo</span>`;
  },

  riesgoBadge(level) {
    const nivel = String(level || 'medio').toLowerCase();
    const label = nivel.charAt(0).toUpperCase() + nivel.slice(1);

    return `<span class="badge risk-${nivel}">Riesgo ${label}</span>`;
  },

  renderDashboard() {
    const oportunidades = this.state.oportunidades;
    const guardadas = this.state.guardadas;
    const alertas = this.state.alertas;
    const recomendadas = this.state.recomendadas.length ? this.state.recomendadas : oportunidades.slice(0, 5);

    document.getElementById('content').innerHTML = `
      <div class="page-container">
        <h1>Dashboard</h1>

        <section class="cards">
          <article class="card">
            <div class="card-content">
              <div>
                <p>Oportunidades nuevas</p>
                <h2>${oportunidades.length}</h2>
              </div>
              <div class="card-icon">${this.icons.search}</div>
            </div>
          </article>

          <article class="card">
            <div class="card-content">
              <div>
                <p>Oportunidades guardadas</p>
                <h2>${guardadas.length}</h2>
              </div>
              <div class="card-icon">${this.icons.bookmark}</div>
            </div>
          </article>

          <article class="card">
            <div class="card-content">
              <div>
                <p>Alertas activas</p>
                <h2>${alertas.filter(a => (a.estado_alerta || a.estado) === 'activa').length}</h2>
              </div>
              <div class="card-icon">${this.icons.bell}</div>
            </div>
          </article>

          <article class="card">
            <div class="card-content">
              <div>
                <p>Riesgo promedio</p>
                <h2>Medio</h2>
              </div>
              <div class="card-icon">${this.icons.risk}</div>
            </div>
          </article>
        </section>

        <section class="grid-two">
          <article class="panel">
            <div class="panel-header"><h2>Tendencia de Oportunidades</h2></div>
            <div class="panel-body">${this.renderMiniChart(oportunidades)}</div>
          </article>

          <article class="panel">
            <div class="panel-header"><h2>Alertas Recientes</h2></div>
            <div class="panel-body">
              ${alertas.length
        ? alertas.slice(0, 5).map(a => `
                    <div class="list-item">
                      <strong>${a.palabra_clave || a.palabraClave || a.categoria || 'Alerta configurada'}</strong>
                      <span>${a.region || 'Todas'} · ${a.frecuencia || '-'}</span>
                    </div>
                  `).join('')
        : '<p class="empty">No existen alertas registradas.</p>'
      }
            </div>
          </article>
        </section>

        <article class="panel">
          <div class="panel-header"><h2>Oportunidades Recientes</h2></div>
          ${this.renderOpportunityTable(recomendadas.slice(0, 5), false)}
        </article>
      </div>
    `;
  },

  renderMiniChart(items) {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    const values = months.map((_, index) => {
      return items.filter((item) => {
        const rawDate = item.fecha_publicacion || item.created_at;
        if (!rawDate) return false;

        const date = new Date(rawDate);
        if (Number.isNaN(date.getTime())) return false;

        return date.getMonth() === index;
      }).length;
    });

    const max = Math.max(...values, 1);

    return `
      <div class="chart">
        ${values.map((value, index) => `
          <div class="chart-item">
            <div class="chart-bar" style="height:${Math.max((value / max) * 180, 20)}px"></div>
            <span>${months[index]}</span>
          </div>
        `).join('')}
      </div>
    `;
  },

  renderOportunidades() {
    const categorias = this.uniqueOptions(this.state.oportunidades, 'categoria');
    const regiones = this.uniqueOptions(this.state.oportunidades, 'region');
    const estados = this.uniqueOptions(this.state.oportunidades, 'estado_oportunidad');

    document.getElementById('content').innerHTML = `
    <div class="page-container">
      <h1>Oportunidades</h1>

      <form id="filterForm" class="filter-panel">
        <input class="full" name="buscar" placeholder="Buscar por palabra clave, código o título..." />

        <select name="categoria">
          <option value="">Todas las categorías</option>
          ${categorias.map(categoria => `
            <option value="${categoria}">${categoria}</option>
          `).join('')}
        </select>

        <select name="region">
          <option value="">Todas las regiones</option>
          ${regiones.map(region => `
            <option value="${region}">${region}</option>
          `).join('')}
        </select>

        <select name="estado">
          <option value="">Todos los estados</option>
          ${estados.map(estado => `
            <option value="${estado}">${estado}</option>
          `).join('')}
        </select>

        <input name="montoMin" type="number" placeholder="Monto mínimo" />
        <input name="montoMax" type="number" placeholder="Monto máximo" />

        <button class="primary-btn">Filtrar</button>
      </form>

      <article class="panel" id="opTable">
        ${this.renderOpportunityTable(this.state.oportunidades, true)}
      </article>
    </div>
  `;

    document.getElementById('filterForm').onsubmit = (event) => {
      event.preventDefault();

      const form = new FormData(event.target);

      const buscar = this.normalizeText(form.get('buscar'));
      const categoria = form.get('categoria');
      const region = form.get('region');
      const estado = form.get('estado');
      const montoMin = Number(form.get('montoMin') || 0);
      const montoMax = Number(form.get('montoMax') || 0);

      let data = [...this.state.oportunidades];

      if (buscar) {
        data = data.filter(o => {
          const texto = this.normalizeText(`
          ${o.codigo_externo || ''}
          ${o.titulo || ''}
          ${o.organismo || ''}
          ${o.descripcion || ''}
          ${o.categoria || ''}
          ${o.region || ''}
        `);

          return texto.includes(buscar);
        });
      }

      if (categoria) {
        data = data.filter(o => o.categoria === categoria);
      }

      if (region) {
        data = data.filter(o => o.region === region);
      }

      if (estado) {
        data = data.filter(o => o.estado_oportunidad === estado);
      }

      if (montoMin > 0) {
        data = data.filter(o => Number(o.monto_referencial || 0) >= montoMin);
      }

      if (montoMax > 0) {
        data = data.filter(o => Number(o.monto_referencial || 0) <= montoMax);
      }

      document.getElementById('opTable').innerHTML = this.renderOpportunityTable(data, true);
    };
  },

  renderOpportunityTable(items, showAction = true) {
    if (!items || !items.length) {
      return '<div class="panel-body"><p class="empty">No hay registros disponibles desde el backend.</p></div>';
    }

    return `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Título</th>
              <th>Organismo</th>
              <th>Categoría</th>
              <th>Región</th>
              <th>Monto</th>
              <th>Fecha Cierre</th>
              <th>Riesgo</th>
              ${showAction ? '<th>Acción</th>' : ''}
            </tr>
          </thead>
          <tbody>
            ${items.map(o => `
              <tr>
                <td class="code">${o.codigo_externo || '-'}</td>
                <td>${o.titulo || '-'}</td>
                <td>${o.organismo || '-'}</td>
                <td>${o.categoria || '-'}</td>
                <td>${o.region || '-'}</td>
                <td>${this.formatMoney(o.monto_referencial)}</td>
                <td>${this.formatDate(o.fecha_cierre)}</td>
                <td>${this.riesgoBadge(o.clasificacionCompraAgil?.nivelRiesgo)}</td>
                ${showAction
        ? `<td><button class="link-btn" onclick="app.renderDetalle(${o.id_oportunidad})">Ver detalle</button></td>`
        : ''
      }
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  async renderDetalle(id) {
    const oportunidad = await api.get(`/oportunidades/${id}`);

    document.getElementById('content').innerHTML = `
    <div class="page-container detail-page">
      <h1>Detalle de Oportunidad</h1>

      <article class="panel detail-panel">
        <div class="panel-header detail-title-header">
          <h2>${oportunidad.titulo || '-'}</h2>
        </div>

        <div class="panel-body detail-body">
          <p class="detail-description">
            ${oportunidad.descripcion || 'Sin descripción registrada.'}
          </p>

          <div class="detail-grid detail-grid-figma">
            <div class="detail-item">
              <strong>Código de oportunidad</strong>
              <span>${oportunidad.codigo_externo || '-'}</span>
            </div>

            <div class="detail-item">
              <strong>Categoría</strong>
              <span>${oportunidad.categoria || '-'}</span>
            </div>

            <div class="detail-item">
              <strong>Región</strong>
              <span>${oportunidad.region || '-'}</span>
            </div>

            <div class="detail-item">
              <strong>Fecha publicación</strong>
              <span>${this.formatDate(oportunidad.fecha_publicacion)}</span>
            </div>

            <div class="detail-item">
              <strong>Fecha cierre</strong>
              <span>${this.formatDate(oportunidad.fecha_cierre)}</span>
            </div>

            <div class="detail-item">
              <strong>Monto referencial</strong>
              <span>${this.formatMoney(oportunidad.monto_referencial)}</span>
            </div>

            <div class="detail-item">
              <strong>Organismo comprador</strong>
              <span>${oportunidad.organismo || '-'}</span>
            </div>
          </div>

          <div class="actions detail-actions">
            <button class="primary-btn" onclick="app.analizarOportunidad(${id})">
              Analizar oportunidad
            </button>

            <button class="secondary-btn" onclick="app.guardarOportunidad(${id})">
              Guardar oportunidad
            </button>
          </div>

          <div id="analysisResult"></div>
        </div>
      </article>
    </div>
  `;
  },

  async analizarOportunidad(id) {
    const result = await api.post(`/analisis/oportunidades/${id}`);
    const resumen = result.resumen || result;
    const historiales = this.normalizeArray(result.historiales);

    document.getElementById('analysisResult').innerHTML = `
    ${historiales.length
        ? `
          <section class="history-box">
            <h2>Historial de Adjudicaciones Similares</h2>

            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Proveedor adjudicado</th>
                    <th>Organismo adjudicador</th>
                    <th>Monto adjudicado</th>
                    <th>Cantidad oferentes</th>
                    <th>Fecha adjudicación</th>
                  </tr>
                </thead>
                <tbody>
                  ${historiales.map(h => `
                    <tr>
                      <td>${h.proveedor_adjudicado || '-'}</td>
                      <td>${h.organismo_adjudicador || '-'}</td>
                      <td>${this.formatMoney(h.monto_adjudicado)}</td>
                      <td>${h.cantidad_oferentes || '-'}</td>
                      <td>${this.formatDate(h.fecha_adjudicacion)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </section>
        `
        : ''
      }

    <section class="analysis-box analysis-inline-box">
      <h2>Análisis de Oportunidad</h2>

      <section class="cards cards-three analysis-cards">
        <article class="card analysis-card-clean">
          <p>Precio estimado</p>
          <h2>${this.formatMoney(resumen.precio_estimado)}</h2>
        </article>

        <article class="card analysis-card-clean">
          <p>Nivel de riesgo</p>
          <h2>${this.riesgoBadge(resumen.nivel_riesgo)}</h2>
        </article>

        <article class="card analysis-card-clean">
          <p>Historiales usados</p>
          <h2>${resumen.cantidad_historiales || 0}</h2>
        </article>
      </section>

      <h3>Recomendación</h3>
      <p class="recommendation-text">
        ${resumen.recomendacion || 'Análisis generado correctamente.'}
      </p>
    </section>
  `;

    this.state.analisis = this.normalizeArray(await api.get('/analisis').catch(() => []));
  },

  async guardarOportunidad(id) {
    await api.post(`/guardadas/${id}`);
    this.state.guardadas = this.normalizeArray(await api.get('/guardadas').catch(() => []));
    alert('Oportunidad guardada correctamente');
  },

  renderAnalisis() {
    document.getElementById('content').innerHTML = `
    <div class="page-container">
      <h1>Análisis</h1>

      <article class="panel">
        <div class="panel-header">
          <h2>Análisis generados</h2>
        </div>

        ${this.state.analisis.length
        ? `
              <div class="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Oportunidad</th>
                      <th>Precio estimado</th>
                      <th>Riesgo</th>
                      <th>Recomendación</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${this.state.analisis.map(a => `
                      <tr>
                        <td>${a.titulo || a.codigo_externo || a.id_oportunidad || '-'}</td>
                        <td>${this.formatMoney(a.precio_estimado)}</td>
                        <td>${this.riesgoBadge(a.nivel_riesgo)}</td>
                        <td>${a.recomendacion || '-'}</td>
                        <td>
                          <button class="link-btn" onclick="app.renderDetalleAnalisis(${a.id_analisis || a.id})">
                            Ver detalle
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `
        : '<div class="panel-body"><p class="empty">Aún no existen análisis generados.</p></div>'
      }
      </article>
    </div>
  `;
  },

  async renderDetalleAnalisis(idAnalisis) {
    const response = await api.get(`/analisis/${idAnalisis}`);

    console.log('Detalle análisis:', response);

    const analisis = response.analisis || response;
    const oportunidad = response.oportunidad || analisis.oportunidad || {};
    const historiales = this.normalizeArray(response.historiales || analisis.historiales || []);

    console.log('response detalle analisis:', response);
    console.log('analisis:', analisis);
    console.log('oportunidad:', oportunidad);
    document.getElementById('content').innerHTML = `
    <div class="page-container">
      <h1>Detalle de Análisis</h1>

      <button class="secondary-btn" onclick="app.renderAnalisis()">
        Volver a análisis
      </button>

      <article class="panel" style="margin-top: 16px;">
        <div class="panel-header">
          <h2>${oportunidad.titulo || analisis.titulo || 'Análisis de oportunidad'}</h2>
        </div>

        <div class="panel-body">
          <section class="cards cards-three">
            <article class="card">
              <p>Precio estimado</p>
              <h2>${this.formatMoney(analisis.precio_estimado)}</h2>
            </article>

            <article class="card">
              <p>Nivel de riesgo</p>
              <h2>${this.riesgoBadge(analisis.nivel_riesgo)}</h2>
            </article>

            <article class="card">
              <p>Historiales usados</p>
              <h2>${analisis.cantidad_historiales || historiales.length || 0}</h2>
            </article>
          </section>

          <h3>Recomendación</h3>
          <p class="recommendation-text">
            ${analisis.recomendacion || 'Sin recomendación registrada.'}
          </p>

          <h3>Datos de oportunidad</h3>

          <div class="detail-grid">
            <div class="detail-item">
              <strong>Identificador oportunidad</strong>
<span>${oportunidad.codigo_externo || analisis.codigo_externo || `ID oportunidad: ${analisis.id_oportunidad}` || '-'}</span>
            </div>

            <div class="detail-item">
              <strong>Organismo</strong>
              <span>${oportunidad.organismo || analisis.organismo || '-'}</span>
            </div>

            <div class="detail-item">
              <strong>Monto referencial</strong>
              <span>${this.formatMoney(oportunidad.monto_referencial || analisis.monto_referencial)}</span>
            </div>

            <div class="detail-item">
              <strong>Fecha análisis</strong>
              <span>${this.formatDate(analisis.fecha_analisis || analisis.created_at)}</span>
            </div>
          </div>

          ${historiales.length
        ? `
                <h3>Historial usado en el análisis</h3>
                <div class="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Proveedor adjudicado</th>
                        <th>Organismo adjudicador</th>
                        <th>Monto adjudicado</th>
                        <th>Cantidad oferentes</th>
                        <th>Fecha adjudicación</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${historiales.map(h => `
                        <tr>
                          <td>${h.proveedor_adjudicado || '-'}</td>
                          <td>${h.organismo_adjudicador || '-'}</td>
                          <td>${this.formatMoney(h.monto_adjudicado)}</td>
                          <td>${h.cantidad_oferentes || '-'}</td>
                          <td>${this.formatDate(h.fecha_adjudicacion)}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              `
        : ''
      }
        </div>
      </article>
    </div>
  `;
  },

  renderAlertas() {
    const categoriasTecnologicas = [
      'Tecnología',
      'Equipamiento tecnológico',
      'Servicios informáticos',
      'Software',
      'Hardware',
      'Soporte TI',
      'Telecomunicaciones',
      'Ciberseguridad',
      'Licencias',
      'Computadores',
      'Impresoras',
      'Redes y conectividad'
    ];

    const categorias = [
      ...new Set([
        ...categoriasTecnologicas,
        ...this.uniqueOptions(this.state.oportunidades, 'categoria')
      ])
    ];
    const regiones = this.uniqueOptions(this.state.oportunidades, 'region');
    const alertaEditando = this.state.alertaEditando;

    const visibleAlertas = this.state.alertas.filter(a =>
      String(a.estado_alerta || a.estado || '').toLowerCase() !== 'inactiva'
    );

    const getSelected = (actual, valor) => String(actual || '') === String(valor) ? 'selected' : '';

    document.getElementById('content').innerHTML = `
    <div class="page-container">
      <h1>Configuración de Alertas</h1>

      <section class="alerts-layout">
        <article class="panel">
          <div class="panel-header">
            <h2>${alertaEditando ? 'Editar Alerta' : 'Crear Nueva Alerta'}</h2>
          </div>

          <div class="panel-body">
            <form id="alertForm" class="alert-form">
              <div class="form-group">
                <label>Palabra clave</label>
                <input 
                  name="palabraClave" 
                  placeholder="Ej: equipos computacionales" 
                  value="${alertaEditando?.palabra_clave || alertaEditando?.palabraClave || ''}" 
                  required 
                />
              </div>

              <div class="form-group">
                <label>Categoría</label>
                <select name="categoria" required>
                  <option value="Todas" ${getSelected(alertaEditando?.categoria, 'Todas')}>Todas</option>
                  ${categorias.map(c => `
                    <option value="${c}" ${getSelected(alertaEditando?.categoria, c)}>${c}</option>
                  `).join('')}
                </select>
              </div>

              <div class="form-group">
                <label>Región</label>
                <select name="region" required>
                  <option value="Todas" ${getSelected(alertaEditando?.region, 'Todas')}>Todas</option>
                  ${regiones.map(r => `
                    <option value="${r}" ${getSelected(alertaEditando?.region, r)}>${r}</option>
                  `).join('')}
                </select>
              </div>

              <div class="alert-money-row">
                <div class="form-group">
                  <label>Monto mínimo</label>
                  <input 
                    name="montoMin" 
                    type="number" 
                    placeholder="0" 
                    value="${alertaEditando?.monto_min || alertaEditando?.montoMin || ''}" 
                    required 
                  />
                </div>

                <div class="form-group">
                  <label>Monto máximo</label>
                  <input 
                    name="montoMax" 
                    type="number" 
                    placeholder="50000000" 
                    value="${alertaEditando?.monto_max || alertaEditando?.montoMax || ''}" 
                    required 
                  />
                </div>
              </div>

              <div class="form-group">
                <label>Frecuencia</label>
                <select name="frecuencia" required>
                  <option value="diaria" ${getSelected(alertaEditando?.frecuencia, 'diaria')}>Diaria</option>
                  <option value="semanal" ${getSelected(alertaEditando?.frecuencia, 'semanal')}>Semanal</option>
                  <option value="manual" ${getSelected(alertaEditando?.frecuencia, 'manual')}>Manual</option>
                </select>
              </div>

              <div class="alert-form-actions">
                <button class="primary-btn">
                  ${alertaEditando ? 'Guardar cambios' : 'Guardar alerta'}
                </button>

                ${alertaEditando
        ? `<button type="button" class="secondary-btn" onclick="app.cancelarEdicionAlerta()">Cancelar</button>`
        : ''
      }
              </div>
            </form>
          </div>
        </article>

        <article class="panel">
          <div class="panel-header">
            <h2>Alertas Existentes</h2>
          </div>

          <div class="panel-body">
            ${visibleAlertas.length
        ? `
      <div class="alerts-list">
        ${visibleAlertas.map(a => {
          const id = a.id_alerta || a.id;
          return `
            <div class="alert-card-item">
              <div class="alert-card-header">
                <div>
                  <h3>Palabra clave: ${a.palabra_clave || a.palabraClave || '-'}</h3>
                  <p>${a.categoria || '-'} · ${a.region || 'Todas'}</p>
                </div>
              </div>

              <div class="alert-card-grid">
                <div>
                  <span>Categoría</span>
                  <strong>${a.categoria || '-'}</strong>
                </div>

                <div>
                  <span>Región</span>
                  <strong>${a.region || 'Todas'}</strong>
                </div>

                <div>
                  <span>Rango</span>
                  <strong>${this.formatMoney(a.monto_min || a.montoMin)} - ${this.formatMoney(a.monto_max || a.montoMax)}</strong>
                </div>

                <div>
                  <span>Frecuencia</span>
                  <strong>${a.frecuencia || '-'}</strong>
                </div>
              </div>

              <div class="alert-card-actions">
                <button class="link-btn" onclick="app.editarAlerta(${id})">Editar</button>
                <button class="danger-btn" onclick="app.eliminarAlerta(${id})">Eliminar</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `
        : '<p class="empty">No existen alertas registradas.</p>'
      }
          </div>
        </article>
      </section>
    </div>
  `;

    document.getElementById('alertForm').onsubmit = async (event) => {
      event.preventDefault();

      const form = new FormData(event.target);

      const payload = {
        palabraClave: form.get('palabraClave'),
        categoria: form.get('categoria'),
        region: form.get('region'),
        montoMin: Number(form.get('montoMin')),
        montoMax: Number(form.get('montoMax')),
        frecuencia: form.get('frecuencia'),
        estadoAlerta: 'activa'
      };

      if (this.state.alertaEditando) {
        const id = this.state.alertaEditando.id_alerta || this.state.alertaEditando.id;
        await api.put(`/alertas/${id}`, payload);
        this.state.alertaEditando = null;
      } else {
        await api.post('/alertas', payload);
      }

      this.state.alertas = this.normalizeArray(await api.get('/alertas').catch(() => []));
      this.renderAlertas();
    };
  },

  async toggleAlerta(id, estadoActual) {
    await api.patch(`/alertas/${id}/estado`, {
      estadoAlerta: estadoActual === 'activa' ? 'inactiva' : 'activa'
    });

    this.state.alertas = this.normalizeArray(await api.get('/alertas').catch(() => []));
    this.renderAlertas();
  },

  editarAlerta(idAlerta) {
    const alerta = this.state.alertas.find(a => Number(a.id_alerta || a.id) === Number(idAlerta));

    if (!alerta) {
      alert('No se encontró la alerta seleccionada');
      return;
    }

    this.state.alertaEditando = alerta;
    this.renderAlertas();
  },

  cancelarEdicionAlerta() {
    this.state.alertaEditando = null;
    this.renderAlertas();
  },

  eliminarAlerta(idAlerta) {
    this.mostrarModalConfirmacion(
      'Eliminar alerta',
      '¿Deseas eliminar esta alerta? Esta acción la dejará inactiva y no aparecerá en el listado.',
      async () => {
        await api.patch(`/alertas/${idAlerta}/estado`, {
          estadoAlerta: 'inactiva'
        });

        this.state.alertas = this.normalizeArray(await api.get('/alertas').catch(() => []));
        this.cerrarModal();
        this.renderAlertas();
      }
    );
  },

  mostrarModalConfirmacion(titulo, mensaje, onConfirmar) {
    const modalExistente = document.getElementById('appModal');
    if (modalExistente) modalExistente.remove();

    const modal = document.createElement('div');
    modal.id = 'appModal';

    modal.style.position = 'fixed';
    modal.style.inset = '0';
    modal.style.background = 'rgba(15, 23, 42, 0.45)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '99999';

    modal.innerHTML = `
    <div style="
      width: 420px;
      max-width: calc(100% - 32px);
      background: #ffffff;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 20px 60px rgba(15, 23, 42, 0.25);
    ">
      <h3 style="margin: 0 0 10px; color: #1e3a8a;">
        ${titulo}
      </h3>

      <p style="margin: 0; color: #4b5563; line-height: 1.5;">
        ${mensaje}
      </p>

      <div style="
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 22px;
      ">
        <button id="modalCancelar" class="secondary-btn" style="width: auto;">
          Cancelar
        </button>

        <button id="modalConfirmar" style="
          border: 0;
          border-radius: 8px;
          padding: 12px 18px;
          background: #ef4444;
          color: #ffffff;
          cursor: pointer;
        ">
          Eliminar
        </button>
      </div>
    </div>
  `;

    document.body.appendChild(modal);

    document.getElementById('modalCancelar').onclick = () => this.cerrarModal();
    document.getElementById('modalConfirmar').onclick = onConfirmar;
  },

  cerrarModal() {
    const modal = document.getElementById('appModal');
    if (modal) modal.remove();
  },

  renderPerfil() {
    const p = this.state.perfil || {};

    const regionesChile = [
      'Arica y Parinacota',
      'Tarapacá',
      'Antofagasta',
      'Atacama',
      'Coquimbo',
      'Valparaíso',
      'Metropolitana',
      'O Higgins',
      'Maule',
      'Ñuble',
      'Biobío',
      'La Araucanía',
      'Los Ríos',
      'Los Lagos',
      'Aysén',
      'Magallanes'
    ];

    const tamanosEmpresa = [
      'Micro',
      'Pequeña',
      'Mediana',
      'Grande'
    ];

    const categorias = this.uniqueOptions(this.state.oportunidades, 'categoria');

    const selected = (actual, valor) => String(actual || '') === String(valor) ? 'selected' : '';

    document.getElementById('content').innerHTML = `
    <div class="page-container">
      <h1>Perfil Empresarial</h1>

      <article class="panel">
        <div class="panel-body">
          <form id="perfilForm" class="form-grid">
            <input 
              name="nombreEmpresa" 
              placeholder="Nombre empresa" 
              value="${p.nombre_empresa || ''}" 
              required 
            />

            <input 
              name="rutEmpresa" 
              placeholder="RUT empresa" 
              value="${p.rut_empresa || ''}" 
              required 
            />

            <input 
              name="rubro" 
              placeholder="Rubro" 
              value="${p.rubro || ''}" 
              required 
            />

            <select name="region" required>
              <option value="">Selecciona región</option>
              ${regionesChile.map(region => `
                <option value="${region}" ${selected(p.region, region)}>${region}</option>
              `).join('')}
            </select>

            <select name="tamanoEmpresa" required>
              <option value="">Tamaño empresa</option>
              ${tamanosEmpresa.map(tamano => `
                <option value="${tamano}" ${selected(p.tamano_empresa, tamano)}>${tamano}</option>
              `).join('')}
            </select>

            <select name="categoriaInteres" required>
              <option value="">Categoría de interés</option>
              ${categorias.map(categoria => `
                <option value="${categoria}" ${selected(p.categoria_interes, categoria)}>${categoria}</option>
              `).join('')}
            </select>

            <input 
              name="montoMinInteres" 
              type="number" 
              placeholder="Monto mínimo de interés" 
              value="${p.monto_min_interes || ''}" 
              required 
            />

            <input 
              name="montoMaxInteres" 
              type="number" 
              placeholder="Monto máximo de interés" 
              value="${p.monto_max_interes || ''}" 
              required 
            />

            <button class="primary-btn">Guardar cambios</button>
          </form>
        </div>
      </article>
    </div>
  `;

    document.getElementById('perfilForm').onsubmit = async (event) => {
      event.preventDefault();

      const form = new FormData(event.target);

      const payload = {
        nombreEmpresa: form.get('nombreEmpresa'),
        rutEmpresa: form.get('rutEmpresa'),
        rubro: form.get('rubro'),
        region: form.get('region'),
        tamanoEmpresa: form.get('tamanoEmpresa'),
        categoriaInteres: form.get('categoriaInteres'),
        montoMinInteres: Number(form.get('montoMinInteres')),
        montoMaxInteres: Number(form.get('montoMaxInteres'))
      };

      if (payload.montoMaxInteres < payload.montoMinInteres) {
        alert('El monto máximo debe ser mayor o igual al monto mínimo.');
        return;
      }

      if (this.state.perfil) {
        await api.put('/perfiles/me', payload);
      } else {
        await api.post('/perfiles', payload);
      }

      this.state.perfil = await api.get('/perfiles/me').catch(() => null);
      alert('Perfil guardado correctamente');
    };
  },

  renderGuardadas() {
    const fechas = this.state.guardadas.map(g => g.fecha_cierre).filter(Boolean).sort();

    document.getElementById('content').innerHTML = `
    <div class="page-container">
      <h1>Oportunidades Guardadas</h1>

      <article class="panel">
        ${this.state.guardadas.length
        ? `
              <div class="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Título</th>
                      <th>Organismo</th>
                      <th>Categoría</th>
                      <th>Región</th>
                      <th>Monto</th>
                      <th>Fecha Cierre</th>
                      <th>Compra Ágil - Riesgo</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${this.state.guardadas.map(o => `
                      <tr>
                        <td class="code">${o.codigo_externo || '-'}</td>
                        <td>${o.titulo || '-'}</td>
                        <td>${o.organismo || '-'}</td>
                        <td>${o.categoria || '-'}</td>
                        <td>${o.region || '-'}</td>
                        <td>${this.formatMoney(o.monto_referencial)}</td>
                        <td>${this.formatDate(o.fecha_cierre)}</td>
                        <td>${this.riesgoBadge(o.clasificacionCompraAgil?.nivelRiesgo)}</td>
                        <td>
<div style="display:flex; align-items:center; gap:12px; white-space:nowrap;">
  <button class="link-btn" onclick="app.renderDetalle(${o.id_oportunidad})">
    Ver detalle
  </button>

  <button
    onclick="app.eliminarGuardada(${o.id_oportunidad})"
    title="Eliminar oportunidad guardada"
    style="border:0; background:transparent; padding:4px; cursor:pointer; color:#ef4444; display:inline-flex; align-items:center; justify-content:center;"
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 6h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M8 6V4h8v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M6 6l1 15h10l1-15" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
      <path d="M10 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  </button>
</div>
</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `
        : '<div class="panel-body"><p class="empty">No tienes oportunidades guardadas.</p></div>'
      }
      </article>

      <article class="summary-panel">
        <div>
          <h2>Total guardadas</h2>
          <p>Tienes ${this.state.guardadas.length} oportunidades guardadas</p>
        </div>
        <div>
          <p>Próxima a cerrar</p>
          <h2>${fechas[0] ? this.formatDate(fechas[0]) : '-'}</h2>
        </div>
      </article>
    </div>
  `;
  },

  eliminarGuardada(idOportunidad) {
    this.mostrarModalConfirmacion(
      'Eliminar oportunidad guardada',
      '¿Deseas eliminar esta oportunidad de tus guardadas?',
      async () => {
        await api.delete(`/guardadas/${idOportunidad}`);

        this.state.guardadas = this.normalizeArray(
          await api.get('/guardadas').catch(() => [])
        );

        this.cerrarModal();
        this.renderGuardadas();
      }
    );
  },

  renderAdminDashboard() {
    const oportunidades = this.state.oportunidades;
    const usuarios = this.state.usuarios;
    const alertas = this.state.alertas;

    document.getElementById('content').innerHTML = `
      <div class="page-container">
        <h1>Dashboard Administrativo</h1>

        <section class="cards">
          <article class="card">
            <div class="card-content">
              <div>
                <p>Usuarios activos</p>
                <h2>${usuarios.filter(u => String(u.estado || '').toLowerCase() === 'activo').length}</h2>
              </div>
              <div class="card-icon">${this.icons.user}</div>
            </div>
          </article>

          <article class="card">
            <div class="card-content">
              <div>
                <p>Oportunidades cargadas</p>
                <h2>${oportunidades.length}</h2>
              </div>
              <div class="card-icon">${this.icons.document}</div>
            </div>
          </article>

          <article class="card">
            <div class="card-content">
              <div>
                <p>Alertas creadas</p>
                <h2>${alertas.length}</h2>
              </div>
              <div class="card-icon">${this.icons.bell}</div>
            </div>
          </article>

          <article class="card">
            <div class="card-content">
              <div>
                <p>Incidencias del sistema</p>
                <h2>0</h2>
              </div>
              <div class="card-icon">${this.icons.alert}</div>
            </div>
          </article>
        </section>

        <section class="grid-two">
          <article class="panel">
            <div class="panel-header"><h2>Carga de Oportunidades por Mes</h2></div>
            <div class="panel-body">${this.renderMiniChart(oportunidades)}</div>
          </article>

          <article class="panel">
            <div class="panel-header"><h2>Estado de Sincronización API</h2></div>
            <div class="panel-body">
              <div class="status-card"><strong>API Mercado Público</strong><span class="badge success">Activo</span></div>
              <div class="status-card"><strong>Servicio de Análisis</strong><span class="badge success">Activo</span></div>
              <div class="status-card"><strong>Sistema de Alertas</strong><span class="badge success">Activo</span></div>
              <button class="primary-btn" onclick="app.sincronizar()">Sincronizar Mercado Público</button>
            </div>
          </article>
        </section>

        <article class="panel">
          <div class="panel-header"><h2>Actividad Reciente del Sistema</h2></div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr><th>Tipo</th><th>Descripción</th><th>Fecha y Hora</th></tr>
              </thead>
              <tbody>
                <tr><td>Usuarios</td><td>${usuarios.length} usuarios registrados en el sistema</td><td>${new Date().toLocaleString('es-CL')}</td></tr>
                <tr><td>Oportunidades</td><td>${oportunidades.length} oportunidades disponibles desde backend</td><td>${new Date().toLocaleString('es-CL')}</td></tr>
                <tr><td>Alertas</td><td>${alertas.length} alertas configuradas</td><td>${new Date().toLocaleString('es-CL')}</td></tr>
              </tbody>
            </table>
          </div>
        </article>
      </div>
    `;
  },

  async sincronizar() {
    const result = await api.post('/oportunidades/sincronizar');

    await this.loadBaseData();
    this.renderAdminDashboard();

    this.mostrarModalSincronizacion(result);
  },

  mostrarModalSincronizacion(result = {}) {
    const resumen = result.resumen || result;

    const procesadas =
      resumen.procesadas ||
      resumen.totalProcesadas ||
      resumen.guardadas ||
      resumen.insertadas ||
      resumen.oportunidadesGuardadas ||
      0;

    const omitidas =
      resumen.omitidas ||
      resumen.totalOmitidas ||
      resumen.descartadas ||
      resumen.noProcesadas ||
      0;

    const modalExistente = document.getElementById('appModal');
    if (modalExistente) modalExistente.remove();

    const modal = document.createElement('div');
    modal.id = 'appModal';
    modal.style.position = 'fixed';
    modal.style.inset = '0';
    modal.style.background = 'rgba(15, 23, 42, 0.45)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '99999';

    modal.innerHTML = `
    <div style="
      width: 460px;
      max-width: calc(100% - 32px);
      background: #ffffff;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 20px 60px rgba(15, 23, 42, 0.25);
    ">
      <h3 style="margin: 0 0 8px; color: #1e3a8a;">
        Sincronización finalizada
      </h3>

      <p style="margin: 0 0 18px; color: #4b5563;">
        Se completó la actualización de oportunidades válidas desde Mercado Público.
      </p>

      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 18px;">
        <div style="border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px;">
          <span style="display:block; color:#64748b; font-size:12px;">Procesadas</span>
          <strong style="display:block; color:#10b981; font-size:28px;">${procesadas}</strong>
        </div>

        <div style="border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px;">
          <span style="display:block; color:#64748b; font-size:12px;">Omitidas</span>
          <strong style="display:block; color:#f59e0b; font-size:28px;">${omitidas}</strong>
        </div>
      </div>

      <p style="margin: 0; color: #4b5563; font-size: 13px;">
        Nota: las oportunidades sin detalle válido o sin monto usable no se procesan.
      </p>

      <div style="display: flex; justify-content: flex-end; margin-top: 22px;">
        <button id="modalAceptar" class="primary-btn" style="width: auto; min-width: 120px;">
          Aceptar
        </button>
      </div>
    </div>
  `;

    document.body.appendChild(modal);
    document.getElementById('modalAceptar').onclick = () => this.cerrarModal();
  },

  renderAdminManagement() {
    document.getElementById('content').innerHTML = `
      <div class="page-container">
        <h1>Gestión Administrativa</h1>

        <article class="panel">
          <div class="panel-header"><h2>Gestión de Usuarios</h2></div>
          ${this.state.usuarios.length
        ? `
                <div class="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Correo</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th>Fecha Registro</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${this.state.usuarios.map(u => `
                        <tr>
                          <td>${u.nombre || ''} ${u.apellido || ''}</td>
                          <td>${u.correo || '-'}</td>
                          <td>${u.nombre_rol || u.rol || '-'}</td>
                          <td><span class="badge ${String(u.estado || '').toLowerCase() === 'activo' ? 'success' : 'neutral'}">${u.estado || '-'}</span></td>
                          <td>${this.formatDate(u.fecha_registro || u.created_at)}</td>
                          <td>
                            <button class="link-btn" onclick="app.cambiarEstadoUsuario(${u.id_usuario}, '${u.estado}')">
                              ${String(u.estado || '').toLowerCase() === 'activo' ? 'Desactivar' : 'Activar'}
                            </button>
                          </td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              `
        : '<div class="panel-body"><p class="empty">No hay usuarios disponibles desde backend.</p></div>'
      }
        </article>

        <article class="panel">
          <div class="panel-header"><h2>Supervisión de Oportunidades Cargadas</h2></div>
          ${this.renderOpportunityTable(this.state.oportunidades.slice(0, 10), false)}
        </article>

        <article class="summary-panel">
          <div><p>Total importadas hoy</p><h2>${this.state.oportunidades.length}</h2></div>
          <div><p>Validadas automáticamente</p><h2>${this.state.oportunidades.length}</h2></div>
          <div><p>Pendientes de revisión</p><h2>0</h2></div>
        </article>
      </div>
    `;
  },

  async cambiarEstadoUsuario(id, estadoActual) {
    await api.patch(`/usuarios/${id}/estado`, {
      estado: String(estadoActual).toLowerCase() === 'activo' ? 'inactivo' : 'activo'
    });

    this.state.usuarios = this.normalizeArray(await api.get('/usuarios').catch(() => []));
    this.renderAdminManagement();
  },

  showMessage(message) {
    const el = document.getElementById('authMessage');
    if (el) {
      el.textContent = message;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => app.init());