const mongoose = require("mongoose"); // Nhập mongoose vào đầu file
const path = require("path");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const env = process.env.NODE_ENV || "development"; // default to 'development'
const envFile = path.resolve(__dirname, `../../.env.${env}`);
dotenv.config({ path: envFile });
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");

const OTP = require("../models/otp.model"); // Đảm bảo đường dẫn đúng
const User = require("../models/user.model"); // Đảm bảo đường dẫn đúng
const Product = require("../models/product.model.js"); // Đảm bảo đường dẫn đúng
const { sendResponse } = require("./response.handler.js");

const sendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    // Kiểm tra xem email đã tồn tại trong collection OTP chưa
    const existingOTP = await OTP.findOne({ email });

    if (existingOTP) {
      // Nếu email đã tồn tại, trả về thông báo lỗi
      sendResponse(res, 400, "OTP đã được gửi, không thể gửi lại!", null);
    }

    // Tạo mã OTP ngẫu nhiên
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });

    // Lưu OTP vào database
    const otpRecord = new OTP({ email, otp });
    await otpRecord.save();

    // Gửi email chứa mã OTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Sử dụng mật khẩu ứng dụng
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Mã OTP của bạn",
      text: `Mã OTP của bạn là: ${otp}. Mã này có hiệu lực trong 5 phút.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Lỗi khi gửi email:", error);
        sendResponse(res, 500, "Lỗi khi gửi email!", null);
      } else {
        console.log("Email đã được gửi: " + info.response);
        sendResponse(res, 200, "Mã OTP đã được gửi qua email!", null);
      }
    });
  } catch (error) {
    console.error("Lỗi khi gửi OTP:", error);
    sendResponse(res, 500, "Lỗi server!", null);
  }
};
const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Tìm OTP trong database
    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      return sendResponse(res, 400, "Mã OTP không hợp lệ!", null);
    }

    // Kiểm tra xem OTP đã hết hạn chưa
    if (otpRecord.expiresAt < new Date()) {
      return sendResponse(res, 400, "Mã OTP đã hết hạn!", null);
    }

    // Xóa OTP sau khi xác thực thành công
    await OTP.deleteOne({ email });

    // Tìm người dùng bằng email
    const user = await User.findOne({ email });
    if (!user) {
      return sendResponse(res, 404, "Người dùng không tồn tại!", null);
    }

    // Tạo access token
    let accessToken;
    try {
      accessToken = jwt.sign(
        { userId: user._id }, // Payload
        process.env.JWT_SECRET, // Secret key
        { expiresIn: "1h" } // Thời gian hết hạn của token
      );
    } catch (error) {
      console.error("Lỗi khi tạo access token:", error);
      return sendResponse(res, 500, "Lỗi server!");
    }

    // Lưu access token vào database
    user.token = accessToken;
    await user.save();

    return sendResponse(res, 200, "Xác thực OTP thành công!", {
      accessToken,
    });
  } catch (error) {
    console.error("Lỗi khi xác thực OTP:", error);
    return sendResponse(res, 500, "Lỗi server!");
  }
};
const registerUser = async (req, res) => {
  try {
    console.log("Dữ liệu nhận được:", req.body);

    const { username, phone, email, password, role } = req.body;

    // Kiểm tra nếu thiếu dữ liệu
    if (!username || !phone || !email || !password) {
      sendResponse(res, 400, "Vui lòng nhập đầy đủ thông tin!");
    }

    // Kiểm tra email hoặc số điện thoại đã tồn tại
    const existingUser = await User.findOne({ $or: [{ phone }, { email }] });
    if (existingUser) {
      sendResponse(res, 409, "Email hoặc số điện thoại đã tồn tại!");
    }

    // Tạo người dùng mới
    const newUser = new User({
      username,
      phone,
      email,
      password,
      role: role || "user",
    });

    // Lưu vào database
    await newUser.save();
    console.log("Người dùng mới được tạo:", newUser);
    sendResponse(res, 200, `Đăng ký thành công!`, newUser);
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    // return res.status(500).json({ statusCode: 500, message: "Lỗi server!" });
    sendResponse(res, 500, `Lỗi khi kết nối đến Server!`);
  }
};
const loginUser = async (req, res) => {
  const { phone, password } = req.body;
  try {
    console.log("Login attempt with:", { phone });
    const customer = await User.findOne({ phone });

    if (!customer) {
      console.log("User not found with phone:", phone);
      return res
        .status(200)
        .json({ statusCode: 3006, message: "Dữ liệu đầu vào không hợp lệ." }); // Khách hàng không tồn tại
    }

    console.log("Found user:", {
      username: customer.username,
      phone: customer.phone,
      role: customer.role,
    });

    const isPasswordValid = await bcrypt.compare(password, customer.password);
    console.log("Password validation:", isPasswordValid);

    if (!isPasswordValid) {
      console.log("Invalid password for user:", customer.username);
      return res
        .status(200)
        .json({ statusCode: 3007, message: "Dữ liệu đầu vào không hợp lệ." }); // Sai mật khẩu
    }

    // Tạo access token
    const accessToken = jwt.sign(
      { userId: customer._id, role: customer.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Tạo refresh token
    const refreshToken = jwt.sign(
      { userId: customer._id },
      process.env.JWT_REFRESH_SECRET || "refreshSecret",
      { expiresIn: "7d" }
    );

    // Lưu refresh token vào database
    customer.refreshToken = refreshToken;
    customer.token = accessToken;
    await customer.save();

    const responseData = {
      accessToken,
      refreshToken,
    };

    console.log("Login successful, sending response:", responseData);

    // Trả về thông tin người dùng và token
    return sendResponse(res, 200, "Đăng nhập thành công", responseData);
  } catch (error) {
    console.error("Login error:", error);
    res.status(200).json({
      statusCode: 3005,
      message: "Hệ thống bận.",
      error: error.message,
    });
  }
};

const getMyProfile = async (req, res) => {
  try {
    // Lấy thông tin người dùng từ request (được thêm bởi middleware authenticateUserToken)
    const user = req.user;

    // Kiểm tra xem người dùng có tồn tại không
    if (!user) {
      return sendResponse(res, 404, "Không tìm thấy người dùng", null);
    }

    // Trả về thông tin người dùng (loại bỏ các trường nhạy cảm như mật khẩu)
    const userProfile = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    // Sử dụng hàm sendResponse để trả về response
    return sendResponse(
      res,
      200,
      "Lấy thông tin cá nhân thành công",
      userProfile
    );
  } catch (error) {
    // Sử dụng hàm sendResponse để trả về lỗi
    return sendResponse(res, 500, "Lỗi máy chủ nội bộ", {
      error: error.message,
    });
  }
};
const getAllProducts = async (req, res) => {
  try {
    // Lấy tất cả sản phẩm từ database
    const products = await Product.find();

    // Trả về danh sách sản phẩm
    return sendResponse(
      res,
      200,
      "Lấy danh sách sản phẩm thành công!",
      products
    );
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sản phẩm:", error);
    return sendResponse(res, 500, "Lỗi máy chủ nội bộ!", {
      error: error.message,
    });
  }
};
const updateProfile = async (req, res) => {
  const userId = req.user._id;

  const updateData = req.body;
  try {
    // Kiểm tra xem người dùng có tồn tại không
    const user = await User.findById(userId);
    if (!user) {
      console.log("Lỗi: Người dùng không tồn tại!");
      return sendResponse(res, 404, "Người dùng không tồn tại!", null);
    }

    // Kiểm tra xem có dữ liệu nào để cập nhật không
    if (Object.keys(updateData).length === 0) {
      console.log("Lỗi: Không có dữ liệu để cập nhật!");
      return sendResponse(res, 400, "Không có dữ liệu để cập nhật!", null);
    }

    // Cập nhật thông tin cá nhân
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true, // Trả về người dùng đã được cập nhật
      runValidators: true, // Kiểm tra tính hợp lệ của dữ liệu
    });

    // Log thông tin người dùng đã cập nhật
    console.log("Người dùng đã cập nhật:", updatedUser);

    // Trả về thông tin người dùng đã cập nhật
    return sendResponse(
      res,
      200,
      "Cập nhật thông tin cá nhân thành công!",
      updatedUser
    );
  } catch (error) {
    console.error("Lỗi khi cập nhật thông tin cá nhân:", error);
    return sendResponse(res, 500, "Lỗi máy chủ nội bộ!", {
      error: error.message,
    });
  }
};
// Hàm cập nhật avatar sử dụng sendResponse
const updateUserAvatar = async (req, res) => {
  try {
    const userId = req.user._id;
    const avatarUrl = req.file.location;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { image: avatarUrl },
      { new: true }
    );

    if (!updatedUser) {
      return sendResponse(res, 404, false, "Không tìm thấy người dùng");
    }

    return sendResponse(res, 200, true, "Cập nhật avatar thành công", {
      user: updatedUser,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật avatar:", error);
    return sendResponse(res, 500, false, "Lỗi server");
  }
};

// Thêm hàm refresh token
const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return sendResponse(res, 401, "Refresh token không được cung cấp!", null);
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || "refreshSecret"
    );

    // Tìm user với refresh token này
    const user = await User.findOne({
      _id: decoded.userId,
      refreshToken: refreshToken,
    });

    if (!user) {
      return sendResponse(res, 401, "Refresh token không hợp lệ!", null);
    }

    // Tạo access token mới
    const newAccessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Cập nhật access token trong database
    user.token = newAccessToken;
    await user.save();

    return sendResponse(res, 200, "Token đã được làm mới!", {
      accessToken: newAccessToken,
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return sendResponse(res, 401, "Refresh token đã hết hạn!", null);
    }
    return sendResponse(res, 500, "Lỗi server!", null);
  }
};

module.exports = {
  registerUser,
  loginUser,
  sendOTP,
  verifyOTP,
  getMyProfile,
  getAllProducts,
  updateProfile,
  updateUserAvatar,
  refreshToken,
};
