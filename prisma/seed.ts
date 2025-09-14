import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Define os nomes dos cargos
const RolesNames: Record<string, { id: number; name: string }> = {
  super: { id: 1, name: 'Super Admin' },
  admin: { id: 2, name: 'Admin' },
  user: { id: 3, name: 'Usuário' },
  guest: { id: 4, name: 'Visitante' },
  teacher: { id: 5, name: 'Professor' },
  student: { id: 6, name: 'Aluno' },
  creator: { id: 7, name: 'Criador' },
  client: { id: 8, name: 'Cliente' },
};

async function main() {
  // Create roles if they do not exist
  for (const i in RolesNames) {
    await prisma.role.upsert({
      where: { name: i },
      update: {},
      create: {
        name: i,
      },
    });
    console.log(`Role '${i}' upserted.`);
  }

  const passwordHash = bcrypt.hashSync('Sete09IT.com', 10);

  // Busca o id do role 'super' após o upsert
  const superAdminRole = await prisma.role.findUnique({ where: { name: 'super' } });
  if (!superAdminRole) {
    throw new Error("Role 'super' não encontrada!");
  }

  const admin = await prisma.user.upsert({
    where: { email: 'dev@secreti.com.br' },
    update: {},
    create: {
      name: 'SecreTI',
      email: 'dev@secreti.com.br',
      password: passwordHash,
      role_id: superAdminRole.id,
    },
  });

  console.log('Admin user upserted:', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
