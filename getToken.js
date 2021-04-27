const fetch = require("node-fetch");

const getToken = fetch(
  `https://id.twitch.tv/oauth2/token?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&grant_type=client_credentials`,
  {
    method: "POST",
  }
)
  .then((res) => res.json())
  .then((json) => {
    return json.access_token;
  });

module.exports = {
  getToken,
};
