import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu tạo dữ liệu mẫu (Seeding)...');

  // Xóa dữ liệu cũ theo thứ tự để tránh lỗi khóa ngoại
  console.log('🧹 Xóa dữ liệu cũ...');
  await prisma.notification.deleteMany();
  await prisma.materialReview.deleteMany();
  await prisma.review.deleteMany();
  await prisma.userInteraction.deleteMany();
  await prisma.walletTransaction.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.material.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('123456', 10);

  // 1. Tạo Users
  console.log('👤 Tạo người dùng...');
  const admin = await prisma.user.create({
    data: {
      username: 'EduMarket Admin',
      email: 'admin@edumarket.vn',
      password_hash: passwordHash,
      role: 'Admin',
      wallet: { create: { balance: 9999999 } }
    },
  });

  const p1 = await prisma.user.create({
    data: {
      username: 'Nguyễn Văn Chuyên',
      email: 'chuyengia@gmail.com',
      password_hash: passwordHash,
      role: 'User',
      wallet: { create: { balance: 1500000 } }
    }
  });

  const p2 = await prisma.user.create({
    data: {
      username: 'Trần Thị Giỏi',
      email: 'thigioi@gmail.com',
      password_hash: passwordHash,
      role: 'User',
      wallet: { create: { balance: 800000 } }
    }
  });

  const b1 = await prisma.user.create({
    data: {
      username: 'Lê Sinh Viên',
      email: 'sinhvien1@gmail.com',
      password_hash: passwordHash,
      role: 'User',
      wallet: { create: { balance: 200000 } }
    }
  });

  const b2 = await prisma.user.create({
    data: {
      username: 'Phạm Tân Sinh',
      email: 'sinhvien2@gmail.com',
      password_hash: passwordHash,
      role: 'User',
      wallet: { create: { balance: 500000 } }
    }
  });

  // 2. Tạo Materials
  console.log('📚 Tạo học liệu...');
  const materials = [
    {
      provider_id: p1.id,
      title: 'Giáo trình Trí tuệ nhân tạo (AI) cơ bản',
      description: 'Giáo trình chi tiết về AI, Machine Learning, Deep Learning dành cho người mới bắt đầu. Gồm 10 chương và bài tập thực hành Python.\n\nNội dung chính:\n- Tổng quan AI\n- Thuật toán tìm kiếm\n- Học máy cơ bản\n- Mạng nơ-ron nhân tạo',
      file_format: 'pdf',
      price: 50000,
      tags: ['AI', 'Machine Learning', 'IT', 'Python'],
      thumbnail_url: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800&auto=format&fit=crop&q=60',
      status: 'Approved'
    },
    {
      provider_id: p1.id,
      title: 'Tài liệu Ôn thi Toeic 600+ (Đầy đủ file nghe)',
      description: 'Bộ tài liệu ôn thi TOEIC format mới nhất. Cung cấp mẹo làm bài, từ vựng theo chủ đề và 5 đề thi thử sát với đề thi thật.',
      file_format: 'zip',
      price: 99000,
      tags: ['English', 'TOEIC', 'Language'],
      thumbnail_url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&auto=format&fit=crop&q=60',
      status: 'Approved'
    },
    {
      provider_id: p2.id,
      title: 'Đồ án Tốt nghiệp: Hệ thống điểm danh bằng khuôn mặt',
      description: 'Source code và báo cáo đầy đủ cho đồ án hệ thống điểm danh tự động. Sử dụng Python, OpenCV, Face_recognition và giao diện PyQt5.',
      file_format: 'zip',
      price: 250000,
      tags: ['Đồ án', 'Computer Vision', 'Python'],
      thumbnail_url: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&auto=format&fit=crop&q=60',
      status: 'Approved'
    },
    {
      provider_id: p2.id,
      title: 'Slide thuyết trình Kinh tế vĩ mô',
      description: 'Mẫu slide PowerPoint thiết kế chuyên nghiệp, nội dung tổng hợp Kinh tế vĩ mô. Thích hợp cho sinh viên khối ngành kinh tế làm bài tập nhóm.',
      file_format: 'pptx',
      price: 0,
      tags: ['Kinh tế', 'Slide', 'Đại học'],
      thumbnail_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60',
      status: 'Approved'
    },
    {
      provider_id: p1.id,
      title: 'Tổng hợp công thức Toán cao cấp A1, A2',
      description: 'Tất cả các công thức toán cao cấp cực kỳ dễ hiểu, giúp bạn qua môn dễ dàng.',
      file_format: 'pdf',
      price: 15000,
      tags: ['Toán', 'Đại học', 'Ôn thi'],
      thumbnail_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=60',
      status: 'Pending'
    }
  ];

  const createdMaterials = [];
  for (const m of materials) {
    const created = await prisma.material.create({ data: m });
    createdMaterials.push(created);
  }

  // 3. Tạo Giao dịch và Tương tác (Interactions)
  console.log('💳 Tạo giao dịch và đánh giá...');
  
  // B1 mua Material 1 (từ P1)
  await prisma.transaction.create({
    data: {
      buyer_id: b1.id,
      seller_id: p1.id,
      material_id: createdMaterials[0].id,
      amount: createdMaterials[0].price,
      status: 'Completed',
      payment_method: 'wallet'
    }
  });

  // Interaction: B1 mua
  await prisma.userInteraction.create({
    data: {
      user_id: b1.id,
      material_id: createdMaterials[0].id,
      interaction_type: 'purchase'
    }
  });

  // B1 đánh giá Material 1
  await prisma.materialReview.create({
    data: {
      user_id: b1.id,
      material_id: createdMaterials[0].id,
      rating: 5,
      comment: 'Giáo trình rất hay và chi tiết, dễ hiểu cho người mới!'
    }
  });

  // B2 mua Material 3 (từ P2)
  await prisma.transaction.create({
    data: {
      buyer_id: b2.id,
      seller_id: p2.id,
      material_id: createdMaterials[2].id,
      amount: createdMaterials[2].price,
      status: 'Completed',
      payment_method: 'vnpay'
    }
  });

  // Interaction: B2 mua
  await prisma.userInteraction.create({
    data: {
      user_id: b2.id,
      material_id: createdMaterials[2].id,
      interaction_type: 'purchase'
    }
  });

  // B2 đánh giá Material 3
  await prisma.materialReview.create({
    data: {
      user_id: b2.id,
      material_id: createdMaterials[2].id,
      rating: 4,
      comment: 'Code chạy tốt, báo cáo chi tiết. Tuy nhiên giao diện hơi đơn giản.'
    }
  });

  // B1 tải đồ miễn phí (Material 4 từ P2)
  await prisma.transaction.create({
    data: {
      buyer_id: b1.id,
      seller_id: p2.id,
      material_id: createdMaterials[3].id,
      amount: createdMaterials[3].price,
      status: 'Completed',
      payment_method: 'free'
    }
  });

  // Interaction: B1 view nhiều cái khác
  await prisma.userInteraction.createMany({
    data: [
      { user_id: b1.id, material_id: createdMaterials[1].id, interaction_type: 'view' },
      { user_id: b1.id, material_id: createdMaterials[2].id, interaction_type: 'view' },
      { user_id: b2.id, material_id: createdMaterials[0].id, interaction_type: 'view' },
      { user_id: b2.id, material_id: createdMaterials[1].id, interaction_type: 'view' },
    ]
  });

  // Đánh giá người bán (Provider Review)
  await prisma.review.create({
    data: {
      reviewer_id: b1.id,
      provider_id: p1.id,
      rating: 5,
      comment: 'Tác giả chia sẻ tài liệu rất có tâm.'
    }
  });

  await prisma.review.create({
    data: {
      reviewer_id: b2.id,
      provider_id: p2.id,
      rating: 4,
      comment: 'Hỗ trợ nhiệt tình khi cài đặt code đồ án.'
    }
  });

  console.log('✅ Hoàn tất tạo dữ liệu mẫu!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
