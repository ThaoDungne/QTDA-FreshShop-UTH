import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import {
  InventoryLot,
  InventoryLotSchema,
  Product,
  ProductSchema,
  StockMovement,
  StockMovementSchema,
  Supplier,
  SupplierSchema,
} from '../../schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InventoryLot.name, schema: InventoryLotSchema },
      { name: Product.name, schema: ProductSchema },
      { name: StockMovement.name, schema: StockMovementSchema },
      { name: Supplier.name, schema: SupplierSchema },
    ]),
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
