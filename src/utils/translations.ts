import { AppLanguage } from '../types';

export interface TranslationDictionary {
  appName: string;
  appSubtitle: string;
  tagline: string;
  header: {
    systemName: string;
    systemTag: string;
    branchLabel: string;
    idPlaceholder: string;
    edgeSynced: string;
    beds: string;
    emergency: string;
    stat: string;
    idLookup: string;
    bruceTitle: string;
    bruceTag: string;
    portal: string;
    intake: string;
    register: string;
    notifications: string;
    notificationsSubtitle: string;
    openSmsCenter: string;
    languageToggle: string;
  };
  dashboard: {
    commandCenter: string;
    title: string;
    subtitle: string;
    triage: string;
    register: string;
    aiSupport: string;
    alerts: string;
  };
  nav: {
    dashboard: string;
    operations: string;
    patients: string;
    appointments: string;
    wards: string;
    emergency: string;
    surgery: string;
    maternity: string;
    dental: string;
    laboratory: string;
    radiology: string;
    blood_bank: string;
    pharmacy: string;
    procurement: string;
    ambulance: string;
    ambulances: string;
    billing: string;
    accounting: string;
    insurance: string;
    analytics: string;
    mobile_clinic: string;
    staff: string;
    patient_portal: string;
    system_settings: string;
    api_docs: string;
    rwanda_national_id: string;
    emergency_locator: string;
    bed_exchange: string;
    ophthalmology: string;
    chronic_disease: string;
    immunization: string;
    medical_travel: string;
    e_prescription: string;
    integration_hub: string;
    security_center: string;
    audit_logs: string;
    ai_assistant: string;
  };
  common: {
    search: string;
    filter: string;
    status: string;
    action: string;
    cancel: string;
    save: string;
    submit: string;
    print: string;
    downloadPdf: string;
    sendSms: string;
    viewDetails: string;
    registerPatient: string;
    statTriage: string;
    allBranches: string;
    total: string;
    subtotal: string;
    paid: string;
    balance: string;
    copay: string;
    insuranceCoverage: string;
    reference: string;
    date: string;
    time: string;
    doctor: string;
    patient: string;
    department: string;
  };
  payment: {
    rwandaPaymentGateway: string;
    chooseMethod: string;
    momoPrompt: string;
    airtelPrompt: string;
    cardPayment: string;
    bankTransfer: string;
    cashPayment: string;
    insuranceDirect: string;
    partialPayment: string;
    advanceDeposit: string;
    refund: string;
    enterPhone: string;
    amountToPay: string;
    processingTransaction: string;
    verifyingNetwork: string;
    paymentSuccess: string;
    receiptTitle: string;
    cashierReconciliation: string;
    todayRevenue: string;
    transactions?: string;
  };
  operations?: any;
  procurement?: any;
  surgery?: any;
  nationalId?: any;
  accounting?: any;
  analytics?: any;
  billing?: any;
  dental?: any;
  maternity?: any;
  [key: string]: any;
}

