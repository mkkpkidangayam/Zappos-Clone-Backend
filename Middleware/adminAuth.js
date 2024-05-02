const jwt = require("jsonwebtoken");

module.exports = function verifyToken(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(403).send({ error: "No token Provided 🙆🏻‍♂️" });
  }
  jwt.verify(token, process.env.ADMIN_JWT_SECRET, (err, decode) => {
    if (err) {
      return res.status(401).json({ error: "Unathorazed😠" });
    }

    req.username = decode.username;

    next();
  });
};

// const adminAuth = (req, res, next) => {
//   const token = req.cookies.adminToken;

//   if (!token) {
//     res.status(401).json({
//       success: false,
//       message: "Unauthorized admin login",
//     });
//   } else {
//     next();
//   }
// };

// module.exports = adminAuth;
