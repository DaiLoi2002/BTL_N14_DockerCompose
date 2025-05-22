const express = require("express");
const router = express.Router();
const {
  Pay,
  Callback,
  Transaction_status,
} = require("../controllers/payments.controller.js");

router.post("/callback", Callback);
router.post("/create", Pay);
router.post("/transaction", Transaction_status);
module.exports = router;
