/**
 * Rwanda National Patient Identity & Insurance Verification Provider Layer
 *
 * Designed with a provider adapter pattern:
 * - In Development & Demo mode (default): uses MockNidaProvider & MockInsuranceProvider
 * - In Production: seamlessly switches to NidaHttpProvider & RssbHttpProvider
 *   via environment variables (NIDA_API_URL, NIDA_API_KEY, RSSB_API_URL, RSSB_API_KEY).
 *
 * NOTE: Prominently identifies demo mode to avoid claiming fake data is real government data.
 */

export interface NationalPatientRecord {
  id: string;
  nin: string;
  first_name: string;
  last_name: string;
  full_name: string;
  gender: 'Male' | 'Female';
  dob: string;
  age: number;
  photo_url: string;
  phone: string;
  email?: string;
  address: {
    province: string;
    district: string;
    sector: string;
    cell: string;
    village: string;
  };
  blood_group: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  status: 'ACTIVE' | 'FLAGGED' | 'DECEASED';
  registered_facility_id: string;
  registered_facility_name: string;
  rhie_id: string;
  national_id_verified: boolean;
  verification_source: 'MOCK_NIDA_PROVIDER' | 'NIDA_DIRECT_API';
  registered_at: string;
  emergency_contact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export interface InsuranceVerificationRecord {
  id: string;
  patient_nin: string;
  patient_name: string;
  provider: 'RSSB_RAMA' | 'MUTUELLE_DE_SANTE' | 'MMI' | 'RADIANT' | 'BRITAM' | 'EDEN_CARE' | 'SANLAM' | 'UAP_OLD_MUTUAL';
  provider_display_name: string;
  policy_number: string;
  tier?: 'CATEGORY_1' | 'CATEGORY_2' | 'CATEGORY_3' | 'CATEGORY_4' | 'STANDARD' | 'EXECUTIVE' | 'VIP';
  status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'INVALID';
  coverage_percentage: number;
  copay_amount_rwf: number;
  eligible_services: string[];
  verified_at: string;
  expires_at: string;
  eligibility_notes: string;
  verification_code: string;
  beneficiaries_count?: number;
}

export interface IdentityProvider {
  readonly providerName: string;
  readonly isDemo: boolean;
  verifyNIN(
    nin: string,
    context?: { staffId: string; facilityId: string; reason: string }
  ): Promise<NationalPatientRecord | null>;
}

export interface InsuranceProvider {
  readonly providerName: string;
  readonly isDemo: boolean;
  verifyInsurance(
    nin: string,
    providerType?: string,
    patientName?: string
  ): Promise<InsuranceVerificationRecord | null>;
}

// Clean and normalize NIN string (remove spaces, hyphens)
export function normalizeNIN(raw: string): string {
  return raw.replace(/[^0-9]/g, '');
}

// Format 16-digit Rwandan NIN into standard readable format: 1 1990 8 0012345 1 20
export function formatRwandanNIN(digits: string): string {
  const clean = normalizeNIN(digits);
  if (clean.length !== 16) return digits;
  return `${clean[0]} ${clean.slice(1, 5)} ${clean[5]} ${clean.slice(6, 13)} ${clean[13]} ${clean.slice(14, 16)}`;
}

// Validate Rwandan NIN format: 16 digits, starts with 1 or 2, year 1900-2026, gender digit 7 (female) or 8 (male)
export function isValidRwandanNIN(raw: string): { isValid: boolean; error?: string } {
  const digits = normalizeNIN(raw);
  if (digits.length !== 16) {
    return {
      isValid: false,
      error: `Rwandan National ID must contain exactly 16 digits (got ${digits.length}). Expected format: 1 YYYY G NNNNNNN C CC`,
    };
  }
  const firstDigit = digits[0];
  if (firstDigit !== '1' && firstDigit !== '2') {
    return {
      isValid: false,
      error: 'Rwandan NIN must begin with 1 (Citizen) or 2 (Foreign Resident)',
    };
  }
  const year = parseInt(digits.slice(1, 5), 10);
  const currentYear = new Date().getFullYear();
  if (year < 1920 || year > currentYear) {
    return {
      isValid: false,
      error: `Year of birth in NIN (${year}) is outside valid range (1920 - ${currentYear})`,
    };
  }
  const genderCode = digits[5];
  if (genderCode !== '7' && genderCode !== '8') {
    return {
      isValid: false,
      error: 'Gender code at digit 6 must be 7 (Female) or 8 (Male)',
    };
  }
  return { isValid: true };
}

// ============================================================================
// Mock NIDA Identity Provider
// ============================================================================

export class MockNidaProvider implements IdentityProvider {
  readonly providerName = 'Mock NIDA Identity Adapter (DEMO MODE — NOT CONNECTED TO GOVERNMENT SYSTEMS)';
  readonly isDemo = true;

