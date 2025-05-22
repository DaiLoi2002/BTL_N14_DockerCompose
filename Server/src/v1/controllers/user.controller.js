const mongoose = require("mongoose");
const path = require("path");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const env = process.env.NODE_ENV || "development";
const envFile = path.resolve(__dirname, `../../.env.${env}`);
dotenv.config({ path: envFile });
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
const { withRetry } = require("../../utils/retryHandler");

// Sửa lại hàm getMyProfile
const getMyProfile = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return sendResponse(res, 404, "Không tìm thấy người dùng", null);
    }

    // Sử dụng withRetry cho thao tác database
    const userProfile = await withRetry(async () => {
      const updatedUser = await User.findById(user._id);
      return {
        _id: updatedUser._id,
        name: updatedUser.username,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      };
    });

    return sendResponse(res, 200, "Lấy thông tin cá nhân thành công", userProfile);
  } catch (error) {
    return sendResponse(res, 500, "Lỗi máy chủ nội bộ", {
      error: error.message,
    });
  }
};

// Sửa lại hàm updateProfile
const updateProfile = async (req, res) => {
  const userId = req.user._id;
  const updateData = req.body;

  try {
    // Sử dụng withRetry cho thao tác database
    const user = await withRetry(async () => {
      return await User.findById(userId);
    });

    if (!user) {
      return sendResponse(res, 404, "Người dùng không tồn tại!", null);
    }

    if (Object.keys(updateData).length === 0) {
      return sendResponse(res, 400, "Không có dữ liệu để cập nhật!", null);
    }

    const updatedUser = await withRetry(async () => {
      return await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      });
    });

    return sendResponse(res, 200, "Cập nhật thông tin cá nhân thành công!", updatedUser);
  } catch (error) {
    return sendResponse(res, 500, "Lỗi máy chủ nội bộ!", {
      error: error.message,
    });
  }
};

// Sửa lại hàm updateUserAvatar
const updateUserAvatar = async (req, res) => {
  try {
    const userId = req.user._id;
    const avatarUrl = req.file.location;

    const updatedUser = await withRetry(async () => {
      return await User.findByIdAndUpdate(
        userId,
        { image: avatarUrl },
        { new: true }
      );
    });

    if (!updatedUser) {
      return sendResponse(res, 404, false, "Không tìm thấy người dùng");
    }

    return sendResponse(res, 200, true, "Cập nhật avatar thành công", {
      user: updatedUser,
    });
  } catch (error) {
    return sendResponse(res, 500, false, "Lỗi server");
  }
};

// Sửa lại hàm sendOTP
const sendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const existingOTP = await withRetry(async () => {
      return await OTP.findOne({ email });
    });

    if (existingOTP) {
      return sendResponse(res, 400, "OTP đã được gửi, không thể gửi lại!", null);
    }

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });

    await withRetry(async () => {
      const otpRecord = new OTP({ email, otp });
      await otpRecord.save();
    });

    // ... rest of the email sending code ...
  } catch (error) {
    console.error("Lỗi khi gửi OTP:", error);
    sendResponse(res, 500, "Lỗi server!", null);
  }
};

// Sửa lại hàm verifyOTP
const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpRecord = await withRetry(async () => {
      return await OTP.findOne({ email, otp });
    });

    if (!otpRecord) {
      return sendResponse(res, 400, "Mã OTP không hợp lệ!", null);
    }

    if (otpRecord.expiresAt < new Date()) {
      return sendResponse(res, 400, "Mã OTP đã hết hạn!", null);
    }

    await withRetry(async () => {
      await OTP.deleteOne({ email });
    });

    const user = await withRetry(async () => {
      return await User.findOne({ email });
    });

    if (!user) {
      return sendResponse(res, 404, "Người dùng không tồn tại!", null);
    }

    // ... rest of the token generation code ...
  } catch (error) {
    console.error("Lỗi khi xác thực OTP:", error);
    return sendResponse(res, 500, "Lỗi server!");
  }
};

// Sửa lại hàm registerUser
const registerUser = async (req, res) => {
  try {
    const { username, phone, email, password, role } = req.body;

    if (!username || !phone || !email || !password) {
      return sendResponse(res, 400, "Vui lòng nhập đầy đủ thông tin!");
    }

    const existingUser = await withRetry(async () => {
      return await User.findOne({ $or: [{ phone }, { email }] });
    });

    if (existingUser) {
      return sendResponse(res, 409, "Email hoặc số điện thoại đã tồn tại!");
    }

    const newUser = new User({
      username,
      phone,
      email,
      password,
      role: role || "user",
    });

    await withRetry(async () => {
      await newUser.save();
    });

    return sendResponse(res, 200, "Đăng ký thành công!", newUser);
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    return sendResponse(res, 500, "Lỗi khi kết nối đến Server!");
  }
};

// Sửa lại hàm loginUser
const loginUser = async (req, res) => {
  const { phone, password } = req.body;
  try {
    const customer = await withRetry(async () => {
      return await User.findOne({ phone });
    });

    if (!customer) {
      return res.status(200).json({ 
        statusCode: 3006, 
        message: "Dữ liệu đầu vào không hợp lệ." 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, customer.password);

    if (!isPasswordValid) {
      return res.status(200).json({ 
        statusCode: 3007, 
        message: "Dữ liệu đầu vào không hợp lệ." 
      });
    }

    const accessToken = jwt.sign(
      { userId: customer._id, role: customer.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { userId: customer._id },
      process.env.JWT_REFRESH_SECRET || "refreshSecret",
      { expiresIn: "7d" }
    );

    await withRetry(async () => {
      customer.refreshToken = refreshToken;
      customer.token = accessToken;
      await customer.save();
    });

    return sendResponse(res, 200, "Đăng nhập thành công", {
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(200).json({
      statusCode: 3005,
      message: "Hệ thống bận.",
      error: error.message,
    });
  }
};

// Sửa lại hàm refreshToken
const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return sendResponse(res, 401, "Refresh token không được cung cấp!", null);
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || "refreshSecret"
    );

    const user = await withRetry(async () => {
      return await User.findOne({
        _id: decoded.userId,
        refreshToken: refreshToken,
      });
    });

    if (!user) {
      return sendResponse(res, 401, "Refresh token không hợp lệ!", null);
    }

    const newAccessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    await withRetry(async () => {
      user.token = newAccessToken;
      await user.save();
    });

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

// ... rest of the exports ... 