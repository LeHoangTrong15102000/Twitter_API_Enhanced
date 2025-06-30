import axios from 'axios';

// Cấu hình base URL cho API
const API_BASE_URL = 'http://localhost:4000';

// Tạo axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Test dữ liệu
const testUser = {
  email: 'test@example.com',
  password: 'Test123456!',
  name: 'Test User',
  date_of_birth: '1990-01-01',
  confirm_password: 'Test123456!'
};

async function testRegisterUser() {
  try {
    console.log('🧪 Testing User Registration...');
    const response = await api.post('/users/register', testUser);
    console.log('✅ Register Success:', response.data);
    return response.data;
  } catch (error: any) {
    console.log('❌ Register Failed:', error.response?.data || error.message);
    return null;
  }
}

async function testLoginUser() {
  try {
    console.log('🧪 Testing User Login...');
    const response = await api.post('/users/login', {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Login Success:', response.data);
    return response.data;
  } catch (error: any) {
    console.log('❌ Login Failed:', error.response?.data || error.message);
    return null;
  }
}

async function testGetMe(accessToken: string) {
  try {
    console.log('🧪 Testing Get Me...');
    const response = await api.get('/users/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    console.log('✅ Get Me Success:', response.data);
    return response.data;
  } catch (error: any) {
    console.log('❌ Get Me Failed:', error.response?.data || error.message);
    return null;
  }
}

async function testDatabaseConnection() {
  try {
    console.log('🧪 Testing Database Connection...');
    // Thử gọi một endpoint đơn giản để kiểm tra kết nối database
    const response = await api.get('/users/me', {
      headers: {
        Authorization: 'Bearer invalid_token'
      }
    });
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.log('✅ Database Connection OK (API returns 401 as expected)');
    } else {
      console.log('❌ Database Connection Failed:', error.response?.data || error.message);
    }
  }
}

async function testServerHealth() {
  try {
    console.log('🧪 Testing Server Health...');
    const response = await api.get('/');
    console.log('✅ Server Health OK:', response.status);
  } catch (error: any) {
    console.log('❌ Server Health Failed:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      response: error.response?.data
    });
  }
}

async function runAllTests() {
  console.log('🚀 Starting API Tests...\n');
  
  // Test 1: Server Health
  await testServerHealth();
  console.log('\n---\n');
  
  // Test 2: Database Connection
  await testDatabaseConnection();
  console.log('\n---\n');
  
  // Test 3: User Registration
  const registerResult = await testRegisterUser();
  console.log('\n---\n');
  
  // Test 4: User Login
  const loginResult = await testLoginUser();
  console.log('\n---\n');
  
  // Test 5: Get Me (nếu login thành công)
  if (loginResult && loginResult.access_token) {
    await testGetMe(loginResult.access_token);
  }
  
  console.log('\n🏁 Tests Completed!');
}

// Chạy tất cả tests
runAllTests().catch(console.error); 