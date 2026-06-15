import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User';
import Condominium from '../models/Condominium';
import Unit from '../models/Unit';
import Resident from '../models/Resident';

dotenv.config();

const seed = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) throw new Error('MONGO_URI não definida');

    await mongoose.connect(mongoURI);
    console.log('✅ Conectado ao MongoDB');

    // Clear existing test data
    await User.deleteMany({ email: { $in: ['sindico@teste.com', 'morador@teste.com'] } });
    console.log('🧹 Dados antigos removidos');

    const salt = await bcrypt.genSalt(10);

    // 1. Create admin user (síndico)
    const adminUser = await User.create({
      name: 'João Síndico',
      email: 'sindico@teste.com',
      password: await bcrypt.hash('123456', salt),
      phone: '11999990001',
      role: 'admin',
    });

    // 2. Create condominium
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

    // Link condo to admin
    adminUser.condominiumId = condo._id as any;
    await adminUser.save();

    // 3. Create a unit
    const unit = await Unit.create({
      condominiumId: condo._id,
      block: 'A',
      number: '101',
      status: 'occupied',
      notes: '',
    });

    // 4. Create resident user
    const residentUser = await User.create({
      name: 'Maria Moradora',
      email: 'morador@teste.com',
      password: await bcrypt.hash('123456', salt),
      phone: '11999990002',
      role: 'resident',
      condominiumId: condo._id,
      unitId: unit._id,
    });

    // 5. Create resident record
    await Resident.create({
      condominiumId: condo._id,
      unitId: unit._id,
      name: 'Maria Moradora',
      phone: '11999990002',
      email: 'morador@teste.com',
      type: 'owner',
      isFinancialResponsible: true,
      userId: residentUser._id,
    });

    console.log('\n✅ Dados de teste criados com sucesso!\n');
    console.log('══════════════════════════════════════════════');
    console.log('👤 SÍNDICO (admin)');
    console.log('   E-mail : sindico@teste.com');
    console.log('   Senha  : 123456');
    console.log('──────────────────────────────────────────────');
    console.log('🏠 MORADOR (resident)');
    console.log('   E-mail : morador@teste.com');
    console.log('   Senha  : 123456');
    console.log('   Unidade: Bloco A - Apt 101');
    console.log('══════════════════════════════════════════════\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Erro ao criar seed:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seed();
