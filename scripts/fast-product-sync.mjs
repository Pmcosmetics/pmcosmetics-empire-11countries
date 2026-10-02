#!/usr/bin/env node
/**
 * PM Cosmetics Hub - Fast Product Sync Engine
 * Synchronizes beauty products with images and prices across:
 * - WooCommerce (Central hub)
 * - Shopify
 * - Noon
 * - Local inventory
 */

import axios from 'axios';
import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const SYNC_DIR = 'sync-logs';
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');
const LOG_FILE = join(SYNC_DIR, `sync-${TIMESTAMP}.json`);

class ProductSyncEngine {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      platforms: {},
      stats: {
        total: 0,
        synced: 0,
        failed: 0,
        skipped: 0
      }
    };
  }

  // WooCommerce: Central hub for product data
  async syncToWooCommerce(products) {
    console.log('🔄 Syncing to WooCommerce...');
    const wooUrl = process.env.WOOCOMMERCE_URL?.trim().replace(/\/+$/, '');
    const key = process.env.WOOCOMMERCE_CONSUMER_KEY?.trim();
    const secret = process.env.WOOCOMMERCE_CONSUMER_SECRET?.trim();

    if (!wooUrl || !key || !secret) {
      console.warn('⚠️  WooCommerce credentials not configured, skipping');
      return { status: 'skipped', reason: 'CREDENTIALS_MISSING' };
    }

    try {
      const auth = `Basic ${Buffer.from(`${key}:${secret}`).toString('base64')}`;
      const wooResults = [];

      for (const product of products) {
        try {
          const payload = {
            name: product.name,
            description: product.description || '',
            regular_price: String(product.priceUSD),
            sku: product.sku,
            manage_stock: true,
            stock_quantity: product.stock,
            status: product.stock > 0 ? 'publish' : 'draft',
            images: (product.images || []).slice(0, 3).map(url => ({ src: url })),
            categories: [{ name: product.category || 'Beauty' }],
            meta_data: [
              { key: '_pm_sku', value: product.sku },
              { key: '_pm_brand', value: product.brand || '' },
              { key: '_pm_markets', value: JSON.stringify(product.markets || []) }
            ]
          };

          // Try update first, then create
          let response;
          try {
            // Search for existing product
            const existing = await axios.get(`${wooUrl}/wp-json/wc/v3/products?sku=${product.sku}`, {
              headers: { Authorization: auth }
            });

            if (existing.data?.length > 0) {
              const productId = existing.data[0].id;
              response = await axios.put(`${wooUrl}/wp-json/wc/v3/products/${productId}`, payload, {
                headers: { Authorization: auth, 'Content-Type': 'application/json' }
              });
              wooResults.push({ sku: product.sku, status: 'updated', id: productId });
            } else {
              throw new Error('NOT_FOUND');
            }
          } catch (e) {
            if (e.message === 'NOT_FOUND' || e.response?.status === 404) {
              response = await axios.post(`${wooUrl}/wp-json/wc/v3/products`, payload, {
                headers: { Authorization: auth, 'Content-Type': 'application/json' }
              });
              wooResults.push({ sku: product.sku, status: 'created', id: response.data.id });
            } else {
              throw e;
            }
          }
        } catch (error) {
          wooResults.push({ sku: product.sku, status: 'failed', error: error.message });
        }
      }

      this.results.platforms.woocommerce = {
        status: 'completed',
        results: wooResults,
        success: wooResults.filter(r => r.status !== 'failed').length,
        failed: wooResults.filter(r => r.status === 'failed').length
      };

      console.log(`✅ WooCommerce: ${wooResults.filter(r => r.status !== 'failed').length}/${products.length} synced`);
      return this.results.platforms.woocommerce;
    } catch (error) {
      console.error('❌ WooCommerce sync failed:', error.message);
      this.results.platforms.woocommerce = { status: 'error', error: error.message };
      return this.results.platforms.woocommerce;
    }
  }

  // Shopify: Sync via REST API
  async syncToShopify(products) {
    console.log('🔄 Syncing to Shopify...');
    const shopifyStore = process.env.SHOPIFY_STORE_URL?.trim();
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN?.trim();

    if (!shopifyStore || !accessToken) {
      console.warn('⚠️  Shopify credentials not configured, skipping');
      return { status: 'skipped', reason: 'CREDENTIALS_MISSING' };
    }

    try {
      const shopifyResults = [];

      for (const product of products) {
        try {
          const payload = {
            product: {
              title: product.name,
              body_html: product.description || '',
              vendor: product.brand || 'PM Cosmetics',
              product_type: product.category || 'Beauty',
              variants: [
                {
                  option1: 'Default',
                  price: String(product.priceUSD),
                  sku: product.sku,
                  inventory_quantity: product.stock,
                  inventory_management: 'shopify'
                }
              ],
              images: (product.images || []).map(src => ({ src })),
              metafields: [
                { namespace: 'pm_cosmetics', key: 'markets', type: 'json', value: JSON.stringify(product.markets || []) }
              ]
            }
          };

          const response = await axios.post(`https://${shopifyStore}/admin/api/2024-01/products.json`, payload, {
            headers: {
              'X-Shopify-Access-Token': accessToken,
              'Content-Type': 'application/json'
            }
          });

          shopifyResults.push({ sku: product.sku, status: 'created', shopifyId: response.data.product.id });
        } catch (error) {
          shopifyResults.push({ sku: product.sku, status: 'failed', error: error.message });
        }
      }

      this.results.platforms.shopify = {
        status: 'completed',
        results: shopifyResults,
        success: shopifyResults.filter(r => r.status !== 'failed').length,
        failed: shopifyResults.filter(r => r.status === 'failed').length
      };

      console.log(`✅ Shopify: ${shopifyResults.filter(r => r.status !== 'failed').length}/${products.length} synced`);
      return this.results.platforms.shopify;
    } catch (error) {
      console.error('❌ Shopify sync failed:', error.message);
      this.results.platforms.shopify = { status: 'error', error: error.message };
      return this.results.platforms.shopify;
    }
  }

  // Noon: Middle East marketplace
  async syncToNoon(products) {
    console.log('🔄 Syncing to Noon...');
    const noonUrl = process.env.NOON_API_URL || 'https://api.noon.partners';
    const noonApiKey = process.env.NOON_API_KEY?.trim();
    const noonSellerId = process.env.NOON_SELLER_ID?.trim();

    if (!noonApiKey || !noonSellerId) {
      console.warn('⚠️  Noon credentials not configured, skipping');
      return { status: 'skipped', reason: 'CREDENTIALS_MISSING' };
    }

    try {
      const noonResults = [];

      for (const product of products) {
        try {
          // Noon requires Arabic content and price per market
          const payload = {
            productName: product.name,
            productNameAr: product.nameAr || product.name,
            sku: product.sku,
            barcode: product.gtin || product.sku,
            category: product.categoryId || '10000',
            description: product.description || '',
            descriptionAr: product.descriptionAr || product.description || '',
            price: product.priceUSD,
            currency: 'USD',
            stock: product.stock,
            images: product.images || [],
            status: product.stock > 0 ? 'ACTIVE' : 'INACTIVE',
            attributes: {
              brand: product.brand || 'PM Cosmetics',
              condition: 'NEW'
            }
          };

          const response = await axios.post(`${noonUrl}/v1/products`, payload, {
            headers: {
              'Authorization': `Bearer ${noonApiKey}`,
              'X-Seller-Id': noonSellerId,
              'Content-Type': 'application/json'
            }
          });

          noonResults.push({ sku: product.sku, status: 'listed', noonId: response.data.data?.productId });
        } catch (error) {
          noonResults.push({ sku: product.sku, status: 'failed', error: error.message });
        }
      }

      this.results.platforms.noon = {
        status: 'completed',
        results: noonResults,
        success: noonResults.filter(r => r.status !== 'failed').length,
        failed: noonResults.filter(r => r.status === 'failed').length
      };

      console.log(`✅ Noon: ${noonResults.filter(r => r.status !== 'failed').length}/${products.length} synced`);
      return this.results.platforms.noon;
    } catch (error) {
      console.error('❌ Noon sync failed:', error.message);
      this.results.platforms.noon = { status: 'error', error: error.message };
      return this.results.platforms.noon;
    }
  }

  // Amazon: Optional marketplace
  async syncToAmazon(products) {
    console.log('🔄 Syncing to Amazon...');
    const amazonApiKey = process.env.AMAZON_API_KEY?.trim();
    const amazonSellerId = process.env.AMAZON_SELLER_ID?.trim();

    if (!amazonApiKey || !amazonSellerId) {
      console.warn('⚠️  Amazon credentials not configured, skipping');
      return { status: 'skipped', reason: 'CREDENTIALS_MISSING' };
    }

    try {
      const amazonResults = [];
      console.log(`✅ Amazon: Ready (requires FBA setup)`);
      
      // Placeholder for Amazon MWS integration
      this.results.platforms.amazon = {
        status: 'ready',
        message: 'Amazon integration requires MWS setup',
        results: []
      };

      return this.results.platforms.amazon;
    } catch (error) {
      console.error('❌ Amazon sync failed:', error.message);
      this.results.platforms.amazon = { status: 'error', error: error.message };
      return this.results.platforms.amazon;
    }
  }

  // Local inventory JSON export
  async exportLocal(products) {
    console.log('💾 Exporting to local inventory...');
    
    try {
      await mkdir('data/products', { recursive: true });
      
      const timestamp = new Date().toISOString();
      const inventory = {
        export_timestamp: timestamp,
        total_products: products.length,
        products: products.map(p => ({
          sku: p.sku,
          name: p.name,
          nameAr: p.nameAr,
          brand: p.brand,
          category: p.category,
          description: p.description,
          price_usd: p.priceUSD,
          price_local: p.priceLocal || {},
          stock: p.stock,
          images: p.images,
          markets: p.markets,
          gtin: p.gtin,
          createdAt: p.createdAt || timestamp,
          updatedAt: timestamp
        }))
      };

      await writeFile(
        'data/products/inventory.json',
        JSON.stringify(inventory, null, 2)
      );

      this.results.platforms.local = {
        status: 'exported',
        file: 'data/products/inventory.json',
        count: products.length
      };

      console.log(`✅ Local: ${products.length} products exported`);
      return this.results.platforms.local;
    } catch (error) {
      console.error('❌ Local export failed:', error.message);
      this.results.platforms.local = { status: 'error', error: error.message };
      return this.results.platforms.local;
    }
  }

  // Main sync orchestrator
  async syncAll(products) {
    console.log('\n🚀 PM Cosmetics Hub - Multi-Platform Sync Engine');
    console.log(`📦 Syncing ${products.length} products...`);
    console.log('─'.repeat(50));

    this.results.stats.total = products.length;

    // Run all syncs in parallel for speed
    await Promise.allSettled([
      this.syncToWooCommerce(products),
      this.syncToShopify(products),
      this.syncToNoon(products),
      this.syncToAmazon(products),
      this.exportLocal(products)
    ]);

    // Calculate final stats
    Object.values(this.results.platforms).forEach(platform => {
      if (platform.success) {
        this.results.stats.synced += platform.success;
        this.results.stats.failed += platform.failed || 0;
      } else if (platform.status === 'exported') {
        this.results.stats.synced += platform.count;
      } else if (platform.status === 'skipped') {
        this.results.stats.skipped += 1;
      }
    });

    console.log('─'.repeat(50));
    console.log(`\n📊 Sync Summary:`);
    console.log(`   Total: ${this.results.stats.total}`);
    console.log(`   ✅ Synced: ${this.results.stats.synced}`);
    console.log(`   ❌ Failed: ${this.results.stats.failed}`);
    console.log(`   ⏭️  Skipped: ${this.results.stats.skipped}`);

    // Save results
    await mkdir(SYNC_DIR, { recursive: true });
    await writeFile(LOG_FILE, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Results saved: ${LOG_FILE}`);

    return this.results;
  }
}

// Example usage with sample products
async function main() {
  const sampleProducts = [
    {
      sku: 'PM-LIPSTICK-001',
      name: 'Premium Rose Lipstick',
      nameAr: 'أحمر الشفاه الوردي الفاخر',
      brand: 'PM Beauty',
      category: 'Makeup',
      categoryId: '10001',
      description: 'Luxurious long-lasting lipstick',
      descriptionAr: 'أحمر شفاه فاخر وطويل الأمد',
      priceUSD: 24.99,
      priceLocal: {
        EGP: 774,
        SAR: 94,
        AED: 92,
        KWD: 7.8
      },
      stock: 150,
      gtin: '1234567890123',
      images: [
        'https://images.example.com/lipstick-rose-1.jpg',
        'https://images.example.com/lipstick-rose-2.jpg',
        'https://images.example.com/lipstick-rose-3.jpg'
      ],
      markets: ['EG', 'SA', 'AE', 'KW', 'QA', 'BH'],
      createdAt: new Date().toISOString()
    },
    {
      sku: 'PM-SERUM-002',
      name: 'Vitamin C Face Serum',
      nameAr: 'سيروم الوجه بفيتامين سي',
      brand: 'PM Science',
      category: 'Skincare',
      categoryId: '10002',
      description: 'Brightening vitamin C serum for all skin types',
      descriptionAr: 'سيروم فيتامين سي المنير لجميع أنواع البشرة',
      priceUSD: 34.99,
      priceLocal: {
        EGP: 1087,
        SAR: 132,
        AED: 128,
        KWD: 10.8
      },
      stock: 89,
      gtin: '1234567890124',
      images: [
        'https://images.example.com/serum-vc-1.jpg',
        'https://images.example.com/serum-vc-2.jpg'
      ],
      markets: ['EG', 'SA', 'AE', 'KW', 'QA', 'BH', 'OM'],
      createdAt: new Date().toISOString()
    }
  ];

  const engine = new ProductSyncEngine();
  const results = await engine.syncAll(sampleProducts);
  
  process.exit(results.stats.failed > 0 ? 1 : 0);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { ProductSyncEngine };
