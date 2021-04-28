const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const fetch = require("node-fetch");
require("dotenv").config();

const { getToken } = require("./getToken");
let ids;

const app = express();
app.use(morgan("tiny"));
app.use(cors());

app.get("/games", (req, res) => {
  getToken.then((respons) => {
    fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Client-ID": process.env.CLIENT_ID,
        Authorization: `Bearer ${respons}`,
      },
      body:
        "fields name,cover.url,release_dates,screenshots,slug,storyline,summary,url,websites; limit 33;where screenshots > 1 & cover > 1 & platforms = [48,49,6];sort rating desc;",
    })
      .then((data) => data.json())
      .then((json) => {
        res.json(cleanDataAll(json));
      });
  });
});

app.get("/games/images", (req, res) => {
  getToken.then((response) => {
    fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Client-ID": process.env.CLIENT_ID,
        Authorization: `Bearer ${response}`,
      },
      body:
        "fields name; limit 33;where screenshots > 1 & cover > 1 & platforms = [48,49,6];sort rating desc;",
    })
      .then((response) => response.json())
      .then((json) => {
        ids = getIds(json);
        console.log(ids);
        fetch("https://api.igdb.com/v4/games", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Client-ID": process.env.CLIENT_ID,
            Authorization: `Bearer ${response}`,
          },
          body:
            "fields screenshots.*; limit 33;" +
            lelele(ids) +
            ";where screenshots > 1 & cover > 1 & platforms = [48,49,6];sort rating desc;",
        })
          .then((data) => data.json())
          .then((dat) => {
            res.json(cleanDataImages(dat));
          });
      });
  });
});

app.get("/games/platforms", (req, res) => {
  getToken.then((response) => {
    fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Client-ID": process.env.CLIENT_ID,
        Authorization: `Bearer ${response}`,
      },
      body:
        "fields name,platforms.abbreviation,platforms.platform_logo.url;limit 33;where screenshots > 1 & cover > 1 & platforms = [48,49,6];sort rating desc;",
    })
      .then((response) => response.json())
      .then((json) => {
        res.json(cleanDataPlatforms(json));
      });
  });
});

function notFound(req, res, next) {
  res.status(404);
  const error = new Error("not found");
  next(error);
}

function errorHandle(error, req, res, next) {
  res.status(res.statusCode || 500);
  res.json({
    message: error.message,
  });
}

function getIds(somethin) {
  return somethin.map((lala) => lala.id);
}

function lelele(ids) {
  ids.forEach((id) => {
    return `where id = ${id.toString()}`;
  });
}

function cleanDataAll(data) {
  return data.map((dat) => ({
    id: dat.id,
    name: dat.name,
    cover: dat.cover.url.replace("thumb", "cover_big"),
    slug: dat.slug,
    storyline: dat.storyline || "",
    summary: dat.summary,
  }));
}

function cleanDataImages(data) {
  return data.map((dat) => ({
    id: dat.id,
    screenshoot: dat.screenshots.map((screen) =>
      screen.url.replace("thumb", "screenshot_med")
    ),
  }));
}

function cleanDataPlatforms(data) {
  return data.map((dat) => ({
    platformsName: dat.platforms.map((plat) => plat.abbreviation),
    platformsImage: dat.platforms.map((plat) => plat.platform_logo.url),
  }));
}

app.use(notFound);
app.use(errorHandle);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`listening port ${port}`);
});
