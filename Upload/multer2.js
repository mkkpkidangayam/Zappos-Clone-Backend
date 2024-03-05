const multer = require("multer");

const storage = multer.diskStorage({
  // Specify the destination directory where uploaded files will be stored
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  // Specify the filename for uploaded files
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Specify file filter to accept only certain file types
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed!"), false);
  }
};

// Initialize multer with the configured storage and file filter
const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;
