import mongoose, { Document, Schema } from 'mongoose';

export interface ICharge extends Document {
  condominiumId: mongoose.Types.ObjectId;
  unitId: mongoose.Types.ObjectId;
  residentId?: mongoose.Types.ObjectId;
  referenceMonth: string;
  amount: number;
  dueDate: Date;
  description: string;
  status: 'pending' | 'paid' | 'late';
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ChargeSchema = new Schema<ICharge>(
  {
    condominiumId: { type: Schema.Types.ObjectId, ref: 'Condominium', required: true },
    unitId: { type: Schema.Types.ObjectId, ref: 'Unit', required: true },
    residentId: { type: Schema.Types.ObjectId, ref: 'Resident' },
    referenceMonth: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: true },
    description: { type: String, default: 'Taxa condominial' },
    status: { type: String, enum: ['pending', 'paid', 'late'], default: 'pending' },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

ChargeSchema.index({ condominiumId: 1 });
ChargeSchema.index({ unitId: 1 });
ChargeSchema.index({ status: 1 });
ChargeSchema.index({ condominiumId: 1, referenceMonth: 1 });

export default mongoose.model<ICharge>('Charge', ChargeSchema);
