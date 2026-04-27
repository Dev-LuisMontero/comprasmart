const oportunidadCoincideConAlerta = (oportunidad, alerta) => {
  const coincideCategoria = alerta.categoria
    ? oportunidad.categoria?.toLowerCase().includes(alerta.categoria.toLowerCase())
    : true;

  const coincideRegion = alerta.region
    ? oportunidad.region?.toLowerCase().includes(alerta.region.toLowerCase())
    : true;

  const coincideMonto =
    Number(oportunidad.monto_referencial) >= Number(alerta.monto_min) &&
    Number(oportunidad.monto_referencial) <= Number(alerta.monto_max);

  const coincidePalabraClave = alerta.palabra_clave
    ? oportunidad.titulo?.toLowerCase().includes(alerta.palabra_clave.toLowerCase()) ||
      oportunidad.descripcion?.toLowerCase().includes(alerta.palabra_clave.toLowerCase())
    : true;

  return (
    coincideCategoria &&
    coincideRegion &&
    coincideMonto &&
    coincidePalabraClave
  );
};

const filtrarOportunidadesPorAlertas = (oportunidades, alertas) => {
  const alertasActivas = alertas.filter(
    (alerta) => alerta.estado_alerta === 'activa'
  );

  return alertasActivas.map((alerta) => {
    const coincidencias = oportunidades.filter((oportunidad) =>
      oportunidadCoincideConAlerta(oportunidad, alerta)
    );

    return {
      alerta,
      coincidencias
    };
  });
};

module.exports = {
  oportunidadCoincideConAlerta,
  filtrarOportunidadesPorAlertas
};