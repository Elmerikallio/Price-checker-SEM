// Store list report script
import { prisma } from './src/db/prisma.js';

async function getStoreListReport() {
  try {
    console.log('=== STORE LIST REPORT ===\n');

    // Get all stores with their statistics
    const stores = await prisma.store.findMany({
      include: {
        _count: {
          select: {
            prices: {
              where: { isActive: true }
            }
          }
        }
      },
      orderBy: [
        { status: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    // Get summary statistics
    const totalStores = stores.length;
    const activeStores = stores.filter(store => store.status === 'ACTIVE').length;
    const pendingStores = stores.filter(store => store.status === 'PENDING').length;
    const lockedStores = stores.filter(store => store.status === 'LOCKED').length;
    const totalPriceReports = stores.reduce((sum, store) => sum + store._count.prices, 0);

    console.log('📊 SUMMARY STATISTICS');
    console.log(`Total Stores: ${totalStores}`);
    console.log(`├── Active: ${activeStores}`);
    console.log(`├── Pending: ${pendingStores}`);
    console.log(`└── Locked: ${lockedStores}`);
    console.log(`Total Price Reports from Stores: ${totalPriceReports}\n`);

    // Group stores by status for better display
    const storesByStatus = {
      'ACTIVE': stores.filter(s => s.status === 'ACTIVE'),
      'PENDING': stores.filter(s => s.status === 'PENDING'),
      'LOCKED': stores.filter(s => s.status === 'LOCKED')
    };

    // Display stores by status
    for (const [status, storeList] of Object.entries(storesByStatus)) {
      if (storeList.length === 0) continue;

      console.log(`🏪 ${status} STORES (${storeList.length})`);
      console.log('═'.repeat(50));

      storeList.forEach((store, index) => {
        console.log(`${index + 1}. ${store.name}`);
        console.log(`   📧 Email: ${store.email}`);
        console.log(`   📍 Address: ${store.address || 'No address provided'}`);
        console.log(`   📞 Phone: ${store.phone || 'No phone provided'}`);
        console.log(`   🌐 Website: ${store.website || 'No website provided'}`);
        console.log(`   📊 Price Reports: ${store._count.prices}`);
        console.log(`   📅 Created: ${store.createdAt.toISOString().split('T')[0]}`);
        console.log(`   🔄 Last Updated: ${store.updatedAt.toISOString().split('T')[0]}`);
        
        if (store.latitude && store.longitude) {
          console.log(`   🗺️  Location: ${store.latitude.toFixed(4)}, ${store.longitude.toFixed(4)}`);
        }
        
        console.log();
      });
    }

    // Additional insights
    if (stores.length > 0) {
      const storesWithPrices = stores.filter(store => store._count.prices > 0);
      const averagePricesPerStore = storesWithPrices.length > 0 ? 
        (totalPriceReports / storesWithPrices.length).toFixed(1) : 0;

      console.log('📈 INSIGHTS');
      console.log('═'.repeat(30));
      console.log(`Stores with price reports: ${storesWithPrices.length}/${totalStores}`);
      console.log(`Average price reports per active store: ${averagePricesPerStore}`);
      
      if (storesWithPrices.length > 0) {
        const mostActiveStore = storesWithPrices.reduce((prev, current) => 
          (prev._count.prices > current._count.prices) ? prev : current
        );
        console.log(`Most active store: ${mostActiveStore.name} (${mostActiveStore._count.prices} reports)`);
      }
    }

    // Show stores that need attention
    const storesNeedingAttention = stores.filter(store => 
      store.status === 'PENDING' || 
      (store.status === 'ACTIVE' && store._count.prices === 0)
    );

    if (storesNeedingAttention.length > 0) {
      console.log('\n⚠️  STORES NEEDING ATTENTION');
      console.log('═'.repeat(35));
      storesNeedingAttention.forEach(store => {
        const reason = store.status === 'PENDING' ? 'Pending approval' : 
                     store._count.prices === 0 ? 'No price reports yet' : 'Unknown';
        console.log(`• ${store.name} (${store.email}) - ${reason}`);
      });
    }

  } catch (error) {
    console.error('❌ Error generating store report:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

getStoreListReport();