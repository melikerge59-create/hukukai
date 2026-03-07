export interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export interface UserPlan {
  user_id: string;
  plan_type: 'free' | 'plus' | 'pro' | 'elite';
  daily_limit: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  category: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'ai';
  content: string;
  created_at: string;
}

export interface UsageCount {
  id: string;
  user_id: string;
  created_at: string;
}

export interface PaymentHistory {
  id: string;
  user_id: string;
  plan_type: string;
  amount: number;
  currency: string;
  status: string;
  iyzipay_token?: string;
  conversation_id?: string;
  created_at: string;
}

export type LegalCategory = 'is' | 'kira' | 'tuketici' | 'aile' | 'trafik' | 'ceza' | 'icra' | 'miras' | 'vergi';

export interface CategoryInfo {
  id: LegalCategory;
  name: string;
  description: string;
  icon: string;
}
