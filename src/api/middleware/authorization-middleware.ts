import { Request, Response, NextFunction } from "express";

declare namespace Express {
  export interface Request {
    auth?: {
      sessionClaims?: {
        metadata?: {
          role?: string;
        };
      };
    };
  }
}

export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const role = req.auth?.sessionClaims?.metadata?.role;
    
    if (role !== 'admin') {
      res.status(403).json({ message: "Admin access required" });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};
