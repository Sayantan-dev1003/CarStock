import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { comparePassword, hashPassword } from '../common/utils/hash.util';
import { LoginDto } from './dto/login.dto';

interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

interface LoginResponse extends TokenPair {
    admin: {
        id: string;
        email: string;
        name: string;
        shopName: string;
        shopPhone?: string | null;
        logoUrl?: string | null;
        deviceToken?: string | null;
    }
}

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwt: JwtService,
        private readonly config: ConfigService,
    ) { }

    // ── Login ──────────────────────────────────────────────────────────────────
    async login(dto: LoginDto): Promise<LoginResponse> {
        const admin = await this.prisma.admin.findUnique({
            where: { email: dto.email },
        });

        if (!admin) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const passwordMatch = await comparePassword(dto.password, admin.password);
        if (!passwordMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const tokens = await this.generateTokens(admin.id, admin.email);
        await this.saveRefreshToken(admin.id, tokens.refreshToken);
        
        // Exclude sensitive fields
        const { password, refreshToken, createdAt, updatedAt, ...adminProfile } = admin;
        
        return { 
            ...tokens, 
            admin: adminProfile 
        };
    }

    // ── Generate access + refresh token pair ───────────────────────────────────
    async generateTokens(adminId: string, email: string): Promise<TokenPair> {
        const payload = { sub: adminId, email };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwt.signAsync(payload, {
                secret: this.config.get<string>('JWT_SECRET'),
                expiresIn: '15m',
            }),
            this.jwt.signAsync(payload, {
                secret: this.config.get<string>('JWT_REFRESH_SECRET'),
                expiresIn: '7d',
            }),
        ]);

        return { accessToken, refreshToken };
    }

    // ── Persist hashed refresh token ───────────────────────────────────────────
    async saveRefreshToken(adminId: string, token: string): Promise<void> {
        const hashed = await hashPassword(token);
        await this.prisma.admin.update({
            where: { id: adminId },
            data: { refreshToken: hashed },
        });
    }

    // ── Rotate tokens ──────────────────────────────────────────────────────────
    async refreshTokens(
        adminId: string,
        refreshToken: string,
    ): Promise<TokenPair> {
        const admin = await this.prisma.admin.findUnique({
            where: { id: adminId },
        });

        if (!admin || !admin.refreshToken) {
            throw new UnauthorizedException('Access denied');
        }

        const tokenMatch = await comparePassword(refreshToken, admin.refreshToken);
        if (!tokenMatch) {
            throw new UnauthorizedException('Access denied');
        }

        const tokens = await this.generateTokens(admin.id, admin.email);
        await this.saveRefreshToken(admin.id, tokens.refreshToken);
        return tokens;
    }

    // ── Logout ─────────────────────────────────────────────────────────────────
    async logout(adminId: string): Promise<{ message: string }> {
        await this.prisma.admin.update({
            where: { id: adminId },
            data: { refreshToken: null },
        });
        return { message: 'Logged out successfully' };
    }
}
