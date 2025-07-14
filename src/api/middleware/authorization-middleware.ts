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

    console.log('--- FULL JWT CLAIMS ---');
    console.log(JSON.stringify(req.auth?.sessionClaims, null, 2));
    console.log('-----------------------');

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
}