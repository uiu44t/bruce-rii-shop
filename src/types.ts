export type PatientStatus = 'inpatient' | 'outpatient' | 'emergency' | 'discharged';

export type UserRole =
  | 'super_admin'
  | 'doctor'
  | 'nurse'
  | 'pharmacist'
  | 'laboratory'
  | 'radiology'
  | 'reception'
  | 'accountant'
  | 'patient';

export interface NextOfKin {
  name: string;
  relationship: 'Spouse' | 'Parent' | 'Child' | 'Sibling' | 'Guardian' | 'Other';
  phone: string;
  email?: string;
  isAuthorizedPerson: boolean;
  emergencyContact: boolean;
  address?: string;
}

export interface Vitals {
  bp: string;           // e.g. "128/82"
  hr: number;           // bpm e.g. 74
  temp: number;         // °F e.g. 98.6
  spo2: number;         // % e.g. 98
  rr: number;           // breaths/min e.g. 16
  weight?: number;      // kg e.g. 72
  height?: number;      // cm e.g. 175
  lastRecorded: string; // ISO date or time
}

export interface SOAPNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface ClinicalNote {
  id: string;
  date: string;
  doctorId: string;
  doctorName: string;
  doctorRole: string;
  title: string;
  soap: SOAPNote;
  type: 'admission' | 'progress' | 'rounds' | 'consultation' | 'discharge';
}

export interface LabResultItem {
  metric: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'high' | 'low' | 'critical';
}

export interface LabReport {
  id: string;
  testName: string;
  category: 'Hematology' | 'Biochemistry' | 'Radiology / Imaging' | 'Cardiology' | 'Microbiology' | 'Pathology';
  date: string;
  doctorName: string;
  status: 'pending' | 'completed' | 'critical';
  results: LabResultItem[];
  conclusion?: string;
}

export type SampleStatus = 'Ordered' | 'Sample Collected' | 'Processing' | 'Completed' | 'Approved';

export interface LabOrder {
  id: string;
  orderNumber: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  doctorName: string;
  testName: string;
  category: 'Hematology' | 'Biochemistry' | 'Microbiology' | 'Cardiology' | 'Pathology';
  sampleType: 'Whole Blood' | 'Serum / Plasma' | 'Urine' | 'Sputum' | 'Swab' | 'CSF';
  orderedDate: string;
  sampleCollectedDate?: string;
  completedDate?: string;
  sampleStatus: SampleStatus;
  results: LabResultItem[];
  isCritical: boolean;
  referenceRanges?: string;
  doctorApproval?: {
    approvedBy: string;
    approvedAt: string;
    notes?: string;
  };
  notes?: string;
  branchId: string;
}

export type ImagingModality = 'X-Ray' | 'CT Scan' | 'MRI' | 'Ultrasound';

export interface RadiologyOrder {
  id: string;
  orderNumber: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  doctorName: string;
  modality: ImagingModality;
  bodyPart: string;
  urgency: 'Routine' | 'Urgent' | 'Emergency STAT';
  requestedDate: string;
  completedDate?: string;
  status: 'Requested' | 'Scheduled' | 'Completed' | 'Reported';
  radiologistName?: string;
  findings?: string;
  impression?: string;
  imageUrl?: string;
  recommendations?: string;
  branchId: string;
}

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface BloodInventoryItem {
  bloodGroup: BloodGroup;
  unitsAvailable: number;
  reservedUnits: number;
  unitsReserved?: number;
  minThreshold: number;
  minAlertLevel?: number;
  expiryEarliest: string;
}

export interface BloodDonation {
  id: string;
  donorName: string;
  donorPhone: string;
  donorAge: number;
  bloodGroup: BloodGroup;
  units: number;
  volumeMl?: number;
  donationDate: string;
  expiryDate: string;
  hemoglobin: number; // g/dL
  hemoglobinLevel?: number;
  screeningStatus?: 'Passed' | 'Failed' | 'Pending';
  status: 'available' | 'issued' | 'expired';
  branchId: string;
}

export type BloodDonationRecord = BloodDonation;

export interface BloodIssueRecord {
  id: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  bloodGroup: BloodGroup;
  units: number;
  doctorName: string;
  indication: string;
  urgency: 'routine' | 'emergency';
  compatibilityVerified: boolean;
  crossmatchStatus: 'Compatible' | 'Incompatible' | 'Pending Crossmatch';
  issuedAt: string;
  branchId: string;
}

export type AmbulanceStatus = 'Available' | 'Dispatched' | 'In-Transit' | 'Maintenance';

