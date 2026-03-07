# HukukAI

Türk Hukuku için yapay zeka destekli hukuki danışmanlık platformu. Modern React + TypeScript ile geliştirilmiş, production-ready web uygulaması.

## Özellikler

- **9 Hukuk Alanı**: İş, Kira, Tüketici, Aile, Trafik, Ceza, İcra, Miras, Vergi
- **AI Powered**: OpenAI GPT-4O-Mini ile güçlendirilmiş hukuki analiz
- **Modern Tema**: Light/Dark mode desteği ile şık tasarım
- **Authentication**: Supabase Auth ile güvenli giriş sistemi
- **Real-time Database**: Supabase PostgreSQL ile sohbet geçmişi
- **Payment Integration**: Iyzipay ile Türk Lirası ödeme sistemi
- **Responsive Design**: Tüm cihazlarda mükemmel görünüm

## Teknoloji Stack

### Frontend
- React 18.3 + TypeScript
- Vite 5.4 (Build tool)
- Tailwind CSS 3.4 (Styling)
- Lucide React (Icons)

### Backend
- Vercel Serverless Functions
- Supabase (Auth + Database)
- OpenAI API (GPT-4O-Mini)
- Iyzipay (Payment Gateway)

### Database
- PostgreSQL (Supabase)
- Row Level Security (RLS)
- Auto migrations

## Kurulum

### 1. Bağımlılıkları Yükle

```bash
npm install
```

### 2. Environment Variables

`.env` dosyası zaten yapılandırılmış durumda. Vercel deployment için aşağıdaki değişkenleri ekleyin:

**Vercel Environment Variables:**
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
IYZICO_API_KEY=your_iyzipay_api_key
IYZICO_SECRET_KEY=your_iyzipay_secret_key
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com
SITE_URL=https://your-app.vercel.app
```

**Frontend (.env):**
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Supabase Migration

Database schema'sı otomatik olarak oluşturulmuştur. Supabase'de zaten aktif:

- ✅ `user_plans` - Kullanıcı planları
- ✅ `conversations` - Sohbetler
- ✅ `messages` - Mesajlar
- ✅ `usage_counts` - Kullanım sayaçları
- ✅ `payment_history` - Ödeme geçmişi
- ✅ RLS Policies - Tüm tablolarda aktif

### 4. Local Development

```bash
npm run dev
```

Uygulama `http://localhost:5173` adresinde çalışacaktır.

### 5. Production Build

```bash
npm run build
```

Build çıktısı `dist/` klasöründe oluşur.

## Deployment (Vercel)

### Otomatik Deployment

1. Vercel hesabınıza giriş yapın
2. GitHub repository'sini import edin
3. Environment variables'ları ekleyin
4. Deploy butonuna tıklayın

### Manuel Deployment

```bash
npm run build
vercel --prod
```

## Proje Yapısı

```
hukukai/
├── api/                      # Vercel Serverless Functions
│   ├── chat.js              # AI chat endpoint
│   ├── payment.js           # Payment initialization
│   └── payment-callback.js  # Payment webhook
├── src/
│   ├── components/          # React components
│   │   ├── AuthModal.tsx
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Navbar.tsx
│   │   └── ThemeToggle.tsx
│   ├── contexts/            # React contexts
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── lib/                 # Utilities
│   │   ├── api.ts
│   │   ├── categories.ts
│   │   └── supabase.ts
│   ├── pages/               # Page components
│   │   ├── ChatPage.tsx
│   │   └── LandingPage.tsx
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   ├── App.tsx              # Root component
│   ├── index.css            # Global styles
│   └── main.tsx             # Entry point
├── vercel.json              # Vercel configuration
└── package.json
```

## API Endpoints

### POST /api/chat

AI sohbet endpoint'i.

**Headers:**
```
Authorization: Bearer {supabase_jwt}
Content-Type: application/json
```

**Body:**
```json
{
  "message": "string",
  "category": "is | kira | tuketici | aile | trafik | ceza | icra | miras | vergi",
  "conversationId": "string (optional)",
  "fileContent": "string (optional)"
}
```

**Response:**
```json
{
  "reply": "string",
  "conversationId": "string"
}
```

### POST /api/payment

Ödeme başlatma endpoint'i.

**Headers:**
```
Authorization: Bearer {supabase_jwt}
Content-Type: application/json
```

**Body:**
```json
{
  "plan": "plus | pro | elite",
  "userEmail": "string",
  "userName": "string"
}
```

### POST /api/payment-callback

Iyzipay webhook endpoint'i. Ödeme sonucu işlenir.

## Güvenlik

- ✅ Row Level Security (RLS) tüm tablolarda aktif
- ✅ JWT Authentication (Supabase)
- ✅ API key validation
- ✅ Input sanitization
- ✅ Rate limiting (günlük limit)
- ✅ HTTPS only

## Planlar

| Plan | Günlük Limit | Fiyat |
|------|-------------|-------|
| Free | 5 soru/gün | ₺0 |
| Plus | 50 soru/gün | ₺99/ay |
| Pro | Sınırsız | ₺349/ay |
| Elite | Sınırsız | ₺799/ay |

## Hukuk Kategorileri

1. **İş Hukuku** - Kıdem tazminatı, işe iade
2. **Kira Hukuku** - Kira artışı, tahliye
3. **Tüketici Hukuku** - Ayıplı mal, garanti
4. **Aile Hukuku** - Boşanma, nafaka
5. **Trafik Hukuku** - Kaza, tazminat
6. **Ceza Hukuku** - Suç, savunma
7. **İcra Hukuku** - İcra takibi, haciz
8. **Miras Hukuku** - Vasiyet, miras
9. **Vergi Hukuku** - Vergi cezaları

## Lisans

Bu proje özel mülkiyettir ve tüm hakları saklıdır.

## İletişim

HukukAI - Türk Hukuku için AI Danışman

---

**Production Ready** ✅
