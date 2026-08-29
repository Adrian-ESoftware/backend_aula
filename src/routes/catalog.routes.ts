import { Router } from 'express';
import * as yup from 'yup';
import slugify from 'slugify';
import { AppDataSource } from '../data-source';
import { Product } from '../entities/Product';
import { Situation } from '../entities/Situation';
import { AppError } from '../errors';
import { requireAuth } from '../middleware/auth';
import { asyncHandler, parseId, validateBody } from '../utils';

const router = Router();
const products = () => AppDataSource.getRepository(Product);
const situations = () => AppDataSource.getRepository(Situation);

const situationSchema = yup.object({
  name: yup.string().trim().min(2).max(80).required(),
  description: yup.string().trim().max(1000).nullable().default(null),
  isActive: yup.boolean().default(true),
});

const situationUpdateSchema = situationSchema.partial();

const productSchema = yup.object({
  name: yup.string().trim().min(2).max(150).required(),
  description: yup.string().trim().max(5000).nullable().default(null),
  price: yup.number().min(0).max(99999999.99).required(),
  situationId: yup.number().integer().positive().required(),
});

const productUpdateSchema = productSchema.partial();

const uniqueSlug = async (name: string, id?: number): Promise<string> => {
  const base = slugify(name, { lower: true, strict: true }) || `produto-${Date.now()}`;
  let slug = base;
  let suffix = 2;
  while (true) {
    const found = await products().findOne({ where: { slug } });
    if (!found || found.id === id) return slug;
    slug = `${base}-${suffix++}`;
  }
};

const findSituation = async (id: number): Promise<Situation> => {
  const situation = await situations().findOneBy({ id });
  if (!situation) throw new AppError('Situação não encontrada.', 404);
  return situation;
};

router.get(
  '/situations',
  asyncHandler(async (_req, res) => {
    res.json(await situations().find({ order: { id: 'ASC' } }));
  }),
);

router.get(
  '/situations/:id',
  asyncHandler(async (req, res) => {
    const situation = await situations().findOne({ where: { id: parseId(req.params.id) } });
    if (!situation) throw new AppError('Situação não encontrada.', 404);
    res.json(situation);
  }),
);

router.post(
  '/situations',
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = await validateBody(situationSchema, req.body);
    const repository = situations();
    if (await repository.findOne({ where: { name: input.name } })) {
      throw new AppError('Já existe uma situação com este nome.', 409);
    }
    const situation = await repository.save(repository.create(input));
    res.status(201).json(situation);
  }),
);

router.patch(
  '/situations/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const situation = await findSituation(parseId(req.params.id));
    const input = await validateBody(situationUpdateSchema, req.body);
    if (input.name && input.name !== situation.name) {
      const duplicate = await situations().findOne({ where: { name: input.name } });
      if (duplicate && duplicate.id !== situation.id) throw new AppError('Já existe uma situação com este nome.', 409);
    }
    Object.assign(situation, input);
    res.json(await situations().save(situation));
  }),
);

router.delete(
  '/situations/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const situation = await findSituation(parseId(req.params.id));
    const linkedProducts = await products().countBy({ situationId: situation.id });
    if (linkedProducts > 0) throw new AppError('Não é possível excluir uma situação com produtos vinculados.', 409);
    await situations().remove(situation);
    res.status(204).send();
  }),
);

router.get(
  '/products',
  asyncHandler(async (_req, res) => {
    res.json(await products().find({ relations: { situation: true }, order: { id: 'ASC' } }));
  }),
);

router.get(
  '/products/:id',
  asyncHandler(async (req, res) => {
    const product = await products().findOne({
      where: { id: parseId(req.params.id) },
      relations: { situation: true },
    });
    if (!product) throw new AppError('Produto não encontrado.', 404);
    res.json(product);
  }),
);

router.post(
  '/products',
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = await validateBody(productSchema, req.body);
    await findSituation(input.situationId);
    const repository = products();
    const product = repository.create({
      ...input,
      slug: await uniqueSlug(input.name),
    });
    res.status(201).json(await repository.save(product));
  }),
);

router.patch(
  '/products/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const product = await products().findOneBy({ id: parseId(req.params.id) });
    if (!product) throw new AppError('Produto não encontrado.', 404);
    const input = await validateBody(productUpdateSchema, req.body);
    if (input.situationId) await findSituation(input.situationId);
    if (input.name && input.name !== product.name) product.slug = await uniqueSlug(input.name, product.id);
    Object.assign(product, input);
    res.json(await products().save(product));
  }),
);

router.delete(
  '/products/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const product = await products().findOneBy({ id: parseId(req.params.id) });
    if (!product) throw new AppError('Produto não encontrado.', 404);
    await products().remove(product);
    res.status(204).send();
  }),
);

export default router;
