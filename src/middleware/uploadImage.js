const appError = "../utils/appError.js";
const multer = require("multer");

const uploadImage = () => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/avatars");
    },
    filename: function (req, file, cb) {
      const ext = file.mimetype.split("/")[1];
      const fileName = `avatar-${Date.now()}.${ext}`;
      cb(null, fileName);
    },
  });
  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(appError.create("File must be animage ", 400), false);
    }
  };
  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 0.5 * 1024 * 1024, // file size
      files: 1, // => no of files
      fields: 10, // => max no of fields in the form data
    },
  });
};
module.exports = uploadImage;