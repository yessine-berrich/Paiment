// src/session/dto/affecter-formateurs.dto.ts

import { IsArray, IsInt, ArrayNotEmpty } from 'class-validator';

/**
 * Data Transfer Object pour l'affectation de formateurs à une session.
 * Reçoit la liste des IDs des formateurs dans le corps de la requête.
 */
export class AffecterFormateursDto {
  @IsArray()
  @ArrayNotEmpty({ message: 'La liste des IDs de formateurs ne peut être vide.' })
  @IsInt({ each: true, message: "Chaque ID de formateur doit être un nombre entier." })
  formateurIds: number[];
}