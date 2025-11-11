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
  ApiSecurity,
} from '@nestjs/swagger';
import { PosService } from './pos.service';
import {
  CreateInvoiceDto,
  VoidInvoiceDto,
  InvoiceQueryDto,
  UpdateInvoiceStatusDto,
} from './dto/sale.dto';
import { ApiKeyOnly } from '../../common/decorators/auth-mode.decorator';

@ApiTags('Point of Sale (POS)')
@Controller('pos')
@ApiKeyOnly() // Chỉ yêu cầu API Key, không cần JWT token
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
    return this.posService.getInvoices(query);
  }

  @Get('invoices/:id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiResponse({ status: 200, description: 'Invoice found' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  getInvoice(@Param('id') id: string) {
    return this.posService.getInvoiceById(id);
  }

  @Patch('invoices/:id/void')
  @ApiOperation({ summary: 'Void invoice' })
  @ApiResponse({ status: 200, description: 'Invoice voided successfully' })
  @ApiResponse({ status: 400, description: 'Invoice already voided' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  voidInvoice(@Param('id') id: string, @Body() voidDto: VoidInvoiceDto) {
    return this.posService.voidInvoice(id, 'admin_id', voidDto.reason); // TODO: Get from auth
  }

  @Patch('invoices/:id/status')
  @ApiOperation({ summary: 'Update invoice status' })
  @ApiResponse({ status: 200, description: 'Invoice status updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  updateInvoiceStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateInvoiceStatusDto,
  ) {
    return this.posService.updateInvoiceStatus(id, updateDto.status);
  }

  @Get('invoices/:id/print')
  @ApiOperation({ summary: 'Print invoice' })
  @ApiResponse({ status: 200, description: 'Invoice print data' })
  printInvoice(@Param('id') id: string) {
    // TODO: Implement invoice printing
    return { message: 'Invoice printing not implemented yet' };
  }
}
