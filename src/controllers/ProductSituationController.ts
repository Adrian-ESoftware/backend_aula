import { Request, Response, Router } from 'express';
import { AppDataSource } from '../data-source';
import { ProductSituation } from '../entity/ProductSituation';
import { PaginationService } from '../services/pagination.service';

const router = Router();

// 1. Listar situações de produtos com paginação
const listProductSituations = async (req: Request, res: Response): Promise<void> => {
  try {
    const repository = AppDataSource.getRepository(ProductSituation);
    const { page = 1, limit = 10 } = req.query;

    const result = await PaginationService.paginate(
      repository,
      Number(page) || 1,
      Number(limit) || 10,
      { id: 'DESC' },
    );

    res.status(200).json(result);
    return;
  } catch (error: any) {
    res.status(400).json({
      error: true,
      message: error?.message || 'Erro ao listar situações de produtos.',
    });
    return;
  }
};

router.get('/', listProductSituations);
router.get('/product-situations', listProductSituations);

// 2. Visualizar situação de produto por ID
const viewProductSituation = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      res.status(404).json({
        message: 'Situação de produto não encontrada.',
      });
      return;
    }

    const repository = AppDataSource.getRepository(ProductSituation);
    const situation = await repository.findOneBy({ id: parsedId });

    if (!situation) {
      res.status(404).json({
        message: 'Situação de produto não encontrada.',
      });
      return;
    }

    res.status(200).json(situation);
    return;
  } catch (error: any) {
    res.status(500).json({
      message: error?.message || 'Erro ao visualizar situação de produto.',
    });
    return;
  }
};

router.get('/:id', viewProductSituation);
router.get('/product-situations/:id', viewProductSituation);

// 3. Cadastrar nova situação de produto
const createProductSituation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({
        message: 'O campo name é obrigatório.',
      });
      return;
    }

    const repository = AppDataSource.getRepository(ProductSituation);
    const newSituation = repository.create({ name: name.trim() });
    await repository.save(newSituation);

    res.status(201).json({
      message: 'Situação de produto cadastrada com sucesso!',
      productSituation: newSituation,
    });
    return;
  } catch (error: any) {
    res.status(500).json({
      message: error?.message || 'Erro ao cadastrar situação de produto.',
    });
    return;
  }
};

router.post('/', createProductSituation);
router.post('/product-situations', createProductSituation);

// 4. Editar situação de produto
const editProductSituation = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      res.status(404).json({
        message: 'Situação de produto não encontrada.',
      });
      return;
    }

    const repository = AppDataSource.getRepository(ProductSituation);
    const situation = await repository.findOneBy({ id: parsedId });

    if (!situation) {
      res.status(404).json({
        message: 'Situação de produto não encontrada.',
      });
      return;
    }

    if (req.body.name) {
      situation.name = String(req.body.name).trim();
    }

    const updatedSituation = await repository.save(situation);

    res.status(200).json({
      message: 'Situação de produto atualizada com sucesso!',
      productSituation: updatedSituation,
    });
    return;
  } catch (error: any) {
    res.status(500).json({
      message: error?.message || 'Erro ao atualizar situação de produto.',
    });
    return;
  }
};

router.put('/:id', editProductSituation);
router.put('/product-situations/:id', editProductSituation);
router.patch('/:id', editProductSituation);
router.patch('/product-situations/:id', editProductSituation);

// 5. Excluir situação de produto
const deleteProductSituation = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      res.status(404).json({
        message: 'Situação de produto não encontrada.',
      });
      return;
    }

    const repository = AppDataSource.getRepository(ProductSituation);
    const situation = await repository.findOneBy({ id: parsedId });

    if (!situation) {
      res.status(404).json({
        message: 'Situação de produto não encontrada.',
      });
      return;
    }

    await repository.remove(situation);

    res.status(200).json({
      message: 'Situação de produto removida com sucesso!',
    });
    return;
  } catch (error: any) {
    res.status(500).json({
      message: error?.message || 'Erro ao remover situação de produto.',
    });
    return;
  }
};

router.delete('/:id', deleteProductSituation);
router.delete('/product-situations/:id', deleteProductSituation);

export const ProductSituationController = router;
export default router;
