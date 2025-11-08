import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { PosService } from './pos.service';
import {
  CreateInvoiceDto,
  VoidInvoiceDto,
  InvoiceQueryDto,
} from './dto/sale.dto';
import { ApiKeyGuard } from '../auth/guards';

@ApiTags('Point of Sale (POS)')
@Controller('pos')
@UseGuards(ApiKeyGuard)
@ApiSecurity('api-key')
export class SaleController {
  constructor(private readonly posService: PosService) {}

  @Post('invoices')
  @ApiOperation({ summary: 'Create new invoice' })
  @ApiResponse({ status: 201, description: 'Invoice created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid invoice data or insufficient stock',
  })
  createInvoice(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.posService.createInvoice(createInvoiceDto);
  }

  @Get('invoices')
  @ApiOperation({ summary: 'Get invoices with filters' })
  @ApiResponse({ status: 200, description: 'List of invoices' })
  getInvoices(@Query() query: InvoiceQueryDto) {
    // TODO: Implement invoice listing with filters
    return { message: 'Invoice listing not implemented yet' };
  }

  @Get('invoices/:id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiResponse({ status: 200, description: 'Invoice found' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  getInvoice(@Param('id') id: string) {
    // TODO: Implement get invoice by ID
    return { message: 'Get invoice by ID not implemented yet' };
  }

  @Patch('invoices/:id/void')
  @ApiOperation({ summary: 'Void invoice' })
  @ApiResponse({ status: 200, description: 'Invoice voided successfully' })
  @ApiResponse({ status: 400, description: 'Invoice already voided' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  voidInvoice(@Param('id') id: string, @Body() voidDto: VoidInvoiceDto) {
    return this.posService.voidInvoice(id, 'admin_id', voidDto.reason); // TODO: Get from auth
  }

  @Get('invoices/:id/print')
  @ApiOperation({ summary: 'Print invoice' })
  @ApiResponse({ status: 200, description: 'Invoice print data' })
  printInvoice(@Param('id') id: string) {
    // TODO: Implement invoice printing
    return { message: 'Invoice printing not implemented yet' };
  }
}
