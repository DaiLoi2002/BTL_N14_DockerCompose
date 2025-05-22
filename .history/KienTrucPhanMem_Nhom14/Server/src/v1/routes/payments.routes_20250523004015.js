const express = require("express");
const router = express.Router();
const { Pay, Callback } = require("../controllers/payments.controller.js");

router.post("/create", Pay);
router.post("/callback", Callback);
module.exports = router;
