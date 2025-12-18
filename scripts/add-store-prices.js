import { prisma } from '../src/db/prisma.js';
import { logger } from '../src/utils/logger.js';

/**
 * Add sample price data from registered stores
 */
async function addStorePriceData() {
  try {
    logger.info('🏪 Adding sample price data from registered stores...');

    // Get active stores from the database
    const stores = await prisma.store.findMany({
      where: {
        status: {
          in: ['ACTIVE', 'PENDING'] // Include both active and pending stores
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        latitude: true,
        longitude: true
      }
    });

    if (stores.length === 0) {
      logger.warn('No active stores found in the database');
      return;
    }

    logger.info(`Found ${stores.length} stores to add price data for`);

    // Get existing products
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        barcode: true
      }
    });

    if (products.length === 0) {
      logger.warn('No products found in the database');
      return;
    }

    logger.info(`Found ${products.length} products`);

    // Define price variations for different store types
    const priceVariations = {
      'Test Store': { multiplier: 0.95, description: 'Budget-friendly prices' },
      'Test Store 2': { multiplier: 1.05, description: 'Premium pricing' },
      'New Test Store': { multiplier: 1.00, description: 'Market average' },
      'Success Store': { multiplier: 1.08, description: 'High-end pricing' },
      'Final Test Store': { multiplier: 0.92, description: 'Competitive pricing' }
    };

    let totalPricesAdded = 0;
    const pricesPerStore = Math.min(5, products.length); // Add prices for up to 5 products per store

    for (const store of stores) {
      logger.info(`\n📍 Adding prices for: ${store.name} (${store.status})`);
      
      // Get base pricing multiplier for this store
      const variation = priceVariations[store.name] || { multiplier: 1.00, description: 'Standard pricing' };
      logger.info(`   ${variation.description} (${variation.multiplier}x base price)`);

      // Select random products for this store (or first N products)
      const selectedProducts = products
        .sort(() => Math.random() - 0.5) // Shuffle products
        .slice(0, pricesPerStore);

      for (const product of selectedProducts) {
        // Get the current shopper price for this product to use as base
        const shopperPrice = await prisma.price.findFirst({
          where: {
            productId: product.id,
            storeId: null, // Shopper submission
            isActive: true
          },
          select: { amount: true }
        });

        if (!shopperPrice) {
          logger.warn(`   ⚠️  No shopper price found for ${product.name}, skipping`);
          continue;
        }

        // Calculate store-specific price with some random variation
        const basePrice = shopperPrice.amount;
        const storePrice = Math.round((basePrice * variation.multiplier + (Math.random() - 0.5) * 0.20) * 100) / 100;

        // Create store price entry
        await prisma.price.create({
          data: {
            productId: product.id,
            storeId: store.id,
            amount: storePrice,
            source: 'STORE_USER',
            latitude: store.latitude,
            longitude: store.longitude,
            observedAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)) // Random time within last 7 days
          }
        });

        const priceDiff = ((storePrice - basePrice) / basePrice * 100).toFixed(1);
        const diffSymbol = priceDiff > 0 ? '+' : '';
        
        logger.info(`   ✅ ${product.name}: €${storePrice} (${diffSymbol}${priceDiff}% vs shopper price)`);
        totalPricesAdded++;
      }
    }

    logger.info(`\n🎉 Store price data added successfully!`);
    logger.info(`   Total prices added: ${totalPricesAdded}`);
    logger.info(`   Average prices per store: ${Math.round(totalPricesAdded / stores.length)}`);

    // Display updated statistics
    const totalProducts = await prisma.product.count();
    const totalPrices = await prisma.price.count({ where: { isActive: true } });
    const shopperPrices = await prisma.price.count({ 
      where: { isActive: true, storeId: null } 
    });
    const storePrices = await prisma.price.count({ 
      where: { isActive: true, storeId: { not: null } } 
    });

    logger.info('\n📊 Updated Database Statistics:');
    logger.info(`   Total Products: ${totalProducts}`);
    logger.info(`   Total Active Prices: ${totalPrices}`);
    logger.info(`   └── Shopper Submissions: ${shopperPrices}`);
    logger.info(`   └── Store Submissions: ${storePrices}`);

    // Show price comparison examples
    const priceComparisons = await prisma.price.findMany({
      where: { 
        isActive: true,
        product: {
          prices: {
            some: {
              AND: [
                { isActive: true },
                { storeId: null } // Has shopper price
              ]
            }
          }
        }
      },
      include: {
        product: { select: { name: true } },
        store: { select: { name: true } }
      },
      orderBy: { amount: 'desc' },
      take: 3
    });

    if (priceComparisons.length > 0) {
      logger.info('\n💰 Price Comparison Examples:');
      for (const price of priceComparisons) {
        logger.info(`   ${price.product.name}: €${price.amount} at ${price.store?.name || 'Shopper Report'}`);
      }
    }

  } catch (error) {
    logger.error('Error adding store price data:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
addStorePriceData()
  .then(() => {
    logger.info('✨ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Script failed:', error);
    process.exit(1);
  });