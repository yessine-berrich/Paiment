import { IsString, IsEmail, IsNotEmpty, IsEnum } from 'class-validator';
import { userRole } from 'utils/constants';

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

  @IsNotEmpty()
  @IsEnum(userRole) // Valide que la valeur fournie est une des valeurs de l'énum
  role?: userRole;
}
