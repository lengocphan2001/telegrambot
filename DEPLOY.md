# Hướng Dẫn Deploy Telegram Bot System lên VPS

Hướng dẫn chi tiết để deploy hệ thống Telegram Bot (Bot, API Server, Admin Panel) lên VPS sử dụng Nginx và PM2.

## 📋 Yêu Cầu

- VPS với Ubuntu 20.04+ hoặc Debian 11+
- Node.js 18+ đã được cài đặt
- PostgreSQL đã được cài đặt và cấu hình
- Domain name (tùy chọn, có thể dùng IP)
- Quyền root hoặc sudo

## 🔧 Bước 1: Chuẩn Bị VPS

### 1.1. Cập nhật hệ thống

```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2. Cài đặt Node.js (nếu chưa có)

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Kiểm tra version
```

### 1.3. Cài đặt PostgreSQL (nếu chưa có)

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 1.4. Cài đặt Nginx

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 1.5. Cài đặt PM2

```bash
sudo npm install -g pm2
pm2 --version  # Kiểm tra version
```

## 📦 Bước 2: Upload Code lên VPS

### 2.1. Tạo thư mục project

```bash
sudo mkdir -p /var/www/telegram-bot
sudo chown $USER:$USER /var/www/telegram-bot
```

### 2.2. Upload code (sử dụng git hoặc scp)

**Option 1: Sử dụng Git**
```bash
cd /var/www/telegram-bot
git clone <your-repo-url> .
```

**Option 2: Sử dụng SCP (từ máy local)**
```bash
scp -r /path/to/telegram-bot/* user@your-vps-ip:/var/www/telegram-bot/
```

## 🔐 Bước 3: Cấu Hình Database

### 3.1. Tạo database và user

```bash
sudo -u postgres psql
```

Trong PostgreSQL console:
```sql
CREATE DATABASE telegram_bot;
CREATE USER telegram_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE telegram_bot TO telegram_user;
\q
```

### 3.2. Cấu hình PostgreSQL để chấp nhận connections

```bash
sudo nano /etc/postgresql/*/main/postgresql.conf
```

Tìm và sửa:
```
listen_addresses = 'localhost'
```

```bash
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

Thêm dòng:
```
local   telegram_bot    telegram_user    md5
host    telegram_bot    telegram_user    127.0.0.1/32    md5
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

## ⚙️ Bước 4: Cấu Hình Environment Variables

### 4.1. Tạo file .env

```bash
cd /var/www/telegram-bot
nano .env
```

Thêm các biến môi trường:

```env
# Database
DATABASE_URL=postgresql://telegram_user:your_secure_password@localhost:5432/telegram_bot

# Telegram Bot
TG_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_GROUP=Aetheriavietnam

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_admin_password
ADMIN_EMAIL=admin@example.com
ADMIN_CHAT_ID=-1003490683472
ADMIN_USERNAME_TELEGRAM=tonyctyp

# API
API_PORT=3001
JWT_SECRET=your_very_secure_jwt_secret_key_change_this

# BNB Listener (nếu cần)
QUICKNODE_WSS=your_quicknode_wss_url
RECEIVE_WALLET=0xaB109189c67d8c4EcC130002e001251a6E700931

# Hero Contract
HERO_CONTRACT=0x15E7ca18F73574112A5fd1d29c93cec0B42C1AAD
```

### 4.2. Tạo file .env cho admin panel

```bash
cd /var/www/telegram-bot/admin
nano .env
```

```env
VITE_API_URL=http://nhandinhbongda.io.vn/api
# hoặc nếu dùng IP:
# VITE_API_URL=http://your-vps-ip/api
```

## 🗄️ Bước 5: Setup Database

### 5.1. Cài đặt dependencies

```bash
cd /var/www/telegram-bot
npm install
```

### 5.2. Setup database schema

```bash
npm run setup-db
```

### 5.3. Seed admin user

```bash
npm run seed-admin
```

## 🏗️ Bước 6: Build Admin Panel

### 6.1. Cài đặt dependencies cho admin

```bash
cd /var/www/telegram-bot/admin
npm install
```

### 6.2. Build production

