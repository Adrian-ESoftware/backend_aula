import { Request, Response, Router } from 'express';
import { AppDataSource } from '../data-source';
import { Situation } from '../entity/Situation';

const router = Router();

router.post('/situations', async (req: Request, res: Response): Promise<void> => {
  try {
    const repository = AppDataSource.getRepository(Situation);
    const novoRegistro = repository.create(req.body);
    await repository.save(novoRegistro);

    res.status(201).json({
      message: 'Situação cadastrada com sucesso!',
      situation: novoRegistro,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error?.message || 'Erro ao cadastrar situação.',
    });
  }
});

export const SituationsController = router;
export default router;
