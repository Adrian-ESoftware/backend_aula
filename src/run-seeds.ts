import 'reflect-metadata';
import bcrypt from 'bcryptjs';
import { AppDataSource } from './data-source';
import { Product } from './entities/Product';
import { Situation } from './entities/Situation';
import { User } from './entities/User';

const run = async (): Promise<void> => {
  await AppDataSource.initialize();

  const userRepository = AppDataSource.getRepository(User);
  const situationRepository = AppDataSource.getRepository(Situation);
  const productRepository = AppDataSource.getRepository(Product);

  let user = await userRepository.findOneBy({ email: 'admin@example.com' });
  if (!user) {
    user = await userRepository.save(
      userRepository.create({
        name: 'Administrador',
        email: 'admin@example.com',
        password: await bcrypt.hash('12345678', 10),
        recoveryTokenHash: null,
        recoveryTokenExpiresAt: null,
      }),
    );
  }

  const situationData = [
    { name: 'Disponível', description: 'Produto disponível para venda.', isActive: true },
    { name: 'Indisponível', description: 'Produto temporariamente indisponível.', isActive: false },
  ];
  const savedSituations: Situation[] = [];
  for (const data of situationData) {
    let situation = await situationRepository.findOneBy({ name: data.name });
    if (!situation) situation = await situationRepository.save(situationRepository.create(data));
    savedSituations.push(situation);
  }

  if (!(await productRepository.count())) {
    await productRepository.save([
      productRepository.create({
        name: 'Produto de exemplo',
        slug: 'produto-de-exemplo',
        description: 'Registro criado pela seed.',
        price: 29.9,
        situationId: savedSituations[0].id,
      }),
    ]);
  }

  console.log(`Seeds concluídas. Usuário de teste: ${user.email} / 12345678`);
  await AppDataSource.destroy();
};

run().catch(async (error: unknown) => {
  console.error('Falha ao executar seeds.', error);
  if (AppDataSource.isInitialized) await AppDataSource.destroy();
  process.exitCode = 1;
});
