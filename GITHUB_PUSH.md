# GitHub'a Push Talimatları

Şu anda local'de hazır olan tüm dosyaları GitHub'a yüklemek için:

## Adım 1: Git Init

```bash
cd /tmp/cc-agent/64442751/project
git init
git remote add origin https://github.com/melikerge59-create/hukukai.git
```

## Adım 2: Commit

```bash
git add .
git commit -m "feat: Complete production-ready rebuild with React + TypeScript

- Modern React + TypeScript architecture
- Light/Dark theme system
- Supabase authentication & database
- AI chat with OpenAI GPT-4O-Mini
- 9 legal categories
- Secure API endpoints
- Responsive design"
```

## Adım 3: Push

```bash
git push origin HEAD:production-ready-rebuild --force
```

## Alternatif: GitHub CLI ile

```bash
# Authenticate
gh auth login

# Push
gh repo sync
```

Sonra Vercel otomatik olarak yeni deployment yapacak.
