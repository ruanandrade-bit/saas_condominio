import { Response } from 'express';
import Announcement from '../models/Announcement';
import { AuthRequest } from '../middlewares/auth';

export const createAnnouncement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, message, category, isPinned } = req.body;
    if (!title?.trim() || !message?.trim()) {
      res.status(400).json({ error: 'Título e mensagem são obrigatórios' });
      return;
    }

    const announcement = await Announcement.create({
      title: title.trim(),
      message: message.trim(),
      category: category || 'general',
      isPinned: Boolean(isPinned),
      condominiumId: req.user!.condominiumId,
      createdBy: req.user!._id,
    });
    res.status(201).json(announcement);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao criar comunicado', details: error.message });
  }
};

export const getAnnouncements = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const announcements = await Announcement.find({ condominiumId: req.user!.condominiumId })
      .populate('createdBy', 'name')
      .sort({ isPinned: -1, createdAt: -1 });
    res.json(announcements);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao buscar comunicados', details: error.message });
  }
};

export const getAnnouncement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const announcement = await Announcement.findOne({
      _id: req.params.id,
      condominiumId: req.user!.condominiumId,
    }).populate('createdBy', 'name');
    if (!announcement) { res.status(404).json({ error: 'Comunicado não encontrado' }); return; }
    res.json(announcement);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao buscar comunicado', details: error.message });
  }
};

export const updateAnnouncement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, message, category, isPinned } = req.body;
    if (!title?.trim() || !message?.trim()) {
      res.status(400).json({ error: 'Título e mensagem são obrigatórios' });
      return;
    }

    const announcement = await Announcement.findOneAndUpdate(
      { _id: req.params.id, condominiumId: req.user!.condominiumId },
      {
        title: title.trim(),
        message: message.trim(),
        category: category || 'general',
        isPinned: Boolean(isPinned),
      },
      { new: true, runValidators: true }
    );
    if (!announcement) { res.status(404).json({ error: 'Comunicado não encontrado' }); return; }
    res.json(announcement);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao atualizar comunicado', details: error.message });
  }
};

export const deleteAnnouncement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const a = await Announcement.findOneAndDelete({ _id: req.params.id, condominiumId: req.user!.condominiumId });
    if (!a) { res.status(404).json({ error: 'Comunicado não encontrado' }); return; }
    res.json({ message: 'Comunicado excluído com sucesso' });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao excluir comunicado', details: error.message });
  }
};
