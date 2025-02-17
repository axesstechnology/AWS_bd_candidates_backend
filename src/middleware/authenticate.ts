import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";

// Define what the JWT payload should look like
interface JWTPayload {
  id: string;
  email: string;
  role?: string;
  // add other fields that you store in your JWT
}

// Update the IUser interface
export interface IUser extends JWTPayload {
  // add any additional user properties here
  name?: string;
  isActive?: boolean;
}

// Extend Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

// JWT secret key (store securely in environment variable)
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// Optional: Add a function to generate tokens
export const generateToken = (user: IUser): string => {
  return jwt.sign(
    {
      id: user?.id,
      email: user?.email,
      role: user?.role
    },
    JWT_SECRET,
    { expiresIn: '7d' } // Set appropriate expiration
  );
};

// Optional: Add a function to refresh tokens
export const refreshToken = (oldToken: string): string | null => {
  try {
    const decoded = jwt.verify(oldToken, JWT_SECRET) as JWTPayload;
    // Generate new token
    return generateToken(decoded as IUser);
  } catch (err) {
    return null;
  }
};
export const authenticateJWT: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Check both cookie and Authorization header
    const token = req.cookies?.token || req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      res.status(401).json({ 
        success: false,
        message: "Access denied. No token provided." 
      });
      return;
    }

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // Attach decoded user information to the request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      // map other fields from decoded as needed
    };

    console.log('Authenticated User:', req.user);
    
    next();
  } catch (err) {
    console.error('JWT Verification Error:', err);
    res.status(403).json({ 
      success: false,
      message: "Invalid token.",
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};

