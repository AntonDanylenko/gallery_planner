const upload = require("../middleware/upload");
const express = require("express");
const router = express.Router();
const data = require("../data");
const photoData = data.photos;

router.get("/", async (req, res) => {
  try {
    const photos = await photoData.getAllPhotos();
    const temp_photos = await photoData.getAllTempPhotos();
    // console.log(photos);
    if (photos==[] && temp_photos!=[]){
      return res.status(200).render("pages/gallery", {photos: null, temp_photos: temp_photos});
    }
    else if(photos!=[] && temp_photos==[]){
      return res.status(200).render("pages/gallery", {photos: photos, temp_photos: null});
    }
    else if(photos==[] && temp_photos==[]){
      return res.status(200).render("pages/gallery", {photos: null, temp_photos: null});
    }
    else{
      return res.status(200).render("pages/gallery", {photos: photos, temp_photos: temp_photos});
    }
  } catch (e) {
    return res.status(404).render("pages/gallery", {photos: null, temp_photos: null, error: e, errorExists: true});
  }
});

router.post("/upload", async (req,res) => {
  try {
    await upload(req, res);
    // console.log("req.files: " + req.files);
    if (req.files.length <= 0) {
      return res.status(400).render("pages/gallery", {photos: null, temp_photos: null, error: "You must select at least 1 file.", errorExists: true});
    }
    await photoData.addIndexes();
    // add_photos.addPhotosToPage(req.files);
    // return res.status(200).render("pages/gallery");
    return res.status(200).redirect("/");
  } catch (e) {
    console.log(e);
    if (e.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).render("pages/gallery", {photos: null, temp_photos: null, error: "Too many files selected", errorExists: true});
    }
    return res.status(404).render("pages/gallery", {photos: null, temp_photos: null, error: e, errorExists: true});
  }
});

router.get("/files/:name", async (req, res) => {
  try {
    const bucket = await photoData.createBucket();
    let downloadStream = bucket.openDownloadStreamByName(req.params.name);
    downloadStream.on("data", function (data) {
      return res.status(200).write(data);
    });
    downloadStream.on("error", function (e) {
      return res.status(404).render("pages/gallery", {photos: null, temp_photos: null, error: e, errorExists: true});
    });
    downloadStream.on("end", () => {
      return res.end();
    });
  } catch (e) {
    return res.status(404).render("pages/gallery", {photos: null, temp_photos: null, error: e, errorExists: true});
  }
});

router.delete("/files/:name", async (req, res) => {
  // console.log("Deleting photo with filename: " + req.params.name);
  try {
    await photoData.removePhoto(req.params.name);
    return res.status(200).render("pages/gallery");
  } catch (e) {
    return res.status(404).render("pages/gallery", {photos: null, temp_photos: null, error: e, errorExists: true});
  }
});

router.post("/layout", async (req, res) => {
  const filenames = req.body.gallery_photos;
  const temp_filenames = req.body.temp_photos;
  // console.log(filenames);
  // console.log(temp_filenames);
  await photoData.updateGallery(filenames);
  // await photoData.updateTemp(temp_filenames);
  return res.status(200).render("pages/gallery");
});

module.exports = router;