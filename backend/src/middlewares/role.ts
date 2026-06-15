import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const roleMiddleware = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Sem permissão para acessar este recurso' });
      return;
    }

    next();
  };
};
