import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Length, Min, MinLength } from "class-validator";
import { userRole } from "utils/constants";

export class UpdateUserDto {

    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    userId: number;

    @IsString()
    @Length(2, 50)
    @IsOptional()
    username?: string;

    @IsString()
    @MinLength(8)
    @IsNotEmpty()
    @IsOptional()
    password?: string;

    @IsEnum(userRole, { message: 'Role must be either admin or user' })
    @IsOptional()
    role?: string;
}