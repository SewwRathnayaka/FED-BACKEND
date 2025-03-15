import { Request, Response, NextFunction } from "express";

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Enhanced debug logging
    console.log('Authorization Debug:', {
      headers: req.headers,
      authHeader: req.headers.authorization,
      token: req.headers.authorization?.split(' ')[1]?.substring(0, 50) + '...',
      auth: req.auth,
      sessionClaims: req.auth?.sessionClaims,
      metadata: req.auth?.sessionClaims?.metadata,
      role: req.auth?.sessionClaims?.metadata?.role
    });

    const role = req.auth?.sessionClaims?.metadata?.role;
    
    if (role !== 'admin') {
      return res.status(403).json({
        message: "Admin access required",
        receivedRole: role,
        authDebug: {
          hasAuth: !!req.auth,
          hasClaims: !!req.auth?.sessionClaims,
          hasMetadata: !!req.auth?.sessionClaims?.metadata
        }
      });
    }

    next();
  } catch (error) {
    console.error('Authorization error:', error);
    next(error);
  }
};
