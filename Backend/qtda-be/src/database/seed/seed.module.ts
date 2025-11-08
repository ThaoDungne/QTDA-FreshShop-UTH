import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeedService } from './seed.service';
import {
  Admin,
  AdminSchema,
  Customer,
  CustomerSchema,
  Supplier,
  SupplierSchema,
  Product,
  ProductSchema,
  InventoryLot,
  InventoryLotSchema,
  Invoice,
  InvoiceSchema,
  InvoiceItem,
  InvoiceItemSchema,
  Payment,
  PaymentSchema,
  StockMovement,
  StockMovementSchema,
  LoyaltyLedger,
  LoyaltyLedgerSchema,
} from '../../schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Admin.name, schema: AdminSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: Supplier.name, schema: SupplierSchema },
      { name: Product.name, schema: ProductSchema },
      { name: InventoryLot.name, schema: InventoryLotSchema },
      { name: Invoice.name, schema: InvoiceSchema },
      { name: InvoiceItem.name, schema: InvoiceItemSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: StockMovement.name, schema: StockMovementSchema },
      { name: LoyaltyLedger.name, schema: LoyaltyLedgerSchema },
    ]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
