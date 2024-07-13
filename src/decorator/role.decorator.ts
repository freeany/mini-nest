import { createParamDecorator } from '@nestjs/common';

export const UserRole = createParamDecorator((data, ctx) => {
  const request = ctx.switchToHttp().getRequest();
  return request.body.role === data; 
});