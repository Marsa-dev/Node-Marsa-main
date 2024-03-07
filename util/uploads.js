const multer = require("multer");
const crypto = require("crypto");

const storageImages = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    // console.log("====>>>", file);
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") +
        "-" +
        crypto.randomUUID() +
        file.originalname
    );
  },
});

const upload = multer({ storage: storageImages });

module.exports = { upload };
