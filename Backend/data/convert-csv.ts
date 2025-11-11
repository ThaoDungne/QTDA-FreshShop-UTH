import * as fs from 'fs';
import * as path from 'path';

interface Product {
  name: string;
  category: string;
  unit: string;
  price: number;
  sku?: string;
  imageUrl?: string;
}

interface CategoryStats {
  [key: string]: number;
}

interface UnitStats {
  [key: string]: number;
}

// Hàm parse giá từ format "9.500₫" hoặc "49.000₫ / 2kg" thành number
function parsePrice(priceStr: string | undefined): number | null {
  if (!priceStr || !priceStr.trim()) return null;
  
  // Loại bỏ tất cả ký tự không phải số
  const cleaned = priceStr.replace(/[^\d]/g, '');
  const price = parseInt(cleaned);
  
  return isNaN(price) ? null : price;
}

// Hàm suy luận unit từ tên sản phẩm
function inferUnit(name: string): string {
  const nameLower = name.toLowerCase();
  
  // Kiểm tra các pattern phổ biến
  if (nameLower.includes('gói') || nameLower.includes('túi') || nameLower.includes('hộp')) {
    if (nameLower.includes('gói')) return 'gói';
    if (nameLower.includes('túi')) return 'túi';
    if (nameLower.includes('hộp')) return 'hộp';
  }
  
  if (nameLower.includes('kg') || nameLower.includes('kilogram')) {
    return 'kg';
  }
  
  if (nameLower.includes('g') && !nameLower.includes('kg')) {
    // Kiểm tra xem có phải là gram không (thường có số + g)
    const gramMatch = nameLower.match(/(\d+)\s*g[^k]/);
    if (gramMatch) return 'g';
  }
  
  if (nameLower.includes('bó')) {
    return 'bó';
  }
  
  if (nameLower.includes('trái') || nameLower.includes('quả') || nameLower.includes('củ')) {
    // Có thể là kg hoặc trái, nhưng thường là kg cho trái cây
    if (nameLower.includes('trái') || nameLower.includes('quả')) {
      return 'kg'; // Trái cây thường bán theo kg
    }
    return 'kg'; // Củ cũng thường bán theo kg
  }
  
  // Mặc định
  return 'kg';
}

// Hàm parse CSV line (xử lý dấu phẩy trong giá trị)
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  
  return values;
}

// Main function
function convertCSV(): void {
  // Đọc file CSV gốc
  const csvPath = path.join(__dirname, 'bhx.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());

  // Parse header
  const headers = parseCSVLine(lines[0]);
  const nameIndex = headers.findIndex(h => h.includes('Product Name') || h.includes('name'));
  const categoryIndex = headers.findIndex(h => h.toLowerCase().includes('category') && !h.includes('link'));
  const priceIndex = headers.findIndex(h => h.toLowerCase().includes('price'));
  const orderIndex = headers.findIndex(h => h.includes('web-scraper-order'));
  const imageIndex = headers.findIndex(h => h.toLowerCase().includes('image') || h.includes('image-src'));

  console.log('Headers found:', {
    name: headers[nameIndex],
    category: headers[categoryIndex],
    price: headers[priceIndex],
    order: headers[orderIndex],
    image: headers[imageIndex]
  });

  // Parse CSV lines
  const products: Product[] = [];
  let skippedCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    const values = parseCSVLine(line);
    
    const name = values[nameIndex]?.replace(/^"|"$/g, '') || '';
    const category = values[categoryIndex]?.replace(/^"|"$/g, '') || '';
    const priceStr = values[priceIndex]?.replace(/^"|"$/g, '') || '';
    const orderId = values[orderIndex]?.replace(/^"|"$/g, '') || '';
    const imageUrl = values[imageIndex]?.replace(/^"|"$/g, '') || '';
    
    // Bỏ qua nếu thiếu name, category hoặc price
    if (!name || !category) {
      skippedCount++;
      continue;
    }
    
    const price = parsePrice(priceStr);
    if (price === null) {
      skippedCount++;
      continue;
    }
    
    const unit = inferUnit(name);
    const sku = orderId ? `BHX-${orderId.split('-').pop()}` : undefined;
    
    products.push({
      name: name.trim(),
      category: category.trim(),
      unit: unit,
      price: price,
      ...(sku && { sku: sku }),
      ...(imageUrl && imageUrl.trim() && { imageUrl: imageUrl.trim() })
    });
  }

  console.log(`\nĐã parse ${products.length} sản phẩm`);
  console.log(`Đã bỏ qua ${skippedCount} dòng (thiếu dữ liệu)`);

  // Tạo CSV mới
  const outputHeaders = ['name', 'category', 'unit', 'price', 'sku', 'imageUrl'];
  const outputLines: string[] = [outputHeaders.join(',')];

  products.forEach((product) => {
    const row = [
      `"${product.name}"`,
      `"${product.category}"`,
      `"${product.unit}"`,
      product.price.toString(),
      product.sku ? `"${product.sku}"` : '',
      product.imageUrl ? `"${product.imageUrl}"` : ''
    ];
    outputLines.push(row.join(','));
  });

  // Ghi file CSV mới
  const outputPath = path.join(__dirname, 'bhx-converted.csv');
  fs.writeFileSync(outputPath, outputLines.join('\n'), 'utf-8');

  console.log(`\n✅ Đã tạo file: ${outputPath}`);
  console.log(`📊 Tổng số sản phẩm: ${products.length}`);

  // Tạo file JSON để dễ import
  const jsonPath = path.join(__dirname, 'bhx-products.json');
  fs.writeFileSync(jsonPath, JSON.stringify(products, null, 2), 'utf-8');
  console.log(`✅ Đã tạo file JSON: ${jsonPath}`);

  // Thống kê
  const categoryStats: CategoryStats = {};
  const unitStats: UnitStats = {};
  
  products.forEach(p => {
    categoryStats[p.category] = (categoryStats[p.category] || 0) + 1;
    unitStats[p.unit] = (unitStats[p.unit] || 0) + 1;
  });

  console.log('\n📈 Thống kê theo category:');
  Object.entries(categoryStats).forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count} sản phẩm`);
  });

  console.log('\n📈 Thống kê theo unit:');
  Object.entries(unitStats).forEach(([unit, count]) => {
    console.log(`  ${unit}: ${count} sản phẩm`);
  });
}

// Chạy script
convertCSV();

