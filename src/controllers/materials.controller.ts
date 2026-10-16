import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../config/prisma';
import { uploadFile, deleteFile } from '../utils/uploadToCloudinary';

interface MulterRequest extends AuthRequest {
  files?: {
    [fieldname: string]: Express.Multer.File[];
  } | Express.Multer.File[];
}

export const createMaterial = async (req: MulterRequest, res: Response): Promise<void> => {
  try {
    const providerId = req.user?.id;
    if (!providerId) {
      res.status(401).json({ message: 'Chưa đăng nhập' });
      return;
    }

    // req.body chứa các field text (multipart/form-data)
    const { title, description, price, tags } = req.body;

    if (!title || !description || price === undefined) {
      res.status(400).json({ message: 'Thiếu thông tin bắt buộc (title, description, price)' });
      return;
    }

    let file_url = null;
    let thumbnail_url = null;
    let file_format = 'unknown';

    // Xử lý upload file
    if (req.files && !Array.isArray(req.files)) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (files['material_file'] && files['material_file'].length > 0) {
        const materialFile = files['material_file'][0];
        const uploadedFile = await uploadFile(materialFile.path, 'materials');
        file_url = uploadedFile.url;
        // Trích xuất định dạng file từ tên ban đầu
        const extMatch = materialFile.originalname.match(/\.([^.]+)$/);
        file_format = extMatch ? extMatch[1].toLowerCase() : 'unknown';
      }

      if (files['thumbnail'] && files['thumbnail'].length > 0) {
        const thumbFile = files['thumbnail'][0];
        const uploadedThumb = await uploadFile(thumbFile.path, 'thumbnails');
        thumbnail_url = uploadedThumb.url;
      }
    }

    // Chuyển tags từ string sang array (nếu gửi dạng string do form-data)
    let parsedTags: string[] = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
        // Nếu không parse được JSON, fallback chia bằng dấu phẩy
        parsedTags = String(tags).split(',').map(tag => tag.trim()).filter(t => t);
      }
    }

    const material = await prisma.material.create({
      data: {
        provider_id: providerId,
        title,
        description,
        file_format,
        file_url,
        thumbnail_url,
        price: Number(price), // Ép kiểu số do body multipart/form-data gửi string
        tags: parsedTags,
      }
    });

    res.status(201).json({ message: 'Đăng tải học liệu thành công', material });
  } catch (error) {
    console.error('Lỗi tạo học liệu:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const getMaterials = async (req: Request, res: Response): Promise<void> => {
  try {
    const { keyword, tags, minPrice, maxPrice } = req.query;

    const whereClause: any = {};

    // Filter by keyword (Search in title or description)
    if (keyword) {
      whereClause.OR = [
        { title: { contains: keyword as string } },
        { description: { contains: keyword as string } }
      ];
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price.gte = parseFloat(minPrice as string);
      if (maxPrice) whereClause.price.lte = parseFloat(maxPrice as string);
    }

    // Filter by tags (Prisma JSON filtering is limited in MySQL, we will do a basic string match or handle in JS if complex,
    // but for array-like strings we can use string-contains if tags are stored as JSON string.
    // In Prisma 6 with MySQL JSON arrays, we can use array-contains if supported. 
    // We will assume string contains for simplicity in this MVP).
    if (tags) {
      whereClause.tags = {
        array_contains: tags // This works in Postgres/MySQL with Prisma JSON array_contains
      };
    }

    const materials = await prisma.material.findMany({
      where: whereClause,
      include: {
        provider: {
          select: {
            id: true,
            username: true,
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    res.status(200).json({ materials });
  } catch (error) {
    console.error('Lỗi lấy danh sách học liệu:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const getMaterialById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const material = await prisma.material.findUnique({
      where: { id: id as string },
      include: {
        provider: {
          select: {
            id: true,
            username: true,
          }
        }
      }
    });

    if (!material) {
      res.status(404).json({ message: 'Không tìm thấy học liệu' });
      return;
    }

    res.status(200).json({ material });
  } catch (error) {
    console.error('Lỗi lấy học liệu chi tiết:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * Cập nhật học liệu.
 * Chỉ cho phép provider (chủ sở hữu) cập nhật.
 */
export const updateMaterial = async (req: MulterRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Chưa đăng nhập.' });
      return;
    }

    const id = req.params.id as string;

    // Kiểm tra material tồn tại
    const material = await prisma.material.findUnique({
      where: { id },
    });

    if (!material) {
      res.status(404).json({ message: 'Không tìm thấy học liệu.' });
      return;
    }

    // Chỉ chủ sở hữu mới được cập nhật
    if (material.provider_id !== userId) {
      res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa học liệu này.' });
      return;
    }

    const { title, description, price, tags } = req.body;
    const updateData: any = {};
    
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = Number(price);

    // Xử lý upload file mới nếu có
    if (req.files && !Array.isArray(req.files)) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (files['material_file'] && files['material_file'].length > 0) {
        // Xóa file cũ trên cloud nếu có public_id
        if (material.file_url) {
          const urlParts = material.file_url.split('/');
          const filenameExt = urlParts[urlParts.length - 1];
          const filenameId = filenameExt.split('.')[0];
          await deleteFile(`materials/${filenameId}`);
        }

        const materialFile = files['material_file'][0];
        const uploadedFile = await uploadFile(materialFile.path, 'materials');
        updateData.file_url = uploadedFile.url;
        
        const extMatch = materialFile.originalname.match(/\.([^.]+)$/);
        if (extMatch) updateData.file_format = extMatch[1].toLowerCase();
      }

      if (files['thumbnail'] && files['thumbnail'].length > 0) {
        if (material.thumbnail_url) {
           const urlParts = material.thumbnail_url.split('/');
           const filenameExt = urlParts[urlParts.length - 1];
           const filenameId = filenameExt.split('.')[0];
           await deleteFile(`thumbnails/${filenameId}`);
        }

        const thumbFile = files['thumbnail'][0];
        const uploadedThumb = await uploadFile(thumbFile.path, 'thumbnails');
        updateData.thumbnail_url = uploadedThumb.url;
      }
    }

    if (tags !== undefined) {
      try {
        updateData.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
        updateData.tags = String(tags).split(',').map(tag => tag.trim()).filter(t => t);
      }
    }

    const updatedMaterial = await prisma.material.update({
      where: { id },
      data: updateData,
      include: {
        provider: {
          select: { id: true, username: true },
        },
      },
    });

    res.status(200).json({
      message: 'Cập nhật học liệu thành công.',
      data: updatedMaterial,
    });
  } catch (error) {
    console.error('Lỗi cập nhật học liệu:', error);
    res.status(500).json({ message: 'Lỗi server.' });
  }
};

/**
 * Xoá học liệu.
 * Cho phép: chủ sở hữu (provider) hoặc Admin.
 * Xoá cứng (hard delete) — vì đây là MVP. Giai đoạn sau có thể chuyển sang soft delete.
 */
export const deleteMaterial = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      res.status(401).json({ message: 'Chưa đăng nhập.' });
      return;
    }

    const id = req.params.id as string;

    // Kiểm tra material tồn tại
    const material = await prisma.material.findUnique({
      where: { id },
    });

    if (!material) {
      res.status(404).json({ message: 'Không tìm thấy học liệu.' });
      return;
    }

    // Chỉ chủ sở hữu hoặc Admin mới được xoá
    if (material.provider_id !== userId && userRole !== 'Admin') {
      res.status(403).json({ message: 'Bạn không có quyền xoá học liệu này.' });
      return;
    }

    // Xóa file trên Cloudinary
    if (material.file_url) {
      const urlParts = material.file_url.split('/');
      const filenameId = urlParts[urlParts.length - 1].split('.')[0];
      await deleteFile(`materials/${filenameId}`);
    }

    if (material.thumbnail_url) {
      const urlParts = material.thumbnail_url.split('/');
      const filenameId = urlParts[urlParts.length - 1].split('.')[0];
      await deleteFile(`thumbnails/${filenameId}`);
    }

    // Xoá các bản ghi liên quan trước
    await prisma.userInteraction.deleteMany({
      where: { material_id: id },
    });

    await prisma.transaction.updateMany({
      where: { material_id: id, status: 'Pending' },
      data: { status: 'Cancelled' },
    });

    // Xoá material
    await prisma.material.delete({
      where: { id },
    });

    res.status(200).json({
      message: 'Xoá học liệu thành công.',
    });
  } catch (error) {
    console.error('Lỗi xoá học liệu:', error);
    res.status(500).json({ message: 'Lỗi server.' });
  }
};
