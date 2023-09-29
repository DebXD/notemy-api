import { Context } from "hono";

export const asyncHandler = async (handler: Function, c: Context) => {
  return handler(c);
};