export interface Ambulance {
  id: string;
  vehicleNumber: string;
  plateNumber?: string;
  model: string;
  type: 'Advanced Life Support (ALS)' | 'Basic Life Support (BLS)' | 'Neonatal Emergency Transport';
  driverName: string;
  driverPhone: string;
  paramedicName: string;
  currentStatus: AmbulanceStatus;
  status?: AmbulanceStatus;
  currentLocation: string;
  equipment: string[];
  currentTrip?: AmbulanceDispatch;
  branchId: string;
}

export interface AmbulanceDispatch {
  id: string;
  ambulanceId: string;
  vehicleNumber: string;
  patientName: string;
  callerPhone: string;
  pickupLocation: string;
  destinationHospital: string;
  urgency: 'Critical' | 'Urgent' | 'Standard';
  dispatchedAt: string;
  estimatedArrivalMinutes: number;
  status: 'dispatched' | 'en_route' | 'patient_picked_up' | 'arrived' | 'completed';
  notes?: string;
  branchId: string;
}

export interface InsuranceProvider {
  id: string;
  name: string;
  code: string;
  type: 'National Health (RSSB/RAMA)' | 'Community Scheme (Mutuelle)' | 'Private Commercial' | 'International';
  contactPhone: string;
  standardCoveragePercent: number;
}

export interface InsuranceClaim {
  id: string;
  claimNumber: string;
  invoiceId: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  insuranceProvider: string;
  policyNumber: string;
  totalAmount: number;
  coveragePercent: number;
  claimedAmount: number;
  patientPayableAmount: number;
  status: 'Pending' | 'Under Review' | 'Approved' | 'Rejected';
  submissionDate: string;
  adjudicatedDate?: string;
  approvalCode?: string;
  rejectionReason?: string;
  branchId: string;
}

export interface SystemNotification {
  id: string;
  recipientId?: string;
  recipientName?: string;
  recipientType: 'patient' | 'staff' | 'all';
  recipientContact?: string; // phone or email
  title: string;
  message: string;
  type: 'appointment' | 'medication' | 'lab' | 'stock' | 'bed' | 'emergency' | 'payment' | 'billing' | 'general';
  channel: 'in_app' | 'sms' | 'email';
  sentAt: string;
  isRead: boolean;
  status: 'delivered' | 'pending' | 'failed';
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  targetType: 'Patient' | 'Prescription' | 'Lab' | 'Radiology' | 'Bed' | 'Billing' | 'Ambulance' | 'BloodBank' | 'System' | 'Insurance' | 'Appointment' | 'Payment' | 'Clinical' | 'Inventory';
  targetId?: string;
  targetName?: string;
  details: string;
  timestamp: string;
  branchId: string;
}

export interface HospitalBranch {
  id: string;
  name: string;
  code: string;
  city: string;
  district?: string;
  address: string;
  phone: string;
  emergencyContact?: string;
  director?: string;
  isMainBranch: boolean;
  totalBeds: number;
  activeDoctorsCount: number;
  activeStaffCount?: number;
}

export interface Prescription {
  id: string;
  medicineName: string;
  dosage: string;
  frequency: string; // e.g. "BID (Twice daily)"
  route: string;     // e.g. "Oral", "IV", "Subcutaneous"
  duration: string;  // e.g. "7 days"
  prescribedBy: string;
  datePrescribed: string;
  status: 'active' | 'completed' | 'discontinued';
  dispensed: boolean;
  notes?: string;
}

export interface Patient {
  id: string;
  mrn: string; // Medical Record Number e.g. "MRN-92041"
  nin?: string; // 16-digit Rwandan National ID Number e.g. "1 1990 8 0012345 1 20"
  nationalVerified?: boolean;
  rhieId?: string;
  photoUrl?: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  phone: string;
  email?: string;
  bloodGroup: BloodGroup;
  allergies: string[];
  nextOfKin?: NextOfKin;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  insurance: {
    provider: string;
    policyNumber: string;
    coveragePercent: number;
  };
  status: PatientStatus;
  admissionDate: string;
  dischargeDate?: string;
  dischargeSummary?: {
    summary: string;
    instructions: string;
    prescriptions: string[];
    followUpDate: string;
    dischargedBy: string;
  };
  ward?: string;
  bedNumber?: string;
  attendingDoctorId: string;
  attendingDoctorName: string;
  primaryDiagnosis: string;
  vitals: Vitals;
  medicalHistory: string[];
  notes: ClinicalNote[];
  labReports: LabReport[];
  prescriptions: Prescription[];
  branchId?: string;
}

