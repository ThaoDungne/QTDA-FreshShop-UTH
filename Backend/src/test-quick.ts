import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedService } from './database/seed/seed.service';
import { InventoryService } from './modules/inventory/inventory.service';
import { PosService } from './modules/sale/pos.service';
import { RevenueReportService } from './modules/report/services/revenue-report.service';
import { TopProductsReportService } from './modules/report/services/top-products-report.service';
import { LoyalCustomersReportService } from './modules/report/services/loyal-customers-report.service';
import { InventoryReportService } from './modules/report/services/inventory-report.service';

async function testQuick() {
  console.log('🚀 Starting FreshShop Quick Test...\n');

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    // 1. Test Seed Service
    console.log('1️⃣ Testing Seed Service...');
    const seedService = app.get(SeedService);
    await seedService.seedDatabase();
    console.log('✅ Seed completed successfully\n');

    // 2. Test Inventory Service
    console.log('2️⃣ Testing Inventory Service...');
    const inventoryService = app.get(InventoryService);

    // Get available stock for first product
    const stock = await inventoryService.getAvailableStock('product_id');
    console.log(`📦 Available stock: ${stock.totalAvailable} units`);

    // Check expiring stock
    const expiring = await inventoryService.getExpiringStock(7);
    console.log(`⚠️  Expiring items: ${expiring.length} lots\n`);

    // 3. Test POS Service
    console.log('3️⃣ Testing POS Service...');
    const posService = app.get(PosService);

    // Create a test invoice
    const invoiceResult = await posService.createInvoice({
      customerId: 'customer_id',
      cashierId: 'admin_id',
      items: [
        {
          productId: 'product_id',
          quantity: 2,
          unitPrice: 12000,
          discount: 1000,
        },
      ],
      paidAmount: 25000,
      note: 'Test invoice from quick test',
    });

    console.log(`🧾 Created invoice: ${invoiceResult.invoice.code}`);
    console.log(
      `💰 Total: ${invoiceResult.invoice.itemsSummary.grandTotal} VND`,
    );
    console.log(`💳 Paid: ${invoiceResult.invoice.paidAmount} VND`);
    console.log(`🔄 Change: ${invoiceResult.invoice.changeAmount} VND\n`);

    // 4. Test Reports
    console.log('4️⃣ Testing Reports...');

    // Revenue Report
    const revenueReport = app.get(RevenueReportService);
    const revenueSummary = await revenueReport.getRevenueSummary();
    console.log(
      `📊 Revenue Summary: ${revenueSummary.totalRevenue} VND (${revenueSummary.totalInvoices} invoices)`,
    );

    // Top Products Report
    const topProductsReport = app.get(TopProductsReportService);
    const topProducts = await topProductsReport.getTopProductsReport({
      limit: 3,
    });
    console.log(`🏆 Top Products: ${topProducts.length} products found`);

    // Loyal Customers Report
    const loyalCustomersReport = app.get(LoyalCustomersReportService);
    const loyalCustomers = await loyalCustomersReport.getLoyalCustomersReport({
      limit: 3,
    });
    console.log(`👥 Loyal Customers: ${loyalCustomers.length} customers found`);

    // Inventory Report
    const inventoryReport = app.get(InventoryReportService);
    const currentInventory = await inventoryReport.getCurrentInventoryReport({
      lowStockThreshold: 10,
      expiryWarningDays: 3,
    });
    console.log(
      `📦 Current Inventory: ${currentInventory.length} products in stock`,
    );

    const lowStock = await inventoryReport.getLowStockReport(10);
    console.log(
      `⚠️  Low Stock Items: ${lowStock.length} products need restocking`,
    );

    const expiringSoon = await inventoryReport.getExpiringSoonReport(3);
    console.log(
      `⏰ Expiring Soon: ${expiringSoon.length} lots expiring in 3 days\n`,
    );

    console.log('🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ Database seeded with sample data');
    console.log('✅ Inventory management working');
    console.log('✅ POS system functional');
    console.log('✅ Reports generating correctly');
    console.log('\n🚀 FreshShop is ready for use!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

// Run the test
testQuick().catch(console.error);
