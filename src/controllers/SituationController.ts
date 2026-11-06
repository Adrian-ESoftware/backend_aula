import { Request, Response, Router } from 'express';
import { Not } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Situation } from '../entity/Situation';
import { PaginationService } from '../services/pagination.service';

const router = Router();

// 1. Rota de listagem geral (GET) - List com PaginationService
const listSituations = async (req: Request, res: Response): Promise<void> => {
  try {
    const situationRepository = AppDataSource.getRepository(Situation);
    const { page = 1, limit = 10 } = req.query;

    const result = await PaginationService.paginate(
      situationRepository,
      Number(page) || 1,
      Number(limit) || 10,
      { id: 'DESC' }
    );

    res.status(200).json(result);
    return;
  } catch (error: any) {
    res.status(400).json({
      error: true,
      message: error?.message || 'Erro ao listar situações.',
    });
    return;
  }
};

router.get('/', listSituations);
router.get('/situations', listSituations);

// 2. Rota de visualização por ID (GET com parâmetro :id) - View
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
      message: error?.message || 'Erro ao visualizar situação',
    });
    return;
  }
};

router.get('/:id', viewSituation);
router.get('/situations/:id', viewSituation);

// 3. Rota POST (Create) - Cadastro
const createSituation = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;
    const situationRepository = AppDataSource.getRepository(Situation);

    if (data?.nameSituation) {
      const existingSituation = await situationRepository.findOne({
        where: { nameSituation: data.nameSituation },
      });

      if (existingSituation) {
        res.status(400).json({
          message: 'Já existe uma situação cadastrada com esse nome.',
        });
        return;
      }
    }

    const newSituation = situationRepository.create(data);
    await situationRepository.save(newSituation);

    res.status(201).json({
      message: 'Situação cadastrada com sucesso!',
      situation: newSituation,
    });
    return;
  } catch (error: any) {
    res.status(500).json({
      message: error?.message || 'Erro ao cadastrar situação',
    });
    return;
  }
};

router.post('/', createSituation);
router.post('/situations', createSituation);

// 4. Rota PUT/PATCH (Edit/Update) - Edição/Atualização
const editSituation = async (req: Request, res: Response): Promise<void> => {
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

    const data = req.body;

    if (data?.nameSituation) {
      const existingSituation = await situationRepository.findOne({
        where: {
          nameSituation: data.nameSituation,
          id: Not(parsedId), // Ignora o registro atual na busca
        },
      });

      if (existingSituation) {
        res.status(400).json({
          message: 'Já existe uma situação cadastrada com esse nome.',
        });
        return;
      }
    }

    situationRepository.merge(situation, data);
    situation.id = parsedId;
    const updatedSituation = await situationRepository.save(situation);

    res.status(200).json({
      message: 'Situação atualizada com sucesso',
      situation: updatedSituation,
    });
    return;
  } catch (error: any) {
    res.status(500).json({
      message: error?.message || 'Erro ao atualizar situação',
    });
    return;
  }
};

router.put('/:id', editSituation);
router.put('/situations/:id', editSituation);
router.patch('/:id', editSituation);
router.patch('/situations/:id', editSituation);

// 5. Rota DELETE (Delete) - Remoção
const deleteSituation = async (req: Request, res: Response): Promise<void> => {
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

    await situationRepository.remove(situation);

    res.status(200).json({
      message: 'Situação removida com sucesso',
    });
    return;
  } catch (error: any) {
    res.status(500).json({
      message: error?.message || 'Erro ao remover situação',
    });
    return;
  }
};

router.delete('/:id', deleteSituation);
router.delete('/situations/:id', deleteSituation);

export const SituationController = router;
export default router;
