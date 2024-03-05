const tryCatchHandler = require("./trycatchHandler");

const authentication = tryCatchHandler(async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).send("Unauthorised Access");
  } else {
    next();
  }
});

module.exports = authentication;