  private seedRecords: Map<string, NationalPatientRecord> = new Map();

  constructor() {
    this.initSeeds();
  }

  private initSeeds() {
    const defaultSeeds: NationalPatientRecord[] = [
      {
        id: 'nat-pat-001',
        nin: '1 1990 8 0012345 1 20',
        first_name: 'Jean Paul',
        last_name: 'Mugisha',
        full_name: 'Jean Paul Mugisha',
        gender: 'Male',
        dob: '1990-04-12',
        age: 36,
        photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
        phone: '+250 788 512 340',
        email: 'jp.mugisha@gmail.com',
        address: {
          province: 'Kigali City',
          district: 'Gasabo',
          sector: 'Kimironko',
          cell: 'Kibagabaga',
          village: 'Nyarutarama',
        },
        blood_group: 'O+',
        status: 'ACTIVE',
        registered_facility_id: 'fac-chuk',
        registered_facility_name: 'Centre Hospitalier Universitaire de Kigali (CHUK)',
        rhie_id: 'RHIE-KGL-88201',
        national_id_verified: true,
        verification_source: 'MOCK_NIDA_PROVIDER',
        registered_at: '2026-01-15T08:30:00Z',
        emergency_contact: {
          name: 'Claudine Uwase',
          relationship: 'Spouse',
          phone: '+250 788 512 341',
        },
      },
      {
        id: 'nat-pat-002',
        nin: '1 1985 7 0045612 1 15',
        first_name: 'Marie Claire',
        last_name: 'Uwase',
        full_name: 'Marie Claire Uwase',
        gender: 'Female',
        dob: '1985-08-24',
        age: 41,
        photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
        phone: '+250 788 640 192',
        email: 'mc.uwase@yahoo.fr',
        address: {
          province: 'Kigali City',
          district: 'Nyarugenge',
          sector: 'Nyamirambo',
          cell: 'Mumena',
          village: 'Rugarama',
        },
        blood_group: 'A+',
        status: 'ACTIVE',
        registered_facility_id: 'fac-kfh',
        registered_facility_name: 'King Faisal Hospital Rwanda (KFH)',
        rhie_id: 'RHIE-KGL-91044',
        national_id_verified: true,
        verification_source: 'MOCK_NIDA_PROVIDER',
        registered_at: '2026-02-01T09:15:00Z',
        emergency_contact: {
          name: 'Emmanuel Habimana',
          relationship: 'Brother',
          phone: '+250 788 640 193',
        },
      },
      {
        id: 'nat-pat-003',
        nin: '1 1995 8 0078901 1 88',
        first_name: 'Eric',
        last_name: 'Nshimiyimana',
        full_name: 'Eric Nshimiyimana',
        gender: 'Male',
        dob: '1995-11-03',
        age: 31,
        photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
        phone: '+250 783 221 890',
        email: 'eric.nshimiye@gmail.com',
        address: {
          province: 'Northern Province',
          district: 'Musanze',
          sector: 'Muhoza',
          cell: 'Ruhengeri',
          village: 'Kigombe',
        },
        blood_group: 'B+',
        status: 'ACTIVE',
        registered_facility_id: 'fac-ruhengeri',
        registered_facility_name: 'Ruhengeri Referral Hospital',
        rhie_id: 'RHIE-MSZ-40219',
        national_id_verified: true,
        verification_source: 'MOCK_NIDA_PROVIDER',
        registered_at: '2026-02-10T11:40:00Z',
        emergency_contact: {
          name: 'Beatha Mukamana',
          relationship: 'Mother',
          phone: '+250 783 221 891',
        },
      },
      {
        id: 'nat-pat-004',
        nin: '1 1978 7 0033445 1 42',
        first_name: 'Chantal',
        last_name: 'Mukamurenzi',
        full_name: 'Chantal Mukamurenzi',
        gender: 'Female',
        dob: '1978-02-19',
        age: 48,
        photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
        phone: '+250 782 109 443',
        email: 'chantal.muka@gmail.com',
        address: {
          province: 'Southern Province',
          district: 'Huye',
          sector: 'Ngoma',
          cell: 'Matyazo',
          village: 'Sovu',
        },
        blood_group: 'AB-',
        status: 'ACTIVE',
        registered_facility_id: 'fac-chub',
        registered_facility_name: 'Centre Hospitalier Universitaire de Butare (CHUB)',
        rhie_id: 'RHIE-HYE-61902',
        national_id_verified: true,
        verification_source: 'MOCK_NIDA_PROVIDER',
        registered_at: '2026-02-18T14:20:00Z',
        emergency_contact: {
          name: 'Theogene Nkurunziza',
          relationship: 'Spouse',
          phone: '+250 782 109 444',
        },
      },
      {
        id: 'nat-pat-005',
        nin: '1 2002 8 0099112 1 90',
        first_name: 'David',
        last_name: 'Kwizera',
        full_name: 'David Kwizera',
        gender: 'Male',
        dob: '2002-06-15',
        age: 24,
        photo_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
        phone: '+250 785 889 012',
        address: {
          province: 'Eastern Province',
          district: 'Rwamagana',
          sector: 'Kigabiro',
          cell: 'Nyagasambu',
          village: 'Sovu',
        },
        blood_group: 'O-',
        status: 'ACTIVE',
        registered_facility_id: 'fac-rwamagana',
        registered_facility_name: 'Rwamagana Provincial Hospital',
        rhie_id: 'RHIE-RWA-19043',
        national_id_verified: true,
        verification_source: 'MOCK_NIDA_PROVIDER',
        registered_at: '2026-03-01T08:00:00Z',
        emergency_contact: {
          name: 'Vestine Uwera',
          relationship: 'Mother',
          phone: '+250 785 889 013',
        },
      },
    ];

    for (const record of defaultSeeds) {
      this.seedRecords.set(normalizeNIN(record.nin), record);
    }
  }