export type AppointmentStatus = 'scheduled' | 'checked_in' | 'in_progress' | 'completed' | 'cancelled';

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  department: string;
  qualification: string;
  experienceYears: number;
  phone: string;
  email: string;
  roomNumber: string;
  status: 'on_duty' | 'on_call' | 'off_duty';
  shift: string;
  schedule?: string;
  avatar: string;
  currentPatientsCount: number;
  branchId?: string;
  facility_id?: string;
  facility_name?: string;
  role?: string;
  license_no?: string;
  active?: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  type: 'Routine Checkup' | 'Specialist Consultation' | 'Post-Op Followup' | 'Emergency Review' | 'Diagnostic Procedure';
  status: AppointmentStatus;
  priority: 'normal' | 'urgent' | 'critical';
  reason: string;
  branchId?: string;
}

export type BedStatus = 'available' | 'occupied' | 'cleaning' | 'maintenance' | 'reserved';
export type WardType = 'ICU' | 'Emergency Bay' | 'General Ward A' | 'General Ward B' | 'Pediatrics' | 'Surgical Unit' | 'Maternity';

export interface Bed {
  id: string;
  bedNumber: string;
  ward: WardType;
  floor: string;
  status: BedStatus;
  patientId?: string;
  patientName?: string;
  patientMrn?: string;
  patientCondition?: 'critical' | 'stable' | 'observation' | 'recovering';
  admittedAt?: string;
  attendingDoctor?: string;
  dailyRate: number;
  branchId?: string;
}

export interface PharmacyItem {
  id: string;
  name: string;
  genericName: string;
  category: 'Antibiotic' | 'Analgesic' | 'Cardiovascular' | 'Antidiabetic' | 'Respiratory' | 'Sedative' | 'IV Fluid' | 'Emergency';
  dosage: string;
  strength?: string;
  form: 'Tablet' | 'Capsule' | 'Injection/IV' | 'Syrup' | 'Inhaler' | 'Ointment';
  dosageForm?: string;
  stock: number;
  minThreshold: number;
  unitPrice: number;
  batchNumber: string;
  expiryDate: string;
  location: string;
  branchId?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  category: 'bed' | 'procedure' | 'lab' | 'pharmacy' | 'consultation' | 'room' | 'imaging' | 'surgery' | 'dental';
  cost: number;
  quantity: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  date: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'partially_paid' | 'insurance_claim';
  items: InvoiceItem[];
  subtotal: number;
  insuranceDiscount: number;
  tax: number;
  total: number;
  paidAmount: number;
  paymentMethod?: 'Cash' | 'Credit Card' | 'Insurance Direct' | 'Wire Transfer' | 'Mobile Money' | 'MTN MoMo' | 'Airtel Money' | 'Visa' | 'Mastercard' | 'Bank Transfer' | 'Insurance' | 'Deposit' | string;
  doctorName?: string;
  department?: string;
  insuranceProvider?: string;
  branchId?: string;
}

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED';

export interface PaymentTransaction {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  amount: number;
  currency: 'RWF';
  provider: 'MTN MoMo' | 'Airtel Money' | 'Visa' | 'Mastercard' | 'Bank Transfer' | 'Cash' | 'Insurance' | 'Deposit';
  transactionReference: string;
  status: PaymentStatus;
  createdAt: string;
  verifiedAt?: string;
  payerPhone?: string;
  cashierName: string;
  notes?: string;
  branchId?: string;
}

// Surgery & Operating Theatre (OT)
export type SurgeryStatus = 'scheduled' | 'in_progress' | 'pacu' | 'completed' | 'cancelled';

export interface PreOpChecklist {
  consentSigned: boolean;
  fastingConfirmed: boolean;
  surgicalSiteMarked: boolean;
  anesthesiaSafetyCheck: boolean;
  pulseOximeterFunctioning: boolean;
  knownAllergiesChecked: boolean;
  difficultAirwayEvaluated: boolean;
  bloodProductsAvailable: boolean;
}

export interface SurgeryRecord {
  id: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  procedureName: string;
  operatingRoom: string; // e.g. "OR-1 (Trauma & Emergency)", "OR-2 (Laparoscopy)", "OR-3 (Obstetric OT)"
  scheduledDate: string;
  scheduledTime: string;
  durationMinutes: number;
  leadSurgeon: string;
  assistantSurgeon?: string;
  anesthesiologist: string;
  scrubNurse: string;
  circulatingNurse: string;
  preOpChecklist: PreOpChecklist;
  status: SurgeryStatus;
  intraOpNotes?: string;
  postOpNotes?: string;
  pacuRecoveryVitals?: string;
  aldreteScore?: number; // 0-10 recovery score
  estimatedCost: number;
  billed: boolean;
  branchId?: string;
}

