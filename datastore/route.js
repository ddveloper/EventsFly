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
const vision = require("./ggvision");

const app = express();
app.enable("trust proxy");

app.get("/", (req, res) => {
  res
    .status(302)
    .set({ Location: "/index" })
    .end();
});

const build_location = JSON.parse(
  fs.readFileSync(__dirname + "/vendor/Building_Locations.json")
)["Building_Locations"];

const depart_list = JSON.parse(
  fs.readFileSync(__dirname + "/vendor/departments.json")
)["Departments"];

app.get("/posterinfor", async (req, res) => {
  console.log("query:", req.query.path);
  const [entities] = await database.getPoster(req.query.path);
  var objResult = {};
  if (entities.length === 1 && entities[0]["filePath"] === req.query.path) {
    objResult = entities[0];
    console.log("found!");
  }
  // add new entries below
  const bl = build_location[Number(objResult.location)];
  objResult.building = bl.building_name;
  objResult.bd_abbr = bl.abbr;
  objResult.address = bl.addr;
  objResult.lat = bl.lat;
  objResult.lng = bl.lng;
  res.send(objResult);
});

app.get("/vendorinfor", async (req, res) => {
  console.log("query by [", req.query.user, "] for ", req.query.infor);

  var objReturn = {};
  if (req.query.infor === "buildings") {
    objReturn = build_location.map(blItem => {
      return blItem["abbr"] + " - " + blItem["building_name"];
    });
  } else if (req.query.infor === "departments") {
    objReturn = depart_list;
  }
  res.send(objReturn);
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

let fileList = [];
app.get("/submit", (req, res) => {
  fileList = [];
  res.sendFile(__dirname + "/view/submit.html");
});

let lastImgLabels = [];
app.get("/imglabels", async (req, res) => {
  res.send(lastImgLabels);
});

app.post("/upload", (req, res) => {
  new formidable.IncomingForm()
    .parse(req)
    .on("fileBegin", (name, file) => {})
    .on("field", (name, field) => {
      console.log("Field", name, field);
    })
    .on("file", async (name, file) => {
      console.log("file uploaded: ", file.name);
      const hashName = String(file.path).substring(
        String(file.path).indexOf("upload_")
      );
      fileList.push({ path: hashName, name: file.name });
      // get Google Vision Labels
      lastImgLabels = await vision.getLabels(file.path);
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
    .parse(req, (err, fields, files) => {
      if (err) {
        console.error("Error", err);
        throw err;
      }
      //console.log("Fields", fields);
      //console.log("FileList:", fileList);
      for (var i = 0, len = fileList.length; i < len; i++) {
        const poster = database.newPoster(
          fields.location,
          fields.timeStart,
          fields.timeEnd,
          fields.department,
          fields.description,
          fileList[i]["name"],
          fileList[i]["path"]
        );
        database.insertPoster(poster);
      }
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
