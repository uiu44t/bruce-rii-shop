import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Patient,
  Doctor,
  Bed,
  PharmacyItem,
  Appointment,
  Invoice,
  EmergencyTriageCase,
  ClinicalNote,
  Prescription,
  Vitals,
  UserRole,
  HospitalBranch,
  LabOrder,
  SampleStatus,
  LabResultItem,
  RadiologyOrder,
  BloodInventoryItem,
  BloodDonation,
  BloodIssueRecord,
  BloodGroup,
  Ambulance,
  AmbulanceDispatch,
  InsuranceProvider,
  InsuranceClaim,
  SystemNotification,
  AuditLogEntry,
  PaymentTransaction,
  PaymentStatus,
  SurgeryRecord,
  SurgeryStatus,
  MaternityRecord,
  NewbornRecord,
  DentalRecord,
  Supplier,
  PurchaseOrder,
  CentralInventoryItem,
  GeneralLedgerEntry,
  ExpenseRecord,
  AppLanguage,
  NationalPatient,
  PatientReferral,
  PatientConsent,
  AccessAuditLog,
  InsuranceVerification,
  Facility,
} from '../types';
import {
  INITIAL_PATIENTS,
  INITIAL_DOCTORS,
  INITIAL_BEDS,
  INITIAL_PHARMACY,
  INITIAL_APPOINTMENTS,
  INITIAL_INVOICES,
  INITIAL_EMERGENCY_CASES,
} from '../data/mockHospitalData';
import {
  INITIAL_BRANCHES,
  INITIAL_LAB_ORDERS,
  INITIAL_RADIOLOGY_ORDERS,
  INITIAL_BLOOD_INVENTORY,
  INITIAL_BLOOD_DONATIONS,
  INITIAL_BLOOD_ISSUES,
  INITIAL_AMBULANCES,
  INITIAL_DISPATCHES,
  INITIAL_INSURANCE_PROVIDERS,
  INITIAL_INSURANCE_CLAIMS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from '../data/mockEnterpriseData';
import {
  INITIAL_NATIONAL_PATIENTS,
  INITIAL_PATIENT_REFERRALS,
  INITIAL_PATIENT_CONSENTS,
  INITIAL_ACCESS_AUDIT_LOGS,
  RWANDA_FACILITIES,
} from '../data/mockRwandaNationalData';
import {
  INITIAL_PAYMENT_TRANSACTIONS,
  INITIAL_SURGERIES,
  INITIAL_MATERNITY_RECORDS,
  INITIAL_DENTAL_RECORDS,
  INITIAL_SUPPLIERS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_CENTRAL_INVENTORY,
  INITIAL_LEDGER_ENTRIES,
  INITIAL_EXPENSES,
} from '../data/mockHospitalEnterprise';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
}

interface HospitalContextType {
  patients: Patient[];
  doctors: Doctor[];
  beds: Bed[];
  pharmacy: PharmacyItem[];
  appointments: Appointment[];
  invoices: Invoice[];
  emergencyCases: EmergencyTriageCase[];
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => void;
  currentUser: { id: string; name: string; role: UserRole; email: string };

  // Role & Multi-Branch & Patient Portal
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentBranchId: string;
  setCurrentBranchId: (branchId: string) => void;
  branches: HospitalBranch[];
  portalPatientId: string;
  setPortalPatientId: (patientId: string) => void;

  // Laboratory Orders & Processing
  labOrders: LabOrder[];
  createLabOrder: (order: Omit<LabOrder, 'id' | 'orderNumber' | 'orderedDate' | 'sampleStatus'>) => LabOrder;
  updateSampleStatus: (orderId: string, status: SampleStatus) => void;
  enterLabResults: (orderId: string, results: LabResultItem[], isCritical?: boolean) => void;
  approveLabResult: (orderId: string, doctorName: string, notes?: string) => void;

  // Radiology & Imaging
  radiologyOrders: RadiologyOrder[];
  createRadiologyOrder: (order: Omit<RadiologyOrder, 'id' | 'orderNumber' | 'requestedDate' | 'status'>) => RadiologyOrder;
  updateRadiologyStatus: (orderId: string, status: RadiologyOrder['status']) => void;
  submitRadiologyReport: (orderId: string, report: { radiologistName: string; findings: string; impression: string; recommendations?: string }) => void;

  // Blood Bank
  bloodInventory: BloodInventoryItem[];
  bloodDonations: BloodDonation[];
  bloodIssues: BloodIssueRecord[];
  addBloodDonation: (donation: Omit<BloodDonation, 'id' | 'status'>) => void;
  recordBloodDonation: (donation: Omit<BloodDonation, 'id' | 'status'>) => void;
  issueBloodUnits: (issueData: Omit<BloodIssueRecord, 'id' | 'issuedAt'>) => boolean;
  requestEmergencyBlood: (bloodGroup: BloodGroup, units: number, patientName: string, doctorName: string) => void;

  // Ambulance & Fleet
  ambulances: Ambulance[];
  dispatches: AmbulanceDispatch[];
  registerAmbulance: (ambulance: Omit<Ambulance, 'id'>) => void;
  updateAmbulanceStatus: (ambulanceId: string, status: Ambulance['currentStatus'], location?: string) => void;
  dispatchAmbulance: (dispatch: Omit<AmbulanceDispatch, 'id' | 'dispatchedAt' | 'status'>) => void;
  updateDispatchStatus: (dispatchId: string, status: AmbulanceDispatch['status']) => void;

  // Insurance & Claims
  insuranceProviders: InsuranceProvider[];
  insuranceClaims: InsuranceClaim[];
  createInsuranceClaim: (claim: Omit<InsuranceClaim, 'id' | 'claimNumber' | 'submissionDate' | 'status'>) => InsuranceClaim;
  submitInsuranceClaim: (claim: Omit<InsuranceClaim, 'id' | 'claimNumber' | 'submissionDate' | 'status'>) => InsuranceClaim;
  adjudicateInsuranceClaim: (claimId: string, status: 'Approved' | 'Rejected', approvalCode?: string, rejectionReason?: string) => void;
  processInsuranceClaim: (claimId: string, status: 'Approved' | 'Rejected', approvalCode?: string, rejectionReason?: string) => void;

  // Notifications & SMS
  notifications: SystemNotification[];
  sendNotification: (notification: Omit<SystemNotification, 'id' | 'sentAt' | 'isRead' | 'status'>) => void;
  markNotificationAsRead: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Audit Logs
  auditLogs: AuditLogEntry[];
  logAuditEvent: (
    actionOrPayload: string | { action: string; targetType?: any; targetName?: string; details?: string; user?: string; targetId?: string },
    targetType?: any,
    targetName?: string,
    details?: string,
    targetId?: string
  ) => void;

  // System Backup & Disaster Recovery
  exportSystemBackup: () => string;
  exportBackupData: () => string;
  restoreSystemBackup: (jsonContent: string) => boolean;
  restoreBackupData: (jsonContent: string) => boolean;

  // Localization
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;

  // Rwanda Payment Gateway & Transactions
  paymentTransactions: PaymentTransaction[];
  initiatePayment: (params: { invoiceId: string; amount: number; provider: PaymentTransaction['provider']; payerPhone?: string; notes?: string }) => Promise<PaymentTransaction>;
  verifyPayment: (transactionId: string) => Promise<PaymentTransaction>;
  recordRefund: (transactionId: string, amount: number, reason: string) => Promise<PaymentTransaction>;

  // Surgery & Operating Theatre (OT)
  surgeries: SurgeryRecord[];
  scheduleSurgery: (data: any) => SurgeryRecord;
  updateSurgeryStatus: (id: string, status: SurgeryStatus, notes?: string) => void;
  billSurgery: (id: string) => Invoice;

  // Maternity & Neonatal
  maternityRecords: MaternityRecord[];
  registerMaternityAdmission: (data: any) => MaternityRecord;
  recordDelivery: (id: string, deliveryData: Partial<MaternityRecord>, newborn: NewbornRecord) => void;
  updateLabourStage: (id: string, stage: MaternityRecord['labourStage'], vitals?: { dilation?: number; fhr?: number }) => void;

  // Dental Module
  dentalRecords: DentalRecord[];
  recordDentalExamination: (data: Omit<DentalRecord, 'id' | 'billed'>) => DentalRecord;
  billDentalProcedure: (recordId: string) => Invoice;

  // Procurement & Inventory
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  centralInventory: CentralInventoryItem[];
  createPurchaseOrder: (poData: any) => PurchaseOrder;
  receiveGoodsPO: (poId: string, grnNumber?: string) => void;
  transferStockToDepartment: (itemId: string, quantity: number, targetDept: string) => void;

  // Rwanda National Identity & Insurance Verification
  nationalPatients: NationalPatient[];
  patientReferrals: PatientReferral[];
  patientConsents: PatientConsent[];
  accessAuditLogs: AccessAuditLog[];
  verifyNationalPatientNIN: (nin: string, reason?: string) => Promise<NationalPatient | null>;
  verifyPatientInsurance: (nin: string, provider?: string, patientName?: string) => Promise<InsuranceVerification | null>;
  recordPatientConsent: (consent: any) => Promise<PatientConsent>;
  createPatientReferral: (referralData: any) => Promise<PatientReferral>;
  updateReferralStatus: (id: string, status: PatientReferral['status'], notes?: string) => Promise<void>;
  createNationalEncounter: (params: { patientNin: string; patientName: string; department?: string; diagnosis?: string }) => Promise<{ mrn: string; encounterId: string }>;

  // Accounting & General Ledger
  ledgerEntries: GeneralLedgerEntry[];
  expenses: ExpenseRecord[];
  recordExpense: (expense: Omit<ExpenseRecord, 'id' | 'expenseNumber'>) => ExpenseRecord;
  postLedgerEntry: (entry: Omit<GeneralLedgerEntry, 'id' | 'entryNumber'>) => GeneralLedgerEntry;

