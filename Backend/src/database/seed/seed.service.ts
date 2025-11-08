import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import {
  Admin,
  AdminDocument,
  Customer,
  CustomerDocument,
  Supplier,
  SupplierDocument,
  Product,
  ProductDocument,
  InventoryLot,
  InventoryLotDocument,
  Invoice,
  InvoiceDocument,
  InvoiceItem,
  InvoiceItemDocument,
  Payment,
  PaymentDocument,
  StockMovement,
  StockMovementDocument,
  LoyaltyLedger,
  LoyaltyLedgerDocument,
} from '../../schemas';
import {
  DEFAULT_ADMIN_USERNAME,
  DEFAULT_ADMIN_PASSWORD,
  BCRYPT_ROUNDS,
} from '../../common/constants';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(Supplier.name) private supplierModel: Model<SupplierDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(InventoryLot.name)
    private inventoryLotModel: Model<InventoryLotDocument>,
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    @InjectModel(InvoiceItem.name)
    private invoiceItemModel: Model<InvoiceItemDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(StockMovement.name)
    private stockMovementModel: Model<StockMovementDocument>,
    @InjectModel(LoyaltyLedger.name)
    private loyaltyLedgerModel: Model<LoyaltyLedgerDocument>,
  ) {}

  async seedDatabase() {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await this.clearDatabase();

    // Seed data
    const admin = await this.seedAdmin();
    const suppliers = await this.seedSuppliers();
    const products = await this.seedProducts(suppliers);
    const inventoryLots = await this.seedInventoryLots(products, suppliers);
    const customers = await this.seedCustomers();
    const { invoices, invoiceItems, payments } = await this.seedInvoices(
      admin,
      customers,
      products,
      inventoryLots,
    );

    console.log('✅ Database seeding completed successfully!');
    console.log(
      `📊 Created: ${suppliers.length} suppliers, ${products.length} products, ${customers.length} customers, ${invoices.length} invoices`,
    );
  }

  private async clearDatabase() {
    await this.adminModel.deleteMany({});
    await this.customerModel.deleteMany({});
    await this.supplierModel.deleteMany({});
    await this.productModel.deleteMany({});
    await this.inventoryLotModel.deleteMany({});
    await this.invoiceModel.deleteMany({});
    await this.invoiceItemModel.deleteMany({});
    await this.paymentModel.deleteMany({});
    await this.stockMovementModel.deleteMany({});
    await this.loyaltyLedgerModel.deleteMany({});
  }

  private async seedAdmin(): Promise<AdminDocument> {
    const hashedPassword = await bcrypt.hash(
      DEFAULT_ADMIN_PASSWORD,
      BCRYPT_ROUNDS,
    );

    const admin = new this.adminModel({
      username: DEFAULT_ADMIN_USERNAME,
      password: hashedPassword,
      fullName: 'System Administrator',
      email: 'admin@freshshop.com',
      phone: '0123456789',
      role: 'admin',
      isActive: true,
    });

    return await admin.save();
  }

  private async seedSuppliers(): Promise<SupplierDocument[]> {
    const suppliersData = [
      {
        name: 'Nhà cung cấp rau sạch Đà Lạt',
        contactName: 'Nguyễn Văn A',
        phone: '0901234567',
        email: 'contact@dalat-vegetables.com',
        address: '123 Đường ABC, Đà Lạt, Lâm Đồng',
        taxCode: '0123456789',
        note: 'Chuyên cung cấp rau sạch từ Đà Lạt',
      },
      {
        name: 'Công ty TNHH Rau củ miền Tây',
        contactName: 'Trần Thị B',
        phone: '0907654321',
        email: 'info@mientay-vegetables.com',
        address: '456 Đường XYZ, Cần Thơ',
        taxCode: '0987654321',
        note: 'Cung cấp rau củ từ miền Tây Nam Bộ',
      },
      {
        name: 'Hợp tác xã nông sản sạch',
        contactName: 'Lê Văn C',
        phone: '0909876543',
        email: 'htx@nongsan.com',
        address: '789 Đường DEF, Hà Nội',
        note: 'Hợp tác xã nông sản hữu cơ',
      },
    ];

    const suppliers = await this.supplierModel.insertMany(suppliersData);
    console.log(`✅ Created ${suppliers.length} suppliers`);
    return suppliers;
  }

  private async seedProducts(
    suppliers: SupplierDocument[],
  ): Promise<ProductDocument[]> {
    const productsData = [
      {
        name: 'Rau muống',
        sku: 'VEG-001',
        category: 'leafy',
        unit: 'bó',
        price: 12000,
        expiryDays: 2,
        supplier: suppliers[0]._id,
        barcode: '1234567890123',
        status: 'active',
        attributes: { organic: true, origin: 'Đà Lạt' },
      },
      {
        name: 'Rau cải xanh',
        sku: 'VEG-002',
        category: 'leafy',
        unit: 'bó',
        price: 15000,
        expiryDays: 3,
        supplier: suppliers[0]._id,
        barcode: '1234567890124',
        status: 'active',
        attributes: { organic: true, origin: 'Đà Lạt' },
      },
      {
        name: 'Cà chua',
        sku: 'VEG-003',
        category: 'fruit',
        unit: 'kg',
        price: 25000,
        expiryDays: 5,
        supplier: suppliers[1]._id,
        barcode: '1234567890125',
        status: 'active',
        attributes: { organic: false, origin: 'Miền Tây' },
      },
      {
        name: 'Khoai tây',
        sku: 'VEG-004',
        category: 'root',
        unit: 'kg',
        price: 18000,
        expiryDays: 7,
        supplier: suppliers[1]._id,
        barcode: '1234567890126',
        status: 'active',
        attributes: { organic: false, origin: 'Miền Tây' },
      },
      {
        name: 'Cà rốt',
        sku: 'VEG-005',
        category: 'root',
        unit: 'kg',
        price: 20000,
        expiryDays: 10,
        supplier: suppliers[2]._id,
        barcode: '1234567890127',
        status: 'active',
        attributes: { organic: true, origin: 'Hà Nội' },
      },
      {
        name: 'Rau thơm',
        sku: 'VEG-006',
        category: 'herb',
        unit: 'bó',
        price: 8000,
        expiryDays: 1,
        supplier: suppliers[0]._id,
        barcode: '1234567890128',
        status: 'active',
        attributes: { organic: true, origin: 'Đà Lạt' },
      },
      {
        name: 'Hành tây',
        sku: 'VEG-007',
        category: 'bulb',
        unit: 'kg',
        price: 22000,
        expiryDays: 14,
        supplier: suppliers[2]._id,
        barcode: '1234567890129',
        status: 'active',
        attributes: { organic: false, origin: 'Hà Nội' },
      },
      {
        name: 'Rau diếp cá',
        sku: 'VEG-008',
        category: 'leafy',
        unit: 'bó',
        price: 10000,
        expiryDays: 2,
        supplier: suppliers[1]._id,
        barcode: '1234567890130',
        status: 'active',
        attributes: { organic: true, origin: 'Miền Tây' },
      },
    ];

    const products = await this.productModel.insertMany(productsData);
    console.log(`✅ Created ${products.length} products`);
    return products as any;
  }

  private async seedInventoryLots(
    products: ProductDocument[],
    suppliers: SupplierDocument[],
  ): Promise<InventoryLotDocument[]> {
    const lots: any[] = [];
    const today = new Date();

    for (const product of products) {
      // Tạo 2-3 lô cho mỗi sản phẩm
      const lotCount = Math.floor(Math.random() * 2) + 2;

      for (let i = 0; i < lotCount; i++) {
        const receivedDate = new Date(today);
        receivedDate.setDate(
          receivedDate.getDate() - Math.floor(Math.random() * 5),
        );

        const expiryDate = product.expiryDays
          ? new Date(
              receivedDate.getTime() + product.expiryDays * 24 * 60 * 60 * 1000,
            )
          : undefined;

        const lotCode = `${product.sku}-${receivedDate.toISOString().slice(0, 10).replace(/-/g, '')}-${String(i + 1).padStart(3, '0')}`;

        const quantityIn = Math.floor(Math.random() * 50) + 20;
        const costPerUnit = product.price * (0.6 + Math.random() * 0.3); // 60-90% giá bán

        const lot = new this.inventoryLotModel({
          product: product._id,
          lotCode,
          receivedDate,
          expiryDate,
          quantityIn,
          quantityAvailable: quantityIn,
          costPerUnit,
          supplier: product.supplier,
          note: `Lô nhập ${i + 1}`,
        });

        lots.push(await lot.save());

        // Tạo stock movement cho lô nhập
        await this.stockMovementModel.create({
          type: 'IN',
          product: product._id,
          lot: lot._id,
          quantity: quantityIn,
          reason: 'PURCHASE',
          actor: (await this.adminModel.findOne())?._id,
          note: `Nhập lô ${lotCode}`,
        });
      }
    }

    console.log(`✅ Created ${lots.length} inventory lots`);
    return lots;
  }

  private async seedCustomers(): Promise<CustomerDocument[]> {
    const customersData = [
      {
        fullName: 'Nguyễn Thị Lan',
        phone: '0901111111',
        gender: 'female',
        birthDate: new Date('1990-05-15'),
        address: '123 Đường ABC, Quận 1, TP.HCM',
        loyaltyPoints: 150,
        loyaltyTier: 'Gold',
        note: 'Khách hàng VIP',
      },
      {
        fullName: 'Trần Văn Minh',
        phone: '0902222222',
        gender: 'male',
        birthDate: new Date('1985-08-20'),
        address: '456 Đường XYZ, Quận 3, TP.HCM',
        loyaltyPoints: 75,
        loyaltyTier: 'Silver',
      },
      {
        fullName: 'Lê Thị Hoa',
        phone: '0903333333',
        gender: 'female',
        birthDate: new Date('1992-12-10'),
        address: '789 Đường DEF, Quận 5, TP.HCM',
        loyaltyPoints: 200,
        loyaltyTier: 'Platinum',
        note: 'Khách hàng thân thiết',
      },
      {
        fullName: 'Phạm Văn Đức',
        phone: '0904444444',
        gender: 'male',
        birthDate: new Date('1988-03-25'),
        address: '321 Đường GHI, Quận 7, TP.HCM',
        loyaltyPoints: 50,
        loyaltyTier: 'Bronze',
      },
      {
        fullName: 'Võ Thị Mai',
        phone: '0905555555',
        gender: 'female',
        birthDate: new Date('1995-07-08'),
        address: '654 Đường JKL, Quận 10, TP.HCM',
        loyaltyPoints: 0,
        note: 'Khách hàng mới',
      },
    ];

    const customers = await this.customerModel.insertMany(customersData);
    console.log(`✅ Created ${customers.length} customers`);
    return customers;
  }

  private async seedInvoices(
    admin: AdminDocument,
    customers: CustomerDocument[],
    products: ProductDocument[],
    inventoryLots: InventoryLotDocument[],
  ) {
    const invoices: any[] = [];
    const invoiceItems: any[] = [];
    const payments: any[] = [];

    // Tạo 5 hóa đơn mẫu
    for (let i = 1; i <= 5; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const invoiceCode = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(i).padStart(4, '0')}`;

      // Chọn ngẫu nhiên 2-4 sản phẩm cho hóa đơn
      const selectedProducts = products.slice(
        0,
        Math.floor(Math.random() * 3) + 2,
      );
      let subtotal = 0;
      const items: any[] = [];

      for (const product of selectedProducts) {
        const quantity = Math.floor(Math.random() * 3) + 1;
        const unitPrice = product.price;
        const discount = Math.random() > 0.7 ? Math.floor(unitPrice * 0.1) : 0; // 10% discount sometimes
        const lineTotal = (unitPrice - discount) * quantity;

        subtotal += lineTotal;
        items.push({
          product: product._id as any,
          quantity,
          unitPrice,
          discount,
          lineTotal,
        });
      }

      const discountTotal =
        Math.random() > 0.8 ? Math.floor(subtotal * 0.05) : 0; // 5% order discount sometimes
      const taxTotal = 0; // No tax for now
      const grandTotal = subtotal - discountTotal + taxTotal;
      const paidAmount = grandTotal + Math.floor(Math.random() * 10000); // Sometimes overpay

      const invoice = new this.invoiceModel({
        code: invoiceCode,
        customer: customer._id,
        cashier: admin._id,
        itemsSummary: {
          itemCount: items.length,
          subtotal,
          discountTotal,
          taxTotal,
          grandTotal,
        },
        paidAmount,
        changeAmount: paidAmount - grandTotal,
        paymentMethod: 'cash',
        status: 'completed',
      });

      const savedInvoice = await invoice.save();
      invoices.push(savedInvoice);

      // Tạo invoice items và cập nhật inventory
      for (const item of items) {
        const product = products.find((p) =>
          (p._id as any).equals(item.product),
        );
        const productLots = inventoryLots.filter(
          (lot) =>
            (lot.product as any).equals(item.product) &&
            lot.quantityAvailable > 0,
        );

        // FIFO: sắp xếp theo expiryDate tăng dần
        productLots.sort((a, b) => {
          if (!a.expiryDate && !b.expiryDate) return 0;
          if (!a.expiryDate) return 1;
          if (!b.expiryDate) return -1;
          return a.expiryDate.getTime() - b.expiryDate.getTime();
        });

        let remainingQuantity = item.quantity;
        const usedLots: any[] = [];

        for (const lot of productLots) {
          if (remainingQuantity <= 0) break;

          const usedQuantity = Math.min(
            remainingQuantity,
            lot.quantityAvailable,
          );
          remainingQuantity -= usedQuantity;

          // Cập nhật inventory lot
          lot.quantityAvailable -= usedQuantity;
          await lot.save();

          usedLots.push({ lot: lot._id as any, quantity: usedQuantity });

          // Tạo stock movement
          await this.stockMovementModel.create({
            type: 'OUT',
            product: item.product,
            lot: lot._id as any,
            quantity: usedQuantity,
            reason: 'SALE',
            refInvoice: savedInvoice._id as any,
            actor: admin._id as any,
            note: `Bán hàng - HĐ ${invoiceCode}`,
          });
        }

        // Tạo invoice item
        const invoiceItem = new this.invoiceItemModel({
          invoice: savedInvoice._id as any,
          product: item.product,
          lot: usedLots[0]?.lot, // Lưu lot đầu tiên được sử dụng
          quantity: item.quantity,
          unit: (product as any)?.unit,
          unitPrice: item.unitPrice,
          discount: item.discount,
          lineTotal: item.lineTotal,
        });

        invoiceItems.push(await invoiceItem.save());
      }

      // Tạo payment
      const payment = new this.paymentModel({
        invoice: savedInvoice._id,
        amount: paidAmount,
        method: 'cash',
        paidAt: new Date(),
        note: `Thanh toán hóa đơn ${invoiceCode}`,
      });

      payments.push(await payment.save());

      // Cập nhật loyalty points cho customer
      const earnedPoints = Math.floor(grandTotal / 1000); // 1 điểm per 1000 VND
      if (earnedPoints > 0) {
        customer.loyaltyPoints += earnedPoints;
        await customer.save();

        // Tạo loyalty ledger entry
        await this.loyaltyLedgerModel.create({
          customer: customer._id,
          type: 'EARN',
          points: earnedPoints,
          reason: 'PURCHASE',
          refInvoice: savedInvoice._id,
          balanceAfter: customer.loyaltyPoints,
        });
      }
    }

    console.log(
      `✅ Created ${invoices.length} invoices with ${invoiceItems.length} items and ${payments.length} payments`,
    );
    return { invoices, invoiceItems, payments };
  }
}
