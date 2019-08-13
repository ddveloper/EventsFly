/**
 * Route module, acting as controller
 */

"use strict";

const express = require("express");
const crypto = require("crypto");
const database = require("./datastore");
const formidable = require("formidable");

const app = express();
app.enable("trust proxy");

app.get("/", (req, res) => {
  res
    .status(302)
    .set({ Location: "/index" })
    .end();
});

app.get("/index", (req, res) => {
  res.sendFile(__dirname + "/view/index.html");
});

app.get("/submit", (req, res) => {
  res.sendFile(__dirname + "/view/submit.html");
});

app.post("/upload", (req, res) => {
  new formidable.IncomingForm()
    .parse(req)
    .on("fileBegin", (name, file) => {
      file.path = __dirname + "/uploads/" + file.name;
    })
    .on("field", (name, field) => {
      console.log("Field", name, field);
    })
    .on("file", async (name, file) => {
      console.log("file uploaded: ", file.name);
    })
    .on("aborted", () => {
      console.error("Request aborted by the user");
    })
    .on("error", err => {
      console.error("Error", err);
    })
    .on("end", () => {
      res.end();
    });
});

app.get("/myico", (req, res) => {
  res.sendFile(__dirname + "/view/icon.png");
});

app.get("/visit", async (req, res, next) => {
  // Create a visit record to be stored in the database
  const visit = {
    timestamp: new Date(),
    // Store a hash of the visitor's ip address
    userIp: crypto
      .createHash("sha256")
      .update(req.ip)
      .digest("hex")
      .substr(0, 7)
  };

  try {
    await database.insertVisit(visit);
    const [entities] = await database.getVisits();
    const visits = entities.map(
      entity => `Time: ${entity.timestamp}, AddrHash: ${entity.userIp}`
    );
    res
      .status(200)
      .set("Content-Type", "text/plain")
      .send(`Last 10 visits:\n${visits.join("\n")}`)
      .end();
  } catch (error) {
    next(error);
  }
});

const PORT = process.env.PORT || 8080;
app.listen(process.env.PORT || 8080, () => {
  console.log(`App listening on port ${PORT}`);
  console.log("Press Ctrl+C to quit.");
});

module.exports = app;
