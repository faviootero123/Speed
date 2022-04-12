const { env } = require("process");

const target = env.ASPNETCORE_HTTPS_PORT
  ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}`
  : env.ASPNETCORE_URLS
  ? env.ASPNETCORE_URLS.split(";")[0]
  : "http://localhost:24483";

const PROXY_CONFIG = [
  {
    context: ["/weatherforecast", "/game"],
    target: target,
    secure: false,
    headers: {
      Connection: "Keep-Alive",
    },
  },
  {
    context: ["/game"],
    target: target,
    secure: false,
    ws: true,
  },
];

module.exports = PROXY_CONFIG;