// Maternity & Neonatal
export interface NewbornRecord {
  babyId: string;
  gender: 'Male' | 'Female';
  birthWeightKg: number;
  headCircumferenceCm: number;
  apgar1Min: number;
  apgar5Min: number;
  timeOfBirth: string;
  deliveryMethod: string;
  cryingAtBirth: boolean;
  vitaminKAdministered: boolean;
  eyeProphylaxisGiven: boolean;
  status: 'Healthy Rooming-in' | 'Transferred to NICU' | 'Observation';
  nicuReason?: string;
}

export interface MaternityRecord {
  id: string;
  patientId: string;
  motherName: string;
  motherMrn: string;
  patientName?: string;
  patientMrn?: string;
  gravida: number;
  para: number;
  gestationalAgeWeeks: number;
  gestationalWeeks?: number;
  expectedDeliveryDate: string;
  bloodGroup: string;
  ancVisitsCount: number;
  admissionDate: string;
  labourStage: 'Antenatal' | 'Stage 1 (Dilation)' | 'Stage 2 (Delivery)' | 'Stage 3 (Placental)' | 'Postpartum' | 'Discharged' | 'latent_phase' | 'first_stage' | 'second_stage' | 'postpartum' | string;
  cervicalDilationCm?: number;
  fetalHeartRateBpm?: number;
  contractionsPer10Min?: number;
  deliveryType?: 'Spontaneous Vaginal Delivery (SVD)' | 'Emergency C-Section' | 'Elective C-Section' | 'Vacuum Assisted';
  deliveryDate?: string;
  attendingMidwifeOrDoctor: string;
  complications?: string;
  estimatedBloodLossMl?: number;
  newborns: NewbornRecord[];
  branchId?: string;
  isHighRisk?: boolean;
  highRiskFactors?: string[];
  partograph?: any;
  deliveryRecord?: any;
  bedNumber?: string;
  deliveryTime?: string;
  deliveryMethod?: string;
  bloodLossMl?: number;
  placentaComplete?: boolean;
  attendingDoctor?: string;
  attendingMidwife?: string;
}

// Dental Module
export type ToothCondition =
  | 'Healthy'
  | 'Caries'
  | 'Missing'
  | 'Filled'
  | 'Crown'
  | 'Extraction Needed'
  | 'Root Canal Needed'
  | 'Impacted'
  | 'Fractured'
  | 'healthy'
  | 'caries'
  | 'missing'
  | 'filled'
  | 'crown'
  | string;

export interface DentalTooth {
  toothNumber: number;
  condition: ToothCondition;
  procedureDone?: string;
  notes?: string;
}

export interface DentalRecord {
  id: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  dentistName: string;
  date: string;
  toothNumber?: number; // 1 to 32
  toothName?: string;
  condition?: ToothCondition;
  procedureDone?: string;
  treatmentPlan?: string;
  notes?: string;
  cost?: number;
  billed?: boolean;
  branchId?: string;
  teeth?: any[];
  examinationDate?: string;
  periodontalScore?: any;
  treatmentPlans?: any[];
}

// Ophthalmology & Vision Care
export interface EyeRefraction {
  sphere: number; // e.g. -2.50
  cylinder: number; // e.g. -0.75
  axis: number; // e.g. 180 degrees
  add?: number; // near vision addition e.g. +2.00
  prism?: string; // e.g. 1.0 BI
}

export interface OphthalmologyRecord {
  id: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  examinationDate: string;
  optometristName: string;
  // Visual Acuity
  visualAcuity: {
    odUnaided: string; // Right eye e.g. 20/40
    osUnaided: string; // Left eye e.g. 20/50
    ouUnaided: string; // Both eyes e.g. 20/30
    odCorrected: string; // e.g. 20/20
    osCorrected: string; // e.g. 20/20
    ouCorrected: string; // e.g. 20/15
    pinholeOd?: string;
    pinholeOs?: string;
  };
  // Refraction
  refraction: {
    od: EyeRefraction;
    os: EyeRefraction;
    pupillaryDistanceMm: number; // PD e.g. 63
  };
  // Intraocular Pressure (IOP)
  intraocularPressure: {
    odMmHg: number; // e.g. 15
    osMmHg: number; // e.g. 16
    method: 'Goldmann Applanation' | 'Non-Contact Tonometer (Air-Puff)' | 'Tono-Pen';
    timeRecorded: string;
    glaucomaRiskAlert: boolean;
  };
  // Slit Lamp & Anterior Segment
  anteriorSegment: {
    cornea: string;
    anteriorChamber: string;
    lensStatus: 'Clear' | 'Early Nuclear Sclerosis' | 'Cortical Cataract' | 'Pseudophakic (IOL)';
    iris: string;
  };
  // Posterior Segment & Fundus
  fundusExamination: {
    cupToDiscRatioOd: number; // e.g. 0.3
    cupToDiscRatioOs: number; // e.g. 0.3
    macula: string;
    retinalVessels: string;
    periphery: string;
  };
  // Clinical Diagnosis & Management
  primaryDiagnosis: string;
  eyeglassPrescriptionIssued: boolean;
  eyeglassNotes?: string;
  medicatedEyeDrops?: string;
  followUpWeeks?: number;
  branchId?: string;
}

