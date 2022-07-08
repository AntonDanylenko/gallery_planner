const mongoCollections = require("../config/mongoCollections");
const photo_files = mongoCollections.photo_files;
const photo_chunks = mongoCollections.photo_chunks;
const photo_infos = mongoCollections.photo_infos;
const db = mongoCollections.database;
const GridFSBucket = require("mongodb").GridFSBucket;
const { ObjectId } = require("mongodb");
const baseUrl = "http://localhost:3000/files/";

module.exports = {

  // Returns all photos in either gallery or sidebar
  async getAllPhotos(location){
    const photoInfoCollection = await photo_infos();
    const infoList = await photoInfoCollection.find({location: location}).sort({"index": -1});
    if (infoList!=[]){
      let fileInfos = [];
      await infoList.forEach((doc) => {
        fileInfos.push({
          name: doc.filename,
          url: baseUrl + doc.filename,
        });
      });
      return fileInfos;
    }
    throw new Error("Could not get all photos");
  },

  // Create bucket
  async createBucket(){
    const database = await db();
    const bucket = new GridFSBucket(database, {
      bucketName: "photos",
    });
    return bucket;
  },

  // Remove a photo
  async removePhoto(name){
    const photoFilesCollection = await photo_files();
    const photo = await photoFilesCollection.findOne({ filename: name });
    if (photo === null){
      throw new Error("No photo with that filename");
    }
    photoName = photo["filename"];
    id = photo["_id"].toString();
    // console.log("photoName: " + photoName);
    // console.log("id: " + id);
    const filesDeletionInfo = await photoFilesCollection.deleteOne({ _id: ObjectId(id) });
    if (filesDeletionInfo.deletedCount === 0) {
      throw new Error("Could not delete photo file");
    }
    const photoChunksCollection = await photo_chunks();
    const chunksDeletionInfo = await photoChunksCollection.deleteMany({ files_id: ObjectId(id) });
    const photoInfoCollection = await photo_infos();
    const infoDeletionInfo = await photoInfoCollection.deleteOne({ filename: photoName });
    if (infoDeletionInfo.deletedCount === 0) {
      throw new Error("Could not delete photo info");
    }
    console.log("DELETED " + photoName);
    return;
  },

  async updateLayout(filenames, sidebar_filenames){
    const photoInfoCollection = await photo_infos();
    const allInfos = await photoInfoCollection.find({}).toArray();

    // Go through all photos and place them in gallery or sidebar based on their location on the page
    for (photo of allInfos){
      if (filenames.indexOf(photo["filename"]) != -1 && photo["location"] != "gallery"){
        photo["location"] = "gallery";
        const updatedInfo = await photoInfoCollection.updateOne(
          { _id: photo["_id"] },
          { $set: photo }
        );
        if (updatedInfo.modifiedCount === 0) {
          throw new Error("Could not update photo location to gallery successfully");
        }
      }
      else if (sidebar_filenames.indexOf(photo["filename"]) != -1 && photo["location"] != "sidebar"){
        photo["location"] = "sidebar";
        const updatedInfo = await photoInfoCollection.updateOne(
          { _id: photo["_id"] },
          { $set: photo }
        );
        if (updatedInfo.modifiedCount === 0) {
          throw new Error("Could not update photo location to sidebar successfully");
        }
      }
    }

    // console.log("filenames: " + filenames);
    // console.log("sidebar_filenames: " + sidebar_filenames);
    // const allInfosNew = await photoInfoCollection.find({}).toArray();
    // console.log("allInfos: " + allInfosNew);

    // Update indeces of gallery images in database to the order of current layout
    let index = filenames.length - 1;
    for (filename of filenames){
      const photo = await photoInfoCollection.findOne({filename: filename});
      if (photo["index"]!=index){
        photo["index"] = index;
        const updatedInfo = await photoInfoCollection.updateOne(
          { _id: photo["_id"] },
          { $set: photo }
        );
        if (updatedInfo.modifiedCount === 0) {
          throw new Error("Could not update gallery photo index successfully");
        }
        console.log("UPDATED INDEX of " + photo["filename"]);
      }
      index--;
    }

    // Update indeces of sidebar images in database to the order of current layout
    let sidebar_index = sidebar_filenames.length - 1;
    for (sidebar_filename of sidebar_filenames){
      const sidebar_photo = await photoInfoCollection.findOne({filename: sidebar_filename});
      if (sidebar_photo["index"]!=sidebar_index){
        sidebar_photo["index"] = sidebar_index;
        const updatedInfo = await photoInfoCollection.updateOne(
          { _id: sidebar_photo["_id"] },
          { $set: sidebar_photo }
        );
        if (updatedInfo.modifiedCount === 0) {
          throw new Error("Could not update sidebar photo index successfully");
        }
        console.log("UPDATED INDEX of " + sidebar_photo["filename"]);
      }
      sidebar_index--;
    }

    return;
  },

  // Add all photos to info collection that are in files but not in info yet
  async updateInfo(){
    const photoFilesCollection = await photo_files();
    const photoFiles = await photoFilesCollection.find({}).toArray();

    // Get all photos already in info collection
    const photoInfoCollection = await photo_infos();
    const allInfos = await photoInfoCollection.find({}).toArray();

    // Get list of filenames of photos already in info collection
    const infoFilenames = allInfos.map(({filename})=>filename);
    // console.log("infoFilenames: " + infoFilenames);

    // Get indeces and the max index of gallery photos already in info
    const allGalleryInfos = await photoInfoCollection.find({location: "gallery"}).toArray();
    const infoIndeces = allGalleryInfos.map(({index})=>index);
    var max_index = 0;
    if (infoIndeces.length!=0){
      max_index = Math.max.apply(Math, infoIndeces) + 1;
    }
    // console.log("max_index: " + max_index);

    // If photo not in info collection yet, add it
    for (photoFile of photoFiles){
      if (infoFilenames.indexOf(photoFile["filename"])==-1){
        let newInfo = {
          filename: photoFile["filename"],
          location: "gallery",
          index: max_index
        }
        const insertInfo = await photoInfoCollection.insertOne(newInfo);
        if (!insertInfo.acknowledged || !insertInfo.insertedId) {
          throw new Error('Could not add photo info');
        }
        max_index++;
      }
    }
  }
}