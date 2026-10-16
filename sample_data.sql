-- Chạy đoạn script này trong MySQL (phpMyAdmin, MySQL Workbench, DBeaver) 
-- để LÀM SẠCH và THÊM LẠI dữ liệu mẫu vào database `doantttn`

USE doantttn;

-- Tắt kiểm tra khóa ngoại để xóa dữ liệu không bị lỗi
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Xóa toàn bộ dữ liệu cũ
TRUNCATE TABLE `reviews`;
TRUNCATE TABLE `user_interactions`;
TRUNCATE TABLE `transactions`;
TRUNCATE TABLE `materials`;
TRUNCATE TABLE `users`;

-- Bật lại kiểm tra khóa ngoại
SET FOREIGN_KEY_CHECKS = 1;

-- 2. Thêm Người dùng mẫu (Mật khẩu cho tất cả đều là: 123456)
-- Mật khẩu đã được mã hóa (Bcrypt Hash chuẩn xác của chuỗi "123456")
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `role`, `is_active`, `created_at`, `updated_at`) VALUES
('user-admin-01', 'Admin_Tong', 'admin@edumarket.com', '$2b$10$Rilr6vjLzpIklDRbdyvBz.jcUVzE1XHEt2KPLBDXeWxKP5yNZVLEC', 'Admin', 1, NOW(), NOW()),
('user-student-01', 'NguyenVanA', 'nguyenvana@gmail.com', '$2b$10$Rilr6vjLzpIklDRbdyvBz.jcUVzE1XHEt2KPLBDXeWxKP5yNZVLEC', 'User', 1, NOW(), NOW()),
('user-student-02', 'TranThiB', 'tranthib@gmail.com', '$2b$10$Rilr6vjLzpIklDRbdyvBz.jcUVzE1XHEt2KPLBDXeWxKP5yNZVLEC', 'User', 1, NOW(), NOW());

-- 3. Thêm Học liệu mẫu (Gắn với người dùng Nguyễn Văn A và Trần Thị B)
INSERT INTO `materials` (`id`, `provider_id`, `title`, `description`, `file_format`, `file_url`, `thumbnail_url`, `price`, `tags`, `created_at`, `updated_at`) VALUES
('mat-01', 'user-student-01', 'Giáo trình C++ Cơ bản đến Nâng cao', 'Tài liệu đầy đủ các chương lập trình C++ dành cho người mới bắt đầu. Có kèm theo bài tập thực hành và mã nguồn mẫu.', 'PDF', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=2069&auto=format&fit=crop', 50000.00, '["cntt", "lap-trinh", "c++"]', NOW(), NOW()),

('mat-02', 'user-student-01', 'Đề cương Ôn thi Giải tích 1', 'Đề cương tóm tắt lý thuyết, các dạng bài tập trọng tâm và bộ 5 đề thi thử môn Giải tích 1.', 'DOCX', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop', 0.00, '["toan", "dai-cuong", "giai-tich"]', NOW(), NOW()),

('mat-03', 'user-student-02', 'Slide Thuyết trình Kinh tế Vĩ mô', 'Trọn bộ slide powerpoint đẹp mắt về Kinh tế vĩ mô. Hiệu ứng sống động, bao gồm tất cả các chương học.', 'PPTX', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop', 120000.00, '["kinhte", "vi-mo", "slide"]', NOW(), NOW()),

('mat-04', 'user-student-02', 'Tài liệu Luyện thi TOEIC 600+', 'Tổng hợp từ vựng và mẹo làm bài thi TOEIC hiệu quả. Đảm bảo tăng ít nhất 100 điểm sau 1 tháng.', 'PDF', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=2071&auto=format&fit=crop', 35000.00, '["ngoaingu", "toeic", "tieng-anh"]', NOW(), NOW());
