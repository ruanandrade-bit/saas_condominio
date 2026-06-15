import { Response } from 'express';
import Charge from '../models/Charge';
import Unit from '../models/Unit';
import Resident from '../models/Resident';
import { AuthRequest } from '../middlewares/auth';

export const createCharge = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const condominiumId = req.user!.condominiumId;
    const { unitId, referenceMonth, amount, dueDate, description } = req.body;

    if (!unitId || !referenceMonth || amount === undefined || !dueDate) {
      res.status(400).json({ error: 'Unidade, mês, valor e vencimento são obrigatórios' });
      return;
    }

    const unit = await Unit.findOne({ _id: unitId, condominiumId });
    if (!unit) {
      res.status(400).json({ error: 'Unidade inválida para este condomínio' });
      return;
    }

    const resident = await Resident.findOne({
      condominiumId,
      unitId: unit._id,
      isFinancialResponsible: true,
    });

    const charge = await Charge.create({
      condominiumId,
      unitId: unit._id,
      residentId: resident?._id,
      referenceMonth,
      amount: Number(amount),
      dueDate: new Date(dueDate),
      description: description || 'Taxa condominial',
    });
    res.status(201).json(charge);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao criar cobrança', details: error.message });
  }
};

export const createBulkCharges = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { referenceMonth, amount, dueDate, description } = req.body;
    const condominiumId = req.user!.condominiumId;

    if (!referenceMonth || amount === undefined || !dueDate) {
      res.status(400).json({ error: 'Mês, valor e vencimento são obrigatórios' });
      return;
    }

    // Get all occupied units
    const units = await Unit.find({ condominiumId, status: { $ne: 'empty' } });

    if (units.length === 0) {
      res.status(400).json({ error: 'Nenhuma unidade ocupada encontrada' });
      return;
    }

    const charges = [];
    for (const unit of units) {
      // Find financial responsible resident
      const resident = await Resident.findOne({
        condominiumId,
        unitId: unit._id,
        isFinancialResponsible: true,
      });

      charges.push({
        condominiumId,
        unitId: unit._id,
        residentId: resident?._id,
        referenceMonth,
        amount: Number(amount),
        dueDate: new Date(dueDate),
        description: description || 'Taxa condominial',
        status: 'pending',
      });
    }

    const created = await Charge.insertMany(charges);
    res.status(201).json({ message: `${created.length} cobranças criadas`, charges: created });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao criar cobranças em massa', details: error.message });
  }
};

export const getCharges = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const filter: any = {};

    if (req.user!.role === 'admin') {
      filter.condominiumId = req.user!.condominiumId;
    } else {
      filter.condominiumId = req.user!.condominiumId;
      filter.unitId = req.user!.unitId;
    }

    if (req.query.status) filter.status = req.query.status;
    if (req.query.referenceMonth) filter.referenceMonth = req.query.referenceMonth;
    if (req.query.unitId && req.user!.role === 'admin') filter.unitId = req.query.unitId;

    const charges = await Charge.find(filter)
      .populate('unitId', 'block number')
      .populate('residentId', 'name phone email')
      .sort({ dueDate: -1 });

    res.json(charges);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao buscar cobranças', details: error.message });
  }
};

export const getCharge = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const charge = await Charge.findOne({
      _id: req.params.id,
      condominiumId: req.user!.condominiumId,
      ...(req.user!.role === 'resident' ? { unitId: req.user!.unitId } : {}),
    })
      .populate('unitId', 'block number')
      .populate('residentId', 'name phone email');

    if (!charge) {
      res.status(404).json({ error: 'Cobrança não encontrada' });
      return;
    }
    res.json(charge);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao buscar cobrança', details: error.message });
  }
};

export const updateCharge = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { unitId, referenceMonth, amount, dueDate, description, status } = req.body;
    const unit = unitId
      ? await Unit.findOne({ _id: unitId, condominiumId: req.user!.condominiumId })
      : null;

    if (unitId && !unit) {
      res.status(400).json({ error: 'Unidade inválida para este condomínio' });
      return;
    }

    const update: Record<string, unknown> = {};
    if (unit) {
      update.unitId = unit._id;
      const resident = await Resident.findOne({
        condominiumId: req.user!.condominiumId,
        unitId: unit._id,
        isFinancialResponsible: true,
      });
      update.residentId = resident?._id ?? null;
    }
    if (referenceMonth !== undefined) update.referenceMonth = referenceMonth;
    if (amount !== undefined) update.amount = Number(amount);
    if (dueDate !== undefined) update.dueDate = new Date(dueDate);
    if (description !== undefined) update.description = description;
    if (status !== undefined) update.status = status;

    const charge = await Charge.findOneAndUpdate(
      { _id: req.params.id, condominiumId: req.user!.condominiumId },
      update,
      { new: true, runValidators: true }
    );
    if (!charge) {
      res.status(404).json({ error: 'Cobrança não encontrada' });
      return;
    }
    res.json(charge);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao atualizar cobrança', details: error.message });
  }
};

export const markAsPaid = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const charge = await Charge.findOneAndUpdate(
      { _id: req.params.id, condominiumId: req.user!.condominiumId },
      { status: 'paid', paidAt: new Date() },
      { new: true }
    );
    if (!charge) {
      res.status(404).json({ error: 'Cobrança não encontrada' });
      return;
    }
    res.json(charge);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao marcar como pago', details: error.message });
  }
};

export const markAsPending = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const charge = await Charge.findOneAndUpdate(
      { _id: req.params.id, condominiumId: req.user!.condominiumId },
      { status: 'pending', paidAt: null },
      { new: true }
    );
    if (!charge) {
      res.status(404).json({ error: 'Cobrança não encontrada' });
      return;
    }
    res.json(charge);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao marcar como pendente', details: error.message });
  }
};

export const deleteCharge = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const charge = await Charge.findOneAndDelete({
      _id: req.params.id,
      condominiumId: req.user!.condominiumId,
    });
    if (!charge) {
      res.status(404).json({ error: 'Cobrança não encontrada' });
      return;
    }
    res.json({ message: 'Cobrança excluída com sucesso' });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao excluir cobrança', details: error.message });
  }
};
