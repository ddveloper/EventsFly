/**
 * Route module, acting as controller
 */

"use strict";

const express = require("express");
const crypto = require("crypto");
const formidable = require("formidable");
const mustache = require("mustache");
const fs = require("fs");

const database = require("./datastore");
const storage = require("./storage");

const app = express();
app.enable("trust proxy");

app.get("/", (req, res) => {
  res
    .status(302)
    .set({ Location: "/index" })
    .end();
});

app.get("/index", (req, res) => {
  fs.readFile(__dirname + "/view/index.html", async (err, data) => {
    res.writeHead(200, {
      "Content-Type": "text/html"
    });
    var img_links = await storage.getFileLinks();
    var ex_img_links = [];
    for (var idx = 0; idx < img_links.length; idx++)
      ex_img_links.push({
        index: idx,
        link: img_links[idx]["link"]
      });
    res.write(
      mustache.render(data.toString(), {
        img_links: ex_img_links
      })
    );
    res.end();
  });
});

app.get("/submit", (req, res) => {
  res.sendFile(__dirname + "/view/submit.html");
});

app.post("/upload", (req, res) => {
  new formidable.IncomingForm()
    .parse(req)
    .on("fileBegin", (name, file) => {
      //file.path = __dirname + "/uploads/" + file.name;
    })
    .on("field", (name, field) => {
      console.log("Field", name, field);
    })
    .on("file", async (name, file) => {
      console.log("file uploaded: ", file.name);
      storage.insertFile(file.path);
      //fs.unlinkSync(file.path);
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

app.post("/submit", (req, res) => {
  new formidable.IncomingForm()
    .parse(req)
    .on("field", (name, field) => {
      console.log("Field", name, field);
    })
    .on("end", () => {
      res.status(204).send();
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