  async verifyNIN(nin: string): Promise<NationalPatientRecord | null> {
    const clean = normalizeNIN(nin);
    const validation = isValidRwandanNIN(clean);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // 1. Direct match in seeds
    if (this.seedRecords.has(clean)) {
      return this.seedRecords.get(clean)!;
    }

    // 2. Realistic algorithmic generation for ANY valid 16-digit Rwandan NIN
    // This allows testing with custom arbitrary NINs!
    const year = parseInt(clean.slice(1, 5), 10);
    const genderCode = clean[5];
    const gender: 'Male' | 'Female' = genderCode === '8' ? 'Male' : 'Female';
    const age = Math.max(1, new Date().getFullYear() - year);
    const formatted = formatRwandanNIN(clean);

    const firstNamesMale = ['Patrick', 'Fabrice', 'Theogene', 'Claude', 'Innocent', 'Olivier', 'Dieudonné'];
    const firstNamesFemale = ['Ange', 'Esperance', 'Nadine', 'Clarisse', 'Beatrice', 'Soline', 'Sandrine'];
    const lastNames = ['Kamanzi', 'Gakwaya', 'Mukunzi', 'Nkurunziza', 'Kayiranga', 'Mutabazi', 'Rwagasore'];

    const fnList = gender === 'Male' ? firstNamesMale : firstNamesFemale;
    const fnIndex = parseInt(clean.slice(6, 8), 10) % fnList.length;
    const lnIndex = parseInt(clean.slice(8, 10), 10) % lastNames.length;

    const firstName = fnList[fnIndex];
    const lastName = lastNames[lnIndex];

    const generated: NationalPatientRecord = {
      id: `nat-pat-gen-${clean.slice(6, 12)}`,
      nin: formatted,
      first_name: firstName,
      last_name: lastName,
      full_name: `${firstName} ${lastName}`,
      gender,
      dob: `${year}-07-15`,
      age,
      photo_url:
        gender === 'Male'
          ? 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      phone: `+250 788 ${clean.slice(8, 11)} ${clean.slice(11, 14)}`,
      address: {
        province: 'Kigali City',
        district: 'Gasabo',
        sector: 'Kacyiru',
        cell: 'Kamatamu',
        village: 'Kabusunzu',
      },
      blood_group: 'O+',
      status: 'ACTIVE',
      registered_facility_id: 'fac-chuk',
      registered_facility_name: 'Centre Hospitalier Universitaire de Kigali (CHUK)',
      rhie_id: `RHIE-GEN-${clean.slice(10, 15)}`,
      national_id_verified: true,
      verification_source: 'MOCK_NIDA_PROVIDER',
      registered_at: new Date().toISOString(),
      emergency_contact: {
        name: `${firstName} Next of Kin`,
        relationship: 'Family Member',
        phone: `+250 788 ${clean.slice(10, 16)}`,
      },
    };

    return generated;
  }
}

// ============================================================================
// Mock Insurance Provider (RSSB / Mutuelle / MMI / Private)
// ============================================================================

export class MockInsuranceProvider implements InsuranceProvider {
  readonly providerName = 'Mock RSSB / CBHI Insurance Adapter (DEMO MODE — NOT CONNECTED TO GOVERNMENT SYSTEMS)';
  readonly isDemo = true;

