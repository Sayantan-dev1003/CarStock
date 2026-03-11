import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';

interface JwtPayload {
    sub: string;
    email: string;
}

interface JwtRefreshUser {
    id: string;
    email: string;
    refreshToken: string;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
    Strategy,
    'jwt-refresh',
) {
    constructor(config: ConfigService) {
        const options: StrategyOptionsWithRequest = {
            jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
            secretOrKey: config.get<string>('JWT_REFRESH_SECRET')!,
            ignoreExpiration: false,
            passReqToCallback: true,
        };
        super(options);
    }

    validate(req: Request, payload: JwtPayload): JwtRefreshUser {
        const refreshToken = (req.body as { refreshToken: string }).refreshToken;
        return { id: payload.sub, email: payload.email, refreshToken };
    }
}
