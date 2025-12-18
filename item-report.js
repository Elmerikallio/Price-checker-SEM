// Database item report script
import { prisma } from './src/db/prisma.js';

async function getItemReport() {
  try {
    // Get basic counts
    const totalProducts = await prisma.product.count();
    const totalPrices = await prisma.price.count({ where: { isActive: true } });
    const totalStores = await prisma.store.count();
    const totalUsers = await prisma.user.count();
    
    console.log('=== ITEM REPORT ===');
    console.log(`Total Products: ${totalProducts}`);
    console.log(`Total Active Prices: ${totalPrices}`);
    console.log(`Total Stores: ${totalStores}`);
    console.log(`Total Admin Users: ${totalUsers}`);
    
    if (totalProducts > 0) {
      // Get products with price info
      const products = await prisma.product.findMany({
        include: {
          prices: {
            where: { isActive: true },
            orderBy: { observedAt: 'desc' },
            take: 3,
            include: {
              store: {
                select: { name: true }
              }
            }
          },
          _count: {
            select: { prices: { where: { isActive: true } } }
          }
        },
        take: 10
      });
      
      console.log('\n=== TOP PRODUCTS ===');
      products.forEach(product => {
        console.log(`\nProduct: ${product.name || product.barcode}`);
        console.log(`  Barcode: ${product.barcode} (${product.barcodeType})`);
        console.log(`  Price Reports: ${product._count.prices}`);
        if (product.prices.length > 0) {
          console.log(`  Latest Price: €${product.prices[0].amount}`);
          console.log(`  Store: ${product.prices[0].store?.name || 'Shopper Report'}`);
        }
      });
    } else {
      console.log('\n🔍 No products found in database');
      console.log('The price-checker system is currently empty');
    }
    
    if (totalStores > 0) {
      const stores = await prisma.store.findMany({
        select: {
          name: true,
          email: true,
          status: true,
          _count: {
            select: { prices: { where: { isActive: true } } }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      console.log('\n=== STORE SUMMARY ===');
      stores.forEach(store => {
        console.log(`\nStore: ${store.name}`);
        console.log(`  Email: ${store.email}`);
        console.log(`  Status: ${store.status}`);
        console.log(`  Price Reports: ${store._count.prices}`);
      });
    }
    
    // Get recent activity if any
    const recentPrices = await prisma.price.findMany({
      where: { isActive: true },
      include: {
        product: {
          select: { barcode: true, name: true }
        },
        store: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    if (recentPrices.length > 0) {
      console.log('\n=== RECENT PRICE ACTIVITY ===');
      recentPrices.forEach(price => {
        console.log(`\n€${price.amount} - ${price.product.name || price.product.barcode}`);
        console.log(`  Store: ${price.store?.name || 'Shopper Report'}`);
        console.log(`  Date: ${price.createdAt.toISOString().split('T')[0]}`);
      });
    }
    
  } catch (error) {
    console.error('Error generating report:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

getItemReport();
