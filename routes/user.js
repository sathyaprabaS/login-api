var express = require("express");
var router = express.Router();

const userController = require("../controllers/userController");

const use = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);


router.post("/login", use(userController.login));
router.post("/signup", use(userController.signup));
router.get("/logout", use(userController.logout));

module.exports = router;
