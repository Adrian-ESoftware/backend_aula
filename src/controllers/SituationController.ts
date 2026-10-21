import { Request, Response, Router } from 'express';
import { AppDataSource } from '../data-source';
import { Situation } from '../entity/Situation';

const router = Router();

// 1. Rota de listagem geral (GET) - List com paginação manual
const listSituations = async (req: Request, res: Response): Promise<void> => {
  try {
    const situationRepository = AppDataSource.getRepository(Situation);

    // 1. Parâmetro de Página (page)
    const pageQuery = req.query.page;
    let page = parseInt(pageQuery as string, 10);
    if (isNaN(page) || page < 1) {
      page = 1;
    }

    // 2. Limite de Registros (limit)
    const limit = 2;

    // 3. Contagem e Validação de Existência (count)
    const totalSituations = await situationRepository.count();

    if (totalSituations === 0) {
      res.status(400).json({
        message: 'Nenhuma situação encontrada',
      });
      return;
    }

    // 4. Cálculo da Última Página (lastPage)
    const lastPage = Math.ceil(totalSituations / limit);

    // 5. Validação da Página Solicitada
    if (page > lastPage) {
      res.status(400).json({
        message: `Página inválida. O total de páginas é ${lastPage}.`,
      });
      return;
    }

    // 6. Cálculo de Deslocamento (offset / skip)
    const offset = (page - 1) * limit;

    // 7. Consulta Paginada ao Banco de Dados
    const situations = await situationRepository.find({
      take: limit,
      skip: offset,
      order: {
        id: 'DESC',
      },
    });

    // 8. Formato da Resposta
    res.status(200).json({
      currentPage: page,
      lastPage,
      totalSituations,
      situations,
    });
    return;
  } catch (error: any) {
    res.status(500).json({
      message: error?.message || 'Erro ao listar situação',
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

    situationRepository.merge(situation, req.body);
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
