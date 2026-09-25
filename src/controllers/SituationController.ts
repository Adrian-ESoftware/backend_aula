import { Request, Response, Router } from 'express';
import { AppDataSource } from '../data-source';
import { Situation } from '../entity/Situation';

const router = Router();

// 1. Rota de listagem geral (GET)
const listSituations = async (_req: Request, res: Response): Promise<void> => {
  try {
    const situationRepository = AppDataSource.getRepository(Situation);
    const situations = await situationRepository.find();

    res.status(200).json(situations);
    return;
  } catch (error: any) {
    res.status(500).json({
      message: error?.message || 'Erro ao listar situação.',
    });
    return;
  }
};

router.get('/', listSituations);
router.get('/situations', listSituations);

// 2. Rota de visualização por ID (GET com parâmetro :id)
const viewSituation = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      res.status(404).json({
        message: 'Situação não encontrada.',
      });
      return;
    }

    const situationRepository = AppDataSource.getRepository(Situation);
    const situation = await situationRepository.findOneBy({
      id: parsedId,
    });

    if (!situation) {
      res.status(404).json({
        message: 'Situação não encontrada.',
      });
      return;
    }

    res.status(200).json(situation);
    return;
  } catch (error: any) {
    res.status(500).json({
      message: error?.message || 'Erro ao visualizar situação.',
    });
    return;
  }
};

router.get('/:id', viewSituation);
router.get('/situations/:id', viewSituation);

// 3. Rota POST (Create)
const createSituation = async (req: Request, res: Response): Promise<void> => {
  try {
    const situationRepository = AppDataSource.getRepository(Situation);
    const newSituation = situationRepository.create(req.body);
    await situationRepository.save(newSituation);

    res.status(201).json({
      message: 'Situação cadastrada com sucesso!',
      situation: newSituation,
    });
    return;
  } catch (error: any) {
    res.status(500).json({
      message: error?.message || 'Erro ao cadastrar situação.',
    });
    return;
  }
};

router.post('/', createSituation);
router.post('/situations', createSituation);

export const SituationController = router;
export default router;
