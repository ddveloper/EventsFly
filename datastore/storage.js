/**
 * Storage module, a lite Google Cloud storage
 */

const { Storage } = require("@google-cloud/storage");

// Instantiate a storage client
const storage = new Storage();
const bucketName = "images-event-fly";

/**
 * Store a file record into the storage.
 *
 * @param {object} filePath The file record to store.
 */
const insertFile = async filePath => {
  // Uploads a local file to the bucket
  await storage.bucket(bucketName).upload(filePath, {
    // Support for HTTP requests made with `Accept-Encoding: gzip`
    gzip: true,
    // By setting the option `destination`, you can change the name of the
    // object you are uploading to a bucket.
    metadata: {
      // Enable long-lived HTTP caching headers
      // Use only if the contents of the file will never change
      // (If the contents will change, use cacheControl: 'no-cache')
      cacheControl: "public, max-age=31536000"
    },
    predefinedAcl: "publicRead"
  });
};

const getFileLinks = async () => {
  const [files] = await storage.bucket(bucketName).getFiles();
  listUrls = [];
  files.forEach(file => {
    //console.log(file.name);
    listUrls.push({'link': 'http://storage.googleapis.com/' + bucketName + '/' + file.name});
  });
  return listUrls;
};

module.exports = {
  insertFile,
  getFileLinks
};
