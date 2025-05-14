import axios from 'axios';

const API_URL = '/v1/users';

class AuthService {
  async login(email, password) {
    try {
      console.log('Login request data:', { phone: email, password });
      const response = await axios.post(`${API_URL}/login-user`, {
        phone: email,
        password
      });
      
      console.log('Login response:', response.data);
      
      // Kiểm tra cấu trúc dữ liệu phản hồi và lưu token
      if (response.data && response.data.data) {
        const { accessToken, refreshToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error.response?.data?.message || 'Đăng nhập thất bại';
    }
  }

  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post(`${API_URL}/refresh-token`, {
        refreshToken
      });

      if (response.data && response.data.data) {
        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        return accessToken;
      }
    } catch (error) {
      console.error('Refresh token error:', error);
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
        password
      });
      
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Đăng ký thất bại';
    }
  }

  async sendOTP(email) {
    try {
      const response = await axios.post(`${API_URL}/send-OTP`, {
        email
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Gửi OTP thất bại';
    }
  }

  async verifyOTP(email, otp) {
    try {
      const response = await axios.post(`${API_URL}/verify-OTP`, {
        email,
        otp
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Xác thực OTP thất bại';
    }
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getToken() {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  // Lưu thông tin đăng ký tạm thời trong quá trình xác thực OTP
  saveRegistrationData(data) {
    localStorage.setItem('registrationData', JSON.stringify(data));
  }

  getRegistrationData() {
    const dataStr = localStorage.getItem('registrationData');
    if (dataStr) return JSON.parse(dataStr);
    return null;
  }

  clearRegistrationData() {
    localStorage.removeItem('registrationData');
  }
}

export default new AuthService(); 