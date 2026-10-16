# LearnVault - Nền Tảng Giao Dịch & Trao Đổi Học Liệu Trực Tuyến

LearnVault là nền tảng thương mại điện tử chuyên biệt dành cho sinh viên và người học để chia sẻ, trao đổi và mua bán tài liệu học tập, giáo trình, bài giảng chất lượng cao, tích hợp công nghệ trí tuệ nhân tạo (Google Gemini AI).

## 🚀 Tính Năng Chính

- **Thương mại học liệu**: Đăng tải, tìm kiếm, xem trước và mua bán tài liệu học tập với các định dạng phổ biến (PDF, DOCX, PPTX,...).
- **Hệ thống ví & giao dịch**: Quản lý số dư ví, nạp/rút tiền, thanh toán đơn hàng an toàn, hỗ trợ mã giảm giá (Coupon).
- **Trí tuệ nhân tạo (AI)**:
  - **Gợi ý học liệu thông minh (Recommendation System)**: Phân tích hành vi tương tác và sở thích của người dùng để đề xuất tài liệu phù hợp nhất thông qua Gemini AI.
  - **Hỗ trợ khách hàng (AI Support Ticket)**: Tự động phân loại nội dung yêu cầu hỗ trợ và gợi ý phản hồi nhanh chóng cho quản trị viên.
- **Hệ thống đánh giá & phản hồi**: Đánh giá sao, nhận xét chất lượng tài liệu và người bán.
- **Bảng điều khiển (Dashboard)**: Thống kê doanh thu, lượt mua, tương tác cho người bán và công cụ quản lý toàn diện cho quản trị viên (Admin).

## 🛠️ Công Nghệ Sử Dụng

### Backend
- **Node.js** & **Express** (TypeScript)
- **Prisma ORM** & **MySQL**
- **Google GenAI SDK** (Gemini AI)
- **Cloudinary** (Lưu trữ tệp & hình ảnh)
- **JWT & Bcrypt** (Xác thực và phân quyền)

### Frontend
- **Next.js** (App Router, TypeScript)
- **Tailwind CSS** & **Lucide Icons**
- **Zustand** (Quản lý trạng thái)
- **Axios** (Giao tiếp API)

## 📦 Cài Đặt & Khởi Chạy

### 1. Yêu Cầu Tiên Quyết
- Node.js (v18+)
- MySQL Server

### 2. Cấu Hình Backend
```bash
# Cài đặt dependencies
npm install

# Tạo file .env từ .env.example và điền thông tin kết nối DB, API Key
cp .env.example .env

# Chạy Prisma migration
npx prisma db push

# Khởi chạy backend (mặc định port 5000)
npm run dev
```

### 3. Cấu Hình Frontend
```bash
cd frontend

# Cài đặt dependencies
npm install

# Tạo file .env.local từ .env.example
cp .env.example .env.local

# Khởi chạy frontend (mặc định port 3000)
npm run dev
```
