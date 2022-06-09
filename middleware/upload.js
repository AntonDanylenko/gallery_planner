const util = require("util");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const settings = require('../config/settings');
const mongoConfig = settings.mongoConfig;

var storage = new GridFsStorage({
  url: mongoConfig.serverUrl + mongoConfig.database,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    const match = ["image/png", "image/jpeg"];
    if (match.indexOf(file.mimetype) === -1) {
      const filename = `${Date.now()}-gallery-${file.originalname}`;
      return filename;
    }
    return {
      bucketName: "photos",
      filename: `${Date.now()}-gallery-${file.originalname}`
    };
  }
});

var uploadFiles = multer({ storage: storage }).single("file");
var uploadFilesMiddleware = util.promisify(uploadFiles);

module.exports = uploadFilesMiddleware;