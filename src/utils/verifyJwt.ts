import { verify } from "hono/jwt";

export const verifyJwtToken = async (token: string, jwtSecret: string) => {
  try {
    const decodedPayload = await verify(token, jwtSecret);
    return decodedPayload;
  } catch(error : any) {
    return error.message;
  }
};


