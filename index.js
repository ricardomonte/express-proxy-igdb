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
        "fields name,rating,genres.name,cover.url,release_dates,slug,storyline,summary,url,websites,platforms.abbreviation; limit 40;where screenshots > 1 & cover > 1 & platforms = {48,49,6} & genres > 1 & rating > 70;sort rating desc;",
    })
      .then((data) => data.json())
      .then((json) => {
        res.json(cleanDataAll(json));
      });
  });
});

app.get("/games/:id", (req, res) => {
  getToken.then((response) => {
    fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Client-ID": process.env.CLIENT_ID,
        Authorization: `Bearer ${response}`,
      },
      body: `fields name,rating,genres.name,cover.url,storyline,summary,release_dates.human,screenshots.url,platforms.abbreviation,platforms.platform_logo.url;where id = ${req.params.id};`,
    })
      .then((response) => response.json())
      .then((json) => {
        res.json(cleanDataOnly(json));
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

function cleanDataAll(data) {
  return data.map((dat) => ({
    id: dat.id,
    name: dat.name,
    cover: dat.cover.url.replace("thumb", "cover_big"),
    genre: dat.genres ? dat.genres[0].name : "",
    rating: dat.rating,
  }));
}

function cleanDataOnly(data) {
  return data.map((dat) => ({
    id: dat.id,
    name: dat.name,
    cover: dat.cover.url.replace("thumb", "cover_big"),
    screen1: dat.screenshots[0]
      ? dat.screenshots[0].url.replace("thumb", "cover_big")
      : "",
    screen2: dat.screenshots[1]
      ? dat.screenshots[1].url.replace("thumb", "cover_big")
      : "",
    screen3: dat.screenshots[2]
      ? dat.screenshots[2].url.replace("thumb", "cover_big")
      : "",
    [dat.platforms[0].abbreviation]: dat.platforms[0].abbreviation,
    [dat.platforms[1].abbreviation]: dat.platforms[1].abbreviation,
    [dat.platforms[2].abbreviation]: dat.platforms[2].abbreviation,
    [dat.platforms[0].abbreviation + "release"]: dat.release_dates[0].human,
    [dat.platforms[1].abbreviation + "release"]: dat.release_dates[1].human,
    [dat.platforms[2].abbreviation + "release"]: dat.release_dates[2].human,
    [dat.platforms[0].abbreviation + "logo"]: dat.platforms[0].platform_logo
      .url,
    [dat.platforms[1].abbreviation + "logo"]: dat.platforms[1].platform_logo
      .url,
    [dat.platforms[2].abbreviation + "logo"]: dat.platforms[2].platform_logo
      .url,
    summary: dat.summary || "",
    storyline: data.storyline || "",
    genre: dat.genres ? dat.genres[0].name : "",
    rating: dat.rating,
  }));
}

app.use(notFound);
app.use(errorHandle);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`listening port ${port}`);
});
