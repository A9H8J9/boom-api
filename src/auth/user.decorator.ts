import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** The authenticated user the passport strategy loaded: `@User() user: SafeUser`. */
export const User = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();

  return req.user;
});
