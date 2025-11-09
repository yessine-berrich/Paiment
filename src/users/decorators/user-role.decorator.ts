import { SetMetadata } from "@nestjs/common";
import { userRole } from "utils/constants";

// This decorator is used to set the user role metadata for a route handler.
export const Roles = (...roles: userRole[] ) => SetMetadata('roles', roles);