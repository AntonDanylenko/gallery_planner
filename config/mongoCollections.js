const dbConnection = require("./mongoConnection");

/* This will allow you to have one reference to each collection per app */
/* Feel free to copy and paste this */
const getCollectionFn = (collection) => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      const db = await dbConnection.connectToDb();
      _col = await db.collection(collection);
    }

    return _col;
  };
};

const getDatabase = () => {
  return async () => {
    return await dbConnection.connectToDb();
  };
}

/* Now, you can list your collections here: */
module.exports = {
  photo_files: getCollectionFn("photos.files"),
  photo_chunks: getCollectionFn("photos.chunks"),
  database: getDatabase()
};