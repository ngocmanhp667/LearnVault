import { Router } from 'express';
import { createMaterial, getMaterials, getMaterialById, updateMaterial, deleteMaterial } from '../controllers/materials.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { upload } from '../config/multer';

const router = Router();

// Lấy danh sách học liệu (có search/filter)
router.get('/', getMaterials);

// Lấy chi tiết học liệu
router.get('/:id', getMaterialById);

// Đăng tải học liệu mới (yêu cầu đăng nhập)
router.post(
  '/',
  authenticateJWT,
  upload.fields([
    { name: 'material_file', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  createMaterial
);

// Cập nhật học liệu (chỉ chủ sở hữu)
router.put(
  '/:id',
  authenticateJWT,
  upload.fields([
    { name: 'material_file', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  updateMaterial
);

// Xoá học liệu (chủ sở hữu hoặc Admin)
router.delete('/:id', authenticateJWT, deleteMaterial);

export default router;
