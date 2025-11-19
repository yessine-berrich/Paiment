import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsInt,
  IsOptional,
} from 'class-validator';

export class CreateSessionDto {
  @IsNotEmpty()
  @IsString()
  promotion: string;

  @IsOptional()
  @IsString()
  classe?: string;

  @IsOptional()
  @IsString()
  specialite?: string;

  @IsOptional()
  @IsString()
  niveau?: string;

  @IsOptional()
  @IsString()
  semestre?: string;

  @IsNotEmpty()
  @IsDateString() // Utiliser IsDateString pour valider une chaîne de date (ex: YYYY-MM-DD)
  date_debut: string;

  @IsNotEmpty()
  @IsDateString()
  date_fin: string;

  @IsNotEmpty()
  @IsInt() // L'ID du coordinateur doit être un entier
  id_coordinateur: number;
}
