// touring-be/middlewares/responseFormatter.js
module.exports = (req, res, next) => {
  res.sendSuccess = (data = null, meta = {}) => {
    return res.json({ success: true, data, meta });
  };

  res.sendError = (code = 'ERROR', message = 'An error occurred', status = 400, extra = {}) => {
    return res.status(status).json({ success: false, error: { code, message, ...extra } });
  };

  next();
};
