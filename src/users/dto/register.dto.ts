import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, MaxLength, MinLength } from "class-validator";

export class RegisterDto {

    @IsString()
    @Length(2, 50)
    @IsOptional()
    username: string;

    @IsNotEmpty()
    @MaxLength(250)
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    @IsNotEmpty()
    password: string;
}