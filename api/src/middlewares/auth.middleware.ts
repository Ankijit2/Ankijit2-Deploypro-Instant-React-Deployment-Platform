import { decode } from "next-auth/jwt";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";


declare global {
  namespace Express {
    interface Request {
      session?: any; // Add a `session` property to the Request interface
    }
  }
}

const authenticateJWT = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const sessionToken =await req.cookies["authjs.session-token"];
  
    
    if (!sessionToken) {
      throw new ApiError(403, "Unauthorized: No token found");
    }
    console.log(process.env.AUTH_SECRET);
    const decodedToken =await decode({
      token:sessionToken,
      secret:process.env.AUTH_SECRET!,
      salt:"authjs.session-token"
  });

    if (!decodedToken) {
      throw new ApiError(403, "Unauthorized: Invalid token");
    }

    req.session = decodedToken; // Attach decoded session data to the request object
    next();
  } catch (error) {
    console.error("Failed to authenticate", error);
    res.status(403).json({ error: "Unauthorized" });
  }
};

export default authenticateJWT;
