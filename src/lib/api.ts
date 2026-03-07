import { supabase } from './supabase';

export interface ChatRequest {
  message: string;
  category: string;
  conversationId?: string;
  fileContent?: string;
}

export interface ChatResponse {
  reply: string;
  conversationId: string;
  error?: string;
  limitExceeded?: boolean;
}

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;

  if (!token) {
    throw new Error('Oturum bulunamadı');
  }

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Bir hata oluştu');
  }

  return response.json();
}

export interface PaymentRequest {
  plan: 'plus' | 'pro' | 'elite';
  userEmail: string;
  userName: string;
}

export interface PaymentResponse {
  checkoutFormContent: string;
  token: string;
  error?: string;
}

export async function initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;

  if (!token) {
    throw new Error('Oturum bulunamadı');
  }

  const response = await fetch('/api/payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Ödeme başlatılamadı');
  }

  return response.json();
}