// Procurement & Inventory
export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  category: 'Pharmaceuticals' | 'Surgical Consumables' | 'Laboratory Reagents' | 'Radiology Supplies' | 'Medical Equipment';
  rating: number;
  tinNumber: string;
  address: string;
}

export interface PurchaseOrderItem {
  itemId: string;
  itemName: string;
  category: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  requestDate: string;
  expectedDelivery: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'Draft' | 'Requested' | 'Approved' | 'Goods Received' | 'Paid' | 'Cancelled';
  grnNumber?: string;
  receivedDate?: string;
  requestedBy: string;
  department: string;
  branchId?: string;
}

export interface CentralInventoryItem {
  id: string;
  code: string;
  name: string;
  category: 'Medical Supplies' | 'Surgical Equipment' | 'PPE & Consumables' | 'Diagnostics' | 'Emergency IV';
  currentStock: number;
  minAlertThreshold: number;
  unitCost: number;
  batchNumber: string;
  expiryDate: string;
  warehouseBin: string;
  supplierName: string;
  branchId?: string;
}

// Accounting & General Ledger
export interface GeneralLedgerEntry {
  id: string;
  entryNumber: string;
  date: string;
  referenceDoc: string;
  description: string;
  category: 'Revenue' | 'Expense' | 'Asset' | 'Liability';
  accountName: string;
  debit: number;
  credit: number;
  department: string;
  postedBy: string;
  branchId?: string;
}

export interface ExpenseRecord {
  id: string;
  expenseNumber: string;
  date: string;
  payee: string;
  category: 'Staff Salaries' | 'Pharmaceuticals' | 'Oxygen & Medical Gases' | 'Utilities & Power' | 'Equipment Maintenance' | 'Ambulance Fuel' | 'Facility Sanitation' | string;
  amount: number;
  paymentMethod: string;
  status: 'approved' | 'paid' | 'pending';
  approvedBy: string;
  notes?: string;
  branchId?: string;
  voucherNumber?: string;
  description?: string;
  department?: string;
  authorizedBy?: string;
}

export type HospitalExpense = ExpenseRecord;

export type AppLanguage = 'en' | 'rw' | 'fr';

export interface EmergencyTriageCase {
  id: string;
  patientName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  arrivalTime: string;
  chiefComplaint: string;
  esiLevel: 1 | 2 | 3 | 4 | 5; // 1: Resuscitation, 2: Emergent, 3: Urgent, 4: Less Urgent, 5: Non-Urgent
  vitals: {
    bp: string;
    hr: number;
    temp: number;
    spo2: number;
    rr: number;
    gcs?: number; // Glasgow Coma Scale
  };
  status: 'waiting' | 'in_triage' | 'assigned_bed' | 'stabilized' | 'admitted' | 'under_treatment';
  assignedBed?: string;
  triageNotes?: string;
  priorityScore: number;
  branchId?: string;
}

export type EmergencyCase = EmergencyTriageCase;

export type ActiveNavTab =
  | 'dashboard'
  | 'operations'
  | 'patient_portal'
  | 'rwanda_national_id'
  | 'emergency_locator'
  | 'bed_exchange'
  | 'e_prescription'
  | 'chronic_disease'
  | 'immunization'
  | 'medical_travel'
  | 'integration_hub'
  | 'security_center'
  | 'patients'
  | 'appointments'
  | 'wards'
  | 'beds'
  | 'emergency'
  | 'surgery'
  | 'maternity'
  | 'dental'
  | 'ophthalmology'
  | 'laboratory'
  | 'radiology'
  | 'blood_bank'
  | 'pharmacy'
  | 'procurement'
  | 'ambulance'
  | 'ambulances'
  | 'billing'
  | 'accounting'
  | 'insurance'
  | 'analytics'
  | 'mobile_clinic'
  | 'staff'
  | 'notifications'
  | 'audit_log'
  | 'audit_logs'
  | 'reports'
  | 'ai_assistant'
  | 'system_settings'
  | 'api_docs'
  | 'backup';

// ============================================================================
// Rwanda National Patient Identity & Insurance Verification Module (NIDA / RSSB / RHIE)
// ============================================================================

