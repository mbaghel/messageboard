/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
var MongoClient = require("mongodb");

const CONNECTION_STRING = process.env.DB;
let messageDb;
MongoClient.connect(
  CONNECTION_STRING,
  (err, db) => {
    if (err) {
      console.log(err);
    }
    messageDb = db;
  }
);

module.exports = function(app) {
  app.route("/api/threads/:board").post(function(req, res) {
    const board = req.params.board;
    const text = req.body.text;
    const deletePass = req.body.delete_password;

    res.end();
  });
  app.route("/api/replies/:board");
};
