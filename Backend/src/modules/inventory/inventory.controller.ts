import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import {
  CreateInventoryLotDto,
  StockAdjustmentDto,
  StockQueryDto,
  CreateInventoryLotServiceDto,
  StockAdjustmentServiceDto,
} from './dto/inventory.dto';

@ApiTags('Inventory Management')
@Controller('inventory')
@ApiSecurity('api-key')
@ApiBearerAuth('JWT-auth')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('lots')
  @ApiOperation({ summary: 'Create new inventory lot' })
  @ApiResponse({
    status: 201,
    description: 'Inventory lot created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid product or supplier' })
  createLot(@Body() createLotDto: CreateInventoryLotDto) {
    const serviceDto: CreateInventoryLotServiceDto = {
      ...createLotDto,
      receivedDate: createLotDto.receivedDate
        ? new Date(createLotDto.receivedDate)
        : undefined,
    };
    return this.inventoryService.createInventoryLot(serviceDto, 'admin_id'); // TODO: get from req.user.sub
  }

  @Post('adjust')
  @ApiOperation({ summary: 'Adjust stock quantity' })
  @ApiResponse({ status: 200, description: 'Stock adjusted successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid adjustment or insufficient stock',
  })
  adjustStock(@Body() adjustDto: StockAdjustmentDto) {
    const serviceDto: StockAdjustmentServiceDto = {
      ...adjustDto,
      actorId: 'admin_id', // TODO: get from req.user.sub
    };
    return this.inventoryService.adjustStock(serviceDto);
  }

  @Get('stock/:productId')
  @ApiOperation({ summary: 'Get available stock for product' })
  @ApiResponse({ status: 200, description: 'Stock information' })
  getAvailableStock(@Param('productId') productId: string) {
    return this.inventoryService.getAvailableStock(productId);
  }

  @Get('expiring')
  @ApiOperation({ summary: 'Get expiring stock' })
  @ApiQuery({
    name: 'days',
    description: 'Days until expiry',
    required: false,
    example: 3,
  })
  @ApiResponse({ status: 200, description: 'Expiring stock list' })
  getExpiringStock(@Query('days') days: string) {
    const daysNumber = days ? parseInt(days) : 3;
    return this.inventoryService.getExpiringStock(daysNumber);
  }

  @Get('report')
  @ApiOperation({ summary: 'Get inventory report' })
  @ApiResponse({ status: 200, description: 'Inventory report' })
  getInventoryReport(@Query() query: StockQueryDto) {
    // TODO: Implement inventory report service
    return { message: 'Inventory report not implemented yet' };
  }
}
