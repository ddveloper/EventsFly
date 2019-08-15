/**
 * Datastore module, a lite Google Cloud database
 */

const { Datastore } = require("@google-cloud/datastore");

// Instantiate a datastore client
const datastore = new Datastore();

/**
 * Insert a poster record into the database.
 *
 * @param {object} poster The poster record to insert.
 */
const insertPoster = poster => {
  return datastore.save({
    key: datastore.key("poster"),
    data: poster
  });
};

/**
 * Retrieve the latest 10 poster records from the database.
 */
const getPoster = path => {
  const query = datastore
    .createQuery("poster")
    .filter("filePath", "=", path)
    .limit(1);

  return datastore.runQuery(query);
};

/**
 * Compose a new poster record.
 */
const newPoster = (lc, t1, t2, dpt, desp, fn, fp) => {
  const poster = {
    timestamp: new Date(),
    location: lc,
    timeStart: t1,
    timeEnd: t2,
    department: dpt,
    description: desp,
    fileName: fn,
    filePath: fp
  };

  return poster;
};

module.exports = {
  insertPoster,
  getPoster,
  newPoster
};
