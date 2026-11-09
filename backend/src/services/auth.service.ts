import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env, assertJwtConfigured } from '../config/env.js';
import { getPrisma } from './db.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  facilityCode: z.string().optional(),
});

const registerSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  phone: z.string().trim().max(32).optional(),
  role: z.enum([
    'SUPER_ADMIN', 'MOH_ADMIN', 'HOSPITAL_ADMIN', 'HOSPITAL_DIRECTOR',
    'DOCTOR', 'NURSE', 'PHARMACIST', 'LAB_TECHNICIAN', 'RADIOLOGIST',
    'BLOOD_BANK_OFFICER', 'RECEPTIONIST', 'ACCOUNTANT', 'INSURANCE_OFFICER',
    'AMBULANCE_OPERATOR', 'CHW', 'PATIENT',
  ]).default('PATIENT'),
  facilityCode: z.string().trim().max(64).optional(),
});

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  permissions: string[];
  facilityId?: string | null;
};

function signAccess(user: AuthUser) {
  assertJwtConfigured();
  return jwt.sign({ sub: user.id, role: user.role, facilityId: user.facilityId, permissions: user.permissions, type: 'access' }, env.jwtAccessSecret, { expiresIn: env.jwtAccessTtl } as jwt.SignOptions);
}

function signRefresh(userId: string) {
  assertJwtConfigured();
  return jwt.sign({ sub: userId, type: 'refresh' }, env.jwtRefreshSecret, { expiresIn: env.jwtRefreshTtl } as jwt.SignOptions);
}

async function buildAuthResponse(user: { id: string; email: string; fullName: string; facilityId?: string | null; role: { code: string; permissions: { permission: { code: string } }[] } }) {
  const permissions = user.role.permissions.map((rp) => rp.permission.code);
  const authUser: AuthUser = { id: user.id, email: user.email, fullName: user.fullName, role: user.role.code, permissions, facilityId: user.facilityId };
  const refreshToken = signRefresh(user.id);
  const prisma = getPrisma();
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date(), refreshTokenHash: await bcrypt.hash(refreshToken, 10) } });
  return { accessToken: signAccess(authUser), refreshToken, user: authUser };
}

export async function login(body: unknown) {
  const input = loginSchema.parse(body);
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
    include: { role: { include: { permissions: { include: { permission: true } } } } },
  });
  if (!user || user.status !== 'ACTIVE' || !user.passwordHash) {
    throw Object.assign(new Error('Invalid credentials or inactive account.'), { status: 401 });
  }
  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) throw Object.assign(new Error('Invalid credentials or inactive account.'), { status: 401 });
  return buildAuthResponse(user);
}

export async function register(body: unknown) {
  const input = registerSchema.parse(body);
  const prisma = getPrisma();
  const email = input.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw Object.assign(new Error('An account with this email already exists.'), { status: 409 });

  const role = await prisma.role.findUnique({ where: { code: input.role }, include: { permissions: { include: { permission: true } } } });
  if (!role) throw Object.assign(new Error('Selected role is not available. Run UBUZIMA RBAC seed first.'), { status: 400 });

  const facility = input.facilityCode
    ? await prisma.facility.findUnique({ where: { code: input.facilityCode } })
    : await prisma.facility.findFirst({ where: { isActive: true }, orderBy: { createdAt: 'asc' } });

  const created = await prisma.user.create({
    data: {
      email,
      fullName: input.fullName,
      phone: input.phone || null,
      passwordHash: await bcrypt.hash(input.password, 12),
      authProvider: 'LOCAL',
      status: 'ACTIVE',
      roleId: role.id,
      facilityId: facility?.id || null,
    },
    include: { role: { include: { permissions: { include: { permission: true } } } } },
  });

  return buildAuthResponse(created);
}

export async function refresh(refreshToken: string) {
  assertJwtConfigured();
  const payload = jwt.verify(refreshToken, env.jwtRefreshSecret) as { sub: string; type: string };
  if (payload.type !== 'refresh') throw Object.assign(new Error('Invalid refresh token.'), { status: 401 });
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({ where: { id: payload.sub }, include: { role: { include: { permissions: { include: { permission: true } } } } } });
  if (!user || !user.refreshTokenHash || !(await bcrypt.compare(refreshToken, user.refreshTokenHash))) {
    throw Object.assign(new Error('Refresh token is invalid or revoked.'), { status: 401 });
  }
  return buildAuthResponse(user);
}

export function verifyAccessToken(token: string): AuthUser & { sub: string } {
  assertJwtConfigured();
  return jwt.verify(token, env.jwtAccessSecret) as any;
}
