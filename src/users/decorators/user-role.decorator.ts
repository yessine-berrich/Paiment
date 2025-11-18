import { SetMetadata } from '@nestjs/common';
import { userRole } from 'utils/constants';

// This decorator is used to set the user role metadata for a route handler.
export const ROLES_KEY = 'roles';
export const Roles = (...roles: userRole[]) => SetMetadata(ROLES_KEY, roles);
