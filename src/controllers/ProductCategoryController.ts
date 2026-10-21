import { Request, Response, Router } from 'express';
import { AppDataSource } from '../data-source';
import { ProductCategory } from '../entity/ProductCategory';
import { PaginationService } from '../services/pagination.service';

const router = Router();

// 1. Listar categorias de produtos com paginação
const listCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const repository = AppDataSource.getRepository(ProductCategory);
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
      message: error?.message || 'Erro ao listar categorias de produtos.',
    });
    return;
  }
};

router.get('/', listCategories);
router.get('/product-categories', listCategories);

// 2. Visualizar categoria por ID
const viewCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      res.status(404).json({
        message: 'Categoria de produto não encontrada.',
      });
      return;
    }

    const repository = AppDataSource.getRepository(ProductCategory);
    const category = await repository.findOneBy({ id: parsedId });

    if (!category) {
      res.status(404).json({
        message: 'Categoria de produto não encontrada.',
      });
      return;
    }

    res.status(200).json(category);
    return;
  } catch (error: any) {
    res.status(500).json({
      message: error?.message || 'Erro ao visualizar categoria de produto.',
    });
    return;
  }
};

router.get('/:id', viewCategory);
router.get('/product-categories/:id', viewCategory);

// 3. Cadastrar nova categoria
const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({
        message: 'O campo name é obrigatório.',
      });
      return;
    }

    const repository = AppDataSource.getRepository(ProductCategory);
    const newCategory = repository.create({ name: name.trim() });
    await repository.save(newCategory);

    res.status(201).json({
      message: 'Categoria de produto cadastrada com sucesso!',
      productCategory: newCategory,
    });
    return;
  } catch (error: any) {
    res.status(500).json({
      message: error?.message || 'Erro ao cadastrar categoria de produto.',
    });
    return;
  }
};

router.post('/', createCategory);
router.post('/product-categories', createCategory);

// 4. Editar categoria
const editCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      res.status(404).json({
        message: 'Categoria de produto não encontrada.',
      });
      return;
    }

    const repository = AppDataSource.getRepository(ProductCategory);
    const category = await repository.findOneBy({ id: parsedId });

    if (!category) {
      res.status(404).json({
        message: 'Categoria de produto não encontrada.',
      });
      return;
    }

    if (req.body.name) {
      category.name = String(req.body.name).trim();
    }

    const updatedCategory = await repository.save(category);

    res.status(200).json({
      message: 'Categoria de produto atualizada com sucesso!',
      productCategory: updatedCategory,
    });
    return;
  } catch (error: any) {
    res.status(500).json({
      message: error?.message || 'Erro ao atualizar categoria de produto.',
    });
    return;
  }
};

router.put('/:id', editCategory);
router.put('/product-categories/:id', editCategory);
router.patch('/:id', editCategory);
router.patch('/product-categories/:id', editCategory);

// 5. Excluir categoria
const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      res.status(404).json({
        message: 'Categoria de produto não encontrada.',
      });
      return;
    }

    const repository = AppDataSource.getRepository(ProductCategory);
    const category = await repository.findOneBy({ id: parsedId });

    if (!category) {
      res.status(404).json({
        message: 'Categoria de produto não encontrada.',
      });
      return;
    }

    await repository.remove(category);

    res.status(200).json({
      message: 'Categoria de produto removida com sucesso!',
    });
    return;
  } catch (error: any) {
    res.status(500).json({
      message: error?.message || 'Erro ao remover categoria de produto.',
    });
    return;
  }
};

router.delete('/:id', deleteCategory);
router.delete('/product-categories/:id', deleteCategory);

export const ProductCategoryController = router;
export default router;
