import { Response } from 'express';
import Issue from '../models/Issue';
import Unit from '../models/Unit';
import { AuthRequest } from '../middlewares/auth';
import { findResidentForUser } from '../utils/residentContext';

export const createIssue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, category, priority } = req.body;
    const condominiumId = req.user!.condominiumId;

    if (!title?.trim() || !description?.trim()) {
      res.status(400).json({ error: 'Título e descrição são obrigatórios' });
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

    const issue = await Issue.create({
      condominiumId,
      unitId: unit._id,
      residentId: resident?._id,
      title: title.trim(),
      description: description.trim(),
      category: category || 'other',
      priority: priority || 'medium',
    });
    res.status(201).json(issue);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao criar ocorrência', details: error.message });
  }
};

export const getIssues = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const filter: any = { condominiumId: req.user!.condominiumId };
    if (req.user!.role === 'resident') filter.unitId = req.user!.unitId;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;

    const issues = await Issue.find(filter)
      .populate('unitId', 'block number')
      .populate('residentId', 'name')
      .sort({ createdAt: -1 });
    res.json(issues);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao buscar ocorrências', details: error.message });
  }
};

export const getIssue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const issue = await Issue.findOne({
      _id: req.params.id,
      condominiumId: req.user!.condominiumId,
      ...(req.user!.role === 'resident' ? { unitId: req.user!.unitId } : {}),
    })
      .populate('unitId', 'block number').populate('residentId', 'name');
    if (!issue) { res.status(404).json({ error: 'Ocorrência não encontrada' }); return; }
    res.json(issue);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao buscar ocorrência', details: error.message });
  }
};

export const updateIssue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const update = {
      ...(req.body.title !== undefined ? { title: req.body.title } : {}),
      ...(req.body.description !== undefined ? { description: req.body.description } : {}),
      ...(req.body.category !== undefined ? { category: req.body.category } : {}),
      ...(req.body.priority !== undefined ? { priority: req.body.priority } : {}),
    };
    const issue = await Issue.findOneAndUpdate(
      { _id: req.params.id, condominiumId: req.user!.condominiumId },
      update, { new: true, runValidators: true }
    );
    if (!issue) { res.status(404).json({ error: 'Ocorrência não encontrada' }); return; }
    res.json(issue);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao atualizar ocorrência', details: error.message });
  }
};

export const updateIssueStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, response } = req.body;
    if (!['open', 'in_progress', 'resolved'].includes(status)) {
      res.status(400).json({ error: 'Status inválido' });
      return;
    }

    const update: any = { status };
    if (response !== undefined) update.response = response;

    const issue = await Issue.findOneAndUpdate(
      { _id: req.params.id, condominiumId: req.user!.condominiumId },
      update, { new: true, runValidators: true }
    );
    if (!issue) { res.status(404).json({ error: 'Ocorrência não encontrada' }); return; }
    res.json(issue);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao atualizar status', details: error.message });
  }
};
