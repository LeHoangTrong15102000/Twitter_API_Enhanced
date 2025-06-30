# 🐳 **HƯỚNG DẪN SETUP VÀ CHẠY DOCKER CHO TWITTER API**

## 📋 **YÊU CẦU HỆ THỐNG**

- ✅ Docker Desktop đã cài đặt và đang chạy
- ✅ Docker Compose version 3.8+
- ✅ Windows 10/11 hoặc macOS hoặc Linux
- ✅ Ít nhất 4GB RAM available cho Docker
- ✅ Ít nhất 10GB free disk space

---

## 🚀 **BƯỚC 1: CHUẨN BỊ FILES**

### **Kiểm tra cấu trúc thư mục:**
```
Twitter_API/
├── docker/
│   └── mongodb/
│       └── init-mongo.js      ✅ (đã tạo)
├── src/
│   ├── healthcheck.ts         ✅ (đã tạo)
│   └── ... (source code)
├── .dockerignore              ✅ (đã tạo)
├── docker.env                 ✅ (đã tạo)
├── Dockerfile                 ✅ (đã cập nhật)
├── Dockerfile.dev             ✅ (đã cập nhật)
├── docker-compose.yml         ✅ (đã cập nhật)
├── docker-compose.dev.yml     ✅ (đã tạo)
└── package.json
```

### **Tạo thư mục cần thiết:**
```bash
mkdir -p uploads/images uploads/videos logs docker/mongodb
```

---

## 🔧 **BƯỚC 2: CẤU HÌNH ENVIRONMENT**

### **Tùy chỉnh file `docker.env` (nếu cần):**

Mở file `docker.env` và cập nhật các thông tin sau theo nhu cầu:

```env
# JWT Secrets - THAY ĐỔI TRONG PRODUCTION!
JWT_SECRET_ACCESS_TOKEN=your_super_secret_access_token_2024
JWT_SECRET_REFRESH_TOKEN=your_super_secret_refresh_token_2024

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# AWS (Optional)
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_S3_BUCKET_NAME=your_s3_bucket_name
```

---

## 🛠️ **BƯỚC 3: BUILD VÀ CHẠY DOCKER**

### **Option A: Chạy Production Mode**

```bash
# Build và chạy tất cả services
docker-compose up -d

# Hoặc build lại images trước khi chạy
docker-compose up --build -d

# Xem logs
docker-compose logs -f

# Xem logs của service cụ thể
docker-compose logs -f twitter-api
```

### **Option B: Chạy Development Mode**

```bash
# Chạy với override file cho development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Build lại nếu cần
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d

# Xem logs development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f twitter-api
```

---

## 📊 **BƯỚC 4: KIỂM TRA SERVICES**

### **Kiểm tra trạng thái containers:**
```bash
docker-compose ps
```

**Output mong đợi:**
```
NAME                COMMAND                  SERVICE     STATUS    PORTS
twitter-api         "pm2-runtime start e…"   twitter-api Up        0.0.0.0:4000->4000/tcp
twitter-mongodb     "docker-entrypoint.s…"   mongodb     Up        0.0.0.0:27017->27017/tcp
twitter-redis       "docker-entrypoint.s…"   redis       Up        0.0.0.0:6379->6379/tcp
```

### **Kiểm tra health checks:**
```bash
# Kiểm tra health của tất cả services
docker-compose ps --format table

# Test API endpoint
curl http://localhost:4000/health
# Hoặc mở browser: http://localhost:4000

# Test MongoDB connection
docker exec -it twitter-mongodb mongosh -u twitter_user -p twitter_password_secure_2024 Twitter

# Test Redis connection
docker exec -it twitter-redis redis-cli ping
```

---

## 🔍 **BƯỚC 5: TEST API ENDPOINTS**

### **Test cơ bản:**
```bash
# Health check
curl http://localhost:4000/health

# API documentation (nếu có Swagger)
# Mở browser: http://localhost:4000/api-docs

# Test đăng ký user
curl -X POST http://localhost:4000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "confirm_password": "Test123456",
    "name": "Test User",
    "date_of_birth": "1990-01-01"
  }'
```

---

## 🐛 **BƯỚC 6: TROUBLESHOOTING**

