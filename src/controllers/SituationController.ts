import { Request, Response, Router } from 'express';
import { AppDataSource } from '../data-source';
import { Situation } from '../entity/Situation';

const router = Router();

// Rota GET /situations simples apenas para checar o funcionamento inicial da rota
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    message: 'Rota de situações funcionando com sucesso!',
  });
});

router.get('/situations', async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    message: 'Rota de situações funcionando com sucesso!',
  });
});

// Rota POST (Create)
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const situationRepository = AppDataSource.getRepository(Situation);
    const newSituation = situationRepository.create(req.body);
    await situationRepository.save(newSituation);

    res.status(201).json({
      message: 'Situação cadastrada com sucesso!',
      situation: newSituation,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error?.message || 'Erro ao cadastrar situação.',
    });
  }
});

router.post('/situations', async (req: Request, res: Response): Promise<void> => {
  try {
    const situationRepository = AppDataSource.getRepository(Situation);
    const newSituation = situationRepository.create(req.body);
    await situationRepository.save(newSituation);

    res.status(201).json({
      message: 'Situação cadastrada com sucesso!',
      situation: newSituation,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error?.message || 'Erro ao cadastrar situação.',
    });
  }
});

export const SituationController = router;
export default router;
