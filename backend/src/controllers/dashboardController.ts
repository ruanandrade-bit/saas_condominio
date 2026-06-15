import { Response } from 'express';
import Charge from '../models/Charge';
import Unit from '../models/Unit';
import Issue from '../models/Issue';
import Reservation from '../models/Reservation';
import Announcement from '../models/Announcement';
import { AuthRequest } from '../middlewares/auth';

export const getAdminDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const condominiumId = req.user!.condominiumId;
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const [
      totalUnits, paidCharges, pendingCharges, lateCharges,
      openIssues, pendingReservations, lateChargesList,
      recentAnnouncements, recentIssues, upcomingReservations,
    ] = await Promise.all([
      Unit.countDocuments({ condominiumId }),
      Charge.aggregate([
        { $match: { condominiumId, status: 'paid', referenceMonth: currentMonth } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Charge.aggregate([
        { $match: { condominiumId, status: 'pending' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Charge.aggregate([
        { $match: { condominiumId, status: 'late' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Issue.countDocuments({ condominiumId, status: 'open' }),
      Reservation.countDocuments({ condominiumId, status: 'pending' }),
      Charge.find({ condominiumId, status: 'late' })
        .populate('unitId', 'block number').populate('residentId', 'name phone')
        .sort({ dueDate: 1 }).limit(10),
      Announcement.find({ condominiumId }).sort({ createdAt: -1 }).limit(5),
      Issue.find({ condominiumId, status: { $in: ['open', 'in_progress'] } })
        .populate('unitId', 'block number').sort({ createdAt: -1 }).limit(5),
      Reservation.find({ condominiumId, status: 'pending', date: { $gte: now } })
        .populate('unitId', 'block number').sort({ date: 1 }).limit(5),
    ]);

    res.json({
      stats: {
        receivedThisMonth: paidCharges[0]?.total || 0,
        toReceive: pendingCharges[0]?.total || 0,
        late: lateCharges[0]?.total || 0,
        totalUnits,
        openIssues,
        pendingReservations,
      },
      lateCharges: lateChargesList,
      recentAnnouncements,
      recentIssues,
      upcomingReservations,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao carregar dashboard', details: error.message });
  }
};

export const getResidentDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const condominiumId = req.user!.condominiumId;
    const unitId = req.user!.unitId;

    const [pendingCharges, recentAnnouncements, openIssues, upcomingReservations] = await Promise.all([
      Charge.find({ condominiumId, unitId, status: { $in: ['pending', 'late'] } }).sort({ dueDate: 1 }).limit(5),
      Announcement.find({ condominiumId }).sort({ isPinned: -1, createdAt: -1 }).limit(5),
      Issue.find({ condominiumId, unitId, status: { $in: ['open', 'in_progress'] } }).sort({ createdAt: -1 }).limit(5),
      Reservation.find({ condominiumId, unitId, date: { $gte: new Date() } }).sort({ date: 1 }).limit(5),
    ]);

    res.json({
      stats: {
        pendingCharges: pendingCharges.length,
        recentAnnouncements: recentAnnouncements.length,
        openIssues: openIssues.length,
        upcomingReservations: upcomingReservations.length,
      },
      pendingCharges,
      recentAnnouncements,
      openIssues,
      upcomingReservations,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao carregar dashboard', details: error.message });
  }
};
