import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { ProductService } from '../../modules/product/product.service';
import { ProductStatus } from '../../common/enums';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../../schemas';
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

async function reimportProducts() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const productService = app.get(ProductService);
  const productModel = app.get<Model<ProductDocument>>(getModelToken(Product.name));

  try {
    // Bước 1: Xóa tất cả sản phẩm hiện tại (hard delete)
    console.log('🗑️  Đang xóa tất cả sản phẩm hiện tại...\n');
    
    // Đếm số sản phẩm trước khi xóa
    const countBefore = await productModel.countDocuments({});
    console.log(`📦 Tìm thấy ${countBefore} sản phẩm trong database`);
    
    // Xóa tất cả sản phẩm (kể cả đã soft delete)
    const deleteResult = await productModel.deleteMany({});
    console.log(`✅ Đã xóa ${deleteResult.deletedCount} sản phẩm\n`);
    console.log('='.repeat(50));
    console.log('📥 Bắt đầu import sản phẩm mới...\n');

    // Bước 2: Import sản phẩm mới từ JSON
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

    console.log(`📦 Found ${productsData.length} products to import...\n`);

    let successCount = 0;
    let errorCount = 0;
    const errors: Array<{ product: string; error: string }> = [];

    // Import từng sản phẩm
    const usedSkus = new Set<string>();
    for (const productData of productsData) {
      try {
        // Kiểm tra SKU trùng trong cùng batch import
        let finalSku = productData.sku;
        if (finalSku && usedSkus.has(finalSku)) {
          // Nếu SKU đã được dùng, bỏ SKU để tránh conflict
          finalSku = undefined;
        }
        if (finalSku) {
          usedSkus.add(finalSku);
        }

        await productService.create({
          name: productData.name,
          category: productData.category,
          unit: productData.unit,
          price: productData.price,
          sku: finalSku,
          imageUrl: productData.imageUrl,
          status: ProductStatus.ACTIVE, // Mặc định active
        });
        successCount++;
        if (successCount % 10 === 0) {
          console.log(
            `  ✅ Imported ${successCount}/${productsData.length} products...`,
          );
        }
      } catch (error: any) {
        errorCount++;
        const errorMsg = error.message || 'Unknown error';
        errors.push({
          product: productData.name,
          error: errorMsg,
        });
        console.error(
          `  ❌ Failed to import "${productData.name}": ${errorMsg}`,
        );
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Import Summary:');
    console.log(`  ✅ Success: ${successCount} products`);
    console.log(`  ❌ Failed: ${errorCount} products`);
    console.log(`  📦 Total: ${productsData.length} products`);

    if (errors.length > 0 && errors.length <= 20) {
      console.log('\n❌ Errors:');
      errors.forEach((err, index) => {
        console.log(`  ${index + 1}. ${err.product}: ${err.error}`);
      });
    }

    console.log('\n✅ Reimport completed!');
  } catch (error) {
    console.error('❌ Reimport failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

void reimportProducts();

