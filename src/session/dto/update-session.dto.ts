import { PartialType } from '@nestjs/mapped-types';
import { CreateSessionDto } from './create-session.dto';

// Tous les champs du CreateSessionDto deviennent optionnels pour la mise à jour
export class UpdateSessionDto extends PartialType(CreateSessionDto) {}