  // Action methods
  addToast: (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => void;
  removeToast: (id: string) => void;

  // Patient Actions
  registerPatient: (patientData: Omit<Patient, 'id' | 'mrn' | 'notes' | 'labReports' | 'prescriptions'>) => Patient;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  admitPatientToBed: (patientId: string, bedId: string, primaryDiagnosis?: string) => void;
  dischargePatient: (patientId: string) => void;
  addPatientVitals: (patientId: string, vitals: Vitals) => void;
  addClinicalNote: (patientId: string, note: Omit<ClinicalNote, 'id' | 'date'>) => void;
  addPrescription: (patientId: string, prescription: Omit<Prescription, 'id' | 'datePrescribed' | 'status' | 'dispensed'>) => void;

  // Bed Actions
  updateBedStatus: (bedId: string, status: Bed['status']) => void;

  // Appointment Actions
  createAppointment: (apt: Omit<Appointment, 'id'>) => void;
  addAppointment: (apt: Omit<Appointment, 'id'>) => void;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;

  // Pharmacy Actions
  dispensePrescription: (patientId: string, rxId: string, pharmacyItemId?: string) => void;
  restockMedication: (id: string, quantity: number) => void;
  restockPharmacyItem: (id: string, quantity: number) => void;
  addPharmacyItem: (item: any) => void;

  // Emergency & Triage Actions
  addEmergencyCase: (triageData: Omit<EmergencyTriageCase, 'id' | 'arrivalTime' | 'priorityScore'>) => EmergencyTriageCase;
  updateEmergencyStatus: (id: string, status: EmergencyTriageCase['status'], assignedBed?: string) => void;

  // Billing Actions
  createInvoice: ((invoiceData: Omit<Invoice, 'id' | 'invoiceNumber'>) => Invoice) & ((patientId: string, items: any[], insuranceCoverPercent?: number) => Invoice);
  recordPayment: (invoiceId: string, amount: number, method: Invoice['paymentMethod']) => void;
  recordInvoicePayment: (invoiceId: string, amount: number, method?: any) => void;

  // Doctor Actions
  updateDoctorStatus: (doctorId: string, status: Doctor['status']) => void;
  toggleDoctorStatus: (doctorId: string) => void;

  // System
  resetAllData: () => void;
}

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PATIENTS: 'hms_patients_v1',
  DOCTORS: 'hms_doctors_v1',
  BEDS: 'hms_beds_v1',
  PHARMACY: 'hms_pharmacy_v1',
  APPOINTMENTS: 'hms_appointments_v1',
  INVOICES: 'hms_invoices_v1',
  EMERGENCY: 'hms_emergency_v1',
  ROLE: 'hms_role_v1',
  BRANCH: 'hms_branch_v1',
  PORTAL_PATIENT: 'hms_portal_patient_v1',
  LAB: 'hms_lab_orders_v1',
  RADIOLOGY: 'hms_radiology_orders_v1',
  BLOOD_INVENTORY: 'hms_blood_inv_v1',
  BLOOD_DONATIONS: 'hms_blood_donations_v1',
  BLOOD_ISSUES: 'hms_blood_issues_v1',
  AMBULANCES: 'hms_ambulances_v1',
  DISPATCHES: 'hms_dispatches_v1',
  INSURANCE_CLAIMS: 'hms_insurance_claims_v1',
  NOTIFICATIONS: 'hms_notifications_v1',
  AUDIT: 'hms_audit_v1',
  PAYMENTS: 'hms_payments_v1',
  SURGERIES: 'hms_surgeries_v1',
  MATERNITY: 'hms_maternity_v1',
  DENTAL: 'hms_dental_v1',
  SUPPLIERS: 'hms_suppliers_v1',
  PURCHASE_ORDERS: 'hms_po_v1',
  CENTRAL_INVENTORY: 'hms_cinv_v1',
  LEDGER: 'hms_ledger_v1',
  EXPENSES: 'hms_expenses_v1',
  LANGUAGE: 'hms_lang_v1',
  NATIONAL_PATIENTS: 'hms_rw_national_patients_v1',
  REFERRALS: 'hms_rw_referrals_v1',
  CONSENTS: 'hms_rw_consents_v1',
  ACCESS_AUDIT: 'hms_rw_access_audit_v1',
};

