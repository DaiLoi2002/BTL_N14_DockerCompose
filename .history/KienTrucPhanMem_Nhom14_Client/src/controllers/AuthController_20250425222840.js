import AuthService from '../services/AuthService';
import User from '../models/User';

class AuthController {
  async login(email, password) {
    try {
      const response = await AuthService.login(email, password);
      return User.fromJson(response);
    } catch (error) {
      throw error;
    }
  }

  async register(name, email, password) {
    try {
      const response = await AuthService.register(name, email, password);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async sendOTP(email) {
    try {
      const response = await AuthService.sendOTP(email);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async verifyOTP(email, otp) {
    try {
      const response = await AuthService.verifyOTP(email, otp);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async completeRegistration(name, username, email, phone, password) {
    try {
      // Sau khi xác thực OTP thành công, tiến hành đăng ký tài khoản
      const response = await AuthService.register(name, username, email, phone, password);
      // Xóa dữ liệu đăng ký tạm thời
      AuthService.clearRegistrationData();
      return response;
    } catch (error) {
      throw error;
    }
  }

  saveRegistrationData(data) {
    AuthService.saveRegistrationData(data);
  }

  getRegistrationData() {
    return AuthService.getRegistrationData();
  }

  clearRegistrationData() {
    AuthService.clearRegistrationData();
  }

  logout() {
    AuthService.logout();
  }

  getCurrentUser() {
    const userData = AuthService.getCurrentUser();
    return userData ? User.fromJson(userData) : null;
  }

  isAuthenticated() {
    return AuthService.isAuthenticated();
  }
}

export default new AuthController(); 