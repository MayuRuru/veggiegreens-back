const express = require("express");
const router = express.Router();

router
  .route("/")
  .get() //controller
  .post()
  .patch()
  .delete();

module.exports = router;
