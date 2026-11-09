/**
 * UBUZIMA HMS demo seed (development only, authorized local DB).
 * Creates RBAC roles/permissions, demo facility, and a bootstrap admin user.
 * Never treat as verified national/government data.
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ROLES = [
  ['SUPER_ADMIN', 'Super Administrator'],
  ['MOH_ADMIN', 'Ministry of Health Administrator'],
  ['HOSPITAL_ADMIN', 'Hospital Administrator'],
  ['HOSPITAL_DIRECTOR', 'Hospital Director'],
  ['DOCTOR', 'Medical Doctor'],
  ['NURSE', 'Nurse'],
  ['PHARMACIST', 'Pharmacist'],
  ['LAB_TECHNICIAN', 'Laboratory Technician'],
  ['RADIOLOGIST', 'Radiologist'],
  ['BLOOD_BANK_OFFICER', 'Blood Bank Officer'],
  ['RECEPTIONIST', 'Receptionist'],
  ['ACCOUNTANT', 'Accountant'],
  ['INSURANCE_OFFICER', 'Insurance Officer'],
  ['AMBULANCE_OPERATOR', 'Ambulance Operator'],
  ['CHW', 'Community Health Worker'],
  ['PATIENT', 'Patient'],
] as const;

const PERMISSIONS = [
  ['*', 'system', 'all', 'Full system access (SUPER_ADMIN only)'],
  ['patients:read', 'patients', 'read', 'View patient registry'],
  ['patients:create', 'patients', 'create', 'Register patients'],
  ['patients:update', 'patients', 'update', 'Update patient records'],
  ['emr:read', 'emr', 'read', 'View EMR'],
  ['emr:write', 'emr', 'write', 'Write consultations/notes'],
  ['appointments:manage', 'appointments', 'manage', 'Manage appointments'],
  ['admissions:manage', 'admissions', 'manage', 'Manage admissions/beds'],
  ['pharmacy:manage', 'pharmacy', 'manage', 'Manage pharmacy/dispensing'],
  ['lab:manage', 'lab', 'manage', 'Manage lab orders/results'],
  ['radiology:manage', 'radiology', 'manage', 'Manage imaging orders/reports'],
  ['billing:manage', 'billing', 'manage', 'Manage invoices/payments'],
  ['insurance:manage', 'insurance', 'manage', 'Manage insurance claims'],
  ['reports:read', 'reports', 'read', 'View reports/analytics'],
  ['admin:manage', 'admin', 'manage', 'Manage users/facilities/settings'],
  ['audit:read', 'audit', 'read', 'View audit logs'],
] as const;

const ROLE_PERMS: Record<string, string[]> = {
  SUPER_ADMIN: ['*'],
  MOH_ADMIN: ['reports:read', 'audit:read', 'patients:read'],
  HOSPITAL_ADMIN: ['patients:read', 'patients:create', 'patients:update', 'appointments:manage', 'admissions:manage', 'reports:read', 'admin:manage', 'audit:read', 'billing:manage'],
  HOSPITAL_DIRECTOR: ['patients:read', 'reports:read', 'audit:read', 'admin:manage'],
  DOCTOR: ['patients:read', 'patients:create', 'patients:update', 'emr:read', 'emr:write', 'appointments:manage', 'lab:manage', 'radiology:manage'],
  NURSE: ['patients:read', 'patients:update', 'emr:read', 'emr:write', 'appointments:manage', 'admissions:manage'],
  PHARMACIST: ['patients:read', 'pharmacy:manage'],
  LAB_TECHNICIAN: ['patients:read', 'lab:manage'],
  RADIOLOGIST: ['patients:read', 'radiology:manage'],
  BLOOD_BANK_OFFICER: ['patients:read'],
  RECEPTIONIST: ['patients:read', 'patients:create', 'appointments:manage'],
  ACCOUNTANT: ['patients:read', 'billing:manage', 'reports:read'],
  INSURANCE_OFFICER: ['patients:read', 'insurance:manage', 'billing:manage'],
  AMBULANCE_OPERATOR: ['patients:read'],
  CHW: ['patients:read', 'patients:create', 'emr:read'],
  PATIENT: ['patients:read'],
};

async function main() {
  for (const [code, name] of ROLES) await prisma.role.upsert({ where: { code }, update: { name }, create: { code, name, isSystem: true } });
  for (const [code, module, action, description] of PERMISSIONS) await prisma.permission.upsert({ where: { code }, update: { module, action, description }, create: { code, module, action, description } });

  for (const [roleCode, permCodes] of Object.entries(ROLE_PERMS)) {
    const role = await prisma.role.findUnique({ where: { code: roleCode } });
    if (!role) continue;
    for (const code of permCodes) {
      const perm = await prisma.permission.findUnique({ where: { code } });
      if (perm) await prisma.rolePermission.upsert({ where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } }, update: {}, create: { roleId: role.id, permissionId: perm.id } });
    }
  }

  const facility = await prisma.facility.upsert({
    where: { code: 'DEMO-FAC-001' },
    update: { name: 'UBUZIMA Demo District Hospital' },
    create: { code: 'DEMO-FAC-001', name: 'UBUZIMA Demo District Hospital', type: 'DISTRICT_HOSPITAL', province: 'Kigali City', district: 'Gasabo', isActive: true },
  });

  const email = (process.env.BOOTSTRAP_ADMIN_EMAIL || 'admin@ubuzima.demo').toLowerCase();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD || 'ChangeMe!Ubuzima2026';
  const role = await prisma.role.findUnique({ where: { code: 'SUPER_ADMIN' } });
  if (role) {
    await prisma.user.upsert({
      where: { email },
      update: { fullName: 'UBUZIMA Bootstrap Admin', roleId: role.id, facilityId: facility.id, status: 'ACTIVE' },
      create: { email, fullName: 'UBUZIMA Bootstrap Admin', roleId: role.id, facilityId: facility.id, status: 'ACTIVE', authProvider: 'LOCAL', passwordHash: await bcrypt.hash(password, 12) },
    });
    console.log(`Bootstrap admin ensured: ${email} (development only; set BOOTSTRAP_ADMIN_* env vars)`);
  }
  console.log('UBUZIMA HMS seed complete (development only).');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => prisma.$disconnect());
