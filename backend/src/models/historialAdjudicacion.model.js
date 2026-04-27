const db = require('../config/db');

const findByOportunidadId = async (idOportunidad) => {
  const result = await db.query(
    `SELECT 
      id_historial,
      id_oportunidad,
      proveedor_adjudicado,
      organismo_adjudicador,
      monto_adjudicado,
      cantidad_oferentes,
      fecha_adjudicacion
    FROM historial_adjudicacion
    WHERE id_oportunidad = $1
    ORDER BY fecha_adjudicacion DESC`,
    [idOportunidad]
  );

  return result.rows;
};

module.exports = {
  findByOportunidadId
};