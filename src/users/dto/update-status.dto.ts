import { IsNumber, IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateUserStatusDto {
  @IsNotEmpty()
  @IsNumber()
  userId: number; // L'ID de l'utilisateur à activer (via le corps de la requête)

  @IsNotEmpty()
  @IsBoolean()
  est_actif: boolean; // La nouvelle valeur (doit être 'true' pour l'activation)
}