```bash
npm run build
```

File build sẽ được tạo trong thư mục `admin/dist`

## 🚀 Bước 7: Chạy Services với PM2

### 7.1. Tạo file cấu hình PM2

```bash
cd /var/www/telegram-bot
nano ecosystem.config.cjs
```

Thêm nội dung sau:

```javascript
module.exports = {
  apps: [
    {
      name: 'telegram-bot',
      script: 'src/bot/server.js',
      cwd: '/var/www/telegram-bot',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/bot-error.log',
      out_file: './logs/bot-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      watch: false
    },
    {
      name: 'telegram-api',
      script: 'src/api/server.js',
      cwd: '/var/www/telegram-bot',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      watch: false
    }
    // Uncomment nếu cần chạy listener
    // {
    //   name: 'telegram-listener',
    //   script: 'src/listener/index.js',
    //   cwd: '/var/www/telegram-bot',
    //   instances: 1,
    //   exec_mode: 'fork',
    //   env: {
    //     NODE_ENV: 'production'
    //   },
    //   error_file: './logs/listener-error.log',
    //   out_file: './logs/listener-out.log',
    //   log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    //   merge_logs: true,
    //   autorestart: true,
    //   max_restarts: 10,
    //   min_uptime: '10s',
    //   watch: false
    // }
  ]
};
```

### 7.2. Tạo thư mục logs

```bash
mkdir -p /var/www/telegram-bot/logs
```

### 7.3. Khởi động tất cả services với PM2

```bash
cd /var/www/telegram-bot
pm2 start ecosystem.config.cjs
```

### 7.4. Lưu cấu hình PM2 để tự động khởi động khi reboot

```bash
pm2 save
pm2 startup
# Chạy lệnh được hiển thị (thường là sudo env PATH=...)
```

### 7.5. Các lệnh PM2 hữu ích

```bash
# Xem danh sách processes
pm2 list

# Xem logs
pm2 logs                    # Tất cả logs
pm2 logs telegram-bot       # Logs của bot
pm2 logs telegram-api      # Logs của API

# Xem thông tin chi tiết
pm2 show telegram-bot
pm2 show telegram-api

# Restart services
pm2 restart all             # Restart tất cả
pm2 restart telegram-bot   # Restart bot
pm2 restart telegram-api   # Restart API

# Stop services
pm2 stop all
pm2 stop telegram-bot

# Delete services
pm2 delete all
pm2 delete telegram-bot

# Monitor (real-time)
pm2 monit

# Reload (zero-downtime restart)
pm2 reload all
pm2 reload telegram-api
```

## 🌐 Bước 8: Cấu Hình Nginx

### 8.1. Tạo file cấu hình Nginx

```bash
sudo nano /etc/nginx/sites-available/telegram-bot
```

Thêm nội dung sau (thay `nhandinhbongda.io.vn` bằng domain của bạn hoặc IP):

```nginx
# API Server (Backend)
upstream api_backend {
    server localhost:3001;
}

# Admin Panel (Frontend)
server {
    listen 80;
    server_name nhandinhbongda.io.vn www.nhandinhbongda.io.vn;
    # hoặc nếu dùng IP: server_name your-vps-ip;

    # Admin Panel - Serve static files
    location / {
        root /var/www/telegram-bot/admin/dist;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # API Proxy
    location /api {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 8.2. Kích hoạt site

```bash
sudo ln -s /etc/nginx/sites-available/telegram-bot /etc/nginx/sites-enabled/
sudo nginx -t  # Kiểm tra cấu hình
sudo systemctl reload nginx
```

### 8.3. Cấu hình SSL với Let's Encrypt (Khuyến nghị)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d nhandinhbongda.io.vn -d www.nhandinhbongda.io.vn
```

Certbot sẽ tự động cấu hình SSL và renew.

## 🔄 Bước 9: Cấu Hình PM2 Startup (Đã được setup ở Bước 7.4)

PM2 đã được cấu hình để tự động khởi động khi reboot. Nếu chưa setup, chạy lại:

```bash
pm2 save
pm2 startup
# Chạy lệnh được hiển thị
```

