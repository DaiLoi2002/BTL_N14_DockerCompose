import axios from "axios";

const API_URL = "/v1/users";

class AuthService {
  async login(email, password) {
    try {
      console.log("Login request data:", { phone: email, password });
      const response = await axios.post(`${API_URL}/login-user`, {
        phone: email,
        password,
      });

      console.log("Login response:", response.data);

      // Kiểm tra cấu trúc dữ liệu phản hồi và lưu token
      if (response.data && response.data.data) {
        localStorage.setItem("accessToken", response.data.data.accessToken);
        // localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(response.data.data.user));
        console.log("Token:", response.data.data.accessToken);
      }

      return response.data.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error.response?.data?.message || "Đăng nhập thất bại";
    }
  }

  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await axios.post(`${API_URL}/refresh-token`, {
        refreshToken,
      });

      if (response.data && response.data.data) {
        const { accessToken } = response.data.data;
        localStorage.setItem("accessToken", accessToken);
        return accessToken;
      }
    } catch (error) {
      console.error("Refresh token error:", error);
      this.logout();
      throw error;
    }
  }

  async register(name, username, email, phone, password) {
    try {
      const response = await axios.post(`${API_URL}/register-user`, {
        name,
        username,
        email,
        phone,
        password,
      });

      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Đăng ký thất bại";
    }
  }

  async sendOTP(email) {
    try {
      const response = await axios.post(`${API_URL}/send-OTP`, {
        email,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Gửi OTP thất bại";
    }
  }

  async verifyOTP(email, otp) {
    try {
      const response = await axios.post(`${API_URL}/verify-OTP`, {
        email,
        otp,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Xác thực OTP thất bại";
    }
  }

  logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }

  async getProfile() {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Token không tồn tại.");

      const response = await axios.get(`${API_URL}/v1/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);

      // Kiểm tra lỗi từ server
      if (error.response) {
        const status = error.response.status;
        const message =
          error.response.data.message || "Lỗi không xác định từ server";

        if (status === 401 || status === 403) {
          // Xử lý lỗi xác thực (token hết hạn hoặc không hợp lệ)
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          throw new Error(
            "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
          );
        }

        throw new Error(message);
      }

      // Lỗi mạng hoặc lỗi khác
      throw new Error("Không thể kết nối tới server. Vui lòng thử lại sau.");
    }
  }

  getToken() {
    return localStorage.getItem("accessToken");
  }

  getRefreshToken() {
    return localStorage.getItem("refreshToken");
  }
  async getCategories() {
    try {
      // const token = this.getToken();

      // if (!token) throw new Error("Không tìm thấy token");

      // Gọi API lấy danh mục
      const response = await axios.get(
        "/v1/categories" // Đảm bảo URL API là chính xác
        // {
        //   headers: {
        //     Authorization: `Bearer ${token}`,
        //   },
        // }
      );

      return response.data; // Trả về danh sách category từ response
    } catch (error) {
      console.error("Lỗi khi lấy danh mục:", error);
      throw error.response?.data?.message || "Lỗi khi lấy danh mục";
    }
  }
  isAuthenticated() {
    return !!this.getToken();
  }

  // Lưu thông tin đăng ký tạm thời trong quá trình xác thực OTP
  saveRegistrationData(data) {
    localStorage.setItem("registrationData", JSON.stringify(data));
  }

  getRegistrationData() {
    const dataStr = localStorage.getItem("registrationData");
    if (dataStr) return JSON.parse(dataStr);
    return null;
  }

  clearRegistrationData() {
    localStorage.removeItem("registrationData");
  }
}

export default new AuthService();
