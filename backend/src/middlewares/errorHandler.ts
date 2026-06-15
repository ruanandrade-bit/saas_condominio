import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('❌ Erro:', err.message);

  if (err.message === 'Origem não permitida pelo CORS') {
    res.status(403).json({ error: err.message });
    return;
  }

  if (err.name === 'ValidationError') {
    res.status(400).json({ error: 'Dados inválidos', details: err.message });
    return;
  }

  if (err.name === 'CastError') {
    res.status(400).json({ error: 'ID inválido' });
    return;
  }

  if ((err as any).code === 11000) {
    res.status(409).json({ error: 'Registro duplicado' });
    return;
  }

  res.status(500).json({ error: 'Erro interno do servidor' });
};
