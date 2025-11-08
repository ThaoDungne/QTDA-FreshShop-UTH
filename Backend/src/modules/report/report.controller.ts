import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiSecurity,
  ApiQuery,
} from '@nestjs/swagger';
import { RevenueReportService } from './services/revenue-report.service';
import { TopProductsReportService } from './services/top-products-report.service';
import { LoyalCustomersReportService } from './services/loyal-customers-report.service';
import { InventoryReportService } from './services/inventory-report.service';
import {
  RevenueReportDto,
  TopProductsReportDto,
  LoyalCustomersReportDto,
  InventoryReportDto,
} from './dto/report.dto';

@ApiTags('Reports & Analytics')
@Controller('reports')
@ApiSecurity('api-key')
@ApiBearerAuth('JWT-auth')
export class ReportController {
  constructor(
    private readonly revenueReportService: RevenueReportService,
    private readonly topProductsReportService: TopProductsReportService,
    private readonly loyalCustomersReportService: LoyalCustomersReportService,
    private readonly inventoryReportService: InventoryReportService,
  ) {}

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue report' })
  @ApiResponse({ status: 200, description: 'Revenue report data' })
  getRevenueReport(@Query() query: RevenueReportDto) {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    return this.revenueReportService.getRevenueReport({
      startDate,
      endDate,
      groupBy: query.groupBy || 'day',
    });
  }

  @Get('revenue/summary')
  @ApiOperation({ summary: 'Get revenue summary' })
  @ApiResponse({ status: 200, description: 'Revenue summary data' })
  getRevenueSummary(@Query() query: RevenueReportDto) {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    return this.revenueReportService.getRevenueSummary(startDate, endDate);
  }

  @Get('top-products')
  @ApiOperation({ summary: 'Get top products report' })
  @ApiResponse({ status: 200, description: 'Top products data' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'ISO date string',
    example: '2025-10-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'ISO date string',
    example: '2025-10-06',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Top N results',
    example: 10,
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by category',
    example: 'vegetable',
  })
  getTopProducts(@Query() query: TopProductsReportDto) {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    return this.topProductsReportService.getTopProductsReport({
      startDate,
      endDate,
      limit: query.limit || 10,
      category: query.category,
    });
  }

  @Get('top-products/revenue')
  @ApiOperation({ summary: 'Get top products by revenue' })
  @ApiResponse({ status: 200, description: 'Top products by revenue data' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'ISO date string',
    example: '2025-10-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'ISO date string',
    example: '2025-10-06',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Top N results',
    example: 10,
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by category',
    example: 'vegetable',
  })
  getTopProductsByRevenue(@Query() query: TopProductsReportDto) {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    return this.topProductsReportService.getTopProductsByRevenue({
      startDate,
      endDate,
      limit: query.limit || 10,
      category: query.category,
    });
  }

  @Get('category-sales')
  @ApiOperation({ summary: 'Get sales by category' })
  @ApiResponse({ status: 200, description: 'Category sales data' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'ISO date string',
    example: '2025-10-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'ISO date string',
    example: '2025-10-06',
  })
  getCategorySales(@Query() query: TopProductsReportDto) {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    return this.topProductsReportService.getCategorySalesReport(
      startDate,
      endDate,
    );
  }

  @Get('loyal-customers')
  @ApiOperation({ summary: 'Get loyal customers report' })
  @ApiResponse({ status: 200, description: 'Loyal customers data' })
  getLoyalCustomers(@Query() query: LoyalCustomersReportDto) {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    return this.loyalCustomersReportService.getLoyalCustomersReport({
      startDate,
      endDate,
      limit: query.limit || 10,
      minOrderCount: query.minOrderCount || 1,
      minTotalSpent: query.minTotalSpent || 0,
    });
  }

  @Get('customer-segments')
  @ApiOperation({ summary: 'Get customer segmentation' })
  @ApiResponse({ status: 200, description: 'Customer segmentation data' })
  getCustomerSegments() {
    return this.loyalCustomersReportService.getCustomerSegmentation();
  }

  @Get('loyalty-points')
  @ApiOperation({ summary: 'Get loyalty points report' })
  @ApiResponse({ status: 200, description: 'Loyalty points data' })
  getLoyaltyPoints() {
    return this.loyalCustomersReportService.getCustomerLoyaltyPointsReport();
  }

  @Get('inventory')
  @ApiOperation({ summary: 'Get inventory report' })
  @ApiResponse({ status: 200, description: 'Inventory report data' })
  getInventoryReport(@Query() query: InventoryReportDto) {
    return this.inventoryReportService.getCurrentInventoryReport({
      lowStockThreshold: query.lowStockThreshold || 10,
      expiryWarningDays: query.expiryWarningDays || 3,
      category: query.category,
    });
  }

  @Get('inventory/low-stock')
  @ApiOperation({ summary: 'Get low stock report' })
  @ApiResponse({ status: 200, description: 'Low stock data' })
  getLowStockReport(@Query('threshold') threshold: string) {
    const thresholdNumber = threshold ? parseInt(threshold) : 10;
    return this.inventoryReportService.getLowStockReport(thresholdNumber);
  }

  @Get('inventory/expiring')
  @ApiOperation({ summary: 'Get expiring stock report' })
  @ApiResponse({ status: 200, description: 'Expiring stock data' })
  getExpiringStockReport(@Query('days') days: string) {
    const daysNumber = days ? parseInt(days) : 3;
    return this.inventoryReportService.getExpiringSoonReport(daysNumber);
  }

  @Get('inventory/value')
  @ApiOperation({ summary: 'Get inventory value report' })
  @ApiResponse({ status: 200, description: 'Inventory value data' })
  getInventoryValueReport() {
    return this.inventoryReportService.getInventoryValueReport();
  }
}
