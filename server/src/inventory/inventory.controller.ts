import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateStockDto } from './dto/update-stock.dto';
import { InventoryService } from './inventory.service';

@ApiTags('Inventory')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }

    // ── POST /inventory/add-stock ──────────────────────────────────────────────
    @Post('add-stock')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Add stock for a product after supplier delivery' })
    addStock(@Body() dto: UpdateStockDto) {
        return this.inventoryService.addStock(dto);
    }

    // ── GET /inventory/summary — BEFORE /:productId to avoid conflicts ─────────
    @Get('summary')
    @ApiOperation({
        summary: 'Get overall inventory value and stock health summary for dashboard',
    })
    getInventorySummary() {
        return this.inventoryService.getInventorySummary();
    }

    // ── GET /inventory/stock-history/:productId ────────────────────────────────
    @Get('stock-history/:productId')
    @ApiOperation({ summary: 'Get paginated stock movement history for a product' })
    @ApiParam({ name: 'productId', description: 'Product UUID' })
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 20 })
    getStockHistory(
        @Param('productId') productId: string,
        @Query('page') page = '1',
        @Query('limit') limit = '20',
    ) {
        return this.inventoryService.getStockHistory(
            productId,
            parseInt(page, 10),
            parseInt(limit, 10),
        );
    }
}