function safeRead<T>(key: string, fallback: T): T {
  try {
    if (typeof window === 'undefined') return fallback;
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}

export const HospitalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>(() => safeRead(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS));

  const [doctors, setDoctors] = useState<Doctor[]>(() => safeRead(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS));

  const [beds, setBeds] = useState<Bed[]>(() => safeRead(STORAGE_KEYS.BEDS, INITIAL_BEDS));

  const [pharmacy, setPharmacy] = useState<PharmacyItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PHARMACY);
    return saved ? JSON.parse(saved) : INITIAL_PHARMACY;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVOICES);
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [emergencyCases, setEmergencyCases] = useState<EmergencyTriageCase[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EMERGENCY);
    return saved ? JSON.parse(saved) : INITIAL_EMERGENCY_CASES;
  });

  // Enterprise States
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return (localStorage.getItem(STORAGE_KEYS.ROLE) as UserRole) || 'super_admin';
  });

  const [currentBranchId, setCurrentBranchId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.BRANCH) || 'branch-kigali';
  });

  const [branches] = useState<HospitalBranch[]>(INITIAL_BRANCHES);

  const [portalPatientId, setPortalPatientId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.PORTAL_PATIENT) || 'pat-101';
  });

  const [labOrders, setLabOrders] = useState<LabOrder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LAB);
    return saved ? JSON.parse(saved) : INITIAL_LAB_ORDERS;
  });

  const [radiologyOrders, setRadiologyOrders] = useState<RadiologyOrder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RADIOLOGY);
    return saved ? JSON.parse(saved) : INITIAL_RADIOLOGY_ORDERS;
  });

  const [bloodInventory, setBloodInventory] = useState<BloodInventoryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BLOOD_INVENTORY);
    return saved ? JSON.parse(saved) : INITIAL_BLOOD_INVENTORY;
  });

  const [bloodDonations, setBloodDonations] = useState<BloodDonation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BLOOD_DONATIONS);
    return saved ? JSON.parse(saved) : INITIAL_BLOOD_DONATIONS;
  });

  const [bloodIssues, setBloodIssues] = useState<BloodIssueRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BLOOD_ISSUES);
    return saved ? JSON.parse(saved) : INITIAL_BLOOD_ISSUES;
  });

  const [ambulances, setAmbulances] = useState<Ambulance[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AMBULANCES);
    return saved ? JSON.parse(saved) : INITIAL_AMBULANCES;
  });

  const [dispatches, setDispatches] = useState<AmbulanceDispatch[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DISPATCHES);
    return saved ? JSON.parse(saved) : INITIAL_DISPATCHES;
  });

  const [insuranceProviders] = useState<InsuranceProvider[]>(INITIAL_INSURANCE_PROVIDERS);

  const [insuranceClaims, setInsuranceClaims] = useState<InsuranceClaim[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INSURANCE_CLAIMS);
    return saved ? JSON.parse(saved) : INITIAL_INSURANCE_CLAIMS;
  });

  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // --- ENTERPRISE MODULES STATES ---
  const [language, setLanguage] = useState<AppLanguage>(() => {
    return (localStorage.getItem(STORAGE_KEYS.LANGUAGE) as AppLanguage) || 'rw';
  });

  const [paymentTransactions, setPaymentTransactions] = useState<PaymentTransaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    return saved ? JSON.parse(saved) : INITIAL_PAYMENT_TRANSACTIONS;
  });

  const [surgeries, setSurgeries] = useState<SurgeryRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SURGERIES);
    return saved ? JSON.parse(saved) : INITIAL_SURGERIES;
  });

  const [maternityRecords, setMaternityRecords] = useState<MaternityRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MATERNITY);
    return saved ? JSON.parse(saved) : INITIAL_MATERNITY_RECORDS;
  });

  const [dentalRecords, setDentalRecords] = useState<DentalRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DENTAL);
    return saved ? JSON.parse(saved) : INITIAL_DENTAL_RECORDS;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PURCHASE_ORDERS);
    return saved ? JSON.parse(saved) : INITIAL_PURCHASE_ORDERS;
  });

  const [centralInventory, setCentralInventory] = useState<CentralInventoryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CENTRAL_INVENTORY);
    return saved ? JSON.parse(saved) : INITIAL_CENTRAL_INVENTORY;
  });

  const [ledgerEntries, setLedgerEntries] = useState<GeneralLedgerEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LEDGER);
    return saved ? JSON.parse(saved) : INITIAL_LEDGER_ENTRIES;
  });

  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  // --- RWANDA NATIONAL IDENTITY & VERIFICATION STATES ---
  const [nationalPatients, setNationalPatients] = useState<NationalPatient[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NATIONAL_PATIENTS);
    return saved ? JSON.parse(saved) : INITIAL_NATIONAL_PATIENTS;
  });

  const [patientReferrals, setPatientReferrals] = useState<PatientReferral[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REFERRALS);
    return saved ? JSON.parse(saved) : INITIAL_PATIENT_REFERRALS;
  });

  const [patientConsents, setPatientConsents] = useState<PatientConsent[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONSENTS);
    return saved ? JSON.parse(saved) : INITIAL_PATIENT_CONSENTS;
  });

  const [accessAuditLogs, setAccessAuditLogs] = useState<AccessAuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACCESS_AUDIT);
    return saved ? JSON.parse(saved) : INITIAL_ACCESS_AUDIT_LOGS;
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(doctors));
  }, [doctors]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BEDS, JSON.stringify(beds));
  }, [beds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PHARMACY, JSON.stringify(pharmacy));
  }, [pharmacy]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EMERGENCY, JSON.stringify(emergencyCases));
  }, [emergencyCases]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLE, currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BRANCH, currentBranchId);
  }, [currentBranchId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PORTAL_PATIENT, portalPatientId);
  }, [portalPatientId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LAB, JSON.stringify(labOrders));
  }, [labOrders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RADIOLOGY, JSON.stringify(radiologyOrders));
  }, [radiologyOrders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BLOOD_INVENTORY, JSON.stringify(bloodInventory));
  }, [bloodInventory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BLOOD_DONATIONS, JSON.stringify(bloodDonations));
  }, [bloodDonations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BLOOD_ISSUES, JSON.stringify(bloodIssues));
  }, [bloodIssues]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AMBULANCES, JSON.stringify(ambulances));
  }, [ambulances]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DISPATCHES, JSON.stringify(dispatches));
  }, [dispatches]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INSURANCE_CLAIMS, JSON.stringify(insuranceClaims));
  }, [insuranceClaims]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(paymentTransactions));
  }, [paymentTransactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SURGERIES, JSON.stringify(surgeries));
  }, [surgeries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MATERNITY, JSON.stringify(maternityRecords));
  }, [maternityRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DENTAL, JSON.stringify(dentalRecords));
  }, [dentalRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PURCHASE_ORDERS, JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CENTRAL_INVENTORY, JSON.stringify(centralInventory));
  }, [centralInventory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LEDGER, JSON.stringify(ledgerEntries));
  }, [ledgerEntries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  const addToast = (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newToast: ToastMessage = {
      ...toast,
      id,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setToasts((prev) => [newToast, ...prev].slice(0, 5));

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Patient Actions
  const registerPatient = (patientData: Omit<Patient, 'id' | 'mrn' | 'notes' | 'labReports' | 'prescriptions'>): Patient => {
    const newId = `pat-${Date.now()}`;
    const mrnNumber = Math.floor(1000 + Math.random() * 9000);
    const newMrn = `MRN-2026-${mrnNumber}`;
    const newPatient: Patient = {
      ...patientData,
      id: newId,
      mrn: newMrn,
      notes: [],
      labReports: [],
      prescriptions: [],
    };

    setPatients((prev) => [newPatient, ...prev]);
    addToast({
      type: 'success',
      title: 'Patient Registered',
      message: `${newPatient.name} assigned ${newMrn}`,
    });
    return newPatient;
  };

  const updatePatient = (id: string, updates: Partial<Patient>) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const admitPatientToBed = (patientId: string, bedId: string, primaryDiagnosis?: string) => {
    const patient = patients.find((p) => p.id === patientId);
    const bed = beds.find((b) => b.id === bedId);

    if (!patient || !bed) return;

    // Free any old bed patient had
    setBeds((prev) =>
      prev.map((b) => {
        if (b.patientId === patientId) {
          return {
            ...b,
            status: 'cleaning',
            patientId: undefined,
            patientName: undefined,
            patientMrn: undefined,
            patientCondition: undefined,
            admittedAt: undefined,
          };
        }
        if (b.id === bedId) {
          return {
            ...b,
            status: 'occupied',
            patientId: patient.id,
            patientName: patient.name,
            patientMrn: patient.mrn,
            patientCondition: 'stable',
            admittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            attendingDoctor: patient.attendingDoctorName,
          };
        }
        return b;
      })
    );

    // Update patient
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          return {
            ...p,
            status: 'inpatient',
            ward: bed.ward,
            bedNumber: bed.bedNumber,
            primaryDiagnosis: primaryDiagnosis || p.primaryDiagnosis,
            admissionDate: new Date().toISOString(),
          };
        }
        return p;
      })
    );

    addToast({
      type: 'success',
      title: 'Patient Admitted',
      message: `${patient.name} admitted to ${bed.ward} (${bed.bedNumber})`,
    });
  };

  const dischargePatient = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) return;

    // Release bed
    setBeds((prev) =>
      prev.map((b) => {
        if (b.patientId === patientId) {
          return {
            ...b,
            status: 'cleaning',
            patientId: undefined,
            patientName: undefined,
            patientMrn: undefined,
            patientCondition: undefined,
            admittedAt: undefined,
          };
        }
        return b;
      })
    );

    // Update patient
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          return {
            ...p,
            status: 'discharged',
            dischargeDate: new Date().toISOString(),
            ward: undefined,
            bedNumber: undefined,
          };
        }
        return p;
      })
    );

    addToast({
      type: 'info',
      title: 'Patient Discharged',
      message: `${patient.name} discharged. Bed scheduled for sanitation.`,
    });
  };

  const addPatientVitals = (patientId: string, vitals: Vitals) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          return { ...p, vitals };
        }
        return p;
      })
    );
    addToast({
      type: 'info',
      title: 'Vitals Recorded',
      message: `Vitals updated for patient. BP: ${vitals.bp}, HR: ${vitals.hr} bpm`,
    });
  };

  const addClinicalNote = (patientId: string, noteData: Omit<ClinicalNote, 'id' | 'date'>) => {
    const newNote: ClinicalNote = {
      ...noteData,
      id: `note-${Date.now()}`,
      date: new Date().toISOString(),
    };

    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          return {
            ...p,
            notes: [newNote, ...(p.notes || [])],
          };
        }
        return p;
      })
    );

    addToast({
      type: 'success',
      title: 'Clinical Note Added',
      message: `${noteData.title} by ${noteData.doctorName} recorded in EMR.`,
    });
  };

  const addPrescription = (
    patientId: string,
    rxData: Omit<Prescription, 'id' | 'datePrescribed' | 'status' | 'dispensed'>
  ) => {
    const newRx: Prescription = {
      ...rxData,
      id: `rx-${Date.now()}`,
      datePrescribed: new Date().toISOString().split('T')[0],
      status: 'active',
      dispensed: false,
    };

    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          return {
            ...p,
            prescriptions: [newRx, ...(p.prescriptions || [])],
          };
        }
        return p;
      })
    );

    addToast({
      type: 'success',
      title: 'Prescription Added',
      message: `${rxData.medicineName} (${rxData.dosage}) sent to pharmacy queue.`,
    });
  };

  // Bed Actions
  const updateBedStatus = (bedId: string, status: Bed['status']) => {
    setBeds((prev) =>
      prev.map((b) => {
        if (b.id === bedId) {
          return { ...b, status };
        }
        return b;
      })
    );
  };

  // Appointment Actions
  const createAppointment = (aptData: Omit<Appointment, 'id'>) => {
    const newApt: Appointment = {
      ...aptData,
      id: `apt-${Date.now()}`,
    };
    setAppointments((prev) => [newApt, ...prev]);
    addToast({
      type: 'success',
      title: 'Appointment Scheduled',
      message: `${newApt.patientName} with ${newApt.doctorName} on ${newApt.date} at ${newApt.time}`,
    });
  };

  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
  };

  // Pharmacy Actions
  const dispensePrescription = (patientId: string, rxId: string, pharmacyItemId?: string) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          return {
            ...p,
            prescriptions: (p.prescriptions || []).map((rx) =>
              rx.id === rxId ? { ...rx, dispensed: true } : rx
            ),
          };
        }
        return p;
      })
    );

    // If an item in stock was specified or matches name, deduct 1 quantity
    if (pharmacyItemId) {
      setPharmacy((prev) =>
        prev.map((item) => {
          if (item.id === pharmacyItemId) {
            const newStock = Math.max(0, item.stock - 1);
            if (newStock <= item.minThreshold) {
              addToast({
                type: 'warning',
                title: 'Low Medication Stock',
                message: `${item.name} has fallen to ${newStock} units (Threshold: ${item.minThreshold}).`,
              });
            }
            return { ...item, stock: newStock };
          }
          return item;
        })
      );
    }

    addToast({
      type: 'success',
      title: 'Medication Dispensed',
      message: 'Prescription marked as dispensed by pharmacy team.',
    });
  };

  const restockMedication = (id: string, quantity: number) => {
    setPharmacy((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStock = item.stock + quantity;
          return { ...item, stock: newStock };
        }
        return item;
      })
    );
    addToast({
      type: 'success',
      title: 'Stock Updated',
      message: `Added +${quantity} units to pharmacy inventory.`,
    });
  };

  const addPharmacyItem = (itemData: Omit<PharmacyItem, 'id'>) => {
    const newItem: PharmacyItem = {
      ...itemData,
      id: `med-${Date.now()}`,
    };
    setPharmacy((prev) => [newItem, ...prev]);
    addToast({
      type: 'success',
      title: 'Formulary Item Added',
      message: `${newItem.name} added to pharmacy inventory.`,
    });
  };

  // Emergency Triage
  const addEmergencyCase = (
    triageData: Omit<EmergencyTriageCase, 'id' | 'arrivalTime' | 'priorityScore'>
  ): EmergencyTriageCase => {
    const priorityScoreMap = { 1: 99, 2: 85, 3: 65, 4: 40, 5: 15 };
    const newCase: EmergencyTriageCase = {
      ...triageData,
      id: `emr-c-${Date.now()}`,
      arrivalTime: 'Just now',
      priorityScore: priorityScoreMap[triageData.esiLevel] || 50,
    };

    setEmergencyCases((prev) => [newCase, ...prev]);
    addToast({
      type: triageData.esiLevel <= 2 ? 'warning' : 'info',
      title: `Emergency Intake - ESI Level ${triageData.esiLevel}`,
      message: `${newCase.patientName}: ${newCase.chiefComplaint.substring(0, 45)}...`,
    });

    return newCase;
  };

  const updateEmergencyStatus = (
    id: string,
    status: EmergencyTriageCase['status'],
    assignedBed?: string
  ) => {
    setEmergencyCases((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status, assignedBed: assignedBed || c.assignedBed } : c))
    );
  };

  // Billing
  const createInvoice: any = (arg1: any, arg2?: any, arg3?: any): Invoice => {
    let newInv: Invoice;
    const count = invoices.length + 84;
    const invoiceNumber = `INV-2026-${String(count).padStart(4, '0')}`;

    if (typeof arg1 === 'string') {
      const patientId = arg1;
      const items = arg2 || [];
      const insuranceCoverPercent = arg3 || 0;
      const patient = patients.find((p) => p.id === patientId);

      const subtotal = items.reduce((acc: number, item: any) => acc + (item.cost * (item.quantity || 1)), 0);
      const insuranceDiscount = (subtotal * insuranceCoverPercent) / 100;
      const tax = (subtotal - insuranceDiscount) * 0.05;
      const total = subtotal - insuranceDiscount + tax;

      newInv = {
        id: `inv-${Date.now()}`,
        invoiceNumber,
        patientId,
        patientName: patient?.name || 'Inpatient Account',
        patientMrn: patient?.mrn || 'MRN-PENDING',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        status: 'pending',
        items,
        subtotal,
        insuranceDiscount,
        tax,
        total,
        paidAmount: 0,
      };
    } else {
      newInv = {
        ...arg1,
        id: `inv-${Date.now()}`,
        invoiceNumber,
      };
    }

    setInvoices((prev) => [newInv, ...prev]);
    addToast({
      type: 'success',
      title: 'Invoice Generated',
      message: `${invoiceNumber} created for ${newInv.patientName} ($${newInv.total.toFixed(2)})`,
    });
    return newInv;
  };

  const recordPayment = (
    invoiceId: string,
    amount: number,
    method: Invoice['paymentMethod']
  ) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          const newPaid = inv.paidAmount + amount;
          const status = newPaid >= inv.total ? 'paid' : 'partially_paid';
          return {
            ...inv,
            paidAmount: newPaid,
            status,
            paymentMethod: method || inv.paymentMethod,
          };
        }
        return inv;
      })
    );
    addToast({
      type: 'success',
      title: 'Payment Processed',
      message: `Recorded payment of $${amount.toFixed(2)}.`,
    });
  };

  const recordInvoicePayment = (invoiceId: string, amount: number, method?: any) => {
    const methodMap: Record<string, Invoice['paymentMethod']> = {
      card: 'Credit Card',
      cash: 'Cash',
      insurance: 'Insurance Direct',
      transfer: 'Wire Transfer',
    };
    recordPayment(invoiceId, amount, methodMap[method] || method || 'Credit Card');
  };

  // --- RWANDA PAYMENT GATEWAY (MTN MoMo, Airtel, Visa/Mastercard, Bank, Cash, Refund) ---
  const initiatePayment = async (params: {
    invoiceId: string;
    amount: number;
    provider: PaymentTransaction['provider'];
    payerPhone?: string;
    notes?: string;
  }): Promise<PaymentTransaction> => {
    const inv = invoices.find((i) => i.id === params.invoiceId);
    const pat = patients.find((p) => p.id === inv?.patientId);
    const txId = `pay-tx-${Date.now()}`;
    const prefix =
      params.provider === 'MTN MoMo'
        ? 'MOMO-250788'
        : params.provider === 'Airtel Money'
        ? 'AIRTEL-RWF'
        : params.provider === 'Visa'
        ? 'VISA-AUTH'
        : params.provider === 'Mastercard'
        ? 'MC-AUTH'
        : 'TX-RWF';
    const txRef = `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;

    const isInstant = params.provider === 'Cash' || params.provider === 'Insurance';
    const initialStatus: PaymentStatus = isInstant ? 'SUCCESS' : 'PROCESSING';

    const newTx: PaymentTransaction = {
      id: txId,
      invoiceId: params.invoiceId,
      invoiceNumber: inv?.invoiceNumber || 'INV-2026-UNKNOWN',
      patientId: inv?.patientId || pat?.id || 'pat-unknown',
      patientName: inv?.patientName || pat?.name || 'Patient',
      amount: params.amount,
      currency: 'RWF',
      provider: params.provider,
      transactionReference: txRef,
      status: initialStatus,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toISOString().split('T')[0],
      verifiedAt: isInstant ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toISOString().split('T')[0] : undefined,
      payerPhone: params.payerPhone || pat?.phone,
      cashierName: 'Aline Umutoni (Cashier 1)',
      notes: params.notes,
      branchId: currentBranchId,
    };

    setPaymentTransactions((prev) => [newTx, ...prev]);

    if (isInstant) {
      recordInvoicePayment(params.invoiceId, params.amount, params.provider);
      postLedgerEntry({
        date: new Date().toISOString().split('T')[0],
        referenceDoc: inv?.invoiceNumber || txRef,
        description: `Payment received via ${params.provider} from ${newTx.patientName}`,
        category: 'Revenue',
        accountName: params.provider === 'Cash' ? 'Cash on Hand (Emergency Cashier)' : 'Accounts Receivable (Insurance Claims)',
        debit: params.amount,
        credit: 0,
        department: 'Revenue & Cashier Office',
        postedBy: 'Aline Umutoni',
        branchId: currentBranchId,
      });
    } else {
      addToast({
        type: 'info',
        title: 'Payment Prompt Sent',
        message: `USSD push initiated for ${params.provider} (${params.amount.toLocaleString()} RWF) to ${params.payerPhone || 'device'}. Waiting for authorization.`,
      });
    }

    logAuditEvent('INITIATE_PAYMENT', 'Payment', `TX: ${txRef} (${params.amount} RWF)`, `Provider: ${params.provider}`, newTx.id);
    return newTx;
  };

  const verifyPayment = async (transactionId: string): Promise<PaymentTransaction> => {
    let updatedTx: PaymentTransaction | undefined;
    setPaymentTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id === transactionId) {
          updatedTx = {
            ...tx,
            status: 'SUCCESS',
            verifiedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toISOString().split('T')[0],
          };
          return updatedTx;
        }
        return tx;
      })
    );

    if (updatedTx) {
      recordInvoicePayment(updatedTx.invoiceId, updatedTx.amount, updatedTx.provider);
      postLedgerEntry({
        date: new Date().toISOString().split('T')[0],
        referenceDoc: updatedTx.invoiceNumber || updatedTx.transactionReference,
        description: `Telco settlement verified: ${updatedTx.provider} Ref ${updatedTx.transactionReference}`,
        category: 'Revenue',
        accountName: `Mobile Money / Card Float (${updatedTx.provider})`,
        debit: updatedTx.amount,
        credit: 0,
        department: 'Revenue & Cashier Office',
        postedBy: 'Aline Umutoni',
        branchId: currentBranchId,
      });
      sendNotification({
        recipientType: 'patient',
        recipientId: updatedTx.patientId,
        recipientName: updatedTx.patientName,
        recipientContact: updatedTx.payerPhone,
        title: 'Inyemezabwishyu / Official Payment Receipt',
        message: `Kuri ${updatedTx.patientName}: Mwishyuye ${updatedTx.amount.toLocaleString()} RWF kuri Fagitire #${updatedTx.invoiceNumber}. Ref: ${updatedTx.transactionReference}. Murakoze!`,
        type: 'billing',
        channel: 'sms',
      });
      addToast({
        type: 'success',
        title: 'Ubwishyu Bwemejwe / Payment Verified',
        message: `Ref: ${updatedTx.transactionReference} confirmed via ${updatedTx.provider} (${updatedTx.amount.toLocaleString()} RWF).`,
      });
      logAuditEvent('VERIFY_PAYMENT', 'Payment', `Verified Ref: ${updatedTx.transactionReference}`, `Amount: ${updatedTx.amount} RWF`, updatedTx.id);
      return updatedTx;
    }
    throw new Error('Transaction not found');
  };

  const recordRefund = async (invoiceOrTransactionId: string, amount: number, reason: string): Promise<PaymentTransaction> => {
    if (!Number.isFinite(amount) || amount <= 0) throw new Error('Refund amount must be greater than 0.');

    const matchedTx = paymentTransactions.find((tx) => tx.id === invoiceOrTransactionId);
    const targetTx = matchedTx
      || paymentTransactions.find((tx) => tx.invoiceId === invoiceOrTransactionId && tx.status === 'SUCCESS')
      || paymentTransactions.find((tx) => tx.invoiceId === invoiceOrTransactionId);

    if (targetTx) {
      const refundedAmount = Math.min(amount, targetTx.amount);
      const refundedTx: PaymentTransaction = {
        ...targetTx,
        status: 'REFUNDED',
        verifiedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toISOString().split('T')[0],
        notes: `${targetTx.notes || ''} [REFUNDED: ${refundedAmount} RWF - Reason: ${reason}]`.trim(),
      };

      setPaymentTransactions((prev) =>
        prev.map((tx) => (tx.id === targetTx.id ? refundedTx : tx))
      );
      setInvoices((prev) =>
        prev.map((inv) => {
          if (inv.id !== refundedTx.invoiceId) return inv;
          const newPaid = Math.max(0, inv.paidAmount - refundedAmount);
          return { ...inv, paidAmount: newPaid, status: newPaid === 0 ? 'pending' : newPaid < inv.total ? 'partially_paid' : inv.status };
        })
      );
      addToast({
        type: 'warning',
        title: 'Amafaranga Yasubijwe / Refund Processed',
        message: `${refundedAmount.toLocaleString()} RWF refunded for ${refundedTx.patientName}. Reason: ${reason}`,
      });
      logAuditEvent('REFUND_PAYMENT', 'Payment', `Refund for ${refundedTx.transactionReference}`, `Amount: ${refundedAmount} RWF, Reason: ${reason}`, refundedTx.id);
      return refundedTx;
    }

    const inv = invoices.find((i) => i.id === invoiceOrTransactionId);
    if (!inv) throw new Error('Invoice or transaction not found for refund.');
    const refundedAmount = Math.min(amount, inv.paidAmount || amount);
    if (refundedAmount <= 0) throw new Error('No paid amount available to refund.');

    const refundTx: PaymentTransaction = {
      id: `refund-${Date.now()}`,
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      patientId: inv.patientId,
      patientName: inv.patientName,
      amount: refundedAmount,
      currency: 'RWF',
      provider: inv.paymentMethod === 'MTN MoMo' || inv.paymentMethod === 'Airtel Money' ? inv.paymentMethod : 'Cash',
      transactionReference: `REFUND-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'REFUNDED',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toISOString().split('T')[0],
      verifiedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toISOString().split('T')[0],
      cashierName: 'Aline Umutoni (Cashier 1)',
      notes: `[INVOICE REFUND] ${reason}`,
      branchId: currentBranchId,
    };

    setPaymentTransactions((prev) => [refundTx, ...prev]);
    setInvoices((prev) =>
      prev.map((item) => {
        if (item.id !== inv.id) return item;
        const newPaid = Math.max(0, item.paidAmount - refundedAmount);
        return { ...item, paidAmount: newPaid, status: newPaid === 0 ? 'pending' : newPaid < item.total ? 'partially_paid' : item.status };
      })
    );
    addToast({
      type: 'warning',
      title: 'Amafaranga Yasubijwe / Refund Processed',
      message: `${refundedAmount.toLocaleString()} RWF refund recorded for ${inv.patientName}. Reason: ${reason}`,
    });
    logAuditEvent('REFUND_PAYMENT', 'Payment', `Refund for invoice ${inv.invoiceNumber}`, `Amount: ${refundedAmount} RWF, Reason: ${reason}`, refundTx.id);
    return refundTx;
  };

  // --- SURGERY & OPERATING THEATRE (OT) ---
  const scheduleSurgery = (data: Omit<SurgeryRecord, 'id' | 'status' | 'billed'>): SurgeryRecord => {
    const newSurgery: SurgeryRecord = {
      ...data,
      id: `surg-${Date.now()}`,
      status: 'scheduled',
      billed: false,
    };
    setSurgeries((prev) => [newSurgery, ...prev]);
    addToast({
      type: 'success',
      title: 'Surgery Scheduled',
      message: `${newSurgery.procedureName} booked in ${newSurgery.operatingRoom}`,
    });
    logAuditEvent('SCHEDULE_SURGERY', 'Clinical', newSurgery.procedureName, `Lead Surgeon: ${newSurgery.leadSurgeon}`, newSurgery.id);
    return newSurgery;
  };

  const updateSurgeryStatus = (id: string, status: SurgeryStatus, notes?: string) => {
    setSurgeries((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          return {
            ...s,
            status,
            postOpNotes: notes || s.postOpNotes,
          };
        }
        return s;
      })
    );
    addToast({
      type: status === 'completed' ? 'success' : 'info',
      title: 'Surgery Status Updated',
      message: `Operating Theatre record updated to: ${status}`,
    });
  };

  const billSurgery = (id: string): Invoice => {
    const surg = surgeries.find((s) => s.id === id);
    if (!surg) throw new Error('Surgery not found');
    const pat = patients.find((p) => p.id === surg.patientId);

    const cost = surg.estimatedCost || 250000;
    const insuranceDiscount = cost * 0.85; // 85% covered by standard RSSB/RAMA
    const total = cost - insuranceDiscount;

    const newInv: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-2026-${String(invoices.length + 95).padStart(4, '0')}`,
      patientId: surg.patientId,
      patientName: surg.patientName,
      patientMrn: surg.patientMrn,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: 'pending',
      items: [
        {
          id: `item-surg-${Date.now()}`,
          description: `Operating Theatre: ${surg.procedureName} (${surg.operatingRoom})`,
          category: 'procedure',
          cost,
          quantity: 1,
        },
      ],
      subtotal: cost,
      insuranceDiscount,
      tax: 0,
      total,
      paidAmount: 0,
      branchId: surg.branchId,
    };

    setInvoices((prev) => [newInv, ...prev]);
    setSurgeries((prev) => prev.map((s) => (s.id === id ? { ...s, billed: true } : s)));
    addToast({
      type: 'success',
      title: 'Surgery Billed to Patient Invoice',
      message: `Generated invoice #${newInv.invoiceNumber} for ${surg.patientName}`,
    });
    return newInv;
  };

  // --- MATERNITY & NEONATAL (NICU) ---
  const registerMaternityAdmission = (data: Omit<MaternityRecord, 'id' | 'newborns'>): MaternityRecord => {
    const newRecord: MaternityRecord = {
      ...data,
      id: `mat-${Date.now()}`,
      newborns: [],
    };
    setMaternityRecords((prev) => [newRecord, ...prev]);
    addToast({
      type: 'success',
      title: 'Maternity Admission Recorded',
      message: `${newRecord.motherName} admitted to Labour & Delivery ward`,
    });
    logAuditEvent('MATERNITY_ADMISSION', 'Clinical', newRecord.motherName, `G${newRecord.gravida}P${newRecord.para}, ${newRecord.gestationalAgeWeeks} weeks`, newRecord.id);
    return newRecord;
  };

  const recordDelivery = (id: string, deliveryData: Partial<MaternityRecord>, newborn: NewbornRecord) => {
    setMaternityRecords((prev) =>
      prev.map((rec) => {
        if (rec.id === id) {
          return {
            ...rec,
            ...deliveryData,
            labourStage: 'Postpartum',
            deliveryDate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toISOString().split('T')[0],
            newborns: [...rec.newborns, newborn],
          };
        }
        return rec;
      })
    );
    addToast({
      type: 'success',
      title: 'Live Birth Recorded',
      message: `${newborn.gender} infant delivered (${newborn.birthWeightKg}kg, APGAR ${newborn.apgar1Min}/${newborn.apgar5Min})`,
    });
    logAuditEvent('RECORD_DELIVERY', 'Clinical', `Birth: ${newborn.gender}`, `Weight: ${newborn.birthWeightKg}kg, Status: ${newborn.status}`, newborn.babyId);
  };

  const updateLabourStage = (id: string, stage: MaternityRecord['labourStage'], vitals?: { dilation?: number; fhr?: number }) => {
    setMaternityRecords((prev) =>
      prev.map((rec) => {
        if (rec.id === id) {
          return {
            ...rec,
            labourStage: stage,
            cervicalDilationCm: vitals?.dilation !== undefined ? vitals.dilation : rec.cervicalDilationCm,
            fetalHeartRateBpm: vitals?.fhr !== undefined ? vitals.fhr : rec.fetalHeartRateBpm,
          };
        }
        return rec;
      })
    );
  };

  // --- DENTAL MEDICINE ---
  const recordDentalExamination = (data: Omit<DentalRecord, 'id' | 'billed'>): DentalRecord => {
    const newRecord: DentalRecord = {
      ...data,
      id: `dent-${Date.now()}`,
      billed: false,
    };
    setDentalRecords((prev) => [newRecord, ...prev]);
    addToast({
      type: 'success',
      title: 'Dental Chart Updated',
      message: `Tooth #${newRecord.toothNumber} documented: ${newRecord.condition}`,
    });
    logAuditEvent('DENTAL_EXAMINATION', 'Clinical', `Tooth #${newRecord.toothNumber || 'All'} (${newRecord.patientName})`, newRecord.condition || 'Examined', newRecord.id);
    return newRecord;
  };

  const billDentalProcedure = (recordId: string): Invoice => {
    const record = dentalRecords.find((d) => d.id === recordId);
    if (!record) throw new Error('Dental record not found');
    const pat = patients.find((p) => p.id === record.patientId);

    const cost = record.cost || 25000;
    const insuranceDiscount = cost * 0.85;
    const total = cost - insuranceDiscount;

    const newInv: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-2026-${String(invoices.length + 96).padStart(4, '0')}`,
      patientId: record.patientId,
      patientName: record.patientName,
      patientMrn: record.patientMrn,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: 'pending',
      items: [
        {
          id: `item-dent-${Date.now()}`,
          description: `Dental Care: Tooth #${record.toothNumber} (${record.procedureDone || record.treatmentPlan})`,
          category: 'procedure',
          cost,
          quantity: 1,
        },
      ],
      subtotal: cost,
      insuranceDiscount,
      tax: 0,
      total,
      paidAmount: 0,
      branchId: record.branchId,
    };

    setInvoices((prev) => [newInv, ...prev]);
    setDentalRecords((prev) => prev.map((d) => (d.id === recordId ? { ...d, billed: true } : d)));
    addToast({
      type: 'success',
      title: 'Dental Procedure Billed',
      message: `Invoice #${newInv.invoiceNumber} created (${total.toLocaleString()} RWF)`,
    });
    return newInv;
  };

  // --- PROCUREMENT & SUPPLY CHAIN ---
  const createPurchaseOrder = (poData: any): PurchaseOrder => {
    const poNumber = `PO-2026-${String(purchaseOrders.length + 86).padStart(5, '0')}`;
    const items = poData.items || [];
    const subtotal = poData.subtotal !== undefined ? poData.subtotal : items.reduce((acc: number, it: any) => acc + (it.totalPrice || it.unitPrice * it.quantityOrdered || 0), 0);
    const tax = poData.tax !== undefined ? poData.tax : Math.round(subtotal * 0.18);
    const total = poData.total !== undefined ? poData.total : (subtotal + tax);
    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber,
      status: 'Approved',
      requestDate: poData.requestDate || new Date().toISOString().split('T')[0],
      expectedDelivery: poData.expectedDelivery || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      requestedBy: poData.requestedBy || 'Dr. Christian Hakizimana',
      subtotal,
      tax,
      total,
      ...poData,
    };
    setPurchaseOrders((prev) => [newPO, ...prev]);
    addToast({
      type: 'success',
      title: 'Purchase Order Issued',
      message: `${poNumber} generated for ${newPO.supplierName} (${newPO.total.toLocaleString()} RWF)`,
    });
    logAuditEvent('CREATE_PO', 'Inventory', poNumber, `Supplier: ${newPO.supplierName}, Total: ${newPO.total} RWF`, newPO.id);
    return newPO;
  };

  const receiveGoodsPO = (poId: string, grnNumber?: string) => {
    const actualGrn = grnNumber || `GRN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    let completedPO: PurchaseOrder | undefined;
    setPurchaseOrders((prev) =>
      prev.map((po) => {
        if (po.id === poId) {
          completedPO = {
            ...po,
            status: 'Goods Received',
            grnNumber: actualGrn,
            receivedDate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toISOString().split('T')[0],
            items: po.items.map((it) => ({ ...it, quantityReceived: it.quantityOrdered })),
          };
          return completedPO;
        }
        return po;
      })
    );

    if (completedPO) {
      // Auto-post General Ledger entry for inventory recognition
      postLedgerEntry({
        date: new Date().toISOString().split('T')[0],
        referenceDoc: completedPO.poNumber,
        description: `Goods Received Note: ${grnNumber} from ${completedPO.supplierName}`,
        category: 'Asset',
        accountName: 'Medical & Surgical Supplies Inventory',
        debit: completedPO.total,
        credit: 0,
        department: completedPO.department || 'Central Warehouse',
        postedBy: 'Procurement Officer',
        branchId: currentBranchId,
      });
      addToast({
        type: 'success',
        title: 'Goods Received (GRN Filed)',
        message: `${completedPO.poNumber} marked received. Inventory updated.`,
      });
    }
  };

  const transferStockToDepartment = (itemId: string, quantity: number, targetDept: string) => {
    setCentralInventory((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newStock = Math.max(0, item.currentStock - quantity);
          return { ...item, currentStock: newStock };
        }
        return item;
      })
    );
    addToast({
      type: 'info',
      title: 'Stock Dispatched',
      message: `Transferred ${quantity} units to ${targetDept}`,
    });
  };

  // --- ACCOUNTING & GENERAL LEDGER ---
  const postLedgerEntry = (entry: Omit<GeneralLedgerEntry, 'id' | 'entryNumber'>): GeneralLedgerEntry => {
    const entryNumber = `GL-2026-${String(ledgerEntries.length + 146).padStart(5, '0')}`;
    const newEntry: GeneralLedgerEntry = {
      ...entry,
      id: `gl-${Date.now()}`,
      entryNumber,
    };
    setLedgerEntries((prev) => [newEntry, ...prev]);
    return newEntry;
  };

  const recordExpense = (expenseData: Omit<ExpenseRecord, 'id' | 'expenseNumber'>): ExpenseRecord => {
    const expenseNumber = `EXP-2026-${String(expenses.length + 41).padStart(4, '0')}`;
    const newExp: ExpenseRecord = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      expenseNumber,
    };
    setExpenses((prev) => [newExp, ...prev]);
    postLedgerEntry({
      date: newExp.date,
      referenceDoc: expenseNumber,
      description: `${newExp.category} paid to ${newExp.payee}`,
      category: 'Expense',
      accountName: `Operating Expenses (${newExp.category})`,
      debit: newExp.amount,
      credit: 0,
      department: 'Finance & Administration',
      postedBy: newExp.approvedBy,
      branchId: newExp.branchId,
    });
    addToast({
      type: 'info',
      title: 'Expense Recorded & Ledger Posted',
      message: `${expenseNumber}: ${newExp.amount.toLocaleString()} RWF for ${newExp.payee}`,
    });
    logAuditEvent('RECORD_EXPENSE', 'System', expenseNumber, `Amount: ${newExp.amount} RWF, Category: ${newExp.category}`, newExp.id);
    return newExp;
  };

  // Doctor status
  const updateDoctorStatus = (doctorId: string, status: Doctor['status']) => {
    setDoctors((prev) =>
      prev.map((d) => (d.id === doctorId ? { ...d, status } : d))
    );
  };

  const toggleDoctorStatus = (doctorId: string) => {
    setDoctors((prev) =>
      prev.map((d) => {
        if (d.id === doctorId) {
          const nextStatus: Record<Doctor['status'], Doctor['status']> = {
            on_duty: 'on_call',
            on_call: 'off_duty',
            off_duty: 'on_duty',
          };
          return { ...d, status: nextStatus[d.status] };
        }
        return d;
      })
    );
  };

  // --- AUDIT LOGGING ---
  const logAuditEvent = (
    actionOrPayload: string | { action: string; targetType?: any; targetName?: string; details?: string; user?: string; targetId?: string },
    targetType?: any,
    targetName?: string,
    details?: string,
    targetId?: string
  ) => {
    const act = typeof actionOrPayload === 'string' ? actionOrPayload : actionOrPayload.action;
    const tType = typeof actionOrPayload === 'string' ? (targetType || 'Security') : (actionOrPayload.targetType || 'Security');
    const tName = typeof actionOrPayload === 'string' ? (targetName || 'System') : (actionOrPayload.targetName || actionOrPayload.user || 'System');
    const det = typeof actionOrPayload === 'string' ? (details || '') : (actionOrPayload.details || '');
    const tId = typeof actionOrPayload === 'string' ? targetId : actionOrPayload.targetId;
    const actor = typeof actionOrPayload === 'object' && actionOrPayload.user ? actionOrPayload.user : (currentRole === 'super_admin' ? 'Super Administrator' : `${currentRole.toUpperCase()} Officer`);

    const newEntry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      actorId: 'user-active',
      actorName: actor,
      actorRole: currentRole,
      action: act,
      targetType: tType,
      targetId: tId,
      targetName: tName,
      details: det,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toISOString().split('T')[0],
      branchId: currentBranchId,
    };
    setAuditLogs((prev) => [newEntry, ...prev.slice(0, 299)]);
  };

  // --- NOTIFICATIONS & SMS/EMAIL ---
  const sendNotification = (notificationData: Omit<SystemNotification, 'id' | 'sentAt' | 'isRead' | 'status'>) => {
    const newNotif: SystemNotification = {
      ...notificationData,
      id: `notif-${Date.now()}`,
      sentAt: 'Just now',
      isRead: false,
      status: 'delivered',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    if (notificationData.channel === 'sms') {
      addToast({
        type: 'info',
        title: `SMS Sent (${notificationData.recipientContact || 'Patient'})`,
        message: notificationData.message,
      });
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // --- LABORATORY MANAGEMENT ---
  const createLabOrder = (orderData: Omit<LabOrder, 'id' | 'orderNumber' | 'orderedDate' | 'sampleStatus'>) => {
    const orderNumber = `LAB-2026-${String(labOrders.length + 896).padStart(4, '0')}`;
    const newOrder: LabOrder = {
      ...orderData,
      id: `lab-${Date.now()}`,
      orderNumber,
      orderedDate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toISOString().split('T')[0],
      sampleStatus: 'Ordered',
    };
    setLabOrders((prev) => [newOrder, ...prev]);

    // Automatic Laboratory -> Billing Integration: Generate patient invoice charge
    const labFee = 25000;
    setInvoices((prev) => {
      const existing = prev.find((i) => i.patientId === newOrder.patientId && i.status !== 'paid');
      if (existing) {
        const newItem = {
          id: `item-lab-${Date.now()}`,
          description: `Laboratory Diagnostic: ${newOrder.testName} (${newOrder.sampleType})`,
          category: 'lab' as const,
          cost: labFee,
          quantity: 1,
        };
        const updatedItems = [...existing.items, newItem];
        const subtotal = updatedItems.reduce((acc, it) => acc + it.cost * it.quantity, 0);
        const insuranceDiscount = subtotal * 0.85;
        const total = subtotal - insuranceDiscount;
        return prev.map((i) => (i.id === existing.id ? { ...i, items: updatedItems, subtotal, insuranceDiscount, total } : i));
      } else {
        const autoInv: Invoice = {
          id: `inv-${Date.now()}`,
          invoiceNumber: `INV-2026-${String(prev.length + 85).padStart(4, '0')}`,
          patientId: newOrder.patientId,
          patientName: newOrder.patientName,
          patientMrn: newOrder.patientMrn,
          date: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
          status: 'pending',
          items: [
            {
              id: `item-lab-${Date.now()}`,
              description: `Laboratory Diagnostic: ${newOrder.testName}`,
              category: 'lab',
              cost: labFee,
              quantity: 1,
            },
          ],
          subtotal: labFee,
          insuranceDiscount: labFee * 0.85,
          tax: 0,
          total: labFee * 0.15,
          paidAmount: 0,
          branchId: currentBranchId,
        };
        return [autoInv, ...prev];
      }
    });

    logAuditEvent('CREATE_LAB_ORDER', 'Lab', `${newOrder.testName} (${newOrder.patientName})`, `Ordered by ${newOrder.doctorName}`, newOrder.id);
    addToast({
      type: 'success',
      title: 'Lab Order Placed & Billed',
      message: `${newOrder.testName} ordered for ${newOrder.patientName} (Copay billed)`,
    });
    return newOrder;
  };

  const updateSampleStatus = (orderId: string, status: SampleStatus) => {
    setLabOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const updated = { ...order, sampleStatus: status };
          if (status === 'Sample Collected') {
            updated.sampleCollectedDate = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          } else if (status === 'Completed' || status === 'Approved') {
            updated.completedDate = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }
          return updated;
        }
        return order;
      })
    );
    logAuditEvent('UPDATE_SAMPLE_STATUS', 'Lab', `Order #${orderId}`, `Sample status updated to ${status}`, orderId);
  };

  const enterLabResults = (orderId: string, results: LabResultItem[], isCritical?: boolean) => {
    setLabOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            results,
            isCritical: isCritical ?? results.some((r) => r.status === 'critical'),
            sampleStatus: 'Completed',
            completedDate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
        }
        return order;
      })
    );

    const targetOrder = labOrders.find((o) => o.id === orderId);
    if (targetOrder) {
      if (isCritical || results.some((r) => r.status === 'critical')) {
        sendNotification({
          recipientType: 'staff',
          title: `CRITICAL LAB RESULT: ${targetOrder.testName}`,
          message: `Critical findings recorded for ${targetOrder.patientName} (${targetOrder.patientMrn}). Immediate review needed.`,
          type: 'lab',
          channel: 'in_app',
        });
      }
    }
    logAuditEvent('ENTER_LAB_RESULTS', 'Lab', `Results for #${orderId}`, `Metrics recorded: ${results.length} tests`, orderId);
  };

  const approveLabResult = (orderId: string, doctorName: string, notes?: string) => {
    let orderToNotify: LabOrder | undefined;
    setLabOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          orderToNotify = order;
          return {
            ...order,
            sampleStatus: 'Approved',
            doctorApproval: {
              approvedBy: doctorName,
              approvedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toISOString().split('T')[0],
              notes: notes || 'Results reviewed and clinically correlated.',
            },
          };
        }
        return order;
      })
    );

    if (orderToNotify) {
      // Automatic patient notification
      sendNotification({
        recipientType: 'patient',
        recipientId: orderToNotify.patientId,
        recipientName: orderToNotify.patientName,
        title: 'Lab Results Approved',
        message: `Ibisubizo bya laboratwari (${orderToNotify.testName}) byemejwe na muganga. Ubu biraboneka muri Patient Portal.`,
        type: 'lab',
        channel: 'sms',
      });
    }

    logAuditEvent('APPROVE_LAB_RESULT', 'Lab', `Approved Order #${orderId}`, `Approved by ${doctorName}`, orderId);
    addToast({
      type: 'success',
      title: 'Lab Results Approved',
      message: `Results verified by ${doctorName} and dispatched to patient chart.`,
    });
  };

  // --- RADIOLOGY & IMAGING ---
  const createRadiologyOrder = (orderData: Omit<RadiologyOrder, 'id' | 'orderNumber' | 'requestedDate' | 'status'>) => {
    const orderNumber = `RAD-2026-${String(radiologyOrders.length + 316).padStart(4, '0')}`;
    const newOrder: RadiologyOrder = {
      ...orderData,
      id: `rad-${Date.now()}`,
      orderNumber,
      requestedDate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toISOString().split('T')[0],
      status: 'Requested',
    };
    setRadiologyOrders((prev) => [newOrder, ...prev]);
    logAuditEvent('CREATE_RADIOLOGY_ORDER', 'Radiology', `${newOrder.modality} - ${newOrder.bodyPart}`, `Patient: ${newOrder.patientName}`, newOrder.id);
    addToast({
      type: 'success',
      title: 'Imaging Study Requested',
      message: `${newOrder.modality} (${newOrder.bodyPart}) ordered for ${newOrder.patientName}`,
    });
    return newOrder;
  };

  const updateRadiologyStatus = (orderId: string, status: RadiologyOrder['status']) => {
    setRadiologyOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status } : order))
    );
    logAuditEvent('UPDATE_RADIOLOGY_STATUS', 'Radiology', `Imaging #${orderId}`, `Status changed to ${status}`, orderId);
  };

  const submitRadiologyReport = (
    orderId: string,
    report: { radiologistName: string; findings: string; impression: string; recommendations?: string }
  ) => {
    setRadiologyOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            ...report,
            status: 'Reported',
            completedDate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toISOString().split('T')[0],
          };
        }
        return order;
      })
    );
    logAuditEvent('SUBMIT_RADIOLOGY_REPORT', 'Radiology', `Report for #${orderId}`, `Signed by ${report.radiologistName}`, orderId);
    addToast({
      type: 'success',
      title: 'Radiology Report Signed',
      message: `Diagnostic report filed by ${report.radiologistName}`,
    });
  };

  // --- BLOOD BANK MANAGEMENT ---
  const addBloodDonation = (donationData: Omit<BloodDonation, 'id' | 'status'>) => {
    const newDonation: BloodDonation = {
      ...donationData,
      id: `don-${Date.now()}`,
      status: 'available',
    };
    setBloodDonations((prev) => [newDonation, ...prev]);

    // Increase blood inventory
    setBloodInventory((prev) =>
      prev.map((inv) =>
        inv.bloodGroup === donationData.bloodGroup
          ? { ...inv, unitsAvailable: inv.unitsAvailable + donationData.units }
          : inv
      )
    );

    logAuditEvent('DONATION_RECEIVED', 'BloodBank', `${donationData.bloodGroup} (${donationData.units} Units)`, `Donor: ${donationData.donorName}`, newDonation.id);
    addToast({
      type: 'success',
      title: 'Blood Donation Logged',
      message: `Received ${donationData.units} unit(s) of ${donationData.bloodGroup} from ${donationData.donorName}.`,
    });
  };

  const issueBloodUnits = (issueData: Omit<BloodIssueRecord, 'id' | 'issuedAt'>): boolean => {
    const inv = bloodInventory.find((b) => b.bloodGroup === issueData.bloodGroup);
    if (!inv || inv.unitsAvailable < issueData.units) {
      addToast({
        type: 'error',
        title: 'Insufficient Blood Stock',
        message: `Only ${inv?.unitsAvailable || 0} unit(s) of ${issueData.bloodGroup} available. Need ${issueData.units}.`,
      });
      return false;
    }

    const newIssue: BloodIssueRecord = {
      ...issueData,
      id: `iss-${Date.now()}`,
      issuedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toISOString().split('T')[0],
    };

    setBloodIssues((prev) => [newIssue, ...prev]);
    setBloodInventory((prev) =>
      prev.map((item) =>
        item.bloodGroup === issueData.bloodGroup
          ? { ...item, unitsAvailable: item.unitsAvailable - issueData.units }
          : item
      )
    );

    logAuditEvent('BLOOD_ISSUED', 'BloodBank', `${issueData.bloodGroup} (${issueData.units} units)`, `Issued to ${issueData.patientName}`, newIssue.id);
    addToast({
      type: 'success',
      title: 'Blood Issued Successfully',
      message: `${issueData.units} units of ${issueData.bloodGroup} dispatched for ${issueData.patientName}. Crossmatch: ${issueData.crossmatchStatus}`,
    });
    return true;
  };

  const requestEmergencyBlood = (bloodGroup: BloodGroup, units: number, patientName: string, doctorName: string) => {
    sendNotification({
      recipientType: 'staff',
      title: `EMERGENCY STAT: ${bloodGroup} Blood Request`,
      message: `STAT request for ${units} unit(s) of ${bloodGroup} for ${patientName} by ${doctorName}. Immediate crossmatch requested.`,
      type: 'emergency',
      channel: 'in_app',
    });
    logAuditEvent('EMERGENCY_BLOOD_REQUEST', 'BloodBank', `STAT ${bloodGroup} x${units}`, `Requested by ${doctorName} for ${patientName}`);
    addToast({
      type: 'warning',
      title: 'Emergency Blood Request Broadcasted',
      message: `Code Red broadcasted to Blood Bank Laboratory.`,
    });
  };

  // --- AMBULANCE & FLEET MANAGEMENT ---
  const registerAmbulance = (ambulanceData: Omit<Ambulance, 'id'>) => {
    const newAmbulance: Ambulance = {
      ...ambulanceData,
      id: `amb-${Date.now()}`,
    };
    setAmbulances((prev) => [newAmbulance, ...prev]);
    logAuditEvent('REGISTER_AMBULANCE', 'Ambulance', newAmbulance.vehicleNumber, `Model: ${newAmbulance.model}`, newAmbulance.id);
    addToast({
      type: 'success',
      title: 'Ambulance Registered',
      message: `Vehicle ${newAmbulance.vehicleNumber} added to hospital fleet.`,
    });
  };

  const updateAmbulanceStatus = (ambulanceId: string, status: Ambulance['currentStatus'], location?: string) => {
    setAmbulances((prev) =>
      prev.map((amb) =>
        amb.id === ambulanceId
          ? { ...amb, currentStatus: status, ...(location ? { currentLocation: location } : {}) }
          : amb
      )
    );
    logAuditEvent('AMBULANCE_STATUS_UPDATE', 'Ambulance', `Unit #${ambulanceId}`, `Status changed to ${status}`, ambulanceId);
  };

  const dispatchAmbulance = (dispatchData: Omit<AmbulanceDispatch, 'id' | 'dispatchedAt' | 'status'>) => {
    const newDispatch: AmbulanceDispatch = {
      ...dispatchData,
      id: `disp-${Date.now()}`,
      dispatchedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'dispatched',
    };
    setDispatches((prev) => [newDispatch, ...prev]);

    // Update vehicle status
    updateAmbulanceStatus(dispatchData.ambulanceId, 'Dispatched', `En route to ${dispatchData.pickupLocation}`);

    sendNotification({
      recipientType: 'staff',
      title: `Ambulance Dispatched: ${dispatchData.vehicleNumber}`,
      message: `Unit assigned to ${dispatchData.patientName} at ${dispatchData.pickupLocation}. Urgency: ${dispatchData.urgency}.`,
      type: 'emergency',
      channel: 'in_app',
    });

    logAuditEvent('AMBULANCE_DISPATCH', 'Ambulance', dispatchData.vehicleNumber, `Destination: ${dispatchData.destinationHospital}`, newDispatch.id);
    addToast({
      type: 'warning',
      title: 'Ambulance Dispatched',
      message: `Unit ${dispatchData.vehicleNumber} dispatched to ${dispatchData.pickupLocation}. ETA: ${dispatchData.estimatedArrivalMinutes}m.`,
    });
  };

  const updateDispatchStatus = (dispatchId: string, status: AmbulanceDispatch['status']) => {
    setDispatches((prev) =>
      prev.map((d) => (d.id === dispatchId ? { ...d, status } : d))
    );
    const dispatch = dispatches.find((d) => d.id === dispatchId);
    if (dispatch && status === 'completed') {
      updateAmbulanceStatus(dispatch.ambulanceId, 'Available', `${dispatch.destinationHospital} Bay`);
    }
  };

  // --- INSURANCE MANAGEMENT ---
  const createInsuranceClaim = (claimData: Omit<InsuranceClaim, 'id' | 'claimNumber' | 'submissionDate' | 'status'>) => {
    const claimNumber = `CLM-2026-${String(insuranceClaims.length + 44).padStart(4, '0')}`;
    const newClaim: InsuranceClaim = {
      ...claimData,
      id: `clm-${Date.now()}`,
      claimNumber,
      submissionDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
    };
    setInsuranceClaims((prev) => [newClaim, ...prev]);
    logAuditEvent('SUBMIT_INSURANCE_CLAIM', 'Insurance', `${claimNumber} (${claimData.patientName})`, `Provider: ${claimData.insuranceProvider}`, newClaim.id);
    addToast({
      type: 'success',
      title: 'Insurance Claim Filed',
      message: `${claimNumber} submitted for $${claimData.claimedAmount.toFixed(2)}`,
    });
    return newClaim;
  };

  const adjudicateInsuranceClaim = (
    claimId: string,
    status: 'Approved' | 'Rejected',
    approvalCode?: string,
    rejectionReason?: string
  ) => {
    setInsuranceClaims((prev) =>
      prev.map((claim) => {
        if (claim.id === claimId) {
          return {
            ...claim,
            status,
            approvalCode: approvalCode || (status === 'Approved' ? `AUTH-RSSB-${Math.floor(Math.random() * 900000 + 100000)}` : undefined),
            rejectionReason,
            adjudicatedDate: new Date().toISOString().split('T')[0],
          };
        }
        return claim;
      })
    );
    logAuditEvent('ADJUDICATE_CLAIM', 'Insurance', `Claim #${claimId}`, `Adjudicated as ${status}`, claimId);
    addToast({
      type: status === 'Approved' ? 'success' : 'error',
      title: `Claim ${status}`,
      message: `Insurance adjudication finalized for claim #${claimId}.`,
    });
  };

  // --- BACKUP & DISASTER RECOVERY ---
  const exportSystemBackup = (): string => {
    const backupSnapshot = {
      version: '2.5.0',
      exportedAt: new Date().toISOString(),
      currentBranchId,
      patients,
      doctors,
      beds,
      pharmacy,
      appointments,
      invoices,
      emergencyCases,
      labOrders,
      radiologyOrders,
      bloodInventory,
      bloodDonations,
      bloodIssues,
      ambulances,
      dispatches,
      insuranceClaims,
      notifications,
      auditLogs,
    };
    logAuditEvent('DATABASE_BACKUP_SNAPSHOT', 'System', 'Full System JSON Backup', 'Manual backup downloaded by admin');
    return JSON.stringify(backupSnapshot, null, 2);
  };

  const restoreSystemBackup = (jsonContent: string): boolean => {
    try {
      const data = JSON.parse(jsonContent);
      if (!data.patients || !data.doctors) {
        throw new Error('Invalid backup schema');
      }
      if (data.patients) setPatients(data.patients);
      if (data.doctors) setDoctors(data.doctors);
      if (data.beds) setBeds(data.beds);
      if (data.pharmacy) setPharmacy(data.pharmacy);
      if (data.appointments) setAppointments(data.appointments);
      if (data.invoices) setInvoices(data.invoices);
      if (data.emergencyCases) setEmergencyCases(data.emergencyCases);
      if (data.labOrders) setLabOrders(data.labOrders);
      if (data.radiologyOrders) setRadiologyOrders(data.radiologyOrders);
      if (data.bloodInventory) setBloodInventory(data.bloodInventory);
      if (data.bloodDonations) setBloodDonations(data.bloodDonations);
      if (data.bloodIssues) setBloodIssues(data.bloodIssues);
      if (data.ambulances) setAmbulances(data.ambulances);
      if (data.dispatches) setDispatches(data.dispatches);
      if (data.insuranceClaims) setInsuranceClaims(data.insuranceClaims);
      if (data.notifications) setNotifications(data.notifications);

      logAuditEvent('DATABASE_RESTORE', 'System', 'Backup Restored', `Restored from version ${data.version || 'unknown'}`);
      addToast({
        type: 'success',
        title: 'System Restored',
        message: 'Enterprise hospital records restored successfully from backup file.',
      });
      return true;
    } catch {
      addToast({
        type: 'error',
        title: 'Restore Failed',
        message: 'Failed to parse backup JSON. Please verify file integrity.',
      });
      return false;
    }
  };

  // Reset
  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEYS.PATIENTS);
    localStorage.removeItem(STORAGE_KEYS.DOCTORS);
    localStorage.removeItem(STORAGE_KEYS.BEDS);
    localStorage.removeItem(STORAGE_KEYS.PHARMACY);
    localStorage.removeItem(STORAGE_KEYS.APPOINTMENTS);
    localStorage.removeItem(STORAGE_KEYS.INVOICES);
    localStorage.removeItem(STORAGE_KEYS.EMERGENCY);
    localStorage.removeItem(STORAGE_KEYS.LAB);
    localStorage.removeItem(STORAGE_KEYS.RADIOLOGY);
    localStorage.removeItem(STORAGE_KEYS.BLOOD_INVENTORY);
    localStorage.removeItem(STORAGE_KEYS.BLOOD_DONATIONS);
    localStorage.removeItem(STORAGE_KEYS.BLOOD_ISSUES);
    localStorage.removeItem(STORAGE_KEYS.AMBULANCES);
    localStorage.removeItem(STORAGE_KEYS.DISPATCHES);
    localStorage.removeItem(STORAGE_KEYS.INSURANCE_CLAIMS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT);
    localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
    localStorage.removeItem(STORAGE_KEYS.SURGERIES);
    localStorage.removeItem(STORAGE_KEYS.MATERNITY);
    localStorage.removeItem(STORAGE_KEYS.DENTAL);
    localStorage.removeItem(STORAGE_KEYS.SUPPLIERS);
    localStorage.removeItem(STORAGE_KEYS.PURCHASE_ORDERS);
    localStorage.removeItem(STORAGE_KEYS.CENTRAL_INVENTORY);
    localStorage.removeItem(STORAGE_KEYS.LEDGER);
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);

    setPatients(INITIAL_PATIENTS);
    setDoctors(INITIAL_DOCTORS);
    setBeds(INITIAL_BEDS);
    setPharmacy(INITIAL_PHARMACY);
    setAppointments(INITIAL_APPOINTMENTS);
    setInvoices(INITIAL_INVOICES);
    setEmergencyCases(INITIAL_EMERGENCY_CASES);
    setLabOrders(INITIAL_LAB_ORDERS);
    setRadiologyOrders(INITIAL_RADIOLOGY_ORDERS);
    setBloodInventory(INITIAL_BLOOD_INVENTORY);
    setBloodDonations(INITIAL_BLOOD_DONATIONS);
    setBloodIssues(INITIAL_BLOOD_ISSUES);
    setAmbulances(INITIAL_AMBULANCES);
    setDispatches(INITIAL_DISPATCHES);
    setInsuranceClaims(INITIAL_INSURANCE_CLAIMS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setPaymentTransactions(INITIAL_PAYMENT_TRANSACTIONS);
    setSurgeries(INITIAL_SURGERIES);
    setMaternityRecords(INITIAL_MATERNITY_RECORDS);
    setDentalRecords(INITIAL_DENTAL_RECORDS);
    setSuppliers(INITIAL_SUPPLIERS);
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    setCentralInventory(INITIAL_CENTRAL_INVENTORY);
    setLedgerEntries(INITIAL_LEDGER_ENTRIES);
    setExpenses(INITIAL_EXPENSES);
    setNationalPatients(INITIAL_NATIONAL_PATIENTS);
    setPatientReferrals(INITIAL_PATIENT_REFERRALS);
    setPatientConsents(INITIAL_PATIENT_CONSENTS);
    setAccessAuditLogs(INITIAL_ACCESS_AUDIT_LOGS);

    addToast({
      type: 'info',
      title: 'Database Reset',
      message: 'All enterprise hospital modules restored to default sample data.',
    });
  };

  // Sync Rwanda National Data to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NATIONAL_PATIENTS, JSON.stringify(nationalPatients));
  }, [nationalPatients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REFERRALS, JSON.stringify(patientReferrals));
  }, [patientReferrals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONSENTS, JSON.stringify(patientConsents));
  }, [patientConsents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_AUDIT, JSON.stringify(accessAuditLogs));
  }, [accessAuditLogs]);

  // Methods for Rwanda National Identity & Insurance Verification
  const ubuzimaAvailable = async () => {
    try { const r = await fetch('/api/v1/health'); if (!r.ok) return false; const d = await r.json(); return Boolean(d?.db?.configured && d?.db?.ok); } catch { return false; }
  };
  const verifyNationalPatientNIN = async (nin: string, reason?: string): Promise<NationalPatient | null> => {
    try {
      const activeDoc = doctors[0];
      const res = await fetch('/api/national-id/verify-identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nin,
          staffId: activeDoc?.id || 'doc-001',
          staffName: activeDoc?.name || 'Dr. Christian Hakizimana',
          staffRole: 'doctor',
          facilityId: activeDoc?.facility_id || 'fac-chuk',
          facilityName: activeDoc?.facility_name || 'Centre Hospitalier Universitaire de Kigali (CHUK)',
          reason: reason || 'Clinical Consultation',
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to verify NIN');
      }
      const data = await res.json();
      if (data.patient) {
        setNationalPatients((prev) => {
          const exists = prev.some((p) => p.nin === data.patient.nin);
          return exists ? prev.map((p) => (p.nin === data.patient.nin ? data.patient : p)) : [data.patient, ...prev];
        });
        addToast({
          type: 'success',
          title: 'NIDA Identity Verified',
          message: `${data.patient.full_name} (${data.patient.nin}) confirmed via NIDA Adapter.`,
        });
        return data.patient;
      }
      return null;
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'NIN Verification Failed',
        message: err.message || 'Could not verify National ID.',
      });
      return null;
    }
  };

  const verifyPatientInsurance = async (nin: string, provider?: string, patientName?: string): Promise<InsuranceVerification | null> => {
    try {
      const activeDoc = doctors[0];
      const res = await fetch('/api/national-id/verify-insurance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nin,
          provider,
          patientName,
          staffId: activeDoc?.id || 'doc-001',
          staffName: activeDoc?.name || 'Dr. Christian Hakizimana',
          staffRole: 'doctor',
          facilityId: activeDoc?.facility_id || 'fac-chuk',
          facilityName: activeDoc?.facility_name || 'CHUK Kigali',
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to verify insurance');
      }
      const data = await res.json();
      return data.insurance;
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Insurance Verification Error',
        message: err.message,
      });
      return null;
    }
  };

  const recordPatientConsent = async (consentData: any): Promise<PatientConsent> => {
    const activeDoc = doctors[0];
    const res = await fetch('/api/national-id/record-consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...consentData,
        staffId: activeDoc?.id || 'doc-001',
        staffName: activeDoc?.name || 'Dr. Christian Hakizimana',
        staffRole: 'doctor',
        facilityId: activeDoc?.facility_id || 'fac-chuk',
        facilityName: activeDoc?.facility_name || 'CHUK Kigali',
      }),
    });
    const data = await res.json();
    if (data.consent) {
      setPatientConsents((prev) => [data.consent, ...prev]);
      addToast({
        type: 'success',
        title: 'Consent Recorded',
        message: 'Patient consent saved in compliance with Rwanda Law N° 058/2021.',
      });
      return data.consent;
    }
    throw new Error(data.error || 'Failed to record consent');
  };

  const createPatientReferral = async (referralData: any): Promise<PatientReferral> => {
    const activeDoc = doctors[0];
    const res = await fetch('/api/national-id/referrals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...referralData,
        referring_doctor_id: activeDoc?.id || 'doc-001',
        referring_doctor_name: activeDoc?.name || 'Dr. Christian Hakizimana',
        source_facility_id: activeDoc?.facility_id || 'fac-chuk',
        source_facility_name: activeDoc?.facility_name || 'CHUK Kigali',
      }),
    });
    const data = await res.json();
    if (data.referral) {
      setPatientReferrals((prev) => [data.referral, ...prev]);
      addToast({
        type: 'success',
        title: 'Referral Dispatched',
        message: `Referral ${data.referral.referral_number} sent to ${data.referral.destination_facility_name}.`,
      });
      return data.referral;
    }
    throw new Error(data.error || 'Failed to create referral');
  };

  const updateReferralStatus = async (id: string, status: PatientReferral['status'], notes?: string): Promise<void> => {
    const res = await fetch(`/api/national-id/referrals/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, receivingNotes: notes }),
    });
    const data = await res.json();
    if (data.referral) {
      setPatientReferrals((prev) => prev.map((r) => (r.id === id ? data.referral : r)));
      addToast({
        type: 'info',
        title: 'Referral Updated',
        message: `Status set to ${status}.`,
      });
    }
  };

  const createNationalEncounter = async (params: { patientNin: string; patientName: string; department?: string; diagnosis?: string }): Promise<{ mrn: string; encounterId: string }> => {
    const activeDoc = doctors[0];
    const res = await fetch('/api/national-id/create-encounter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...params,
        facilityId: activeDoc?.facility_id || 'fac-chuk',
        facilityName: activeDoc?.facility_name || 'CHUK Kigali',
        staffId: activeDoc?.id || 'doc-001',
        staffName: activeDoc?.name || 'Dr. Christian Hakizimana',
        department: params.department || activeDoc?.department || 'Internal Medicine',
      }),
    });
    const data = await res.json();
    if (data.encounter) {
      const matched = patients.find((p) => p.nin === params.patientNin);
      if (!matched) {
        registerPatient({
          name: params.patientName,
          age: 35,
          gender: 'Male',
          bloodGroup: 'O+',
          phone: '+250 788 000 000',
          email: '',
          address: 'Kigali, Rwanda',
          emergencyContact: 'Family Member',
          insuranceProvider: 'RSSB / RAMA',
          insurancePolicyNumber: 'RAMA-2026-LINK',
          status: 'Outpatient',
          nin: params.patientNin,
          nationalVerified: true,
          branchId: currentBranchId,
        } as any);
      }
      addToast({
        type: 'success',
        title: 'EMR Encounter Created',
        message: `Assigned Hospital Record Number: ${data.encounter.mrn}`,
      });
      return { mrn: data.encounter.mrn, encounterId: data.encounter.id };
    }
    throw new Error(data.error || 'Failed to create encounter');
  };

  return (
    <HospitalContext.Provider
      value={{
        patients,
        doctors,
        beds,
        pharmacy,
        appointments,
        invoices,
        emergencyCases,
        toasts,
        currentRole,
        setCurrentRole,
        currentBranchId,
        setCurrentBranchId,
        branches,
        portalPatientId,
        setPortalPatientId,
        labOrders,
        createLabOrder,
        updateSampleStatus,
        enterLabResults,
        approveLabResult,
        radiologyOrders,
        createRadiologyOrder,
        updateRadiologyStatus,
        submitRadiologyReport,
        bloodInventory,
        bloodDonations,
        bloodIssues,
        addBloodDonation,
        recordBloodDonation: addBloodDonation,
        issueBloodUnits,
        requestEmergencyBlood,
        ambulances,
        dispatches,
        registerAmbulance,
        updateAmbulanceStatus,
        dispatchAmbulance,
        updateDispatchStatus,
        insuranceProviders,
        insuranceClaims,
        createInsuranceClaim,
        submitInsuranceClaim: createInsuranceClaim,
        adjudicateInsuranceClaim,
        processInsuranceClaim: adjudicateInsuranceClaim,
        notifications,
        sendNotification,
        markNotificationAsRead,
        markNotificationRead: markNotificationAsRead,
        markAllNotificationsAsRead,
        auditLogs,
        logAuditEvent,
        exportSystemBackup,
        exportBackupData: exportSystemBackup,
        restoreSystemBackup,
        restoreBackupData: restoreSystemBackup,
        addToast,
        showToast: addToast,
        currentUser: {
          id: 'doc-001',
          name: 'Dr. Jean-Paul Habimana',
          role: currentRole,
          email: 'jp.habimana@chuk.rw',
        },
        removeToast,
        registerPatient,
        updatePatient,
        admitPatientToBed,
        dischargePatient,
        addPatientVitals,
        addClinicalNote,
        addPrescription,
        updateBedStatus,
        createAppointment,
        addAppointment: createAppointment,
        updateAppointmentStatus,
        dispensePrescription,
        restockMedication,
        restockPharmacyItem: restockMedication,
        addPharmacyItem,
        addEmergencyCase,
        updateEmergencyStatus,
        createInvoice,
        recordPayment,
        recordInvoicePayment,
        updateDoctorStatus,
        toggleDoctorStatus,
        resetAllData,
        // Enterprise modules
        language,
        setLanguage,
        paymentTransactions,
        initiatePayment,
        verifyPayment,
        recordRefund,
        surgeries,
        scheduleSurgery,
        updateSurgeryStatus,
        billSurgery,
        maternityRecords,
        registerMaternityAdmission,
        recordDelivery,
        updateLabourStage,
        dentalRecords,
        recordDentalExamination,
        billDentalProcedure,
        suppliers,
        purchaseOrders,
        centralInventory,
        createPurchaseOrder,
        receiveGoodsPO,
        transferStockToDepartment,
        ledgerEntries,
        expenses,
        recordExpense,
        postLedgerEntry,
        // Rwanda National Identity & Insurance Verification
        nationalPatients,
        patientReferrals,
        patientConsents,
        accessAuditLogs,
        verifyNationalPatientNIN,
        verifyPatientInsurance,
        recordPatientConsent,
        createPatientReferral,
        updateReferralStatus,
        createNationalEncounter,
      }}
    >
      {children}
    </HospitalContext.Provider>
  );
};

export const useHospital = () => {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error('useHospital must be used within a HospitalProvider');
  }
  return context;
};
