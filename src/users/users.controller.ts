import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    UseGuards,
    Put,
    Delete,

} from "@nestjs/common";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { AuthGuard } from "./guards/auth.guard";
import { CurrentUser } from "./decorators/current-user.decarator";
import { JwtPayloadType } from "utils/types";
import { Roles } from "./decorators/user-role.decorator";
import { userRole } from "utils/constants";
import { AuthRolesGuard } from "./guards/auth-roles.guard";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UsersService } from "./users.service";


@Controller('api/users')
export class UsersController {
  constructor(private readonly authService: UsersService) {}

  @Post('/auth/register')
    register(@Body() body: RegisterDto) {
        return this.authService.register(body);
    }

    @HttpCode(HttpStatus.OK)
    @Post('/auth/login')
    login(@Body() body: LoginDto) {
        return this.authService.login(body);
    }

    // @Get('/current-user')
    // @UseGuards(AuthGuard)
    // // @UseInterceptors(ClassSerializerInterceptor)
    // getCurrentUser(@CurrentUser() payload: JwtPayloadType) {
    //     // console.log('Get current user route handler called');
    //     return this.authService.getCurrentUser(payload.id);
    // }

    @Get()
    @Roles(userRole.ADMIN) // Only accessible by users with the 'admin' role
    @UseGuards(AuthRolesGuard)
    // @UseInterceptors(ClassSerializerInterceptor)
    getAllUsers() {
        return this.authService.getAllUsers();
    }

    @Put()
    @UseGuards(AuthGuard)
    update(
        // @CurrentUser() payload: JwtPayloadType,
        @Body() body: UpdateUserDto) {
        // return this.usersService.update(payload.id, body);
        return this.authService.update(    body);
    }

    // @Delete('/:id')
    // @UseGuards(AuthGuard)
    // delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() payload: JwtPayloadType) {
    //     return this.authService.delete(id, payload);
    // }
}
