# PM Cosmetics Hub - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Git
- Docker (optional, for database)

### 1. Clone Repository
```bash
git clone https://github.com/Pmcosmetics/pmcosmetics-empire-11countries.git
cd pmcosmetics-empire-11countries
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
```bash
cp .env.example .env
# Edit .env and fill in your API keys and secrets
```

### 4. Initialize Database
```bash
# If using PostgreSQL with Docker
docker run -d \
  --name pmcosmetics-db \
  -e POSTGRES_USER=pmcosmetics \
  -e POSTGRES_PASSWORD=your_secure_password \
  -e POSTGRES_DB=pmcosmetics \
  -p 5432:5432 \
  postgres:15
```

### 5. Validate Project
```bash
npm run validate
```

### 6. Start Development Server
```bash
npm run dev
```

Server will run on `http://localhost:3000`

---

## 📋 Configuration

### Markets Configuration
Edit `config/markets.json` to manage the 11 countries

### Catalog Schema
The product schema is defined in `config/catalog.schema.json`

### Environment Variables
Copy `config/integrations.example.env` to `.env` and add:
- Shopify API credentials
- Instagram Business credentials
- Etsy API keys
- WhatsApp Business API token
- Notion API key
- Database connection strings

---

## 🔌 Integration Setup

### Shopify
1. Create Shopify app at https://partners.shopify.com/
2. Get API credentials
3. Add to `.env` file
4. Run: `npm run sync:shopify`

### Instagram
1. Create Facebook App at https://developers.facebook.com/
2. Add Instagram Business credentials
3. Get long-lived access token
4. Add to `.env` file

### Etsy
1. Register app at https://www.etsy.com/developers/
2. Get OAuth credentials
3. Add to `.env` file

### WhatsApp Business
1. Get Business Account at Meta
2. Create app and get phone number ID
3. Generate access token
4. Add to `.env` file

---

## 📦 Database Setup

### PostgreSQL Schema
```bash
npm run db:migrate
```

### Seed Sample Data
```bash
npm run db:seed
```

---

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Generate Coverage Report
```bash
npm test -- --coverage
```

---

## 📊 Data Management

### Validate Catalog
```bash
npm run validate:catalog
```

### Validate Inventory
```bash
npm run validate:inventory
```

### Sync Inventory from Shopify
```bash
npm run sync:inventory
```

### Update Prices
```bash
npm run sync:prices
```

### Generate Reports
```bash
npm run generate:reports
```

---

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Deploy to Vercel
```bash
vercel deploy --prod
```

### Deploy to GitHub Pages
```bash
npm run build
npm run deploy
```

---

## 🔐 Security Checklist

- [ ] Never commit `.env` file
- [ ] Rotate API keys regularly
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS in production
- [ ] Setup firewall rules
- [ ] Enable database encryption
- [ ] Configure CORS properly
- [ ] Use strong JWT secrets
- [ ] Enable rate limiting
- [ ] Setup monitoring and logging

---

## 📱 Mobile App Setup

### React Native Setup
```bash
cd app/mobile
npm install
```

### Build iOS
```bash
npm run build:ios
```

### Build Android
```bash
npm run build:android
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change PORT in .env
PORT=3001 npm run dev
```

### Database Connection Error
- Check DATABASE_URL in .env
- Verify database is running
- Check credentials

### API Integration Issues
- Verify API keys in .env
- Check API rate limits
- Review logs for errors

---

## 📞 Support

For issues or questions:
- 📧 Email: tech@pmcosmetics.hub
- 💬 Discord: [Join Server]
- 📱 WhatsApp: Business Support

---

## 📚 Additional Resources

- [Architecture Documentation](./ARCHITECTURE.md)
- [API Documentation](./API.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Security Guide](./SECURITY.md)

---

**Happy Building! 🚀**
