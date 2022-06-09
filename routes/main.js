const upload = require("../middleware/upload");
const express = require("express");
const router = express.Router();
const data = require('../data');
const photoData = data.photos;
// const xss = require('xss');
// const baseUrl = "http://localhost:3000/files/";

// GET /
router.get('/', async (req, res) => {
  try {
    const photos = await photoData.getAllPhotos();
    // console.log(photos);
    if (photos==[]){
      res.render('pages/gallery', {photos: null});
    }
    else{
      res.render('pages/gallery', {photos: photos});
      // return res.status(200).send(fileInfos);
    }
  } catch (e) {
    return res.status(400).json(e)
  }
});

// POST /requests
router.post('/upload', async (req,res) => {
  try {
    await upload(req, res);
    // console.log(req.files);
    if (req.files.length <= 0) {
      return res
        .status(400)
        .send({ message: "You must select at least 1 file." });
    }
    res.redirect("/");
  } catch (error) {
    console.log(error);
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).send({
        message: "Too many files to upload.",
      });
    }
    return res.status(500).send({
      message: `Error when trying upload many files: ${error}`,
    });
  }
});

router.get("/files/:name", async (req, res) => {
  try {
    const bucket = await photoData.createBucket();
    let downloadStream = bucket.openDownloadStreamByName(req.params.name);
    downloadStream.on("data", function (data) {
      return res.status(200).write(data);
    });
    downloadStream.on("error", function (err) {
      return res.status(404).send({ message: "Cannot download the Image!" });
    });
    downloadStream.on("end", () => {
      return res.end();
    });
  } catch (error) {
    return res.status(500).send({
      message: error.message,
    });
  }
});

module.exports = router;