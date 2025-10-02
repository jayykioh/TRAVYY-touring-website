// src/utils/jwt.js
const jwt = require("jsonwebtoken");
const { randomUUID } = require("crypto");

const ACCESS_TTL  = process.env.ACCESS_TTL  || "10m";
const REFRESH_TTL = process.env.REFRESH_TTL || "30d";

function signAccess(user) {
  return jwt.sign(
    { sub: user.id, role: user.role || "Traveler" },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_TTL }
  );
}

function signRefresh({ jti, userId }) {
  return jwt.sign(
    { sid: jti, sub: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TTL, jwtid: jti }
  );
}

function verifyAccess(t)  { return jwt.verify(t, process.env.JWT_ACCESS_SECRET); }
function verifyRefresh(t) { return jwt.verify(t, process.env.JWT_REFRESH_SECRET); }
function newId()          { return randomUUID(); }

module.exports = { signAccess, signRefresh, verifyAccess, verifyRefresh, newId };
