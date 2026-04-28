const oportunidadModel = require('../models/oportunidad.model');
const { success, error } = require('../utils/response');
const mercadoPublicoService = require('../services/mercadoPublico.service');

const agregarClasificacionCompraAgil = (oportunidades = []) => {
  return oportunidades.map((oportunidad) => ({
    ...oportunidad,
    clasificacionCompraAgil:
      mercadoPublicoService.clasificarCompraAgil(oportunidad)
  }));
};

const getOportunidades = async (req, res) => {
  try {
    const oportunidades = await oportunidadModel.findAll(req.query);

    const oportunidadesClasificadas =
      agregarClasificacionCompraAgil(oportunidades);

    return success(
      res,
      'Oportunidades obtenidas correctamente',
      oportunidadesClasificadas
    );
  } catch (err) {
    return error(res, 'Error al obtener oportunidades', 500);
  }
};

const getOportunidadById = async (req, res) => {
  try {
    const { id } = req.params;

    const oportunidad = await oportunidadModel.findById(id);

    if (!oportunidad) {
      return error(res, 'Oportunidad no encontrada', 404);
    }

    const oportunidadClasificada = {
      ...oportunidad,
      clasificacionCompraAgil:
        mercadoPublicoService.clasificarCompraAgil(oportunidad)
    };

    return success(
      res,
      'Detalle de oportunidad obtenido correctamente',
      oportunidadClasificada
    );
  } catch (err) {
    return error(res, 'Error al obtener detalle de oportunidad', 500);
  }
};

const getRecomendadasPorPerfil = async (req, res) => {
  try {
    const oportunidades = await oportunidadModel.findRecommendedByPerfil(
      req.user.id_usuario
    );

    const oportunidadesClasificadas =
      agregarClasificacionCompraAgil(oportunidades);

    return success(
      res,
      'Oportunidades recomendadas según perfil obtenidas correctamente',
      oportunidadesClasificadas
    );
  } catch (err) {
    return error(res, 'Error al obtener oportunidades recomendadas', 500);
  }
};

const sincronizarOportunidades = async (req, res) => {
  try {
    const categorias = await oportunidadModel.findCategoriasRegistradas();

    if (!categorias.length) {
      return success(res, 'No existen categorías registradas para sincronizar', {
        categorias: [],
        procesadas: 0,
        omitidas: 0,
        detalle: []
      });
    }

    const resultadoApi = await mercadoPublicoService.obtenerOportunidadesActivas();
    const totalRecibidas = resultadoApi.oportunidades.length;

    if (!resultadoApi.integrado) {
      return error(res, resultadoApi.message, 400);
    }

    let procesadas = 0;
    let omitidas = 0;
    const detalle = [];

    for (const categoria of categorias) {
      const filtradas = mercadoPublicoService.filtrarPorCategoria(
        resultadoApi.oportunidades,
        categoria,
        20
      );

      let procesadasCategoria = 0;
      let omitidasCategoria = 0;

      for (const item of filtradas) {
        if (!item.CodigoExterno) {
          omitidas++;
          omitidasCategoria++;

          console.log('Oportunidad omitida: sin código externo', {
            categoria,
            item
          });

          continue;
        }

        const detalleLicitacion = await mercadoPublicoService.obtenerDetalleLicitacion(
          item.CodigoExterno
        );

        if (!detalleLicitacion) {
          omitidas++;
          omitidasCategoria++;

          console.log('Oportunidad omitida: no se pudo obtener detalle', {
            categoria,
            codigo: item.CodigoExterno
          });

          continue;
        }

        const normalizada = mercadoPublicoService.normalizarOportunidad(
          detalleLicitacion,
          categoria
        );

        if (!normalizada.codigo_externo) {
          omitidas++;
          omitidasCategoria++;

          console.log('Oportunidad omitida: detalle sin código externo', {
            categoria,
            detalleLicitacion
          });

          continue;
        }

        if (normalizada.monto_referencial <= 0) {
          omitidas++;
          omitidasCategoria++;

          console.log('Oportunidad omitida por monto inválido en detalle:', {
            categoria,
            codigo: normalizada.codigo_externo,
            titulo: normalizada.titulo,
            montoNormalizado: normalizada.monto_referencial,
            camposMontoOriginales: {
              MontoEstimado: detalleLicitacion.MontoEstimado,
              MontoTotal: detalleLicitacion.MontoTotal,
              Monto: detalleLicitacion.Monto,
              Total: detalleLicitacion.Total
            }
          });

          continue;
        }

        await oportunidadModel.upsert(normalizada);

        procesadas++;
        procesadasCategoria++;
      }

      detalle.push({
        categoria,
        encontradas_en_listado: filtradas.length,
        procesadas: procesadasCategoria,
        omitidas: omitidasCategoria
      });
    }

    return success(res, 'Sincronización finalizada correctamente', {
      categorias,
      procesadas,
      omitidas,
      detalle,
      totalRecibidas
    });
  } catch (err) {
    console.error('Error en sincronización Mercado Público:', err);

    return error(
      res,
      'Error al sincronizar oportunidades desde Mercado Público',
      500
    );
  }
};

module.exports = {
  getOportunidades,
  getOportunidadById,
  getRecomendadasPorPerfil,
  sincronizarOportunidades
};