import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { ProductService } from '../../modules/product/product.service';
import { ProductStatus } from '../../common/enums';
import * as fs from 'fs';
import * as path from 'path';

interface ProductData {
  name: string;
  category: string;
  unit: string;
  price: number;
  sku?: string;
  imageUrl?: string;
}

async function importProducts() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const productService = app.get(ProductService);

  try {
    // Đọc file JSON - hỗ trợ cả khi chạy từ src và dist
    const possiblePaths = [
      path.join(__dirname, '../../../data/bhx-products.json'), // Từ src
      path.join(process.cwd(), 'data/bhx-products.json'), // Từ root
      path.join(process.cwd(), 'Backend/data/bhx-products.json'), // Từ workspace root
    ];
    
    let jsonPath: string | null = null;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        jsonPath = p;
        break;
      }
    }
    
    if (!jsonPath) {
      console.error(`❌ File not found. Tried:`);
      possiblePaths.forEach(p => console.error(`   - ${p}`));
      console.log('\n💡 Please run convert-csv.ts first to generate the JSON file');
      process.exit(1);
    }
    
    console.log(`📂 Reading from: ${jsonPath}`);

    const productsData: ProductData[] = JSON.parse(
      fs.readFileSync(jsonPath, 'utf-8'),
    );

    console.log(`📦 Found ${productsData.length} products to import...\n`);

    let successCount = 0;
    let errorCount = 0;
    const errors: Array<{ product: string; error: string }> = [];

    // Import từng sản phẩm
    for (const productData of productsData) {
      try {
        await productService.create({
          name: productData.name,
          category: productData.category,
          unit: productData.unit,
          price: productData.price,
          sku: productData.sku,
          imageUrl: productData.imageUrl,
          status: ProductStatus.ACTIVE, // Mặc định active
        });
        successCount++;
        if (successCount % 10 === 0) {
          console.log(`  ✅ Imported ${successCount}/${productsData.length} products...`);
        }
      } catch (error: any) {
        errorCount++;
        const errorMsg = error.message || 'Unknown error';
        errors.push({
          product: productData.name,
          error: errorMsg,
        });
        console.error(`  ❌ Failed to import "${productData.name}": ${errorMsg}`);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Import Summary:');
    console.log(`  ✅ Success: ${successCount} products`);
    console.log(`  ❌ Failed: ${errorCount} products`);
    console.log(`  📦 Total: ${productsData.length} products`);

    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.forEach((err, index) => {
        console.log(`  ${index + 1}. ${err.product}: ${err.error}`);
      });
    }

    console.log('\n✅ Import completed!');
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

void importProducts();

