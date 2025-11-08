import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@ApiTags('Product Management')
@Controller('products')
@ApiSecurity('api-key')
@ApiBearerAuth('JWT-auth')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiOperation({ summary: 'Create new product' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 409, description: 'SKU already exists' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'List of all products' })
  findAll() {
    return this.productService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active products only' })
  @ApiResponse({ status: 200, description: 'List of active products' })
  getActiveProducts() {
    return this.productService.getActiveProducts();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search products' })
  @ApiQuery({
    name: 'q',
    description: 'Free text: name, SKU, barcode',
    required: true,
    example: 'rau sku123',
  })
  @ApiQuery({
    name: 'page',
    description: 'Page index (1-based)',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Items per page',
    required: false,
    example: 20,
  })
  @ApiQuery({
    name: 'category',
    description: 'Filter by category',
    required: false,
    example: 'vegetable',
  })
  @ApiQuery({
    name: 'active',
    description: 'Filter by active flag',
    required: false,
    example: true,
  })
  @ApiQuery({
    name: 'sortBy',
    description: 'Sort field',
    required: false,
    example: 'createdAt',
  })
  @ApiQuery({
    name: 'sortOrder',
    description: 'Sort order asc|desc',
    required: false,
    example: 'desc',
  })
  @ApiResponse({ status: 200, description: 'Search results' })
  search(@Query('q') query: string) {
    return this.productService.search(query);
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get products by category' })
  @ApiResponse({ status: 200, description: 'Products in category' })
  findByCategory(@Param('category') category: string) {
    return this.productService.findByCategory(category);
  }

  @Get('supplier/:supplierId')
  @ApiOperation({ summary: 'Get products by supplier' })
  @ApiResponse({ status: 200, description: 'Products from supplier' })
  findBySupplier(@Param('supplierId') supplierId: string) {
    return this.productService.findBySupplier(supplierId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'Product found' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 409, description: 'SKU already exists' })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product (soft delete)' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}
