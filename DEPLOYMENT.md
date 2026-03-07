# HukukAI Deployment Guide

Bu doküman HukukAI platformunun Vercel'e deployment sürecini adım adım açıklar.

## Ön Gereksinimler

1. ✅ Supabase hesabı ve proje
2. ✅ OpenAI API anahtarı
3. ✅ Iyzipay hesabı (sandbox veya production)
4. ✅ Vercel hesabı
5. ✅ GitHub repository

## 1. Supabase Yapılandırması

### Database Migration

Database schema'sı otomatik olarak oluşturulmuştur. Kontrol için:

```sql
-- Tabloları kontrol et
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- RLS politikalarını kontrol et
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

Beklenen tablolar:
- `user_plans`
- `conversations`
- `messages`
- `usage_counts`
- `payment_history`

### Authentication Ayarları

Supabase Dashboard → Authentication → Settings:

1. **Email Provider**: Enabled
2. **Email Confirmations**: Disabled (otomatik giriş için)
3. **Site URL**: `https://your-app.vercel.app`
4. **Redirect URLs**:
   - `https://your-app.vercel.app`
   - `http://localhost:5173` (development)

## 2. Environment Variables Hazırlığı

### Frontend (.env)

Zaten yapılandırılmış:
```env
VITE_SUPABASE_URL=https://ohcpkvewkxffkcspzydc.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Backend (Vercel)

Aşağıdaki değişkenleri Vercel Dashboard'a ekleyin:

| Variable | Değer | Nereden Alınır |
|----------|-------|---------------|
| `SUPABASE_URL` | `https://xxx.supabase.co` | Supabase Project Settings |
| `SUPABASE_SERVICE_KEY` | `eyJhbGc...` | Supabase Project Settings → API → service_role key |
| `OPENAI_API_KEY` | `sk-...` | OpenAI Platform → API Keys |
| `IYZICO_API_KEY` | `sandbox-...` | Iyzipay Dashboard |
| `IYZICO_SECRET_KEY` | `sandbox-...` | Iyzipay Dashboard |
| `IYZICO_BASE_URL` | `https://sandbox-api.iyzipay.com` | Sandbox için |
| `SITE_URL` | `https://your-app.vercel.app` | Vercel deployment URL |

**UYARI**: `SUPABASE_SERVICE_KEY` gizli tutulmalıdır! Production değişkenine ekleyin.

## 3. Vercel Deployment

### Otomatik Deployment (Önerilen)

1. **Vercel'e Giriş**
   - https://vercel.com adresine gidin
   - GitHub ile giriş yapın

2. **Proje Import**
   - "Add New..." → "Project" tıklayın
   - GitHub repository'sini seçin
   - Import tıklayın

3. **Environment Variables**
   - "Environment Variables" sekmesine tıklayın
   - Yukarıdaki tüm backend değişkenlerini ekleyin
   - Environment: `Production`, `Preview`, `Development` (hepsini seçin)

4. **Deploy**
   - "Deploy" butonuna tıklayın
   - İlk deployment 2-3 dakika sürer

### Manuel Deployment

```bash
# Vercel CLI yükle (ilk kez)
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

## 4. Deployment Sonrası Kontroller

### 4.1. Frontend Kontrolü

1. **Ana Sayfa**: `https://your-app.vercel.app`
   - Landing page açılıyor mu?
   - Kategori kartları görünüyor mu?
   - Light/Dark mode çalışıyor mu?

2. **Authentication**
   - Giriş modal'ı açılıyor mu?
   - Kayıt oluyor mu?
   - Giriş yapılıyor mu?

3. **Chat**
   - Kategori seçince chat sayfası açılıyor mu?
   - Mesaj gönderilebiliyor mu?
   - AI yanıt geliyor mu?

### 4.2. API Kontrolü

Vercel Dashboard → Functions → Logs'dan kontrol edin:

```bash
# Chat API test
curl -X POST https://your-app.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT" \
  -d '{"message":"Merhaba","category":"is"}'

# Expected: 200 OK + {"reply":"...","conversationId":"..."}
```

### 4.3. Database Kontrolü

Supabase Dashboard → Table Editor:

1. **user_plans**: Yeni kullanıcı için free plan oluştu mu?
2. **conversations**: Sohbet kaydedildi mi?
3. **messages**: Mesajlar kaydedildi mi?
4. **usage_counts**: Kullanım sayıldı mı?

## 5. Production Geçişi (Iyzipay)

Sandbox'tan production'a geçiş:

1. Iyzipay Dashboard → Production API Keys alın
2. Vercel Environment Variables:
   ```
   IYZICO_API_KEY=production-key
   IYZICO_SECRET_KEY=production-secret
   IYZICO_BASE_URL=https://api.iyzipay.com
   ```
3. Redeploy edin: `vercel --prod` veya GitHub'a push

## 6. Domain Yapılandırması (Opsiyonel)

### Custom Domain Ekleme

1. Vercel Dashboard → Project → Settings → Domains
2. Custom domain ekle: `hukukai.com`
3. DNS ayarlarını yapılandır:
   ```
   A Record: 76.76.21.21
   CNAME: cname.vercel-dns.com
   ```
4. SSL otomatik yapılandırılır (Let's Encrypt)

### Supabase Redirect URL Güncelle

```
https://hukukai.com
```

### Environment Variables Güncelle

```
SITE_URL=https://hukukai.com
```

## 7. Monitoring ve Optimizasyon

### Vercel Analytics

Dashboard → Analytics'ten izleyin:
- Ziyaretçi sayısı
- Sayfa yükleme süreleri
- API response times

### Error Tracking

Functions → Logs'dan hataları izleyin:
- 4xx: Client errors
- 5xx: Server errors

### Performance

- Lighthouse score: 90+ hedefleyin
- Core Web Vitals'ı optimize edin
- API response time < 2s

## 8. Troubleshooting

### Problem: API 401 Unauthorized

**Çözüm:**
```bash
# Supabase JWT token'ı kontrol et
# Browser console:
const { data } = await supabase.auth.getSession()
console.log(data.session.access_token)
```

### Problem: Mesaj gönderilmiyor

**Çözüm:**
1. Vercel Logs kontrol et
2. OpenAI API key doğru mu?
3. Günlük limit aşıldı mı?

### Problem: Ödeme çalışmıyor

**Çözüm:**
1. Iyzipay sandbox mode'da mı?
2. Callback URL doğru mu? `SITE_URL/api/payment-callback`
3. Test kartları: https://dev.iyzipay.com/tr/test-kartlari

## 9. Güvenlik Kontrol Listesi

- ✅ HTTPS aktif (Vercel otomatik)
- ✅ RLS tüm tablolarda aktif
- ✅ Service key sadece backend'de
- ✅ API rate limiting var
- ✅ Input validation var
- ✅ CORS yapılandırılmış

## 10. Destek ve İletişim

**Vercel Destek:** https://vercel.com/support
**Supabase Destek:** https://supabase.com/support
**Iyzipay Destek:** https://dev.iyzipay.com

---

**Deployment tamamlandı!** 🎉

Sorun yaşarsanız Vercel Logs ve Supabase Logs'u kontrol edin.
