import { Controller, Post, Body, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InventoryService } from './inventory.service';
import { UpdateStockDto } from './dto/update-stock.dto';

@ApiTags('Inventory')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get overall inventory value and stock health summary' })
  getInventorySummary() {
    return this.inventoryService.getInventorySummary();
  }

  @Post('add-stock')
  @ApiOperation({ summary: 'Add stock for a product after supplier delivery' })
  addStock(@Body() dto: UpdateStockDto) {
    return this.inventoryService.addStock(dto);
  }

  @Get('stock-history/:productId')
  @ApiOperation({ summary: 'Get stock movement history for a product' })
  getStockHistory(
    @Param('productId') productId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.inventoryService.getStockHistory(productId, parseInt(page, 10), parseInt(limit, 10));
  }
}
