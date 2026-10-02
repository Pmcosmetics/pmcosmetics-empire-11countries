#!/usr/bin/env node
/**
 * Al Fouad Pharmacies Catalog Scraper & Product Importer
 * Extracts beauty products with images, prices, and categories
 * Prepares data for PM Cosmetics Hub multi-platform sync
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const ALFOUAD_BASE_URL = 'https://alfouadpharmacies.com';

// Product category mapping for PM Cosmetics
const CATEGORY_MAP = {
  'cleansers': 'Skincare',
  'moisturizers': 'Skincare',
  'serums': 'Skincare',
  'masks': 'Skincare',
  'sunscreen': 'Skincare',
  'toners': 'Skincare',
  'cleansing': 'Skincare',
  'makeup': 'Makeup',
  'foundation': 'Makeup',
  'concealer': 'Makeup',
  'powder': 'Makeup',
  'blush': 'Makeup',
  'eyeshadow': 'Makeup',
  'mascara': 'Makeup',
  'eyeliner': 'Makeup',
  'lipstick': 'Makeup',
  'lip': 'Makeup',
  'fragrance': 'Fragrance',
  'perfume': 'Fragrance',
  'cologne': 'Fragrance',
  'hair': 'Haircare',
  'shampoo': 'Haircare',
  'conditioner': 'Haircare',
  'body': 'Body Care',
  'lotion': 'Body Care',
  'cream': 'Skincare'
};

// Market pricing configuration
const MARKET_CURRENCIES = {
  'EG': { code: 'EGP', rate: 1, symbol: 'ج.م' },
  'SA': { code: 'SAR', rate: 0.133, symbol: '﷼' },
  'AE': { code: 'AED', rate: 0.137, symbol: 'd.إ' },
  'KW': { code: 'KWD', rate: 0.0082, symbol: 'd.ك' },
  'QA': { code: 'QAR', rate: 0.137, symbol: 'ر.ق' },
  'BH': { code: 'BHD', rate: 0.0106, symbol: 'd.ب' },
  'OM': { code: 'OMR', rate: 0.0103, symbol: 'ر.ع.' },
  'JO': { code: 'JOD', rate: 0.0355, symbol: 'd.ا' },
  'PS': { code: 'ILS', rate: 0.270, symbol: '₪' },
  'LB': { code: 'LBP', rate: 9.75, symbol: 'ل.ل' },
  'IR': { code: 'IRR', rate: 10500, symbol: '﷼' }
};

class AlFouadCatalogScraper {
  constructor() {
    this.products = [];
    this.errors = [];
    this.session = axios.create({
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
  }

  // Convert EGP price to local currencies
  convertPrice(usdPrice, marketCode) {
    const market = MARKET_CURRENCIES[marketCode];
    if (!market) return usdPrice;
    
    // Assuming the fetched price is in USD, convert to local currency
    const rate = market.rate;
    return Math.round(usdPrice / rate * 100) / 100;
  }

  // Extract category from product data
  identifyCategory(productName, productDescription) {
    const text = `${productName} ${productDescription}`.toLowerCase();
    
    for (const [keyword, category] of Object.entries(CATEGORY_MAP)) {
      if (text.includes(keyword)) {
        return category;
      }
    }
    
    return 'Beauty'; // Default category
  }

  // Scrape Al Fouad homepage to find product links
  async scrapeProductLinks() {
    console.log('🔍 Scanning Al Fouad Pharmacies catalog...');
    
    try {
      const response = await this.session.get(`${ALFOUAD_BASE_URL}/en`);
      const $ = cheerio.load(response.data);
      
      const links = new Set();
      
      // Find product listing links
      $('a[href*="/collections/"], a[href*="/products/"]').each((_, el) => {
        const href = $(el).attr('href');
        if (href && !href.includes('collections') && href.includes('products')) {
          links.add(href.startsWith('http') ? href : `${ALFOUAD_BASE_URL}${href}`);
        }
      });

      // Also check category pages
      const categoryLinks = [
        '/collections/shop-by-concern',
        '/collections/brands',
        '/collections/skincare',
        '/collections/makeup'
      ];

      for (const catLink of categoryLinks) {
        try {
          const catResponse = await this.session.get(`${ALFOUAD_BASE_URL}${catLink}`);
          const cat$ = cheerio.load(catResponse.data);
          
          cat$('a[href*="/products/"]').each((_, el) => {
            const href = cat$(el).attr('href');
            if (href) {
              links.add(href.startsWith('http') ? href : `${ALFOUAD_BASE_URL}${href}`);
            }
          });
        } catch (e) {
          // Skip invalid category links
        }
      }

      console.log(`✅ Found ${links.size} product links`);
      return Array.from(links);
    } catch (error) {
      console.error('❌ Failed to scan catalog:', error.message);
      return [];
    }
  }

  // Extract product details from product page
  async extractProductDetails(productUrl) {
    try {
      const response = await this.session.get(productUrl);
      const $ = cheerio.load(response.data);
      
      // Extract basic info
      const name = $('h1.product-title, h1[class*="title"]').text().trim() 
                || $('meta[property="og:title"]').attr('content')
                || '';
      
      const description = $('div.product-description, div[class*="description"]').text().trim()
                        || $('meta[name="description"]').attr('content')
                        || '';
      
      const priceText = $('span.price, span[class*="price"]').first().text().trim();
      const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
      
      // Extract images
      const images = [];
      $('img.product-image, img[class*="product"]').each((_, el) => {
        const src = $(el).attr('src') || $(el).attr('data-src');
        if (src && !src.includes('placeholder')) {
          images.push(src.startsWith('http') ? src : `${ALFOUAD_BASE_URL}${src}`);
        }
      });

      // Extract brand
      let brand = $('span.brand, span[class*="brand"]').text().trim() || 'Al Fouad';
      
      // Extract SKU/Product code
      const sku = $('span.sku, span[class*="sku"], [class*="product-code"]').text().trim()
                || productUrl.split('/').pop().toUpperCase();

      // Stock status
      const stockText = $('span.stock, span[class*="stock"], span[class*="availability"]').text().toLowerCase();
      const inStock = !stockText.includes('out of stock') && !stockText.includes('unavailable');

      if (!name || !price) {
        return null;
      }

      const category = this.identifyCategory(name, description);
      
      return {
        sku: `ALFOUAD-${sku.replace(/[^A-Z0-9]/g, '')}`,
        name: name.slice(0, 255),
        nameAr: name, // Would need translation in production
        brand: brand.slice(0, 120),
        category,
        categoryId: `CAT-${category.toUpperCase().replace(/\s+/g, '-')}`,
        description: description.slice(0, 1000),
        descriptionAr: description.slice(0, 1000),
        priceUSD: price,
        priceLocal: Object.fromEntries(
          Object.entries(MARKET_CURRENCIES).map(([market, config]) => [
            market,
            Math.round(this.convertPrice(price, market) * 100) / 100
          ])
        ),
        stock: inStock ? 100 : 0, // Assume 100 if in stock, 0 if not
        gtin: sku.replace(/[^0-9]/g, '').slice(0, 14) || `${Date.now()}`,
        images: images.slice(0, 5), // Max 5 images
        markets: ['EG', 'SA', 'AE', 'KW', 'QA', 'BH'], // Available markets
        source: 'Al Fouad Pharmacies',
        sourceUrl: productUrl,
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      this.errors.push({ url: productUrl, error: error.message });
      return null;
    }
  }

  // Main scraping orchestration
  async scrapeAndImport(maxProducts = 50) {
    console.log('\n🚀 Al Fouad Pharmacies Product Scraper');
    console.log('─'.repeat(50));
    
    // Get product links
    const links = await this.scrapeProductLinks();
    const limitedLinks = links.slice(0, maxProducts);
    
    console.log(`📥 Extracting details from ${limitedLinks.length} products...\n`);
    
    // Extract each product
    let processedCount = 0;
    for (const link of limitedLinks) {
      const product = await this.extractProductDetails(link);
      
      if (product) {
        this.products.push(product);
        console.log(`✅ ${processedCount + 1}. ${product.name} (${product.category})`);
      } else {
        console.log(`⏭️  Skipped: ${link}`);
      }
      
      processedCount++;
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n' + '─'.repeat(50));
    console.log(`✅ Successfully scraped: ${this.products.length}/${limitedLinks.length} products`);
    
    if (this.errors.length > 0) {
      console.log(`⚠️  Errors: ${this.errors.length}`);
    }

    return {
      total: limitedLinks.length,
      successful: this.products.length,
      failed: this.errors.length,
      products: this.products,
      errors: this.errors
    };
  }

  // Export to JSON for PM Cosmetics Hub
  async exportToPMCatalog(outputPath = 'data/products/alfouad-catalog.json') {
    console.log(`\n💾 Exporting to PM Cosmetics catalog...`);
    
    try {
      await mkdir('data/products', { recursive: true });
      
      const catalog = {
        source: 'Al Fouad Pharmacies',
        sourceUrl: ALFOUAD_BASE_URL,
        exportDate: new Date().toISOString(),
        totalProducts: this.products.length,
        products: this.products.map(p => ({
          sku: p.sku,
          name: p.name,
          nameAr: p.nameAr,
          brand: p.brand,
          category: p.category,
          categoryId: p.categoryId,
          description: p.description,
          descriptionAr: p.descriptionAr,
          pricing: {
            usd: p.priceUSD,
            byMarket: p.priceLocal
          },
          inventory: {
            stock: p.stock,
            lastUpdated: new Date().toISOString()
          },
          media: {
            images: p.images
          },
          metadata: {
            barcode: p.gtin,
            source: p.source,
            sourceUrl: p.sourceUrl
          },
          availability: {
            markets: p.markets,
            active: p.stock > 0
          }
        }))
      };

      await writeFile(outputPath, JSON.stringify(catalog, null, 2));
      console.log(`✅ Exported to: ${outputPath}`);
      
      return outputPath;
    } catch (error) {
      console.error('❌ Export failed:', error.message);
      throw error;
    }
  }

  // Generate CSV for bulk import
  async exportToCSV(outputPath = 'data/products/alfouad-catalog.csv') {
    console.log(`\n📊 Generating CSV for bulk import...`);
    
    try {
      await mkdir('data/products', { recursive: true });
      
      const header = 'sku,name,nameAr,brand,category,categoryId,description,descriptionAr,priceUSD,price_EGP,price_SAR,price_AED,price_KWD,stock,gtin,images,markets,sourceUrl\n';
      
      const rows = this.products.map(p => {
        const imageStr = p.images.join('|');
        const marketStr = p.markets.join(',');
        
        return [
          p.sku,
          `"${p.name.replace(/"/g, '""')}"`,
          `"${p.nameAr.replace(/"/g, '""')}"`,
          p.brand,
          p.category,
          p.categoryId,
          `"${p.description.replace(/"/g, '""')}"`,
          `"${p.descriptionAr.replace(/"/g, '""')}"`,
          p.priceUSD,
          p.priceLocal['EG'] || '',
          p.priceLocal['SA'] || '',
          p.priceLocal['AE'] || '',
          p.priceLocal['KW'] || '',
          p.stock,
          p.gtin,
          `"${imageStr}"`,
          marketStr,
          p.sourceUrl
        ].join(',');
      }).join('\n');

      const csv = header + rows;
      await writeFile(outputPath, csv);
      console.log(`✅ Generated CSV: ${outputPath}`);
      
      return outputPath;
    } catch (error) {
      console.error('❌ CSV generation failed:', error.message);
      throw error;
    }
  }
}

// Main execution
async function main() {
  const scraper = new AlFouadCatalogScraper();
  
  try {
    // Scrape products
    const maxProducts = parseInt(process.argv[2]) || 20;
    const results = await scraper.scrapeAndImport(maxProducts);
    
    // Export formats
    await scraper.exportToPMCatalog();
    await scraper.exportToCSV();
    
    console.log('\n✅ Al Fouad catalog ready for PM Cosmetics Hub sync!');
    process.exit(results.failed === results.total ? 1 : 0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { AlFouadCatalogScraper };
