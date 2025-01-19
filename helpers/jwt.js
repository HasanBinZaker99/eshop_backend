const { expressjwt: expressJwt } = require("express-jwt");

function authJwt() {
  const secret = process.env.secret;
  const api = process.env.API_URL;
  return expressJwt({
    secret,
    algorithms: ["HS256"],
    isRevoked: isRevoked,
  }).unless({
    path: [
      {
        url: /\/public\/uploads(.*)/,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      },
      {
        url: /\/api\/v1\/products(.*)/,
        methods: ["GET", "POST", "OPTIONS", "PUT"],
      },
      {
        url: /\/api\/v1\/categories(.*)/,
        methods: ["GET", "OPTIONS", "POST", "PUT"],
      },
      {
        url: /\/api\/v1\/users(.*)/,
        methods: ["GET", "POST", "DELETE", "OPTIONS", "PUT"],
      },
      {
        url: /\/api\/v1\/orders(.*)/,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      },

      `${api}/users/login`,
      `${api}/users/register`,
    ],
  });
}
async function isRevoked(req, payload, done) {
  if (!payload.isAdmin) {
    return done(null, true);
  }
  done();
}
module.exports = authJwt;
