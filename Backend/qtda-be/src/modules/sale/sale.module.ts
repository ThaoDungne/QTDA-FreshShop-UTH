import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SaleController } from './sale.controller';
import { PosService } from './pos.service';
import {
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
  Customer,
  CustomerSchema,
  Product,
  ProductSchema,
  InventoryLot,
  InventoryLotSchema,
  Admin,
  AdminSchema,
  Promotion,
  PromotionSchema,
} from '../../schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Invoice.name, schema: InvoiceSchema },
      { name: InvoiceItem.name, schema: InvoiceItemSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: StockMovement.name, schema: StockMovementSchema },
      { name: LoyaltyLedger.name, schema: LoyaltyLedgerSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: Product.name, schema: ProductSchema },
      { name: InventoryLot.name, schema: InventoryLotSchema },
      { name: Admin.name, schema: AdminSchema },
      { name: Promotion.name, schema: PromotionSchema },
    ]),
  ],
  controllers: [SaleController],
  providers: [PosService],
  exports: [PosService],
})
export class SaleModule {}
