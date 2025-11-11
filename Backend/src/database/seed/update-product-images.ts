import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { ProductService } from '../../modules/product/product.service';
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

async function updateProductImages() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const productService = app.get(ProductService);

  try {
    // Đọc file JSON
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
      possiblePaths.forEach((p) => console.error(`   - ${p}`));
      console.log(
        '\n💡 Please run convert-csv.ts first to generate the JSON file',
      );
      process.exit(1);
    }

    console.log(`📂 Reading from: ${jsonPath}`);

    const productsData: ProductData[] = JSON.parse(
      fs.readFileSync(jsonPath, 'utf-8'),
    );

    console.log(`📦 Found ${productsData.length} products to update...\n`);

    let successCount = 0;
    let notFoundCount = 0;
    let noImageCount = 0;
    const errors: Array<{ product: string; error: string }> = [];

    // Cập nhật từng sản phẩm
    for (const productData of productsData) {
      try {
        // Tìm sản phẩm theo SKU hoặc tên
        let product;
        if (productData.sku) {
          const products = await productService.findAll();
          product = products.find((p) => p.sku === productData.sku);
        }

        if (!product) {
          // Thử tìm theo tên
          const products = await productService.findAll();
          product = products.find(
            (p) => p.name.trim() === productData.name.trim(),
          );
        }

        if (!product) {
          notFoundCount++;
          errors.push({
            product: productData.name,
            error: 'Product not found in database',
          });
          continue;
        }

        if (!productData.imageUrl || !productData.imageUrl.trim()) {
          noImageCount++;
          continue;
        }

        // Cập nhật imageUrl
        await productService.update(product._id.toString(), {
          imageUrl: productData.imageUrl,
        });

        successCount++;
        if (successCount % 10 === 0) {
          console.log(
            `  ✅ Updated ${successCount}/${productsData.length} products...`,
          );
        }
      } catch (error: any) {
        const errorMsg = error.message || 'Unknown error';
        errors.push({
          product: productData.name,
          error: errorMsg,
        });
        console.error(
          `  ❌ Failed to update "${productData.name}": ${errorMsg}`,
        );
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Update Summary:');
    console.log(`  ✅ Success: ${successCount} products`);
    console.log(`  ⚠️  Not found: ${notFoundCount} products`);
    console.log(`  ⚠️  No image URL: ${noImageCount} products`);
    console.log(`  ❌ Failed: ${errors.length} products`);
    console.log(`  📦 Total: ${productsData.length} products`);

    if (errors.length > 0 && errors.length <= 20) {
      console.log('\n❌ Errors:');
      errors.forEach((err, index) => {
        console.log(`  ${index + 1}. ${err.product}: ${err.error}`);
      });
    }

    console.log('\n✅ Update completed!');
  } catch (error) {
    console.error('❌ Update failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

void updateProductImages();

