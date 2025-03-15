import { Request, Response, NextFunction } from "express";

const globalErrorHandlingMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  const errorResponses: Record<string, number> = {
    NotFoundError: 404,
    ValidationError: 400,
    UnauthorizedError: 401
  };

  const statusCode = errorResponses[error.name] || 500;
  
  res.status(statusCode).json({
    message: error.message,
    stack: process.env.NODE_ENV === 'production' ? null : error.stack
  });
};

export default globalErrorHandlingMiddleware;
