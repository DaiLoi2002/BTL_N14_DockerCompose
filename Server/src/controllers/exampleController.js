const { createAxiosInstance, withRetry } = require('../utils/retryHandler');

// Tạo instance cho API bên ngoài
const externalApi = createAxiosInstance('https://api.example.com');

const exampleController = {
  async getData(req, res) {
    try {
      const data = await withRetry(async () => {
        const response = await externalApi.get('/some-endpoint');
        return response.data;
      });
      
      res.json(data);
    } catch (error) {
      res.status(error.response?.status || 500).json({
        error: 'Lỗi khi lấy dữ liệu',
        message: error.message
      });
    }
  },

  async postData(req, res) {
    try {
      const data = await withRetry(async () => {
        const response = await externalApi.post('/some-endpoint', req.body);
        return response.data;
      });
      
      res.json(data);
    } catch (error) {
      res.status(error.response?.status || 500).json({
        error: 'Lỗi khi gửi dữ liệu',
        message: error.message
      });
    }
  }
};

module.exports = exampleController; 