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
    // Check both possible locations for role
    const role =
      req.auth?.sessionClaims?.role ||
      req.auth?.sessionClaims?.metadata?.role;

    console.log('Authorization Check:', {
      role: role,
      authObject: req.auth,
      sessionClaims: req.auth?.sessionClaims,
      metadata: req.auth?.sessionClaims?.metadata
    });

    if (role !== 'admin') {
      res.status(403).json({
        message: "Admin access required",
        debug: {
          receivedRole: role,
          expectedRole: 'admin',
          fullAuth: req.auth,
          sessionClaims: req.auth?.sessionClaims,
          metadata: req.auth?.sessionClaims?.metadata
        }
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Authorization error:', error);
    next(error);
  }
};