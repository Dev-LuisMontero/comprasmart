const errorMiddleware = (err, req, res, next) => {
  console.error('Error no controlado:', err);

  return res.status(err.status || 500).json({
    ok: false,
    message: err.message || 'Error interno del servidor'
  });
};

module.exports = errorMiddleware;