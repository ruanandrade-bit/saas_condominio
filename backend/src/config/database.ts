import mongoose from 'mongoose';
import { getMongoUri } from './env';

const seedTestUsers = async () => {
  // Dynamically import to avoid issues when not needed
  const bcrypt = (await import('bcryptjs')).default;
  const User = (await import('../models/User')).default;
  const Condominium = (await import('../models/Condominium')).default;
  const Unit = (await import('../models/Unit')).default;
  const Resident = (await import('../models/Resident')).default;

  const already = await User.findOne({ email: 'sindico@teste.com' });
  if (already) return; // already seeded

  const salt = await bcrypt.genSalt(10);

  // Admin (síndico)
  const adminUser = await User.create({
    name: 'João Síndico',
    email: 'sindico@teste.com',
    password: await bcrypt.hash('123456', salt),
    phone: '11999990001',
    role: 'admin',
  });

  const condo = await Condominium.create({
    name: 'Residencial Aurora',
    cnpj: '12.345.678/0001-90',
    address: 'Rua das Flores, 100',
    city: 'São Paulo',
    state: 'SP',
    pixKey: 'sindico@teste.com',
    defaultFee: 350,
    dueDay: 10,
    ownerId: adminUser._id,
  });

  adminUser.condominiumId = condo._id as any;
  await adminUser.save();

  const unit = await Unit.create({
    condominiumId: condo._id,
    block: 'A',
    number: '101',
    status: 'occupied',
    notes: '',
  });

  // Resident (morador)
  const residentUser = await User.create({
    name: 'Maria Moradora',
    email: 'morador@teste.com',
    password: await bcrypt.hash('123456', salt),
    phone: '11999990002',
    role: 'resident',
    condominiumId: condo._id,
    unitId: unit._id,
  });

  // Additional Units and Residents for "sindico@teste.com"
  const blocks = ['Bloco A', 'Bloco B', 'Bloco C'];
  const residentNames = ['João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Lucas', 'Julia', 'Marcos', 'Fernanda', 'Rafael'];
  const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes'];

  for (const block of blocks) {
    for (let floor = 1; floor <= 5; floor++) {
      for (let unitNum = 1; unitNum <= 4; unitNum++) {
        const number = `${floor}0${unitNum}`;
        const isOccupied = Math.random() > 0.3;

        const newUnit = await Unit.create({
          condominiumId: condo._id,
          block,
          number,
          status: isOccupied ? 'occupied' : 'empty',
          notes: '',
        });

        if (isOccupied) {
          const name = `${residentNames[Math.floor(Math.random() * residentNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
          await Resident.create({
            condominiumId: condo._id,
            unitId: newUnit._id,
            name,
            phone: `1199999${Math.floor(1000 + Math.random() * 9000)}`,
            email: `morador.${block.replace(' ', '').toLowerCase()}${number}@teste.com`,
            type: Math.random() > 0.7 ? 'tenant' : 'owner',
            isFinancialResponsible: true,
          });
        }
      }
    }
  }

  console.log('\n  ══════════════════════════════════════════');
  console.log('  🧪 MODO DE TESTE — usuários criados:');
  console.log('  ──────────────────────────────────────────');
  console.log('  👤 Síndico  → sindico@teste.com  / 123456');
  console.log('  🏠 Morador  → morador@teste.com  / 123456');
  console.log('  ══════════════════════════════════════════\n');
};

const connectDB = async (): Promise<void> => {
  const mongoURI = getMongoUri();

  if (!mongoURI) {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
    console.log('🧪 MongoDB in-memory iniciado (modo teste)');
    await seedTestUsers();
    return;
  }

  await mongoose.connect(mongoURI);
  console.log('✅ MongoDB Atlas conectado com sucesso');
};

export default connectDB;
