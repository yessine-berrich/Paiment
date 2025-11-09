import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { JwtPayloadType } from "utils/types";


export const CurrentUser = createParamDecorator(
    (data, context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest();
        const user: JwtPayloadType = request.user; // The user info is attached by the AuthGuard
        return user;
    }
)