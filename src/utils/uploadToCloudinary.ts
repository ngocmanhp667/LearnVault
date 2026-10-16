import cloudinary from '../config/cloudinary';
import fs from 'fs';

/**
 * Upload file từ local lên Cloudinary
 * @param filePath Đường dẫn file ở local (trong thư mục uploads/)
 * @param folder Tên folder trên Cloudinary ('materials' | 'thumbnails')
 * @returns Thông tin url và public_id của file đã upload
 */
export const uploadFile = async (filePath: string, folder: string): Promise<{ url: string; public_id: string }> => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'auto', // Tự động nhận diện định dạng (ảnh, raw, video, document)
    });
    
    // Xóa file tạm ở local sau khi upload thành công
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    // Xóa file tạm nếu có lỗi xảy ra
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    console.error('Lỗi upload file lên Cloudinary:', error);
    throw new Error('Không thể tải file lên hệ thống');
  }
};

/**
 * Xóa file trên Cloudinary bằng public_id
 * @param publicId ID public của file trên Cloudinary
 */
export const deleteFile = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Lỗi khi xóa file trên Cloudinary:', error);
  }
};
