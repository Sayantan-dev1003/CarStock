import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

interface RequestUser {
    id: string;
    email: string;
    refreshToken?: string;
}

export const CurrentUser = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): RequestUser => {
        const request = ctx.switchToHttp().getRequest<Request & { user: RequestUser }>();
        return request.user;
    },
);
