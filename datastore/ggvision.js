/**
 * Google Vision module, to label a image
 */

const vision = require("@google-cloud/vision");

// Instantiate a Vision client
const client = new vision.ImageAnnotatorClient();

/*** Retrieve the latest 10 poster records from the database.
 */
const getLabels = async path => {
  const [result] = await client.labelDetection(path);
  const annotations = result.labelAnnotations;
  const labels = annotations.map(label => label.description);
  return labels;
};

module.exports = {
  getLabels
};
