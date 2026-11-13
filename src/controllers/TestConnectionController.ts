import { Request, Response, Router } from 'express';

const router = Router();

const testConnection = (_req: Request, res: Response): void => {
  res.status(200).json({
    message: 'Conexão com a API realizada com sucesso!',
  });
};

router.get('/', testConnection);

export const TestConnectionController = router;
export default router;
