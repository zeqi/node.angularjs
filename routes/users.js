var express = require('express');
var router = express.Router();

var users = require("../users").users;

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send(users);
});

router.get('/:id', function (req, res, next) {
  res.send(users[req.params.id]);
});

router.delete("/:id", function (req, res, next) {
  delete users[req.params.id];
  res.send(users);
});

router.put("/", function (req, res, next) {
  users[req.body.id] = req.body;
  res.send(users);
});

router.post("/", function (req, res, next) {
  users[req.body.id] = req.body;
  res.send(users);
});

module.exports = router;