### **Vấn đề thường gặp:**

#### **1. Port đã được sử dụng:**
```bash
# Kiểm tra process đang dùng port
netstat -ano | findstr :4000

# Tắt process
taskkill /PID <PID_NUMBER> /F

# Hoặc thay đổi port trong docker-compose.yml
ports:
  - "4001:4000"  # Dùng port 4001 thay vì 4000
```

#### **2. MongoDB connection failed:**
```bash
# Kiểm tra MongoDB logs
docker-compose logs mongodb

# Restart MongoDB service
docker-compose restart mongodb

# Kiểm tra MongoDB từ bên trong container
docker exec -it twitter-mongodb mongosh
```

#### **3. Build failed:**
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache

# Kiểm tra Dockerfile syntax
docker build -t test-build .
```

#### **4. Hot reload không hoạt động (Dev mode):**
```bash
# Đảm bảo volumes được mount đúng
docker-compose -f docker-compose.yml -f docker-compose.dev.yml config

# Restart development container
docker-compose -f docker-compose.yml -f docker-compose.dev.yml restart twitter-api
```

---

## 📝 **BƯỚC 7: LỆNH DOCKER HỮU ÍCH**

### **Quản lý containers:**
```bash
# Xem tất cả containers
docker-compose ps

# Stop tất cả services
docker-compose down

# Stop và xóa volumes (CẨTHẬN - Sẽ mất data!)
docker-compose down -v

# Restart service cụ thể
docker-compose restart twitter-api

# Xem logs realtime
docker-compose logs -f --tail=100 twitter-api
```

### **Debug containers:**
```bash
# Vào shell của container
docker exec -it twitter-api /bin/bash

# Xem environment variables
docker exec twitter-api env

# Xem processes đang chạy
docker exec twitter-api ps aux
```

### **Clean up:**
```bash
# Xóa containers và networks
docker-compose down

# Xóa images không sử dụng
docker image prune

# Xóa tất cả (containers, images, volumes, networks)
docker system prune -a
```

---

## 🌐 **BƯỚC 8: TRUY CẬP APPLICATION**

### **URLs quan trọng:**

- **API Base URL**: http://localhost:4000
- **Health Check**: http://localhost:4000/health
- **API Documentation**: http://localhost:4000/api-docs (nếu có)
- **MongoDB**: mongodb://twitter_user:twitter_password_secure_2024@localhost:27017/Twitter
- **Redis**: redis://localhost:6379

### **Tools để test:**
- **Postman**: Import API collection
- **MongoDB Compass**: Kết nối đến MongoDB
- **Redis Desktop Manager**: Kết nối đến Redis

---

## ⚙️ **BƯỚC 9: PRODUCTION DEPLOYMENT**

### **Để deploy lên server production:**

1. **Upload code lên server**
2. **Cập nhật environment variables trong `docker.env`**
3. **Chạy production mode:**
   ```bash
   docker-compose up -d
   ```
4. **Setup reverse proxy (Nginx)** để HTTPS
5. **Setup monitoring và logging**

---

## 🎯 **TÓM TẮT COMMANDS NHANH**

```bash
# 🚀 Khởi động nhanh (Production)
docker-compose up -d

# 🛠️ Development mode
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# 📊 Kiểm tra status
docker-compose ps

# 📝 Xem logs
docker-compose logs -f twitter-api

# 🛑 Dừng tất cả
docker-compose down

# 🔄 Restart service
docker-compose restart twitter-api

# 🧹 Clean up
docker-compose down && docker system prune -f
```

---

## ✅ **CHECKLIST HOÀN THÀNH**

- [ ] Docker Desktop đang chạy
- [ ] Tất cả files Docker đã được tạo
- [ ] Thư mục `uploads` và `logs` đã được tạo
- [ ] Environment variables đã được cấu hình
- [ ] `docker-compose up -d` chạy thành công
- [ ] Tất cả services đều ở trạng thái "Up"
- [ ] API trả về response tại http://localhost:4000
- [ ] MongoDB kết nối thành công
- [ ] Redis kết nối thành công
- [ ] Health checks đều PASS

**🎉 Chúc mừng! Dự án Twitter API đã chạy thành công trên Docker!** 