  private seedVerifications: Map<string, InsuranceVerificationRecord> = new Map();

  constructor() {
    this.initSeeds();
  }

  private initSeeds() {
    const seeds: InsuranceVerificationRecord[] = [
      {
        id: 'ins-ver-001',
        patient_nin: '1 1990 8 0012345 1 20',
        patient_name: 'Jean Paul Mugisha',
        provider: 'RSSB_RAMA',
        provider_display_name: 'Rwanda Social Security Board (RSSB / RAMA)',
        policy_number: 'RAMA-2026-8849201',
        tier: 'STANDARD',
        status: 'ACTIVE',
        coverage_percentage: 85,
        copay_amount_rwf: 15,
        eligible_services: ['Consultation', 'Laboratory', 'Pharmacy', 'Radiology', 'Surgery', 'Hospitalization'],
        verified_at: new Date().toISOString(),
        expires_at: '2026-12-31T23:59:59Z',
        eligibility_notes: 'Active salaried civil/private employee plan. Covered for all national referral hospitals with 15% patient co-payment.',
        verification_code: 'RSSB-AUTH-99214',
        beneficiaries_count: 4,
      },
      {
        id: 'ins-ver-002',
        patient_nin: '1 1985 7 0045612 1 15',
        patient_name: 'Marie Claire Uwase',
        provider: 'MUTUELLE_DE_SANTE',
        provider_display_name: 'Community-Based Health Insurance (CBHI / Mutuelle de Santé)',
        policy_number: 'CBHI-GAS-2026-440129',
        tier: 'CATEGORY_3',
        status: 'ACTIVE',
        coverage_percentage: 90,
        copay_amount_rwf: 200,
        eligible_services: ['Consultation', 'Maternity', 'Laboratory', 'Essential Pharmacy', 'Inpatient Ward'],
        verified_at: new Date().toISOString(),
        expires_at: '2026-06-30T23:59:59Z',
        eligibility_notes: 'Ubudehe Category 3 active. Primary transfer sheet required for referral hospitals. Ticket modérateur is 200 RWF at health center, 10% copay at hospital.',
        verification_code: 'CBHI-VER-55104',
        beneficiaries_count: 5,
      },
      {
        id: 'ins-ver-003',
        patient_nin: '1 1995 8 0078901 1 88',
        patient_name: 'Eric Nshimiyimana',
        provider: 'MMI',
        provider_display_name: 'Military Medical Insurance (MMI Rwanda)',
        policy_number: 'MMI-RW-883019',
        tier: 'EXECUTIVE',
        status: 'ACTIVE',
        coverage_percentage: 85,
        copay_amount_rwf: 15,
        eligible_services: ['Consultation', 'Emergency Bay', 'Trauma Surgery', 'Radiology CT/MRI', 'Pharmacy', 'Ambulance Evacuation'],
        verified_at: new Date().toISOString(),
        expires_at: '2027-01-31T23:59:59Z',
        eligibility_notes: 'Active defense personnel medical policy. Full coverage at Rwanda Military Hospital and accredited public/private referral centers.',
        verification_code: 'MMI-SEC-77182',
        beneficiaries_count: 3,
      },
      {
        id: 'ins-ver-004',
        patient_nin: '1 1978 7 0033445 1 42',
        patient_name: 'Chantal Mukamurenzi',
        provider: 'RADIANT',
        provider_display_name: 'Radiant Insurance Company (Private Health)',
        policy_number: 'RAD-HLTH-2026-1029',
        tier: 'VIP',
        status: 'ACTIVE',
        coverage_percentage: 90,
        copay_amount_rwf: 10,
        eligible_services: ['Consultation', 'Executive Health Screening', 'Oncology Care', 'Dental', 'Optical', 'International Evacuation'],
        verified_at: new Date().toISOString(),
        expires_at: '2026-11-30T23:59:59Z',
        eligibility_notes: 'Comprehensive VIP Tier with regional EAC and overseas referral coverage approved by Medical Board.',
        verification_code: 'RAD-VIP-88190',
        beneficiaries_count: 2,
      },
    ];

    for (const v of seeds) {
      this.seedVerifications.set(normalizeNIN(v.patient_nin), v);
    }
  }

