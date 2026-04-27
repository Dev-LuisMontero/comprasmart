const success = (res, message, data = null, status = 200) => {
  return res.status(status).json({
    ok: true,
    message,
    data
  });
};

const error = (res, message, status = 400) => {
  return res.status(status).json({
    ok: false,
    message
  });
};

module.exports = {
  success,
  error
};