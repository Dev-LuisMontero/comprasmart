const db = require('../config/db');

const findAll = async (filters = {}) => {
  const { categoria, region, estado, montoMin, montoMax } = filters;

  const conditions = [];
  const values = [];

  if (categoria) {
    values.push(`%${categoria}%`);
    conditions.push(`categoria ILIKE $${values.length}`);
  }

  if (region) {
    values.push(`%${region}%`);
    conditions.push(`region ILIKE $${values.length}`);
  }

  if (estado) {
    values.push(estado);
    conditions.push(`estado_oportunidad = $${values.length}`);
  }

  if (montoMin) {
    values.push(Number(montoMin));
    conditions.push(`monto_referencial >= $${values.length}`);
  }

  if (montoMax) {
    values.push(Number(montoMax));
    conditions.push(`monto_referencial <= $${values.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await db.query(
    `SELECT 
      id_oportunidad,
      codigo_externo,
      titulo,
      organismo,
      descripcion,
      categoria,
      region,
      monto_referencial,
      fecha_publicacion,
      fecha_cierre,
      estado_oportunidad
    FROM oportunidad
    ${where}
    ORDER BY fecha_publicacion DESC`,
    values
  );

  return result.rows;
};

const findById = async (idOportunidad) => {
  const result = await db.query(
    `SELECT 
      id_oportunidad,
      codigo_externo,
      titulo,
      organismo,
      descripcion,
      categoria,
      region,
      monto_referencial,
      fecha_publicacion,
      fecha_cierre,
      estado_oportunidad
    FROM oportunidad
    WHERE id_oportunidad = $1`,
    [idOportunidad]
  );

  return result.rows[0];
};

const findRecommendedByPerfil = async (idUsuario) => {
  const result = await db.query(
    `SELECT 
      o.id_oportunidad,
      o.codigo_externo,
      o.titulo,
      o.organismo,
      o.descripcion,
      o.categoria,
      o.region,
      o.monto_referencial,
      o.fecha_publicacion,
      o.fecha_cierre,
      o.estado_oportunidad
    FROM oportunidad o
    INNER JOIN perfil_empresa p ON p.id_usuario = $1
    WHERE 
      o.region ILIKE '%' || p.region || '%'
      AND o.categoria ILIKE '%' || p.categoria_interes || '%'
      AND o.monto_referencial BETWEEN p.monto_min_interes AND p.monto_max_interes
      AND o.estado_oportunidad = 'activa'
    ORDER BY o.fecha_publicacion DESC`,
    [idUsuario]
  );

  return result.rows;
};

const findCategoriasRegistradas = async () => {
  const result = await db.query(
    `SELECT DISTINCT categoria_interes AS categoria
     FROM perfil_empresa
     WHERE categoria_interes IS NOT NULL

     UNION

     SELECT DISTINCT categoria
     FROM alerta
     WHERE categoria IS NOT NULL`
  );

  return result.rows.map((row) => row.categoria);
};

const upsert = async (oportunidad) => {
  const result = await db.query(
    `INSERT INTO oportunidad (
      codigo_externo,
      titulo,
      organismo,
      descripcion,
      categoria,
      region,
      monto_referencial,
      fecha_publicacion,
      fecha_cierre,
      estado_oportunidad
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    ON CONFLICT (codigo_externo)
    DO UPDATE SET
      titulo = EXCLUDED.titulo,
      organismo = EXCLUDED.organismo,
      descripcion = EXCLUDED.descripcion,
      categoria = EXCLUDED.categoria,
      region = EXCLUDED.region,
      monto_referencial = EXCLUDED.monto_referencial,
      fecha_publicacion = EXCLUDED.fecha_publicacion,
      fecha_cierre = EXCLUDED.fecha_cierre,
      estado_oportunidad = EXCLUDED.estado_oportunidad
    RETURNING *`,
    [
      oportunidad.codigo_externo,
      oportunidad.titulo,
      oportunidad.organismo,
      oportunidad.descripcion,
      oportunidad.categoria,
      oportunidad.region,
      oportunidad.monto_referencial,
      oportunidad.fecha_publicacion,
      oportunidad.fecha_cierre,
      oportunidad.estado_oportunidad
    ]
  );

  return result.rows[0];
};

module.exports = {
  findAll,
  findById,
  findRecommendedByPerfil,
  findCategoriasRegistradas,
  upsert
};