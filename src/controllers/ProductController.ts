import { Request, Response, Router } from 'express';
import { AppDataSource } from '../data-source';
import { Product } from '../entity/Product';
import { ProductCategory } from '../entity/ProductCategory';
import { ProductSituation } from '../entity/ProductSituation';
import { PaginationService } from '../services/pagination.service';

const router = Router();

// 1. Listar produtos com paginação e relacionamentos
const listProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const repository = AppDataSource.getRepository(Product);
    const { page = 1, limit = 10 } = req.query;

    const result = await PaginationService.paginate(
      repository,
      Number(page) || 1,
      Number(limit) || 10,
      { id: 'DESC' },
      { productCategory: true, productSituation: true },
    );

    res.status(200).json(result);
    return;
  } catch (error: any) {
    res.status(400).json({
      error: true,
      message: error?.message || 'Erro ao listar produtos.',
    });
    return;
  }
};

router.get('/', listProducts);
router.get('/products', listProducts);

// 2. Visualizar produto por ID
const viewProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      res.status(404).json({
        message: 'Produto não encontrado.',
      });
      return;
    }

    const repository = AppDataSource.getRepository(Product);
    const product = await repository.findOne({
      where: { id: parsedId },
      relations: {
        productCategory: true,
        productSituation: true,
      },
    });

    if (!product) {
      res.status(404).json({
        message: 'Produto não encontrado.',
      });
      return;
    }

    res.status(200).json(product);
    return;
  } catch (error: any) {
    res.status(500).json({
      message: error?.message || 'Erro ao visualizar produto.',
    });
    return;
  }
};

router.get('/:id', viewProduct);
router.get('/products/:id', viewProduct);

// 3. Cadastrar novo produto
const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, productSituationId, productCategoryId, price, description } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({
        message: 'O campo name é obrigatório.',
      });
      return;
    }

    const productRepo = AppDataSource.getRepository(Product);
    const categoryRepo = AppDataSource.getRepository(ProductCategory);
    const situationRepo = AppDataSource.getRepository(ProductSituation);

    if (productCategoryId) {
      const categoryExists = await categoryRepo.findOneBy({ id: Number(productCategoryId) });
      if (!categoryExists) {
        res.status(400).json({
          message: 'Categoria de produto informada não existe.',
        });
        return;
      }
    }

    if (productSituationId) {
      const situationExists = await situationRepo.findOneBy({ id: Number(productSituationId) });
      if (!situationExists) {
        res.status(400).json({
          message: 'Situação de produto informada não existe.',
        });
        return;
      }
    }

    const newProduct = productRepo.create({
      name: name.trim(),
      productSituationId: productSituationId ? Number(productSituationId) : null,
      productCategoryId: productCategoryId ? Number(productCategoryId) : null,
      price: price !== undefined ? Number(price) : null,
      description: description || null,
    });

    await productRepo.save(newProduct);

    res.status(201).json({
      message: 'Produto cadastrado com sucesso!',
      product: newProduct,
    });
    return;
  } catch (error: any) {
    res.status(500).json({
      message: error?.message || 'Erro ao cadastrar produto.',
    });
    return;
  }
};

router.post('/', createProduct);
router.post('/products', createProduct);

// 4. Editar produto
const editProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      res.status(404).json({
        message: 'Produto não encontrado.',
      });
      return;
    }

    const productRepo = AppDataSource.getRepository(Product);
    const product = await productRepo.findOneBy({ id: parsedId });

    if (!product) {
      res.status(404).json({
        message: 'Produto não encontrado.',
      });
      return;
    }

    const { name, productSituationId, productCategoryId, price, description } = req.body;

    if (name) product.name = String(name).trim();
    if (price !== undefined) product.price = Number(price);
    if (description !== undefined) product.description = description;

    if (productCategoryId !== undefined) {
      if (productCategoryId !== null) {
        const categoryRepo = AppDataSource.getRepository(ProductCategory);
        const categoryExists = await categoryRepo.findOneBy({ id: Number(productCategoryId) });
        if (!categoryExists) {
          res.status(400).json({ message: 'Categoria de produto informada não existe.' });
          return;
        }
        product.productCategoryId = Number(productCategoryId);
      } else {
        product.productCategoryId = null;
      }
    }

    if (productSituationId !== undefined) {
      if (productSituationId !== null) {
        const situationRepo = AppDataSource.getRepository(ProductSituation);
        const situationExists = await situationRepo.findOneBy({ id: Number(productSituationId) });
        if (!situationExists) {
          res.status(400).json({ message: 'Situação de produto informada não existe.' });
          return;
        }
        product.productSituationId = Number(productSituationId);
      } else {
        product.productSituationId = null;
      }
    }

    const updatedProduct = await productRepo.save(product);

    res.status(200).json({
      message: 'Produto atualizado com sucesso!',
      product: updatedProduct,
    });
    return;
  } catch (error: any) {
    res.status(500).json({
      message: error?.message || 'Erro ao atualizar produto.',
    });
    return;
  }
};

router.put('/:id', editProduct);
router.put('/products/:id', editProduct);
router.patch('/:id', editProduct);
router.patch('/products/:id', editProduct);

// 5. Excluir produto
const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      res.status(404).json({
        message: 'Produto não encontrado.',
      });
      return;
    }

    const productRepo = AppDataSource.getRepository(Product);
    const product = await productRepo.findOneBy({ id: parsedId });

    if (!product) {
      res.status(404).json({
        message: 'Produto não encontrado.',
      });
      return;
    }

    await productRepo.remove(product);

    res.status(200).json({
      message: 'Produto removido com sucesso!',
    });
    return;
  } catch (error: any) {
    res.status(500).json({
      message: error?.message || 'Erro ao remover produto.',
    });
    return;
  }
};

router.delete('/:id', deleteProduct);
router.delete('/products/:id', deleteProduct);

export const ProductController = router;
export default router;
