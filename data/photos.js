const mongoCollections = require('../config/mongoCollections');
const photos = mongoCollections.photos;
const db = mongoCollections.database;
const GridFSBucket = require("mongodb").GridFSBucket;
const baseUrl = "http://localhost:3000/files/";

module.exports = {
  // // Creates a photo and checks to see if its properly inserted
  // async createPhoto(photoImage){
  //   const photoCollection= await photos();
    
  //   let newPhoto = {
  //     photoImage: photoImage
  //   }

  //   const insertPhoto = await photoCollection.insertOne(newPhoto);

  //   if (!insertPhoto.acknowledged || !insertPhoto.insertedId) throw 'Internal Server Error';

  //   return {photoInserted: true};
  // },

  // Returns all photo urls
  async getAllPhotos(){
    const photoCollection = await photos();
    const photoList = await photoCollection.find({});
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
  }

}