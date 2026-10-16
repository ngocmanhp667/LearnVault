import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Khởi tạo client Gemini bằng API Key từ biến môi trường
export const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || 'MISSING_API_KEY' 
});

// Sử dụng model mới nhất và tối ưu cho phản hồi nhanh (flash)
export const MODEL_NAME = 'gemini-1.5-flash';
