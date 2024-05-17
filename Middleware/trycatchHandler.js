const tryCatchHandler = (controller) => async (req, res, next) => {
  try {
    await controller(req, res);
  } catch (error) {
    return next(error); 
  } 
};

module.exports = tryCatchHandler;
