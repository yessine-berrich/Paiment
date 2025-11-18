import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  nom: string;

  @IsNotEmpty()
  @IsString()
  prenom: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  // Champs pour CoordonneesBancaires
  @IsNotEmpty()
  @IsString()
  n_cin: string;

  @IsNotEmpty()
  @IsString()
  rib: string;

  @IsNotEmpty()
  @IsString()
  banque: string;
}