  async verifyInsurance(
    nin: string,
    requestedProvider?: string,
    patientName?: string
  ): Promise<InsuranceVerificationRecord | null> {
    const clean = normalizeNIN(nin);

    if (this.seedVerifications.has(clean)) {
      const match = { ...this.seedVerifications.get(clean)! };
      if (patientName) match.patient_name = patientName;
      if (requestedProvider) {
        match.provider = requestedProvider as any;
      }
      return match;
    }

    // Algorithmic default insurance based on requested or RSSB RAMA
    const chosenProvider = requestedProvider || 'RSSB_RAMA';
    const isMutuelle = chosenProvider === 'MUTUELLE_DE_SANTE';
    const isMMI = chosenProvider === 'MMI';

    return {
      id: `ins-ver-${clean.slice(8, 14)}`,
      patient_nin: formatRwandanNIN(clean),
      patient_name: patientName || 'Verified Citizen',
      provider: chosenProvider as any,
      provider_display_name: isMutuelle
        ? 'Community-Based Health Insurance (CBHI / Mutuelle de Santé)'
        : isMMI
        ? 'Military Medical Insurance (MMI Rwanda)'
        : 'Rwanda Social Security Board (RSSB / RAMA)',
      policy_number: isMutuelle
        ? `CBHI-RW-2026-${clean.slice(9, 15)}`
        : `RAMA-2026-${clean.slice(9, 15)}`,
      tier: isMutuelle ? 'CATEGORY_3' : 'STANDARD',
      status: 'ACTIVE',
      coverage_percentage: isMutuelle ? 90 : 85,
      copay_amount_rwf: isMutuelle ? 200 : 15,
      eligible_services: ['Consultation', 'Laboratory', 'Pharmacy', 'General Care'],
      verified_at: new Date().toISOString(),
      expires_at: '2026-12-31T23:59:59Z',
      eligibility_notes: 'Active coverage verified in Rwanda Health Insurance gateway. Patient eligible for standard outpatient & inpatient benefits.',
      verification_code: `AUTH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      beneficiaries_count: 3,
    };
  }
}

// ============================================================================
// Production HTTP Providers (Prepared for live NIDA & RSSB REST endpoints)
// ============================================================================

export class NidaHttpProvider implements IdentityProvider {
  readonly providerName = 'Official NIDA Direct REST API';
  readonly isDemo = false;
  private apiUrl: string;
  private apiKey: string;

  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }

  async verifyNIN(
    nin: string,
    context?: { staffId: string; facilityId: string; reason: string }
  ): Promise<NationalPatientRecord | null> {
    const clean = normalizeNIN(nin);
    const response = await fetch(`${this.apiUrl}/citizens/${clean}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'X-Facility-ID': context?.facilityId || 'DEFAULT_FACILITY',
        'X-Staff-ID': context?.staffId || 'STAFF',
        'X-Audit-Reason': context?.reason || 'EMR_CLINICAL_INTAKE',
      },
    });
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`NIDA API returned status ${response.status}: ${await response.text()}`);
    }
    return (await response.json()) as NationalPatientRecord;
  }
}

export class RssbHttpProvider implements InsuranceProvider {
  readonly providerName = 'Official RSSB / RHIE REST API';
  readonly isDemo = false;
  private apiUrl: string;
  private apiKey: string;

  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }

  async verifyInsurance(
    nin: string,
    providerType?: string,
    patientName?: string
  ): Promise<InsuranceVerificationRecord | null> {
    const clean = normalizeNIN(nin);
    const response = await fetch(`${this.apiUrl}/eligibility/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ nin: clean, providerType, patientName }),
    });
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`RSSB API returned status ${response.status}: ${await response.text()}`);
    }
    return (await response.json()) as InsuranceVerificationRecord;
  }
}

// ============================================================================
// Provider Factory
// ============================================================================

export function getIdentityProvider(): IdentityProvider {
  const nidaUrl = process.env.NIDA_API_URL;
  const nidaKey = process.env.NIDA_API_KEY;
  if (nidaUrl && nidaKey) {
    return new NidaHttpProvider(nidaUrl, nidaKey);
  }
  return new MockNidaProvider();
}

export function getInsuranceProvider(): InsuranceProvider {
  const rssbUrl = process.env.RSSB_API_URL;
  const rssbKey = process.env.RSSB_API_KEY;
  if (rssbUrl && rssbKey) {
    return new RssbHttpProvider(rssbUrl, rssbKey);
  }
  return new MockInsuranceProvider();
}
