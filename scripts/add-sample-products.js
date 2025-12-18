import { prisma } from '../src/db/prisma.js';
import { logger } from '../src/utils/logger.js';

/**
 * Add sample products to the database
 */
async function addSampleProducts() {
  try {
    logger.info('🛒 Adding sample products to the database...');

    // Sample products with realistic barcodes and names
    const sampleProducts = [
      {
        barcode: '6414893001022',
        barcodeType: 'EAN13',
        name: 'Fazer Blue Original Milk Chocolate 200g',
        initialPrice: 3.95
      },
      {
        barcode: '6411401026812',
        barcodeType: 'EAN13', 
        name: 'Valio Fresh Milk 1L',
        initialPrice: 1.29
      },
      {
        barcode: '6410405049735',
        barcodeType: 'EAN13',
        name: 'Oululainen Reissumies Rye Bread 500g',
        initialPrice: 2.15
      },
      {
        barcode: '5701184005385',
        barcodeType: 'EAN13',
        name: 'Arla Organic Butter 500g',
        initialPrice: 4.25
      },
      {
        barcode: '6438177000762',
        barcodeType: 'EAN13',
        name: 'Pirkka Free-range Eggs 12pcs',
        initialPrice: 3.49
      },
      {
        barcode: '6411300001026',
        barcodeType: 'EAN13',
        name: 'Paulig Juhla Mokka Ground Coffee 500g',
        initialPrice: 6.95
      },
      {
        barcode: '6414893210134',
        barcodeType: 'EAN13',
        name: 'Vaasan Ruispalat Crisp Bread 250g',
        initialPrice: 2.85
      },
      {
        barcode: '6410405001955',
        barcodeType: 'EAN13',
        name: 'Atria Chicken Breast Fillet 400g',
        initialPrice: 7.25
      }
    ];

    let createdCount = 0;
    let skippedCount = 0;

    for (const productData of sampleProducts) {
      // Check if product already exists
      const existingProduct = await prisma.product.findUnique({
        where: {
          barcode_barcodeType: {
            barcode: productData.barcode,
            barcodeType: productData.barcodeType
          }
        }
      });

      if (existingProduct) {
        logger.info(`  Product ${productData.name} already exists, skipping...`);
        skippedCount++;
        continue;
      }

      // Create the product
      const product = await prisma.product.create({
        data: {
          barcode: productData.barcode,
          barcodeType: productData.barcodeType,
          name: productData.name
        }
      });

      // Add an initial price observation (as if reported by a shopper)
      await prisma.price.create({
        data: {
          productId: product.id,
          amount: productData.initialPrice,
          source: 'SHOPPER',
          latitude: 60.4518, // Turku coordinates as example
          longitude: 22.2666,
          observedAt: new Date()
        }
      });

      logger.info(` Created product: ${productData.name} (€${productData.initialPrice})`);
      createdCount++;
    }

    logger.info(` Sample products added successfully!`);
    logger.info(`   Created: ${createdCount} products`);
    logger.info(`   Skipped: ${skippedCount} products (already existed)`);

    // Display current statistics
    const totalProducts = await prisma.product.count();
    const totalPrices = await prisma.price.count({ where: { isActive: true } });
    
    logger.info('\n Current Database Statistics:');
    logger.info(`   Total Products: ${totalProducts}`);
    logger.info(`   Total Active Prices: ${totalPrices}`);

  } catch (error) {
    logger.error('Error adding sample products:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
addSampleProducts()
  .then(() => {
    logger.info(' Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Script failed:', error);
    process.exit(1);
  });