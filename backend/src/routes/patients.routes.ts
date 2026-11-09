import { Router } from 'express';
import { z } from 'zod';
import crypto from 'node:crypto';
import { requireAuth, requirePermission, type AuthRequest } from '../middleware/auth.js';
import { getPrisma } from '../services/db.js';
import { isDbConfigured } from '../config/env.js';

export const patientRouter = Router();
patientRouter.use(requireAuth);

const createPatientSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'UNKNOWN']).default('UNKNOWN'),
  dateOfBirth: z.string().optional(),
  phone: z.string().optional(),
  district: z.string().optional(),
  sector: z.string().optional(),
  facilityId: z.string().optional(),
  nationalId: z.string().optional(),
  consentEmrAccess: z.boolean().default(false),
});

function hashIdentifier(value: string) {
  return crypto.createHash('sha256').update(value.trim()).digest('hex');
}
function maskIdentifier(value: string) {
  const v = value.replace(/\s+/g, '');
  return v.length <= 4 ? '****' : `${v.slice(0, 2)}****${v.slice(-2)}`;
}

patientRouter.get('/', requirePermission('patients:read'), async (req: AuthRequest, res, next) => {
  try {
    if (!isDbConfigured()) return res.status(503).json({ error: 'DB_NOT_CONFIGURED' });
    const prisma = getPrisma();
    const q = String(req.query.q || '').trim();
    const where = q ? { OR: [{ fullName: { contains: q, mode: 'insensitive' as const } }, { mrn: { contains: q, mode: 'insensitive' as const } }, { phone: { contains: q } }] } : {};
    const patients = await prisma.patient.findMany({ where, take: 25, orderBy: { createdAt: 'desc' }, select: { id: true, mrn: true, fullName: true, gender: true, dateOfBirth: true, phone: true, district: true, status: true, createdAt: true } });
    res.json({ data: patients, mode: 'postgres' });
  } catch (e) { next(e); }
});

patientRouter.post('/', requirePermission('patients:create'), async (req: AuthRequest, res, next) => {
  try {
    if (!isDbConfigured()) return res.status(503).json({ error: 'DB_NOT_CONFIGURED' });
    const input = createPatientSchema.parse(req.body);
    const prisma = getPrisma();
    const fullName = `${input.firstName} ${input.lastName}`.trim();
    const mrn = `MRN-${Date.now().toString().slice(-8)}`;
    const patient = await prisma.patient.create({
      data: {
        mrn, firstName: input.firstName, lastName: input.lastName, fullName,
        gender: input.gender, dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
        phone: input.phone, district: input.district, sector: input.sector,
        registeredFacilityId: input.facilityId || req.user?.facilityId || undefined,
        consents: { create: [{ type: 'EMR_ACCESS', granted: input.consentEmrAccess, recordedBy: req.user?.id, purpose: 'Patient registration' }] },
        identifiers: input.nationalId ? { create: [{ type: 'NATIONAL_ID', valueHash: hashIdentifier(input.nationalId), valueMasked: maskIdentifier(input.nationalId), verificationSource: 'MANUAL_ENTRY_UNVERIFIED', isPrimary: true }] } : undefined,
      },
    });
    await prisma.auditLog.create({ data: { actorUserId: req.user?.id, facilityId: req.user?.facilityId || undefined, action: 'PATIENT_CREATED', targetType: 'Patient', targetId: patient.id, details: JSON.stringify({ mrn: patient.mrn, source: 'ubuzima-v1' }) } });
    res.status(201).json({ data: { id: patient.id, mrn: patient.mrn, fullName: patient.fullName }, mode: 'postgres' });
  } catch (e) { next(e); }
});
