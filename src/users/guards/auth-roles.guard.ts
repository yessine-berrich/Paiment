import { UsersService } from '../users.service';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";
import { JwtPayloadType } from "utils/types";
import { Reflector } from "@nestjs/core";
import { userRole } from "utils/constants";

@Injectable()
export class AuthRolesGuard implements CanActivate {

    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly reflector: Reflector,
        private readonly usersService: UsersService
    ) {}

    async canActivate(context: ExecutionContext) {

        const roles: userRole[] = this.reflector.getAllAndOverride('roles', [context.getHandler(), context.getClass()]);

        if (!roles || roles.length === 0) {
            return false; // No roles specified
        }


        const request = context.switchToHttp().getRequest();
        const [type, token]= request.headers.authorization?.split(" ") ?? [];
        if (type !== "Bearer" || !token) {
            throw new UnauthorizedException("Authorization header is missing or malformed");
        }
        try {
            const secret = this.configService.get<string>("JWT_SECRET");
            const payload: JwtPayloadType = await this.jwtService.verifyAsync(token, { secret });

            const user = await this.usersService.getCurrentUser(payload.id);
            if (!user) {
                throw new UnauthorizedException("User not found");
            }

            if (roles.includes(user.role)) {
                request.user = user;
                return true;
            }
        } catch (error) {
            throw new UnauthorizedException("Invalid or expired token");
        }
        return false;
    }
}