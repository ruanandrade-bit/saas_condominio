import { Response } from 'express';
import Unit from '../models/Unit';
import Resident from '../models/Resident';
import Charge from '../models/Charge';
import Issue from '../models/Issue';
import Reservation from '../models/Reservation';
import { AuthRequest } from '../middlewares/auth';

export const createUnit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user!.condominiumId) {
      res.status(409).json({ error: 'Usuário sem condomínio vinculado' });
      return;
    }

    if (!req.body.number?.trim()) {
      res.status(400).json({ error: 'Número da unidade é obrigatório' });
      return;
    }

    const unit = await Unit.create({
      block: req.body.block || '',
      number: req.body.number.trim(),
      status: req.body.status || 'empty',
      notes: req.body.notes || '',
      condominiumId: req.user!.condominiumId,
    });
    res.status(201).json(unit);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao criar unidade', details: error.message });
  }
};

export const getUnits = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const units = await Unit.find({ condominiumId: req.user!.condominiumId }).sort({ block: 1, number: 1 });
    res.json(units);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao buscar unidades', details: error.message });
  }
};

export const getUnit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const requestedUnitId = req.user!.role === 'resident'
      ? req.user!.unitId
      : req.params.id;
    const unit = await Unit.findOne({
      _id: requestedUnitId,
      condominiumId: req.user!.condominiumId,
    });
    if (!unit) {
      res.status(404).json({ error: 'Unidade não encontrada' });
      return;
    }
    res.json(unit);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao buscar unidade', details: error.message });
  }
};

export const updateUnit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.body.number?.trim()) {
      res.status(400).json({ error: 'Número da unidade é obrigatório' });
      return;
    }

    const unit = await Unit.findOneAndUpdate(
      { _id: req.params.id, condominiumId: req.user!.condominiumId },
      {
        block: req.body.block || '',
        number: req.body.number.trim(),
        status: req.body.status || 'empty',
        notes: req.body.notes || '',
      },
      { new: true, runValidators: true }
    );
    if (!unit) {
      res.status(404).json({ error: 'Unidade não encontrada' });
      return;
    }
    res.json(unit);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao atualizar unidade', details: error.message });
  }
};

export const deleteUnit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const filter = {
      _id: req.params.id,
      condominiumId: req.user!.condominiumId,
    };
    const unit = await Unit.findOne(filter);
    if (!unit) {
      res.status(404).json({ error: 'Unidade não encontrada' });
      return;
    }

    const [hasResidents, hasCharges, hasIssues, hasReservations] = await Promise.all([
      Resident.exists({ condominiumId: req.user!.condominiumId, unitId: unit._id }),
      Charge.exists({ condominiumId: req.user!.condominiumId, unitId: unit._id }),
      Issue.exists({ condominiumId: req.user!.condominiumId, unitId: unit._id }),
      Reservation.exists({ condominiumId: req.user!.condominiumId, unitId: unit._id }),
    ]);

    if (hasResidents || hasCharges || hasIssues || hasReservations) {
      res.status(409).json({ error: 'Unidade possui registros vinculados e não pode ser excluída' });
      return;
    }

    await Unit.deleteOne(filter);
    res.json({ message: 'Unidade excluída com sucesso' });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao excluir unidade', details: error.message });
  }
};