export type FacilityType =
  | 'REFERRAL'
  | 'DISTRICT'
  | 'TEACHING'
  | 'SPECIALIZED'
  | 'PROVINCIAL'
  | 'HEALTH_CENTER'
  | 'PRIVATE'
  | 'INTERNATIONAL_SPECIALIZED';

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  province: string;
  district: string;
  sector?: string;
  city?: string;
  address: string;
  code: string; // e.g. "CHUK-001", "KFH-002", "DH-GAS-003"
  phone: string;
  email: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  emergency_available: boolean;
  insurance_supported: string[];
  active: boolean;
  verified_at?: string;
  is_international?: boolean;
  country: string; // "Rwanda" or "Kenya", "India", etc.
  departments?: string[];
  total_beds?: number;
  available_beds?: number;
  icu_beds?: { total: number; available: number };
  doctors_count?: number;
  services?: string[];
  opening_hours?: string;
  category?: 'HOSPITAL' | 'HEALTH_CENTER' | 'CLINIC' | 'PHARMACY' | 'LABORATORY' | 'AMBULANCE_BASE';
  available_ambulances?: number;
}

export interface RwandaAddress {
  province: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
}

export interface NationalPatient {
  id: string;
  nin: string; // 16-digit Rwandan NIN e.g. "1 1990 8 0012345 1 20"
  first_name: string;
  last_name: string;
  full_name: string;
  gender: 'Male' | 'Female';
  dob: string; // YYYY-MM-DD
  age: number;
  photo_url: string;
  phone: string;
  email?: string;
  address: RwandaAddress;
  blood_group: BloodGroup;
  status: 'ACTIVE' | 'FLAGGED' | 'DECEASED';
  registered_facility_id: string;
  registered_facility_name: string;
  rhie_id: string; // Rwanda Health Information Exchange ID e.g. "RHIE-KGL-88201"
  national_id_verified: boolean;
  verification_source: 'MOCK_NIDA_PROVIDER' | 'NIDA_DIRECT_API';
  registered_at: string;
  emergency_contact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export type InsuranceProviderType =
  | 'RSSB_RAMA'
  | 'MUTUELLE_DE_SANTE'
  | 'MMI'
  | 'RADIANT'
  | 'BRITAM'
  | 'EDEN_CARE'
  | 'SANLAM'
  | 'UAP_OLD_MUTUAL';

export interface InsuranceVerification {
  id: string;
  patient_nin: string;
  patient_name: string;
  provider: InsuranceProviderType;
  provider_display_name: string;
  policy_number: string;
  tier?: 'CATEGORY_1' | 'CATEGORY_2' | 'CATEGORY_3' | 'CATEGORY_4' | 'STANDARD' | 'EXECUTIVE' | 'VIP';
  status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'INVALID';
  coverage_percentage: number; // e.g. 85 for RAMA, 90 for Mutuelle/MMI
  copay_amount_rwf: number;
  eligible_services: string[];
  verified_at: string;
  expires_at: string;
  eligibility_notes: string;
  verification_code: string;
  beneficiaries_count?: number;
}

export type ConsentType =
  | 'EMR_ACCESS'
  | 'INSURANCE_BILLING'
  | 'RHIE_DATA_EXCHANGE'
  | 'REFERRAL_TRANSFER'
  | 'EMERGENCY_OVERRIDE'
  | 'TREATMENT'
  | 'REFERRAL'
  | 'RESEARCH';

export interface PatientConsent {
  id: string;
  patient_nin: string;
  patient_name: string;
  facility_id: string;
  facility_name: string;
  staff_id: string;
  staff_name: string;
  staff_role: string;
  consent_type: ConsentType;
  granted: boolean;
  granted_at: string;
  expires_at: string;
  legal_framework: string; // "Rwanda Law N° 058/2021 on Personal Data Protection and Privacy"
  notes?: string;
  ip_address?: string;
}

export type AuditActionType =
  | 'NIN_LOOKUP'
  | 'IDENTITY_VERIFIED'
  | 'INSURANCE_CHECK'
  | 'CONSENT_GRANTED'
  | 'CONSENT_REVOKED'
  | 'ENCOUNTER_CREATED'
  | 'REFERRAL_CREATED'
  | 'REFERRAL_UPDATED'
  | 'PAYMENT_CREATED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'REFUND_CREATED'
  | 'REFUND_COMPLETED'
  | 'EMERGENCY_OVERRIDE';

export interface AccessAuditLog {
  id: string;
  staff_id: string;
  staff_name: string;
  staff_role: string;
  facility_id: string;
  facility_name: string;
  patient_nin: string;
  patient_name: string;
  action: AuditActionType;
  timestamp: string;
  ip_address: string;
  reason: string;
  status: 'SUCCESS' | 'DENIED' | 'FLAGGED';
  details?: string;
}

export type ReferralPriority = 'ROUTINE' | 'URGENT' | 'EMERGENCY';
export type ReferralStatus = 'PENDING' | 'ACCEPTED' | 'IN_TRANSIT' | 'COMPLETED' | 'REJECTED';
export type ReferralType = 'LOCAL' | 'INTERNATIONAL';

export interface PatientReferral {
  id: string;
  referral_number: string; // e.g. "REF-2026-RW-0104"
  patient_nin: string;
  patient_name: string;
  patient_age: number;
  patient_gender: 'Male' | 'Female';
  source_facility_id: string;
  source_facility_name: string;
  source_facility_district: string;
  destination_facility_id: string;
  destination_facility_name: string;
  destination_country: string; // "Rwanda" or "Kenya", "India", etc.
  referral_type: ReferralType;
  priority: ReferralPriority;
  status: ReferralStatus;
  primary_diagnosis: string;
  clinical_summary: string;
  transfer_reason: string; // e.g. "Neurosurgery ICU requiring specialized intracranial pressure monitoring"
  required_services: string[];
  referring_doctor_id: string;
  referring_doctor_name: string;
  referring_department: string;
  created_at: string;
  accepted_at?: string;
  completed_at?: string;
  ambulance_required: boolean;
  assigned_ambulance?: string;
  transport_notes?: string;
  receiving_notes?: string;
}

export interface StaffProfile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole | string;
  facility_id: string;
  facility_name: string;
  department: string;
  license_no: string;
  phone: string;
  active: boolean;
}