export const translations: Record<AppLanguage, TranslationDictionary> = {
  en: {
    appName: 'Rwanda Digital Hospital Management System',
    appSubtitle: 'Integrated National & Hospital Clinical Operations',
    tagline: 'A secure, patient-centered platform for hospitals and clinics in Rwanda',
    header: {
      systemName: 'Rwanda Digital Hospital',
      systemTag: 'RW HMS',
      branchLabel: 'Facility',
      idPlaceholder: 'Enter National ID to find photo...',
      edgeSynced: 'Secure sync active',
      beds: 'Beds',
      emergency: 'Emergency',
      stat: 'STAT',
      idLookup: 'ID Photo',
      bruceTitle: 'Bruce Rii AI',
      bruceTag: 'RW/EN',
      portal: 'Patient Portal',
      intake: 'Emergency Intake',
      register: 'Register Patient',
      notifications: 'Notifications',
      notificationsSubtitle: 'Messages & alerts',
      openSmsCenter: 'Open SMS Center →',
      languageToggle: 'Kinyarwanda',
    },
    dashboard: {
      commandCenter: 'Hospital Operations Center',
      title: 'Clinical & Administrative Dashboard',
      subtitle: 'Real-time view of patients, beds, emergency care, appointments, and clinical operations.',
      triage: 'Emergency Triage',
      register: 'Register Patient',
      aiSupport: 'Clinical AI Support',
      alerts: 'Clinical Alerts',
    },
    nav: {
      dashboard: 'Dashboard',
      operations: 'Operations',
      patients: 'Patients & EMR',
      appointments: 'Appointments',
      wards: 'Wards & Beds',
      emergency: 'Emergency & Triage',
      surgery: 'Surgery (OT)',
      maternity: 'Maternity & Neonatal',
      dental: 'Dental',
      laboratory: 'Laboratory',
      radiology: 'Radiology',
      blood_bank: 'Blood Bank',
      pharmacy: 'Pharmacy',
      procurement: 'Procurement',
      ambulance: 'Ambulance',
      ambulances: 'Ambulances & Dispatch',
      billing: 'Billing & Cashier',
      accounting: 'Accounting',
      insurance: 'Insurance & Claims',
      analytics: 'Analytics',
      mobile_clinic: 'Mobile Clinic',
      staff: 'Medical Staff',
      patient_portal: 'Patient Portal',
      system_settings: 'System Settings',
      api_docs: 'API & Integrations',
      rwanda_national_id: 'Rwanda National ID & RHIE',
      emergency_locator: 'Emergency Facility Locator',
      bed_exchange: 'Real-Time Bed Exchange',
      ophthalmology: 'Ophthalmology & Vision',
      chronic_disease: 'Chronic Disease Care',
      immunization: 'Immunization (Inkingo)',
      medical_travel: 'International Medical Travel',
      e_prescription: 'E-Prescription & Safety',
      integration_hub: 'RHIE Hub & Integrations',
      security_center: 'Security & Compliance',
      audit_logs: 'Audit Logs',
      ai_assistant: 'AI Clinical Assistant',
    },
    common: {
      search: 'Search by name, MRN, phone...',
      filter: 'Filter',
      status: 'Status',
      action: 'Action',
      cancel: 'Cancel',
      save: 'Save Changes',
      submit: 'Submit',
      print: 'Print Document',
      downloadPdf: 'Download PDF',
      sendSms: 'Send SMS Receipt',
      viewDetails: 'View Details',
      registerPatient: 'Register Patient',
      statTriage: 'STAT Triage',
      allBranches: 'All Hospital Branches',
      total: 'Total',
      subtotal: 'Subtotal',
      paid: 'Paid',
      balance: 'Balance Due',
      copay: 'Patient Copay',
      insuranceCoverage: 'Insurance Coverage',
      reference: 'Transaction Ref',
      date: 'Date',
      time: 'Time',
      doctor: 'Attending Doctor',
      patient: 'Patient Name',
      department: 'Department',
    },
    payment: {
      rwandaPaymentGateway: 'Rwanda National Payment Gateway',
      chooseMethod: 'Select Payment Method',
      momoPrompt: 'MTN Mobile Money (MoMo)',
      airtelPrompt: 'Airtel Money Rwanda',
      cardPayment: 'Visa / Mastercard',
      bankTransfer: 'Bank Wire / Transfer (RWF)',
      cashPayment: 'Physical Hospital Cashier',
      insuranceDirect: 'Insurance Pre-Authorization',
      partialPayment: 'Partial Payment Installment',
      advanceDeposit: 'Admission Advance Deposit',
      refund: 'Patient Refund / Adjustment',
      enterPhone: 'Enter Mobile Money Number (+250 78... / +250 73...)',
      amountToPay: 'Amount to Pay (RWF)',
      processingTransaction: 'Initiating USSD Network Prompt...',
      verifyingNetwork: 'Verifying Transaction with Telco...',
      paymentSuccess: 'Payment Verified Successfully!',
      receiptTitle: 'Official Hospital Payment Receipt',
      cashierReconciliation: 'Cashier Daily Shift Reconciliation',
      todayRevenue: "Today's Revenue Collections",
      transactions: 'Payment Transactions',
    },
    operations: {
      title: 'Hospital Operational Command & Bed Bureau',
      subtitle: 'Real-time telemetry across clinical departments, emergency bay, and resource utilization',
      occupiedBeds: 'Occupied Inpatient Beds',
      availableBeds: 'Available Beds',
      activeEmergencies: 'Active Emergency Cases',
      pendingLabs: 'Pending Lab Tests',
      otUtilization: 'Operating Theatres in Surgery',
      icuBeds: 'ICU Capacity & Occupancy',
      ambulanceFleet: 'Active Ambulances on Dispatch',
    },
    procurement: {
      title: 'Procurement, Warehouse & Medical Supply Chain',
      subtitle: 'Hospital requisition orders, inventory replenishment, and approved supplier database',
      purchaseOrders: 'Purchase Orders',
      centralInventory: 'Central Warehouse Inventory',
      suppliers: 'Approved Vendors & Suppliers',
      createPO: 'Create Requisition Order',
      lowStockAlerts: 'Low Stock Alert Thresholds',
    },
    surgery: {
      title: 'Operating Theatres & Surgical Schedule',
      subtitle: 'Surgical bookings, pre-op verification, WHO Surgical Safety Checklist, and post-op recovery',
      scheduleSurgery: 'Schedule Surgery',
      theatreRooms: 'Operating Theatre Bays',
      activeCases: 'Surgical Procedures in Progress',
      whoChecklist: 'WHO Surgical Safety Checklist',
    },
    nationalId: {
      title: 'Rwanda National Patient Identity & Insurance Verification',
      subtitle: 'NIDA Citizen Identity Verification, RSSB/Mutuelle/MMI Eligibility, and Inter-Facility Referrals',
      demoBanner: 'DEMO MODE — NOT CONNECTED TO GOVERNMENT SYSTEMS (NIDA / RSSB / RHIE)',
      ninInputLabel: 'Enter 16-Digit National ID (Indangamuntu)',
      ninPlaceholder: 'e.g. 1 1990 8 0012345 1 20',
      verifyButton: 'Verify Citizen Identity',
      identityVerified: 'Identity Verified by NIDA Provider',
      insuranceCheck: 'Verify Insurance Eligibility',
      consentNotice: 'Patient Consent Recorded (Rwanda Law N° 058/2021)',
      createEncounter: 'Create Hospital Encounter / EMR Link',
      referPatient: 'Create Inter-Facility Referral',
      auditLog: 'NIDA & RHIE Access Audit Trail',
      demoNote: 'This prototype uses a sandbox adapter layer. Production NIDA and RSSB API credentials can be plugged in via environment variables.',
    },
    accounting: {
      accounting: 'Accounting & Financial Ledger',
      recordExpense: 'Record Operational Expense',
      generalLedger: 'General Ledger',
      expenses: 'Operating Expenses',
      financialStatements: 'Financial Statements (P&L)',
    },
    analytics: {
      analytics: 'Hospital Analytics',
    },
    billing: {
      createInvoice: 'Generate Hospital Invoice',
      invoices: 'Hospital Invoices',
      title: 'Hospital Billing & Invoices',
    },
    dental: {
      title: 'Dental Medicine & Odontogram',
      recordExam: 'Record Dental Examination',
      teethChart: 'Odontogram & Dental Chart',
      treatmentPlan: 'Dental Treatment Plan',
      periodontal: 'Periodontal Screening',
      procedures: 'Dental Procedures & Billing',
      healthy: 'Healthy',
      caries: 'Caries',
      missing: 'Missing',
      filled: 'Filled',
      crown: 'Crown',
    },
    maternity: {
      title: 'Maternity, Labour & Neonatal Care (NICU)',
      registerMother: 'Register Maternity Admission',
      recordDelivery: 'Record Childbirth Delivery',
      activeLabour: 'Active Labour Ward',
      partograph: 'Digital Partograph',
      postpartum: 'Postpartum & Neonates',
    },
  },
  rw: {
    appName: 'Sisitemu y’Ubuvuzi n’Ibitaro mu Rwanda',
    appSubtitle: 'Gahunda ihuriweho yo gucunga abarwayi n’ibikorwa by’ibitaro',
    tagline: 'Sisitemu yorohereza ibitaro n’amavuriro mu Rwanda gutanga serivisi nziza, zizewe, kandi zihuta',
    header: {
      systemName: 'Sisitemu y’Ibitaro mu Rwanda',
      systemTag: 'RW HMS',
      branchLabel: 'Ikigo',
      idPlaceholder: 'Andika nimero y’indangamuntu urebe ifoto...',
      edgeSynced: 'Ihuriro ritekanye rirakora',
      beds: 'Ibitanda',
      emergency: 'Ubutabazi',
      stat: 'BYIHUTIRWA',
      idLookup: 'Ifoto ya ID',
      bruceTitle: 'Bruce Rii AI',
      bruceTag: 'RW/EN',
      portal: 'Urubuga rw’Umurwayi',
      intake: 'Kwakira Ubutabazi',
      register: 'Kwandika Umurwayi',
      notifications: 'Ubutumwa',
      notificationsSubtitle: 'Ubutumwa n’imenyesha',
      openSmsCenter: 'Fungura SMS Center →',
      languageToggle: 'English',
    },
    dashboard: {
      commandCenter: 'Ikigo cy’Imicungire y’Ibitaro',
      title: 'Ikibaho cy’Ubuvuzi n’Imicungire',
      subtitle: 'Reba mu kanya nyako uko abarwayi, ibitanda, ubutabazi, gahunda za muganga n’ibikorwa by’ibitaro bihagaze.',
      triage: 'Gutandukanya Abarwayi',
      register: 'Kwandika Umurwayi',
      aiSupport: 'Ubufasha bwa AI mu Buvuzi',
      alerts: 'Imenyesha ry’Ubuvuzi',
    },
    nav: {
      dashboard: 'Ikibaho',
      operations: 'Imikorere',
      patients: 'Abarwayi & EMR',
      appointments: 'Gahunda za Muganga',
      wards: 'Ibyumba & Ibitanda',
      emergency: 'Ubutabazi & Triage',
      surgery: 'Kubaga (OT)',
      maternity: 'Kubyara & Abana Bavutse',
      dental: 'Amenyo',
      laboratory: 'Laboratwari',
      radiology: 'Radiologiya',
      blood_bank: 'Amaraso',
      pharmacy: 'Farisiyo',
      procurement: 'Ibugenzuzi & Ibikoresho',
      ambulance: 'Ambulansi',
      ambulances: 'Ambulansi & Kohereza',
      billing: 'Kwishyura & Kashiye',
      accounting: 'Imari & Ibaruramari',
      insurance: 'Ubwishingizi',
      analytics: 'Isesenguramakuru',
      mobile_clinic: 'Kliniki Igendanwa',
      staff: 'Abakozi b’Ubuvuzi',
      patient_portal: 'Urubuga rw’Umurwayi',
      system_settings: 'Igenamiterere',
      api_docs: 'API & Ihuza',
      rwanda_national_id: 'Indangamuntu & RHIE',
      emergency_locator: 'Gushaka Ibitaro by’Ubutabazi',
      bed_exchange: 'Ihuriro ry’Ibitanda Ako Kanya',
      ophthalmology: 'Amaso',
      chronic_disease: 'Indwara Zidakira',
      immunization: 'Inkingo (EPI)',
      medical_travel: 'Ubuvuzi Mpuzamahanga',
      e_prescription: 'E-Prescription & Umutekano',
      integration_hub: 'RHIE Hub & Ihuza',
      security_center: 'Umutekano & Itegeko 058',
      audit_logs: 'Inyandiko z’Isuzuma',
      ai_assistant: 'Ubufasha bwa AI',
    },
    common: {
      search: 'Shakisha izina, MRN, telefoni...',
      filter: 'Gushungura',
      status: 'Imiterere',
      action: 'Igikorwa',
      cancel: 'Guhagarika',
      save: 'Kubika Impinduka',
      submit: 'Ohereza',
      print: 'Gucapa Inyandiko',
      downloadPdf: 'Kumanura PDF',
      sendSms: 'Kohereza Inyemezabwishyu kuri SMS',
      viewDetails: 'Kureba Ibirambuye',
      registerPatient: 'Kwandika Umurwayi',
      statTriage: 'Ubutabazi Bwihuse',
      allBranches: 'Amashami Yose y’Ibitaro',
      total: 'Igiteranyo Rusange',
      subtotal: 'Igiteranyo cy’Ibikoresho',
      paid: 'Icyishyuwe',
      balance: 'Asigaye Kwishyurwa',
      copay: 'Uruhare rw’Umurwayi',
      insuranceCoverage: 'Icyishyurwa n’Ubwishingizi',
      reference: 'Nimero y’Ubwishyu',
      date: 'Itariki',
      time: 'Isaha',
      doctor: 'Muganga Uvura',
      patient: 'Izina ry’Umurwayi',
      department: 'Ishami ry’Ubuvuzi',
    },
    payment: {
      rwandaPaymentGateway: 'Uburyo bwo Kwishyura mu Rwanda (Gateway)',
      chooseMethod: 'Hitamo Uburyo bwo Kwishyura',
      momoPrompt: 'MTN Mobile Money (MoMo)',
      airtelPrompt: 'Airtel Money Rwanda',
      cardPayment: 'Ikarita ya Banki (Visa / Mastercard)',
      bankTransfer: 'Kwishyura kuri Konti ya Banki (RWF)',
      cashPayment: 'Amafaranga y’Inoti ku Mukozi (Cash)',
      insuranceDirect: 'Kwishyurirwa n’Ubwishingizi Ako Kanya',
      partialPayment: 'Kwishyura Igice (Installment)',
      advanceDeposit: 'Ingwate / Kwishyura Mbere (Deposit)',
      refund: 'Gusubiza Amafaranga Umurwayi (Refund)',
      enterPhone: 'Injiza Nimero ya Mobile Money (+250 78... / +250 73...)',
      amountToPay: 'Amafaranga yo Kwishyura (RWF)',
      processingTransaction: 'Gusaba Uburenganzira kuri Telefoni...',
      verifyingNetwork: 'Gusuzuma ko Amafaranga Yagezeho...',
      paymentSuccess: 'Ubwishyu Bwemejwe neza!',
      receiptTitle: 'Inyemezabwishyu Yemewe y’Ibitaro',
      cashierReconciliation: 'Ibarurishamutungo rya Buri Munsi (Cashier Shift)',
      todayRevenue: 'Amafaranga Yinjiye Uyu Munsi',
    },
    operations: {
      title: 'Imikorere y’Ibitaro muri Rusange & Imyanya y’Ibitanda',
      subtitle: 'Amakuru y’uburyo amashami yose akora, ubutabazi bwihuse, n’ibikoresho by’ibitaro',
      occupiedBeds: 'Ibitanda Birwayemo Abarwayi',
      availableBeds: 'Ibitanda Bisigaye Byiteguye',
      activeEmergencies: 'Abarwayi Barembye muri Emergensi',
      pendingLabs: 'Ibizamini Byatanzwe Bitaraboneka',
      otUtilization: 'Ibyumba by’Ibagiro Birimo Gukora',
      icuBeds: 'Ibitanda byo muri Reanimasiyo (ICU)',
      ambulanceFleet: 'Imbangukiragutabara Ziri mu Butumwa',
    },
    procurement: {
      title: 'Gutumiza Imiti, Ububiko & Ibikoresho by’Ibitaro',
      subtitle: 'Gutumiza imiti n’ibikoresho, kureba ibishize mu bubiko, n’abacuruzi bemewe',
      purchaseOrders: 'Inyandiko zo Gutumiza Imiti (PO)',
      centralInventory: 'Ububiko Bukuru bw’Ibitaro',
      suppliers: 'Abacuruzi n’Inganda Bemewe',
      createPO: 'Tanga Icyifuzo cyo Gutumiza',
      lowStockAlerts: 'Imiti Igomba Kongerwa vuba',
    },
    surgery: {
      title: 'Ibyumba by’Ibagiro & Gahunda y’Ababagwa',
      subtitle: 'Gahunda z’abagiye kubagwa, urutonde rw’umutekano rwa OMS, no gukurikirana abamaze kubagwa',
      scheduleSurgery: 'Shyiraho Gahunda yo Kubaga',
      theatreRooms: 'Ibyumba by’Ibagiro Byose',
      activeCases: 'Abarwayi barimo kubagwa aka kanya',
      whoChecklist: 'Urutonde rw’Umutekano wo Kubaga rwa OMS',
    },
    nationalId: {
      title: 'Kugenzura Indangamuntu y’Umurwayi & Ubwishingizi mu Rwanda',
      subtitle: 'Gusuzuma Indangamuntu muri NIDA, Kumenya Ubwishingizi bwa RSSB/Mutuelle/MMI, no Kohereza Umurwayi mu Bindi Bitaro',
      demoBanner: 'ICYITONDERWA: IKI NI ICYITEGEREREZO (DEMO MODE) — NTABWO CYIFATANYIJE NA SISTEMU YA LETA (NIDA / RSSB / RHIE)',
      ninInputLabel: 'Injiza Imibare 16 y\'Indangamuntu y\'u Rwanda',
      ninPlaceholder: 'urugero: 1 1990 8 0012345 1 20',
      verifyButton: 'Kugenzura Indangamuntu muri NIDA',
      identityVerified: 'Amakuru y\'Indangamuntu Yemejwe muri NIDA',
      insuranceCheck: 'Kugenzura Ubwishingizi bwa RSSB / Mutuelle',
      consentNotice: 'Uruhushya rw\'Umurwayi rwanditswe (Itegeko N° 058/2021 ryo kurinda amakuru bwite)',
      createEncounter: 'Kwandika Umurwayi muri Dosiye y\'Ibitaro (EMR)',
      referPatient: 'Kohereza Umurwayi mu Bindi Bitaro (Referral)',
      auditLog: 'Inyandiko z\'Umutekano ku bageze ku Makuru (Audit Trail)',
      demoNote: 'Iyi porogaramu ikoresha sandbox. Kode z\'ukuri za NIDA na RSSB zishobora gushyirwamo binyuze muri variables z\'ibidukikije.',
    },
    accounting: {
      accounting: 'Imicungire y’Imari & Amakonti',
      recordExpense: 'Kwandika Amafaranga Yasohotse',
      generalLedger: 'Igitabo cy’Imari (General Ledger)',
      expenses: 'Ibyasohotse Byose',
      financialStatements: 'Raporo y’Imari n’Inyungu',
    },
    analytics: {
      analytics: 'Isesenguramakuru',
    },
    billing: {
      createInvoice: 'Kora Inyemezabwishyu Nshya',
      invoices: 'Inyemezabwishyu z\'Abarwayi',
      title: 'Kwishyura & Fagitire',
    },
    dental: {
      title: 'Ubuvuzi bw’Amenyo & Imbonerahamwe',
      recordExam: 'Suzuma Amenyo',
      teethChart: 'Imbonerahamwe y’Amenyo',
      treatmentPlan: 'Gahunda yo Kuvura Amenyo',
      periodontal: 'Isesengura ry’Ishinya',
      procedures: 'Ibikorwa byakozwe ku Menyo',
      healthy: 'Kizima',
      caries: 'Kiborera',
      missing: 'Kirabuze',
      filled: 'Cyasannye',
      crown: 'Cyambitswe Ikamba',
    },
    maternity: {
      title: 'Kubyara & Abana Bavutse (NICU)',
      registerMother: 'Kwandika Umubyeyi Uje Kubyara',
      recordDelivery: 'Kwandika Umwana Wavutse',
      activeLabour: 'Icyumba cyo Kubyara',
      partograph: 'Ikarita yo Gukurikirana Ikise (Partograph)',
      postpartum: 'Aho Abamaze Kubyara Baruhukira',
    },
  },
  fr: {
    appName: 'Système numérique de gestion hospitalière du Rwanda',
    appSubtitle: 'Opérations cliniques intégrées nationales et hospitalières',
    tagline: 'Plateforme sécurisée et centrée sur le patient pour les hôpitaux et cliniques du Rwanda',
    header: { systemName: 'Hôpital numérique du Rwanda', systemTag: 'RW HMS', branchLabel: 'Établissement', idPlaceholder: "Entrer l'ID national pour trouver la photo...", edgeSynced: 'Synchronisation sécurisée active', beds: 'Lits', emergency: 'Urgence', stat: 'URGENT', idLookup: 'Photo ID', bruceTitle: 'Bruce Rii AI', bruceTag: 'RW/EN/FR', portal: 'Portail patient', intake: 'Admission urgence', register: 'Enregistrer patient', notifications: 'Notifications', notificationsSubtitle: 'Messages et alertes', openSmsCenter: 'Ouvrir le centre SMS →', languageToggle: 'Kinyarwanda' },
    dashboard: { commandCenter: 'Centre des opérations hospitalières', title: 'Tableau de bord clinique et administratif', subtitle: 'Vue en temps réel des patients, lits, urgences, rendez-vous et opérations cliniques.', triage: 'Triage urgence', register: 'Enregistrer patient', aiSupport: 'Assistance clinique IA', alerts: 'Alertes cliniques' },
    nav: { dashboard: 'Tableau de bord', operations: 'Opérations', patients: 'Patients & DME', appointments: 'Rendez-vous', wards: 'Services & lits', emergency: 'Urgence & triage', surgery: 'Chirurgie (Bloc)', maternity: 'Maternité & néonatal', dental: 'Dentaire', laboratory: 'Laboratoire', radiology: 'Radiologie', blood_bank: 'Banque de sang', pharmacy: 'Pharmacie', procurement: 'Approvisionnement', ambulance: 'Ambulance', ambulances: 'Ambulances & dispatch', billing: 'Facturation & caisse', accounting: 'Comptabilité', insurance: 'Assurance & sinistres', analytics: 'Analytique', mobile_clinic: 'Clinique mobile', staff: 'Personnel médical', patient_portal: 'Portail patient', system_settings: 'Paramètres système', api_docs: 'API & intégrations', rwanda_national_id: 'ID national Rwanda & RHIE', emergency_locator: "Localisateur d'urgence", bed_exchange: 'Échange de lits en temps réel', ophthalmology: 'Ophtalmologie & vision', chronic_disease: 'Maladies chroniques', immunization: 'Vaccination (Inkingo)', medical_travel: 'Voyage médical international', e_prescription: 'E-prescription & sécurité', integration_hub: 'Hub RHIE & intégrations', security_center: 'Sécurité & conformité', audit_logs: "Journaux d'audit", ai_assistant: 'Assistant clinique IA' },
    common: { search: 'Rechercher par nom, MRN, téléphone...', filter: 'Filtrer', status: 'Statut', action: 'Action', cancel: 'Annuler', save: 'Enregistrer', submit: 'Soumettre', print: 'Imprimer', downloadPdf: 'Télécharger PDF', sendSms: 'Envoyer reçu SMS', viewDetails: 'Voir détails', registerPatient: 'Enregistrer patient', statTriage: 'Triage STAT', allBranches: 'Tous les établissements', total: 'Total', subtotal: 'Sous-total', paid: 'Payé', balance: 'Solde dû', copay: 'Quote-part patient', insuranceCoverage: 'Couverture assurance', reference: 'Réf. transaction', date: 'Date', time: 'Heure', doctor: 'Médecin traitant', patient: 'Nom du patient', department: 'Département' },
    payment: { rwandaPaymentGateway: 'Passerelle de paiement nationale du Rwanda', chooseMethod: 'Choisir le mode de paiement', momoPrompt: 'MTN Mobile Money (MoMo)', airtelPrompt: 'Airtel Money Rwanda', cardPayment: 'Visa / Mastercard', bankTransfer: 'Virement bancaire (RWF)', cashPayment: 'Caisse hospitalière', insuranceDirect: 'Pré-autorisation assurance', partialPayment: 'Paiement partiel', advanceDeposit: "Dépôt d'admission", refund: 'Remboursement / ajustement', enterPhone: 'Numéro Mobile Money (+250 78... / +250 73...)', amountToPay: 'Montant à payer (RWF)', processingTransaction: 'Initiation de la demande USSD...', verifyingNetwork: "Vérification auprès de l'opérateur...", paymentSuccess: 'Paiement vérifié avec succès !', receiptTitle: 'Reçu de paiement hospitalier officiel', cashierReconciliation: 'Rapprochement de caisse quotidien', todayRevenue: 'Recettes du jour', transactions: 'Transactions de paiement' },
    operations: { title: 'Commandement opérationnel & gestion des lits', subtitle: 'Télémétrie en temps réel des départements cliniques, urgences et ressources', occupiedBeds: 'Lits occupés', availableBeds: 'Lits disponibles', activeEmergencies: 'Urgences actives', pendingLabs: 'Analyses en attente', otUtilization: 'Blocs opératoires actifs', icuBeds: 'Capacité USI', ambulanceFleet: 'Ambulances en mission' },
    procurement: { title: "Achats, entrepôt & chaîne d'approvisionnement médical", subtitle: 'Commandes, réapprovisionnement et fournisseurs agréés', purchaseOrders: 'Bons de commande', centralInventory: 'Inventaire central', suppliers: 'Fournisseurs agréés', createPO: 'Créer une commande', lowStockAlerts: 'Alertes de stock bas' },
    surgery: { title: 'Blocs opératoires & planning chirurgical', subtitle: 'Réservations, vérification pré-op, liste OMS et récupération post-op', scheduleSurgery: 'Planifier chirurgie', theatreRooms: "Salles d'opération", activeCases: 'Interventions en cours', whoChecklist: 'Liste de sécurité chirurgicale OMS' },
    nationalId: { title: "Identité nationale du patient & vérification d'assurance (Rwanda)", subtitle: 'Vérification NIDA, éligibilité RSSB/Mutuelle/MMI et références inter-établissements', demoBanner: 'MODE DÉMO — NON CONNECTÉ AUX SYSTÈMES GOUVERNEMENTAUX (NIDA / RSSB / RHIE)', ninInputLabel: "Entrer l'ID national à 16 chiffres (Indangamuntu)", ninPlaceholder: 'ex. 1 1990 8 0012345 1 20', verifyButton: "Vérifier l'identité", identityVerified: "Identité vérifiée par l'adaptateur NIDA", insuranceCheck: "Vérifier l'éligibilité assurance", consentNotice: 'Consentement enregistré (Loi Rwanda N° 058/2021)', createEncounter: 'Créer rencontre hospitalière / lien DME', referPatient: 'Créer référence inter-établissement', auditLog: "Journal d'audit NIDA & RHIE", demoNote: "Prototype avec adaptateur sandbox. Les identifiants NIDA/RSSB de production peuvent être configurés via variables d'environnement." },
    accounting: { accounting: 'Comptabilité & grand livre', recordExpense: 'Enregistrer une dépense', generalLedger: 'Grand livre', expenses: "Dépenses d'exploitation", financialStatements: 'États financiers' },
    analytics: { analytics: 'Analytique hospitalière' },
    billing: { createInvoice: 'Générer facture', invoices: 'Factures', title: 'Facturation hospitalière' },
    dental: { title: 'Médecine dentaire & odontogramme', recordExam: 'Enregistrer examen dentaire', teethChart: 'Odontogramme', treatmentPlan: 'Plan de traitement', periodontal: 'Dépistage parodontal', procedures: 'Procédures & facturation', healthy: 'Sain', caries: 'Carie', missing: 'Absent', filled: 'Obturé', crown: 'Couronne' },
    maternity: { title: 'Maternité, travail & soins néonataux', registerMother: 'Enregistrer admission maternité', recordDelivery: 'Enregistrer accouchement', activeLabour: 'Salle de travail active', partograph: 'Partogramme numérique', postpartum: 'Post-partum & nouveau-nés' },
  },};
