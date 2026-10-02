import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/types/enums';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'List published products with filtering/pagination',
  })
  findAll(@Query() query: QueryProductsDto) {
    return this.productsService.findAll(query);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Get('admin/all')
  @ApiOperation({ summary: 'List all products including inactive (admin)' })
  findAllForAdmin(@Query() query: QueryProductsDto) {
    return this.productsService.findAllForAdmin(query);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Get('admin/:id')
  @ApiOperation({ summary: 'Get a product by id (admin)' })
  findOneById(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get a published product by slug' })
  async findOne(@Param('slug') slug: string) {
    const product = await this.productsService.findBySlug(slug);
    const populatedCategory = product.category as unknown as {
      _id?: { toString(): string };
    };
    const categoryId =
      populatedCategory._id?.toString() ?? String(product.category);
    const related = await this.productsService.findRelated(
      product.id,
      categoryId,
    );
    return { product, related };
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a product (admin)' })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a product (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product (admin)' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
