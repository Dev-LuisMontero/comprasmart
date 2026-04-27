const normalizarTexto = (texto = '') => {
  return texto
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

const clasificarCompraAgil = (oportunidad) => {
  const tipo = oportunidad.tipo || oportunidad.Tipo || '';
  const monto = Number(
    oportunidad.monto_estimado ||
    oportunidad.montoEstimado ||
    oportunidad.MontoEstimado ||
    0
  );

  const texto = normalizarTexto(`
    ${oportunidad.titulo || oportunidad.Nombre || ''}
    ${oportunidad.descripcion || oportunidad.Descripcion || ''}
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
    'informatica',
    'informatico',
    'software',
    'computador',
    'licencia',
    'equipamiento tecnologico',
    'soporte tic'
  ];

  const coincideTexto = palabrasClave.some((palabra) => texto.includes(palabra));

  if (coincideTexto) {
    score += 1;
    criterios.push('Coincidencia por texto o categoría tecnológica');
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
    puntaje: score,
    criterios
  };
};

module.exports = {
  clasificarCompraAgil
};