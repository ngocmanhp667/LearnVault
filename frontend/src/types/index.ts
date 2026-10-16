export interface User {
  id: string;
  username: string;
  email: string;
  role: 'Admin' | 'User';
  created_at: string;
}

export interface Material {
  id: string;
  provider_id: string;
  title: string;
  description: string;
  file_format: string;
  file_url: string | null;
  thumbnail_url: string | null;
  price: number;
  tags: string[];
  created_at: string;
  provider?: Pick<User, 'id' | 'username'>;
}

export interface Transaction {
  id: string;
  buyer_id: string;
  seller_id: string;
  material_id: string;
  amount: number;
  status: 'Pending' | 'Completed' | 'Failed' | 'Cancelled';
  payment_method: string | null;
  created_at: string;
  buyer?: Pick<User, 'id' | 'username' | 'email'>;
  seller?: Pick<User, 'id' | 'username' | 'email'>;
  material?: Pick<Material, 'id' | 'title' | 'price'>;
}

export interface Review {
  id: string;
  reviewer_id: string;
  provider_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer?: Pick<User, 'id' | 'username'>;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  pagination?: Pagination;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'PAYMENT' | 'EARNING';
  amount: number;
  status: string;
  description: string | null;
  created_at: string;
}

export interface MaterialReview {
  id: string;
  user_id: string;
  material_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user?: Pick<User, 'username'>;
}

