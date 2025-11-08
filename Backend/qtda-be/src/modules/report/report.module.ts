import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportController } from './report.controller';
import { RevenueReportService } from './services/revenue-report.service';
import { TopProductsReportService } from './services/top-products-report.service';
import { LoyalCustomersReportService } from './services/loyal-customers-report.service';
import { InventoryReportService } from './services/inventory-report.service';
import {
  Invoice,
  InvoiceSchema,
  InvoiceItem,
  InvoiceItemSchema,
  Customer,
  CustomerSchema,
  InventoryLot,
  InventoryLotSchema,
  Product,
  ProductSchema,
  StockMovement,
  StockMovementSchema,
} from '../../schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Invoice.name, schema: InvoiceSchema },
      { name: InvoiceItem.name, schema: InvoiceItemSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: InventoryLot.name, schema: InventoryLotSchema },
      { name: Product.name, schema: ProductSchema },
      { name: StockMovement.name, schema: StockMovementSchema },
    ]),
  ],
  controllers: [ReportController],
  providers: [
    RevenueReportService,
    TopProductsReportService,
    LoyalCustomersReportService,
    InventoryReportService,
  ],
  exports: [
    RevenueReportService,
    TopProductsReportService,
    LoyalCustomersReportService,
    InventoryReportService,
  ],
})
export class ReportModule {}
