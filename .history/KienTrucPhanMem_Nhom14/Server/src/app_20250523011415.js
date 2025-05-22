const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./v1/config/db");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
app.use(express.json()); // bắt buộc để parse req.body từ MoMo
const {
  apiLimiter,
  authLimiter,
  uploadLimiter,
} = require("./v1/middlewares/rateLimiter");

// Tạo ứng dụng Express
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(compression());

// Static file
app.use("/images", express.static(path.join(__dirname, "../images")));

// Kết nối MongoDB
connectDB();

// Apply rate limiters
app.use("/v1/auth", authLimiter); // Rate limit cho các routes authentication
app.use("/v1/upload", uploadLimiter); // Rate limit cho các routes upload
app.use("/v1", apiLimiter); // Rate limit cho tất cả các API routes khác

// Routes v1
app.use("/v1/users", require("./v1/routes/user.routes"));
app.use("/v1/admin", require("./v1/routes/admin.routes"));
app.use("/v1/categories", require("./v1/routes/category.route"));
app.use("/v1/products", require("./v1/routes/product.routes"));
app.use("/v1/payments", require("./v1/routes/payments.routes"));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
});

module.exports = app; // Xuất ứng dụng để dùng trong các file khác
