import { Response } from 'express';
import Reservation from '../models/Reservation';
import Unit from '../models/Unit';
import { AuthRequest } from '../middlewares/auth';
import { findResidentForUser } from '../utils/residentContext';

export const createReservation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { area, date, startTime, endTime, notes } = req.body;
    const condominiumId = req.user!.condominiumId;
    const reservationDate = new Date(date);

    if (!area?.trim() || !date || !startTime || !endTime) {
      res.status(400).json({ error: 'Área, data e horários são obrigatórios' });
      return;
    }

    if (Number.isNaN(reservationDate.getTime()) || startTime >= endTime) {
      res.status(400).json({ error: 'Data ou intervalo de horário inválido' });
      return;
    }

    const unitId = req.user!.role === 'resident' ? req.user!.unitId : req.body.unitId;
    const unit = await Unit.findOne({ _id: unitId, condominiumId });
    if (!unit) {
      res.status(400).json({ error: 'Unidade inválida para este condomínio' });
      return;
    }

    const resident = await findResidentForUser(req.user!);
    if (req.user!.role === 'resident' && !resident) {
      res.status(409).json({ error: 'Conta de morador sem cadastro vinculado' });
      return;
    }

    // Check for conflicting approved reservations
    const conflict = await Reservation.findOne({
      condominiumId, area: area.trim(), date: reservationDate, status: 'approved',
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
      ],
    });

    if (conflict) {
      res.status(409).json({ error: 'Já existe uma reserva aprovada para este horário e área' });
      return;
    }

    const reservation = await Reservation.create({
      condominiumId,
      unitId: unit._id,
      residentId: resident?._id,
      area: area.trim(),
      date: reservationDate,
      startTime,
      endTime,
      notes: notes || '',
    });
    res.status(201).json(reservation);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao criar reserva', details: error.message });
  }
};

export const getReservations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const filter: any = { condominiumId: req.user!.condominiumId };
    if (req.user!.role === 'resident') filter.unitId = req.user!.unitId;
    if (req.query.status) filter.status = req.query.status;

    const reservations = await Reservation.find(filter)
      .populate('unitId', 'block number')
      .populate('residentId', 'name')
      .sort({ date: -1 });
    res.json(reservations);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao buscar reservas', details: error.message });
  }
};

export const getReservation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reservation = await Reservation.findOne({
      _id: req.params.id, condominiumId: req.user!.condominiumId,
      ...(req.user!.role === 'resident' ? { unitId: req.user!.unitId } : {}),
    }).populate('unitId', 'block number').populate('residentId', 'name');
    if (!reservation) { res.status(404).json({ error: 'Reserva não encontrada' }); return; }
    res.json(reservation);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao buscar reserva', details: error.message });
  }
};

export const approveReservation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (
      !reservation ||
      !req.user!.condominiumId ||
      reservation.condominiumId.toString() !== req.user!.condominiumId.toString()
    ) {
      res.status(404).json({ error: 'Reserva não encontrada' }); return;
    }

    // Re-check for conflicts before approving
    const conflict = await Reservation.findOne({
      condominiumId: reservation.condominiumId, area: reservation.area,
      date: reservation.date, status: 'approved', _id: { $ne: reservation._id },
      $or: [{ startTime: { $lt: reservation.endTime }, endTime: { $gt: reservation.startTime } }],
    });

    if (conflict) {
      res.status(409).json({ error: 'Conflito de horário com outra reserva aprovada' }); return;
    }

    reservation.status = 'approved';
    await reservation.save();
    res.json(reservation);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao aprovar reserva', details: error.message });
  }
};

export const rejectReservation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const r = await Reservation.findOneAndUpdate(
      { _id: req.params.id, condominiumId: req.user!.condominiumId },
      { status: 'rejected' }, { new: true }
    );
    if (!r) { res.status(404).json({ error: 'Reserva não encontrada' }); return; }
    res.json(r);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao recusar reserva', details: error.message });
  }
};

export const cancelReservation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const r = await Reservation.findOneAndUpdate(
      {
        _id: req.params.id,
        condominiumId: req.user!.condominiumId,
        ...(req.user!.role === 'resident' ? { unitId: req.user!.unitId } : {}),
      },
      { status: 'cancelled' }, { new: true, runValidators: true }
    );
    if (!r) { res.status(404).json({ error: 'Reserva não encontrada' }); return; }
    res.json(r);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao cancelar reserva', details: error.message });
  }
};