// ============================================================================
// Real-Time Bed Exchange Across Facilities
// ============================================================================
export type WardBedType =
  | 'ICU'
  | 'Emergency'
  | 'General Ward'
  | 'Pediatrics'
  | 'Maternity'
  | 'Surgery'
  | 'NICU';

export type BedExchangeStatus =
  | 'AVAILABLE' // 🟢
  | 'OCCUPIED'  // 🔴
  | 'CLEANING'  // 🟡
  | 'MAINTENANCE' // ⚫
  | 'RESERVED'; // 🔵

export interface BedExchangeItem {
  id: string;
  facility_id: string;
  facility_name: string;
  district: string;
  ward_type: WardBedType;
  bed_number: string;
  status: BedExchangeStatus;
  patient_mrn?: string;
  patient_name?: string;
  reserved_for_referral?: string;
  oxygen_support: boolean;
  ventilator_support: boolean;
  last_updated: string;
}

// ============================================================================
// E-Prescription & Pharmacy Dispense Workflow
// ============================================================================
export interface PrescriptionItem {
  id: string;
  medicine: string;
  dose: string;
  frequency: string;
  duration: string;
  quantity: number;
  route: string;
  instructions: string;
  is_dispensed?: boolean;
}

export interface EPrescription {
  id: string;
  prescription_number: string;
  patient_id: string;
  patient_name: string;
  patient_mrn: string;
  patient_nin?: string;
  patient_allergies: string[];
  doctor_id: string;
  doctor_name: string;
  facility_id: string;
  facility_name: string;
  created_at: string;
  status: 'DRAFT' | 'PRESCRIBED' | 'DISPENSED' | 'CANCELLED';
  medications: PrescriptionItem[];
  allergy_warnings: string[];
  interaction_warnings: string[];
  duplicate_warnings: string[];
  refills_allowed: number;
  refills_used: number;
  dispensed_at?: string;
  dispensed_by?: string;
  receipt_number?: string;
  patient_notes?: string;
}

// ============================================================================
// Chronic Disease Management
// ============================================================================
export type ChronicConditionType =
  | 'Diabetes'
  | 'Hypertension'
  | 'Asthma'
  | 'HIV care'
  | 'TB'
  | 'Kidney disease'
  | 'Heart disease';

export interface ChronicCareProgram {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_mrn: string;
  patient_nin?: string;
  condition: ChronicConditionType;
  stage_or_type: string;
  diagnosis_date: string;
  attending_clinician: string;
  facility_name: string;
  latest_vitals: {
    bp?: string;
    blood_glucose?: string;
    hba1c?: string;
    viral_load?: string;
    cd4?: string;
    egfr?: string;
    peak_flow?: string;
  };
  active_medications: string[];
  care_plan: string;
  next_appointment_date: string;
  next_lab_due: string;
  status: 'STABLE' | 'ATTENTION_NEEDED' | 'CRITICAL';
  adherence_rate_pct: number;
  last_consult_notes?: string;
}

// ============================================================================
// Child Immunization (EPI Registry)
// ============================================================================
export interface ChildVaccineEntry {
  vaccine_name: string;
  target_disease: string;
  scheduled_age: string;
  status: 'GIVEN' | 'DUE' | 'OVERDUE';
  date_given?: string;
  batch_number?: string;
  administered_by?: string;
  notes?: string;
}