## 📝 Bước 10: Kiểm Tra và Monitoring

### 10.1. Kiểm tra logs

**Với PM2:**
```bash
# Xem tất cả logs
pm2 logs

# Xem logs của từng service
pm2 logs telegram-bot
pm2 logs telegram-api

# Xem logs real-time
pm2 logs --lines 100

# Xem logs từ file
tail -f /var/www/telegram-bot/logs/bot-out.log
tail -f /var/www/telegram-bot/logs/api-out.log
```

### 10.2. Kiểm tra services đang chạy

```bash
# Kiểm tra ports
sudo netstat -tlnp | grep -E '3001|5173'

# Kiểm tra processes
ps aux | grep node
```

### 10.3. Test API

```bash
curl http://localhost:3001/api/dashboard/stats
```

## 🔒 Bước 11: Bảo Mật

### 11.1. Cấu hình Firewall

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 11.2. Giới hạn quyền truy cập file

```bash
sudo chmod 600 /var/www/telegram-bot/.env
sudo chown $USER:$USER /var/www/telegram-bot/.env
```

### 11.3. Cập nhật thường xuyên

```bash
sudo apt update && sudo apt upgrade -y
```

## 🔄 Bước 12: Update Code

### 12.1. Pull code mới

```bash
cd /var/www/telegram-bot
git pull origin main  # hoặc branch của bạn
npm install
```

### 12.2. Rebuild admin (nếu có thay đổi)

```bash
cd /var/www/telegram-bot/admin
npm install
npm run build
```

### 12.3. Restart services

**Với PM2:**
```bash
# Restart tất cả
pm2 restart all

# Hoặc restart từng service
pm2 restart telegram-bot
pm2 restart telegram-api

# Reload (zero-downtime) - chỉ áp dụng cho API
pm2 reload telegram-api
```

## 🐛 Troubleshooting

### Bot không chạy

1. Kiểm tra token bot:
```bash
echo $TG_BOT_TOKEN
```

2. Kiểm tra database connection:
```bash
cd /var/www/telegram-bot
npm run setup-db
```

### API không response

1. Kiểm tra API đang chạy:
```bash
curl http://localhost:3001/api/dashboard/stats
```

2. Kiểm tra Nginx logs:
```bash
sudo tail -f /var/log/nginx/error.log
```

### Admin panel không load

1. Kiểm tra file build:
```bash
ls -la /var/www/telegram-bot/admin/dist
```

2. Kiểm tra Nginx config:
```bash
sudo nginx -t
```

3. Kiểm tra Nginx access logs:
```bash
sudo tail -f /var/log/nginx/access.log
```

### Database connection error

1. Kiểm tra PostgreSQL đang chạy:
```bash
sudo systemctl status postgresql
```

2. Test connection:
```bash
psql -U telegram_user -d telegram_bot -h localhost
```

## 📚 Tài Liệu Tham Khảo

- [Node.js Documentation](https://nodejs.org/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

## ✅ Checklist Deploy

- [ ] VPS đã được setup
- [ ] Node.js và PostgreSQL đã cài đặt
- [ ] Code đã được upload lên VPS
- [ ] Database đã được tạo và cấu hình
- [ ] File .env đã được cấu hình đầy đủ
- [ ] Database schema đã được setup
- [ ] Admin user đã được seed
- [ ] Admin panel đã được build
- [ ] PM2 đã được cài đặt
- [ ] File ecosystem.config.js đã được tạo
- [ ] Services đã được chạy với PM2
- [ ] PM2 startup đã được cấu hình
- [ ] Nginx đã được cấu hình
- [ ] SSL đã được cấu hình (nếu có domain)
- [ ] Firewall đã được cấu hình
- [ ] Tất cả services đang chạy và hoạt động

## 🆘 Hỗ Trợ

Nếu gặp vấn đề, kiểm tra:
1. Logs của từng service
2. Nginx error logs
3. Database connection
4. Environment variables
5. Firewall rules

---

**Lưu ý**: Thay thế tất cả các giá trị placeholder (nhandinhbongda.io.vn, your-vps-ip, your-username, etc.) bằng giá trị thực tế của bạn.

