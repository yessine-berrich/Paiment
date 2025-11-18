import { IsEmail, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  rib?: string; // Mise à jour du RIB

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  banque?: string; // Mise à jour de la Banque
}
