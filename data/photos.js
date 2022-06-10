const mongoCollections = require('../config/mongoCollections');
const photo_files = mongoCollections.photo_files;
const photo_chunks = mongoCollections.photo_chunks;
const db = mongoCollections.database;
const GridFSBucket = require("mongodb").GridFSBucket;
const { ObjectId } = require('mongodb');
const baseUrl = "http://localhost:3000/files/";

module.exports = {

  // Returns all photo urls
  async getAllPhotos(){
    const photoFilesCollection = await photo_files();
    const photoList = await photoFilesCollection.find({});
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
    throw new Error('Could not get all photos');
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
      throw new Error('No photo with that filename');
    }
    const photoName = photo["filename"];
    const id = photo["_id"].toString();
    // console.log("photoName: " + photoName);
    // console.log("id: " + id);
    const filesDeletionInfo = await photoFilesCollection.deleteOne({ _id: ObjectId(id) });
    if (filesDeletionInfo.deletedCount === 0) {
      throw new Error('Could not delete photo file');
    }
    const photoChunksCollection = await photo_chunks();
    // const chunks = await photoChunksCollection.find({ files_id: ObjectId(id) });
    // console.log(chunks.toArray());
    // const numChunks = chunks.toArray().length;
    // console.log("numChunks: " + numChunks);
    const chunksDeletionInfo = await photoChunksCollection.deleteMany({ files_id: ObjectId(id) });
    // console.log("deletion count: " + chunksDeletionInfo.deletedCount);
    // if (chunksDeletionInfo.deletedCount !== numChunks) {
    //   throw new Error('Could not delete all photo chunks');
    // }
    // console.log("Success");
    return photoName + ' has been successfully deleted!';
  }

}