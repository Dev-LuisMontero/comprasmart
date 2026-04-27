const axios = require('axios');

const API_URL = process.env.MERCADO_PUBLICO_API_URL;
const TICKET = process.env.MERCADO_PUBLICO_TICKET;

const normalizarTexto = (texto = '') => {
  return texto
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

const clasificarCompraAgil = (item = {}) => {
  const tipo = item.Tipo || item.tipo || '';
  const monto =
    Number(item.MontoEstimado) ||
    Number(item.MontoTotal) ||
    Number(item.Monto) ||
    Number(item.Total) ||
    Number(item.monto_referencial) ||
    0;

  const textoItems = item.Items?.Listado
    ? item.Items.Listado.map((i) => `
        ${i.Categoria || ''}
        ${i.NombreProducto || ''}
        ${i.Descripcion || ''}
      `).join(' ')
    : '';

  const texto = normalizarTexto(`
    ${item.Nombre || item.titulo || ''}
    ${item.Descripcion || item.descripcion || ''}
    ${item.Categoria || item.categoria || ''}
    ${item.Rubro || ''}
    ${textoItems}
  `);

  let score = 0;
  const criterios = [];

  if (tipo === 'L1') {
    score += 3;
    criterios.push('Tipo de licitación L1');
  }

  if (monto > 0 && monto <= 10000000) {
    score += 2;
    criterios.push('Monto estimado dentro de rango menor');
  }

  const palabrasClave = [
    'compra agil',
    'tecnologico',
    'tecnologia',
    'informatica',
    'informatico',
    'software',
    'computador',
    'computadores',
    'licencia',
    'licencias',
    'soporte tic',
    'equipamiento tecnologico'
  ];

  const coincideTexto = palabrasClave.some((palabra) => texto.includes(palabra));

  if (coincideTexto) {
    score += 1;
    criterios.push('Coincidencia por texto/categoría tecnológica');
  }

  let nivelConfianza = 'bajo';

  if (score >= 5) {
    nivelConfianza = 'alto';
  } else if (score >= 3) {
    nivelConfianza = 'medio';
  }

  return {
    esCompraAgilProbable: score >= 3,
    nivelConfianza,
    score,
    criterios
  };
};

const obtenerOportunidadesActivas = async () => {
  if (!API_URL || !TICKET) {
    return {
      integrado: false,
      oportunidades: [],
      message: 'API de Mercado Público no configurada'
    };
  }

  const response = await axios.get(
    `${API_URL}/servicios/v1/publico/licitaciones.json`,
    {
      params: {
        estado: 'activas',
        ticket: TICKET
      }
    }
  );

  const listado = response.data?.Listado || [];

  if (process.env.LOG_API_RAW === 'true') {
    console.log('===== RESPUESTA API MERCADO PÚBLICO =====');
    console.log('Total registros recibidos:', listado.length);
    console.log('Primer registro crudo:', JSON.stringify(listado[0], null, 2));
    console.log('========================================');
  }

  const oportunidadesClasificadas = listado.map((item) => ({
    ...item,
    clasificacionCompraAgil: clasificarCompraAgil(item)
  }));

  return {
    integrado: true,
    oportunidades: oportunidadesClasificadas
  };
};

const normalizarOportunidad = (item, categoriaBuscada = '') => {
  const monto =
    Number(item.MontoEstimado) ||
    Number(item.MontoTotal) ||
    Number(item.Monto) ||
    Number(item.Total) ||
    0;

  const region =
    item.Comprador?.RegionUnidad ||
    item.Region ||
    'Sin región';

  const organismo =
    item.Comprador?.NombreOrganismo ||
    'Organismo no informado';

  const clasificacionCompraAgil = clasificarCompraAgil(item);

  return {
    codigo_externo: item.CodigoExterno || null,
    titulo: item.Nombre || 'Sin título',
    organismo,
    descripcion: item.Descripcion || item.Nombre,
    categoria: categoriaBuscada,
    region,
    monto_referencial: monto,
    fecha_publicacion: item.FechaPublicacion || item.Fechas?.FechaPublicacion || new Date(),
    fecha_cierre: item.FechaCierre || item.Fechas?.FechaCierre || new Date(),
    estado_oportunidad: 'activa',

    // No se guarda en BD. Solo queda disponible si el flujo lo usa para respuesta o logs.
    clasificacionCompraAgil
  };
};

const filtrarPorCategoria = (oportunidades, categoria, limite = 20) => {
  return oportunidades
    .filter((item) => {
      const textoItems = item.Items?.Listado
        ? item.Items.Listado.map((i) => `
            ${i.Categoria || ''}
            ${i.NombreProducto || ''}
            ${i.Descripcion || ''}
          `).join(' ')
        : '';

      const texto = normalizarTexto(`
        ${item.Nombre || ''}
        ${item.Descripcion || ''}
        ${item.Categoria || ''}
        ${item.Rubro || ''}
        ${item.Comprador?.NombreOrganismo || ''}
        ${textoItems}
      `);

      return texto.includes(normalizarTexto(categoria));
    })
    .slice(0, limite);
};

const obtenerDetalleLicitacion = async (codigoExterno) => {
  if (!API_URL || !TICKET) {
    return null;
  }

  try {
    const response = await axios.get(
      `${API_URL}/servicios/v1/publico/licitaciones.json`,
      {
        params: {
          codigo: codigoExterno,
          ticket: TICKET
        }
      }
    );

    const detalle = response.data?.Listado?.[0] || null;

    if (!detalle) {
      return null;
    }

    const detalleClasificado = {
      ...detalle,
      clasificacionCompraAgil: clasificarCompraAgil(detalle)
    };

    if (process.env.LOG_API_RAW === 'true') {
      console.log('===== DETALLE LICITACIÓN =====');
      console.log(JSON.stringify(detalleClasificado, null, 2));
      console.log('==============================');
    }

    return detalleClasificado;
  } catch (err) {
    console.log('Error obteniendo detalle:', codigoExterno);
    return null;
  }
};

module.exports = {
  obtenerOportunidadesActivas,
  obtenerDetalleLicitacion,
  normalizarOportunidad,
  filtrarPorCategoria,
  clasificarCompraAgil
};