const express = require("express");
const axios = require("axios");
const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const CryptoJS = require("crypto-js");
const { response } = require("../../app");

var accessKey = "F8BBA842ECF85";
var secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
const Pay = async (req, res) => {
  //https://developers.momo.vn/#/docs/en/aiov2/?id=payment-method
  //parameters

  var orderInfo = "pay with MoMo";
  var partnerCode = "MOMO";
  var redirectUrl = "https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b";
  var ipnUrl =
    "https://67f0-2402-800-63a9-e252-24dd-187b-183a-c2e0.ngrok-free.app/v1/payments/callback";
  var requestType = "payWithMethod";
  var amount = "50000";
  var orderId = partnerCode + new Date().getTime();
  var requestId = orderId;
  var extraData = "";
  var orderGroupId = "";
  var autoCapture = true;
  var lang = "vi";

  //before sign HMAC SHA256 with format
  //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
  var rawSignature =
    "accessKey=" +
    accessKey +
    "&amount=" +
    amount +
    "&extraData=" +
    extraData +
    "&ipnUrl=" +
    ipnUrl +
    "&orderId=" +
    orderId +
    "&orderInfo=" +
    orderInfo +
    "&partnerCode=" +
    partnerCode +
    "&redirectUrl=" +
    redirectUrl +
    "&requestId=" +
    requestId +
    "&requestType=" +
    requestType;
  //puts raw signature
  console.log("--------------------RAW SIGNATURE----------------");
  console.log(rawSignature);
  //signature
  const crypto = require("crypto");
  var signature = crypto
    .createHmac("sha256", secretKey)
    .update(rawSignature)
    .digest("hex");
  console.log("--------------------SIGNATURE----------------");
  console.log(signature);

  //json object send to MoMo endpoint
  const requestBody = JSON.stringify({
    partnerCode: partnerCode,
    partnerName: "Test",
    storeId: "MomoTestStore",
    requestId: requestId,
    amount: amount,
    orderId: orderId,
    orderInfo: orderInfo,
    redirectUrl: redirectUrl,
    ipnUrl: ipnUrl,
    lang: lang,
    requestType: requestType,
    autoCapture: autoCapture,
    extraData: extraData,
    orderGroupId: orderGroupId,
    signature: signature,
  });
  //option for axios
  const options = {
    method: "POST",
    url: "https://test-payment.momo.vn/v2/gateway/api/create",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(requestBody),
    },
    data: requestBody,
  };
  let result;
  try {
    result = await axios(options);
    console.log(result.data);
    res.status(200).json({
      status: "success",
      message: "Payment created successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to create payment",
      error: error.message,
    });
  }
};
const Callback = async (req, res) => {
  try {
    console.log("Callback OK");
    console.log(req.body);
    res.status(200).json(req.body);
  } catch (error) {
    console.error("Error in Callback:", error);
    res.status(500).send("Internal Server Error");
  }
};
const Transaction_status = async (req, res) => {
  const { orderId } = req.body;
  const rawSignature = `accessKey=${accessKey}&orderId=${orderId}&partnerCode=MOMO&requestId=${orderId}`;

  const signature = CryptoJS.createHmac("sha256", secretKey)
    .update(rawSignature)
    .digest("hex");
  const requestBody = JSON.stringify({
    partnerCode: "MOMO",
    orderId: orderId,
    requestId: orderId,
    signature: signature,
    lang: "vi",
  });
  //OPting for axios
  const options = {
    method: "POST",
    url: "https://test-payment.momo.vn/v2/gateway/api/query",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(requestBody),
    },
    data: requestBody,
  };
  let result = await axios(options);
  res.status(200).json(result.data);
};
module.exports = { Pay, Callback };
