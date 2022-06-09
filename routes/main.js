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
    console.log(req.file);
    if (req.file == undefined) {
      return res.send({
        message: "You must select a file.",
      });
    }
    // return res.send({
    //   message: "File has been uploaded.",
    // });
    res.redirect("/")
  } catch (error) {
    console.log(error);
    return res.send({
      message: "Error when trying upload image: ${error}",
    });
  }

  // if (!req.body.photoImage){
  //   res.status(404);
  //   res.render('pages/gallery', {error: "No image url provided", errorExists: true});
  // }
  // if (req.body.photoImage!='string' || req.body.photoImage.trim().length==0){
  //   res.status(404);
  //   res.render('pages/gallery', {error: "Image url cannot be all spaces", errorExists: true});
  // }
  // try {
  //   // var today = new Date();
  //   // var dd = String(today.getDate()).padStart(2, '0');
  //   // var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  //   // var yyyy = today.getFullYear();
  //   // today = mm + '/' + dd + '/' + yyyy;
  //   const create = await photoData.createPhoto(xss(req.body.photoImage));
  //   if (create.photoInserted) {
  //     res.redirect('/');
  //   }
  // } catch (e) {
  //   res.status(404);
  //   res.render('pages/gallery', {error: e, errorExists: true});
  // }
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