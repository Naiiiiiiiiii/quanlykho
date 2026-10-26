import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

export const FORBIDDEN_MESSAGE_KEY = 'forbiddenMessage';
export const ForbiddenMessage = (message: string) =>
  SetMetadata(FORBIDDEN_MESSAGE_KEY, message);
