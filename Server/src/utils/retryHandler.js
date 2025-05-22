const axios = require('axios');
const axiosRetry = require('axios-retry');

// Tạo instance axios với cấu hình retry
const createAxiosInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    timeout: 10000, // timeout 10 giây
  });

  // Cấu hình retry
  axiosRetry(instance, {
    retries: 3,
    retryDelay: (retryCount) => {
      return retryCount * 1000; // Delay tăng dần: 1s, 2s, 3s
    },
    retryCondition: (error) => {
      // Thử lại khi có lỗi mạng hoặc lỗi server 5xx
      return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
             (error.response && error.response.status >= 500);
    },
    onRetry: (retryCount, error, requestConfig) => {
      console.log(`[Retry] Lần thử lại thứ ${retryCount} cho ${requestConfig.url}`);
    }
  });

  return instance;
};

// Hàm wrapper để xử lý retry cho các thao tác database
const withRetry = async (operation, maxRetries = 3) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.log(`[Retry] Lần thử lại thứ ${attempt} thất bại:`, error.message);
      
      // Nếu là lỗi kết nối database hoặc lỗi server
      if (error.name === 'MongoError' || error.name === 'MongoServerError' || 
          error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        // Đợi một khoảng thời gian trước khi thử lại
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        continue;
      }
      
      // Nếu là lỗi khác, không retry
      throw error;
    }
  }
  
  throw lastError;
};

module.exports = {
  createAxiosInstance,
  withRetry
}; 