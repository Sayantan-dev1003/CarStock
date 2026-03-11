import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshGuard } from './guards/refresh.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

interface RefreshBody {
    refreshToken: string;
}

interface AuthUser {
    id: string;
    email: string;
    refreshToken?: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    // ── POST /auth/login ───────────────────────────────────────────────────────
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Admin login — returns access & refresh tokens' })
    login(@Body() dto: LoginDto): Promise<TokenPair> {
        return this.authService.login(dto);
    }

    // ── POST /auth/refresh ─────────────────────────────────────────────────────
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @UseGuards(RefreshGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Rotate token pair using a valid refresh token' })
    refresh(
        @CurrentUser() user: AuthUser,
        @Body() body: RefreshBody,
    ): Promise<TokenPair> {
        return this.authService.refreshTokens(user.id, body.refreshToken);
    }

    // ── POST /auth/logout ──────────────────────────────────────────────────────
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Logout — invalidates the stored refresh token' })
    logout(@CurrentUser() user: AuthUser): Promise<{ message: string }> {
        return this.authService.logout(user.id);
    }
}