export interface ImmunizationRecord {
  id: string;
  child_id: string;
  child_name: string;
  child_nin?: string;
  dob: string;
  gender: 'Male' | 'Female';
  birth_weight_kg: number;
  mother_name: string;
  mother_nin?: string;
  phone: string;
  facility_name: string;
  vaccinations: ChildVaccineEntry[];
  next_vaccine_due: string;
  is_overdue: boolean;
  sms_reminder_sent: boolean;
  notes?: string;
}

// ============================================================================
// International Medical Travel & Cross-Border Care
// ============================================================================
export type TravelWorkflowStage =
  | 'SPECIALIST_SEARCH'
  | 'TELEMEDICINE'
  | 'REFERRAL_APPROVAL'
  | 'COST_ESTIMATE'
  | 'INSURANCE_PREAUTH'
  | 'TRAVEL_DOCUMENTS'
  | 'TREATMENT'
  | 'RETURN_FOLLOWUP'
  | 'INQUIRY'
  | 'RECORD_REVIEW'
  | 'TREATMENT_PLAN'
  | 'VISA_SUPPORT'
  | 'ADMITTED'
  | 'FOLLOW_UP';

export interface InternationalMedicalTravel {
  id: string;
  case_number: string;
  patient_id: string;
  patient_name: string;
  patient_mrn: string;
  patient_nin: string;
  destination_country: string;
  hospital_name: string;
  specialist_name: string;
  specialty: string;
  stage: TravelWorkflowStage;
  telemedicine_date?: string;
  telemedicine_notes?: string;
  estimated_cost_usd: number;
  estimated_cost_rwf: number;
  insurance_covered_amount: number;
  patient_share_amount: number;
  medical_visa_status: 'NOT_REQUIRED' | 'SUBMITTED' | 'APPROVED' | 'IN_REVIEW';
  fit_to_fly_certified: boolean;
  travel_date?: string;
  return_date?: string;
  created_at: string;
  notes: string;
  // Concierge and travel support extensions
  passport_number?: string;
  origin_country?: string;
  diagnosis?: string;
  target_facility?: string;
  attending_specialist?: string;
  visa_support_letter_ref?: string;
  arrival_date?: string;
  visa_status?: 'NOT_REQUIRED' | 'SUBMITTED' | 'APPROVED' | 'IN_REVIEW' | 'GRANTED' | 'PENDING' | 'ISSUED';
  medical_summary?: string;
}

// ============================================================================
// Integration Hub
// ============================================================================
export type IntegrationKey =
  | 'NIDA'
  | 'RHIE'
  | 'RSSB'
  | 'CBHI'
  | 'MTN_MOMO'
  | 'AIRTEL_MONEY'
  | 'SMS_GATEWAY'
  | 'EMAIL'
  | 'AI_ENGINE';

export interface SystemIntegration {
  id: string;
  service_key: IntegrationKey;
  display_name: string;
  category: 'GOVERNMENT_EXCHANGE' | 'PAYMENT_GATEWAY' | 'COMMUNICATION' | 'INTELLIGENCE';
  status: 'CONNECTED' | 'NOT_CONNECTED' | 'SANDBOX_ACTIVE' | 'ERROR' | 'DEGRADED';
  endpoint_url?: string;
  api_key_configured: boolean;
  last_ping?: string;
  latency_ms?: number;
  description: string;
  name?: string;
  provider?: string;
  last_ping_ms?: number;
  success_rate_pct?: number;
  last_sync?: string;
}

// ============================================================================
// Advanced Security Center
// ============================================================================
export interface SecurityAuditItem {
  id: string;
  timestamp: string;
  event_type:
    | 'LOGIN_SUCCESS'
    | 'LOGIN_FAILED'
    | 'DATA_ACCESS'
    | 'PERMISSION_CHANGE'
    | 'API_REQUEST'
    | 'SECURITY_ALERT'
    | 'BACKUP_CREATED';
  user_email: string;
  ip_address: string;
  user_agent: string;
  facility: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  details: string;
  user_name?: string;
  user_role?: string;
  action?: string;
  patient_mrn?: string;
  access_justification?: string;
}

// Module Compatibility Type Aliases
export type EPrescriptionItem = PrescriptionItem;
export type ChildImmunizationRecord = ImmunizationRecord;
export type VaccineScheduleEntry = ChildVaccineEntry;
export type NationalIntegration = SystemIntegration;
export type MedicalTravelCase = InternationalMedicalTravel;
export type SecurityAuditLog = SecurityAuditItem;

