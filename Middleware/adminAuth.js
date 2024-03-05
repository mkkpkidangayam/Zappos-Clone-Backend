const adminAuth = (req, res, next) => {
  const token = req.cookies.adminAuth;

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Unauthorized admin login",
    });
  } else {
    next();
  }
};

module.exports = adminAuth;
