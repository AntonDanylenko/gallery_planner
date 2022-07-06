const mongoCollections = require("../config/mongoCollections");
const photo_files = mongoCollections.photo_files;
const photo_chunks = mongoCollections.photo_chunks;
const photo_temp = mongoCollections.photo_temp;
const db = mongoCollections.database;
const GridFSBucket = require("mongodb").GridFSBucket;
const { ObjectId } = require("mongodb");
const baseUrl = "http://localhost:3000/files/";

module.exports = {

  // Returns all photos
  async getAllPhotos(){
    const photoFilesCollection = await photo_files();
    const photoList = await photoFilesCollection.find({}).sort({"index": -1});
    if (photoList!=[]){
      let fileInfos = [];
      await photoList.forEach((doc) => {
        fileInfos.push({
          name: doc.filename,
          url: baseUrl + doc.filename,
        });
      });
      return fileInfos;
    }
    throw new Error("Could not get all photos");
  },

  // Returns all temp photos
  async getAllTempPhotos(){
    const photoTempCollection = await photo_temp();
    const photoList = await photoTempCollection.find({}); //.sort({"tempIndex": -1});
    if (photoList!=[]){
      let fileInfos = [];
      await photoList.forEach((doc) => {
        fileInfos.push({
          name: doc.filename,
          url: baseUrl + doc.filename,
        });
      });
      return fileInfos;
    }
    throw new Error("Could not get all temp photos");
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
    var photoName = "";
    var id = "";
    var filesDeletionInfo;
    const photoFilesCollection = await photo_files();
    const photo = await photoFilesCollection.findOne({ filename: name });
    if (photo === null){
      const photoTempCollection = await photo_temp();
      const temp_photo = await photoTempCollection.findOne({ filename: name });
      if (temp_photo === null){
        throw new Error("No photo or temp photo with that filename");
      }
      else {
        photoName = temp_photo["filename"];
        id = temp_photo["_id"].toString();
        filesDeletionInfo = await photoTempCollection.deleteOne({ _id: ObjectId(id) });
      }
    }
    else {
      photoName = photo["filename"];
      id = photo["_id"].toString();
      filesDeletionInfo = await photoFilesCollection.deleteOne({ _id: ObjectId(id) });
    }
    // console.log("photoName: " + photoName);
    // console.log("id: " + id);
    // const filesDeletionInfo = await photoFilesCollection.deleteOne({ _id: ObjectId(id) });
    if (filesDeletionInfo.deletedCount === 0) {
      throw new Error("Could not delete photo file");
    }
    const photoChunksCollection = await photo_chunks();
    // const chunks = await photoChunksCollection.find({ files_id: ObjectId(id) });
    // console.log(chunks.toArray());
    // const numChunks = chunks.toArray().length;
    // console.log("numChunks: " + numChunks);
    const chunksDeletionInfo = await photoChunksCollection.deleteMany({ files_id: ObjectId(id) });
    // console.log("deletion count: " + chunksDeletionInfo.deletedCount);
    // if (chunksDeletionInfo.deletedCount !== numChunks) {
    //   throw new Error("Could not delete all photo chunks");
    // }
    // console.log("Success");
    console.log("DELETED " + photoName);
    return;
  },

  // Add indexes to all photos that don"t have them
  async addIndexes(){
    const photoFilesCollection = await photo_files();
    const photoList = await photoFilesCollection.find({}).toArray();
    if (photoList){
      let start_index = 0;
      if (await photoFilesCollection.countDocuments({index: {$exists: true}}) > 0){
        const indexedPhotos = await photoFilesCollection.find({index: {$exists: true}});
        // console.log(indexedPhotos.toArray());
        const sortedPhotos = await indexedPhotos.sort({"index": -1}).toArray();
        // console.log(sortedPhotos);
        const maxPhoto = sortedPhotos[0];
        // console.log("maxPhoto: " + maxPhoto);
        start_index = maxPhoto["index"] + 1;
        // console.log("start_index indexed: " + start_index);
      }
      // else {
      //   console.log("start_index unindexed: " + start_index);
      // }
      const unindexedPhotos = await photoFilesCollection.find({index: {$exists: false}});
      const sortUnindexed = await unindexedPhotos.sort({"uploadDate": 1}).toArray();
      // console.log(sortUnindexed);
      for (photo of sortUnindexed){
        photo["index"] = start_index;
        const updatedInfo = await photoFilesCollection.updateOne(
          { _id: photo["_id"] },
          { $set: photo }
        );
        if (updatedInfo.modifiedCount === 0) {
          throw new Error("Could not update photo index successfully");
        }
        console.log("ADDED " + photo["filename"]);
        start_index++;
      }
      return;
    }
  },

  async updateGallery(filenames){
    const photoFilesCollection = await photo_files();
    let index = filenames.length - 1;
    for (filename of filenames){
      const photo = await photoFilesCollection.findOne({filename: filename});
      if (photo["index"]!=index){
        photo["index"] = index;
        const updatedInfo = await photoFilesCollection.updateOne(
          { _id: photo["_id"] },
          { $set: photo }
        );
        if (updatedInfo.modifiedCount === 0) {
          throw new Error("Could not update photo index successfully");
        }
        console.log("UPDATED INDEX of " + photo["filename"]);
      }
      index--;
    }
    return;
  },

  // async updateTemp(temp_filenames){
  //   const photoTempCollection = await photo_temp();
  //   let index = filenames.length - 1;
  //   for (filename of filenames){
  //     const photo = await photoTempCollection.findOne({filename: filename});
  //     if (photo["index"]!=index){
  //       photo["index"] = index;
  //       const updatedInfo = await photoTempCollection.updateOne(
  //         { _id: photo["_id"] },
  //         { $set: photo }
  //       );
  //       if (updatedInfo.modifiedCount === 0) {
  //         throw new Error("Could not update photo index successfully");
  //       }
  //       console.log("UPDATED INDEX of " + photo["filename"]);
  //     }
  //     index--;
  //   }
  //   return;
  // }

}