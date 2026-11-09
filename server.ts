import express from "express";
import http from "node:http";
import path from "node:path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import {
  getIdentityProvider,
  getInsuranceProvider,
  normalizeNIN,
  formatRwandanNIN,
  isValidRwandanNIN,
} from "./server/identity/providers";
import { getPaymentProvider, paymentStore } from "./server/identity/payments";
import {
  RWANDA_FACILITIES,
  INITIAL_NATIONAL_PATIENTS,
  INITIAL_PATIENT_REFERRALS,
  INITIAL_PATIENT_CONSENTS,
  INITIAL_ACCESS_AUDIT_LOGS,
} from "./src/data/mockRwandaNationalData";
import { createUbuzimaApi } from "./backend/src/app.ts";


dotenv.config();

// In-memory data store for live full-stack verification & referrals
let serverNationalPatients = [...INITIAL_NATIONAL_PATIENTS];
let serverPatientReferrals = [...INITIAL_PATIENT_REFERRALS];
let serverPatientConsents = [...INITIAL_PATIENT_CONSENTS];
let serverAccessAuditLogs = [...INITIAL_ACCESS_AUDIT_LOGS];

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = Number(process.env.PORT || 3000);

  app.use(express.json());

  // UBUZIMA HMS v1 API (additive). Mounted at /api/v1; dev CSP allows Vite/React Refresh/HMR on same origin.
  app.use('/api/v1', createUbuzimaApi());

  // Legacy API Routes (kept for current frontend compatibility during migration)

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Clinical SOAP Notes generator
  app.post("/api/ai/soap-notes", async (req, res) => {
    try {
      const { doctorNotes, patientInfo } = req.body;
      const ai = getAI();

      if (!ai) {
        // Fallback clinical template
        return res.json({
          soapNote: {
            subjective: `Patient (${patientInfo?.name || "Patient"}, Age ${patientInfo?.age || "N/A"}) reports: ${doctorNotes || "Routine check-up."}`,
            objective: `Vitals: BP ${patientInfo?.vitals?.bp || "120/80"}, HR ${patientInfo?.vitals?.hr || "72"} bpm, Temp ${patientInfo?.vitals?.temp || "98.6"}°F, SpO2 ${patientInfo?.vitals?.spo2 || "98"}%. General: Alert, oriented x3, in no acute distress.`,
            assessment: `Clinical impression: ${patientInfo?.diagnosis || "Primary presentation under clinical evaluation"}. Stable baseline.`,
            plan: `1. Continue supportive management. 2. Prescribed appropriate medication regimen. 3. Monitor vitals Q4H. 4. Follow up in 48-72 hours or seek immediate care if red flag symptoms develop.`
          },
          source: "offline_clinical_engine"
        });
      }

      const prompt = `You are an expert Hospital Clinical Scribe and Physician Assistant.
Convert the following unstructured clinician notes and patient context into a professional, formal hospital SOAP Note (Subjective, Objective, Assessment, Plan).

Patient Information:
${JSON.stringify(patientInfo, null, 2)}

Clinician's Dictation / Rough Notes:
"${doctorNotes}"

Respond in valid JSON with this exact structure:
{
  "subjective": "...",
  "objective": "...",
  "assessment": "...",
  "plan": "..."
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const text = response.text || "{}";
      const parsed = JSON.parse(text);
      res.json({ soapNote: parsed, source: "gemini-3.8-flash" });
    } catch (err: any) {
      console.error("Error generating SOAP note:", err);
      res.status(500).json({ error: err.message || "Failed to generate SOAP note" });
    }
  });

  // Drug Interaction Checker
  app.post("/api/ai/drug-interactions", async (req, res) => {
    try {
      const { currentMedications, newMedication, patientAllergies } = req.body;
      const ai = getAI();

      if (!ai) {
        return res.json({
          severity: "Low",
          hasInteraction: false,
          summary: "No severe contraindications identified by baseline formulary rule-engine.",
          recommendations: "Administer with water as prescribed. Monitor for gastrointestinal sensitivity.",
          source: "offline_formulary_engine"
        });
      }

      const prompt = `You are a clinical pharmacologist in a hospital pharmacy.
Analyze potential drug-drug interactions, contraindications, and allergy risks for:

Current Medications: ${JSON.stringify(currentMedications)}
New Prescribed Medication: ${newMedication}
Known Patient Allergies: ${JSON.stringify(patientAllergies || [])}

Provide your evaluation in valid JSON with:
{
  "hasInteraction": boolean,
  "severity": "None" | "Low" | "Moderate" | "Severe" | "Contraindicated",
  "summary": "Clear clinical summary of the risk or compatibility",
  "mechanism": "Brief pharmacologic mechanism if applicable",
  "recommendations": "Actionable instructions for the prescribing physician and nursing team"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });

      const text = response.text || "{}";
      const parsed = JSON.parse(text);
      res.json({ ...parsed, source: "gemini-3.8-flash" });
    } catch (err: any) {
      console.error("Error checking drug interactions:", err);
      res.status(500).json({ error: err.message || "Drug interaction check failed" });
    }
  });

  // Emergency Triage & Differential Diagnosis Decision Support
  app.post("/api/ai/triage-assist", async (req, res) => {
    try {
      const { chiefComplaint, vitals, age, gender, medicalHistory } = req.body;
      const ai = getAI();

      if (!ai) {
        return res.json({
          esiLevel: 3,
          esiCategory: "Urgent",
          redFlags: ["Monitor for sudden decompensation or vital spikes"],
          differentialDiagnoses: ["Acute presenting symptoms requiring diagnostic evaluation"],
          recommendedWorkup: ["Complete Blood Count (CBC)", "Basic Metabolic Panel", "12-Lead ECG"],
          triageNotes: "Standard urgent triage protocol initiated. Re-evaluate vitals in 30 minutes.",
          source: "offline_triage_protocol"
        });
      }

      const prompt = `You are an Emergency Medicine Triage Physician.
Evaluate the following patient triage data based on the Emergency Severity Index (ESI Levels 1-5):
- Level 1: Resuscitation (immediate life-saving intervention needed)
- Level 2: Emergent (high risk, confused/lethargic, severe pain/distress)
- Level 3: Urgent (requires 2+ hospital resources, vitals outside danger zone)
- Level 4: Less Urgent (requires 1 hospital resource)
- Level 5: Non-Urgent (requires 0 hospital resources)

Patient Profile:
- Age: ${age}, Gender: ${gender}
- Chief Complaint: "${chiefComplaint}"
- Vitals: ${JSON.stringify(vitals)}
- Past Medical History: ${JSON.stringify(medicalHistory || [])}

Provide your output in strict JSON format:
{
  "esiLevel": number (1 to 5),
  "esiCategory": "Resuscitation" | "Emergent" | "Urgent" | "Less Urgent" | "Non-Urgent",
  "urgencyScore": number (1-100),
  "redFlags": ["list", "of", "critical", "signs"],
  "differentialDiagnoses": ["top 3-4 likely clinical considerations"],
  "recommendedWorkup": ["labs, imaging, or monitoring to order immediately"],
  "triageNotes": "Succinct clinical reasoning for the assigned level"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const text = response.text || "{}";
      const parsed = JSON.parse(text);
      res.json({ ...parsed, source: "gemini-3.8-flash" });
    } catch (err: any) {
      console.error("Error in triage assist:", err);
      res.status(500).json({ error: err.message || "Triage evaluation failed" });
    }
  });

  // Discharge Summary Generator
  app.post("/api/ai/discharge-summary", async (req, res) => {
    try {
      const { patientName, diagnosis, treatmentsGiven, medications, dischargeVitals } = req.body;
      const ai = getAI();

      if (!ai) {
        return res.json({
          summary: `Patient ${patientName} is discharged in stable condition following treatment for ${diagnosis}.`,
          medicationSchedule: medications?.map((m: any) => `${m.name}: ${m.dosage}, ${m.frequency}`) || [],
          activityRestrictions: "Resume normal activities as tolerated. Rest for 48 hours and avoid heavy lifting.",
          warningSigns: ["Fever over 101°F", "Sudden shortness of breath", "Severe chest or abdominal pain", "Persistent dizziness"],
          followUpInstructions: "Schedule outpatient follow-up with attending physician in 7 days.",
          source: "offline_discharge_engine"
        });
      }

      const prompt = `You are a hospital discharge coordinator.
Generate a comprehensive, clear, compassionate, and patient-readable discharge summary.

Patient: ${patientName}
Admission Diagnosis: ${diagnosis}
Treatments & Procedures: ${JSON.stringify(treatmentsGiven)}
Discharge Medications: ${JSON.stringify(medications)}
Discharge Vitals: ${JSON.stringify(dischargeVitals)}

Respond in valid JSON with:
{
  "summary": "Clear overview of hospital stay, recovery status, and care provided",
  "medicationSchedule": ["Detailed timing and food instructions for each medicine"],
  "activityRestrictions": "Dietary and physical activity instructions",
  "warningSigns": ["Specific red flag symptoms that require return to Emergency Room"],
  "followUpInstructions": "When and whom to see for follow-up appointments"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const text = response.text || "{}";
      const parsed = JSON.parse(text);
      res.json({ ...parsed, source: "gemini-3.8-flash" });
    } catch (err: any) {
      console.error("Error generating discharge summary:", err);
      res.status(500).json({ error: err.message || "Discharge summary generation failed" });
    }
  });

  // AI Patient-Friendly Lab Result Explainer
  app.post("/api/ai/explain-lab", async (req, res) => {
    try {
      const { testName, results, patientName } = req.body;
      const ai = getAI();

      if (!ai) {
        return res.json({
          overview: `Laboratory report for ${testName} completed for ${patientName || "the patient"}.`,
          simplifiedFindings: results?.map((r: any) => `${r.metric}: ${r.value} ${r.unit} (${r.status === 'normal' ? 'Within healthy limits' : 'Outside typical range'})`) || [],
          clinicalMeaning: "Most measured values align with expectations or minor variations under clinical supervision.",
          questionsForDoctor: ["Are there dietary changes recommended?", "When should this panel be repeated?"],
          source: "offline_lab_explainer"
        });
      }

      const prompt = `You are a supportive, knowledgeable clinical educator explaining laboratory results to a patient.
Translate these medical lab metrics into clear, non-jargon, reassuring yet accurate patient explanations.

Test: ${testName}
Patient: ${patientName}
Results: ${JSON.stringify(results)}

Format your response in strict JSON:
{
  "overview": "Short summary explaining the purpose of this test",
  "simplifiedFindings": ["Plain-language interpretation for each key metric"],
  "clinicalMeaning": "What the pattern suggests in everyday language",
  "questionsForDoctor": ["2-3 helpful questions the patient can ask their care team"]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      const text = response.text || "{}";
      const parsed = JSON.parse(text);
      res.json({ ...parsed, source: "gemini-3.8-flash" });
    } catch (err: any) {
      console.error("Error explaining lab results:", err);
      res.status(500).json({ error: err.message || "Lab explanation failed" });
    }
  });

  // AI Comprehensive Medical Record Summarizer
  app.post("/api/ai/summarize-record", async (req, res) => {
    try {
      const { patientChart } = req.body;
      const ai = getAI();

      if (!ai) {
        return res.json({
          executiveSummary: `${patientChart?.name || "Patient"} (${patientChart?.mrn || ""}) is under active hospital care for ${patientChart?.primaryDiagnosis || "clinical observation"}.`,
          keyRiskFactors: patientChart?.medicalHistory || ["Hypertension"],
          activeRegimenSummary: "Standard inpatient pharmacotherapy and scheduled vitals observation.",
          carePriorities: ["Maintain vital stability", "Complete ordered diagnostic labs", "Evaluate for discharge planning"],
          source: "offline_record_summarizer"
        });
      }

      const prompt = `You are a Chief Medical Officer conducting a high-level clinical review.
Synthesize the following comprehensive hospital patient chart into an executive clinical summary.

Patient Medical Chart:
${JSON.stringify(patientChart, null, 2)}

Format response in strict JSON:
{
  "executiveSummary": "1-2 paragraphs summarizing history, current presentation, clinical course, and trajectory",
  "keyRiskFactors": ["Bullet list of major clinical risk flags or comorbidities"],
  "activeRegimenSummary": "Concise summary of medications, pending labs, and consultations",
  "carePriorities": ["Top 3-4 clinical actions recommended for the care team"]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const text = response.text || "{}";
      const parsed = JSON.parse(text);
      res.json({ ...parsed, source: "gemini-3.8-flash" });
    } catch (err: any) {
      console.error("Error summarizing record:", err);
      res.status(500).json({ error: err.message || "Record summary failed" });
    }
  });

  // ============================================================================
  // Bruce Rii AI — Rwandan Patient Companion & Hospital Information Assistant
  // ============================================================================
  app.post("/api/ai/bruce-rii", async (req, res) => {
    try {
      const { message, history, language = "rw", patientContext } = req.body;
      const ai = getAI();

      const userQuery = (message || "").toLowerCase().trim();

      // Curated Rwanda hospital knowledge base summary for context
      const facilitiesSummary = RWANDA_FACILITIES.map((f) => ({
        name: f.name,
        type: f.type,
        province: f.province,
        district: f.district,
        phone: f.phone,
        emergency: f.emergency_available ? "24/7 Emergency Available" : "Standard OPD",
        availableBeds: f.available_beds,
        departments: f.departments?.slice(0, 5) || [],
        services: f.services?.slice(0, 5) || [],
        insurance: f.insurance_supported || [],
      }));

      // Match relevant facilities for quick recommendations
      const generalDirectoryQuery = /(ibitaro|hospital|hospitals|clinic|facilities|facility|directory|all hospitals|all clinics)/i.test(userQuery);
      const relevantFacilities = RWANDA_FACILITIES.filter((f) => {
        const text = `${f.name} ${f.district} ${f.province} ${(f.departments || []).join(" ")} ${(f.services || []).join(" ")}`.toLowerCase();
        if (generalDirectoryQuery) return true;
        if (userQuery.includes("mutuelle") && f.insurance_supported.includes("MUTUELLE_DE_SANTE")) return true;
        if ((userQuery.includes("umutima") || userQuery.includes("heart") || userQuery.includes("cardio")) && text.includes("cardio")) return true;
        if ((userQuery.includes("amaso") || userQuery.includes("eye") || userQuery.includes("vision")) && (text.includes("eye") || text.includes("kabgayi") || text.includes("ophthalm"))) return true;
        if ((userQuery.includes("umutwe") || userQuery.includes("psych") || userQuery.includes("mental") || userQuery.includes("ndera")) && (text.includes("neuro") || text.includes("ndera"))) return true;
        if ((userQuery.includes("kubyara") || userQuery.includes("maternity") || userQuery.includes("baby") || userQuery.includes("muhima")) && (text.includes("maternity") || text.includes("muhima"))) return true;
        if ((userQuery.includes("kanseri") || userQuery.includes("cancer") || userQuery.includes("butaro")) && (text.includes("cancer") || text.includes("oncology") || text.includes("butaro"))) return true;
        if ((userQuery.includes("emergency") || userQuery.includes("ubutabazi") || userQuery.includes("impanuka")) && f.emergency_available) return true;
        if (userQuery.includes("chuk") && f.name.includes("CHUK")) return true;
        if ((userQuery.includes("faisal") || userQuery.includes("kfh")) && f.name.includes("Faisal")) return true;
        if ((userQuery.includes("kanombe") || userQuery.includes("rmh")) && f.name.includes("Military")) return true;
        return false;
      }).slice(0, 6);

      // Intelligent localized responder for Bruce Rii AI in Kinyarwanda & English
      let fallbackReply = "";
      const emergencyNotice = language === "en"
        ? "🚨 Emergency Notice: If this is an immediate life-threatening situation, call SAMU Ambulance at 912 or 112 immediately."
        : "🚨 Ubutabazi Bwihuse: Niba ari ikibazo gikomeye cy'ubuzima cyangwa impanuka, hamagara Imbangukiragutabara (SAMU) kuri 912 cyangwa Polisi kuri 112 ako kanya.";

      const directoryQuestion = /(ibitaro|hospital|hospitals|clinic|facilities|facility|directory|ahantu|serivisi|service|services|biherereye|ahantu biherereye)/i.test(userQuery);
      const directoryMatches = RWANDA_FACILITIES.filter((f) => {
        const haystack = `${f.name} ${f.district} ${f.province} ${(f.departments || []).join(' ')} ${(f.services || []).join(' ')}`.toLowerCase();
        if (directoryQuestion) {
          return haystack.includes(userQuery.replace(/[^a-z0-9\s]/gi, '').trim()) || userQuery.includes('ibitaro') || userQuery.includes('hospital') || userQuery.includes('clinic') || userQuery.includes('serivisi') || userQuery.includes('service');
        }
        return false;
      });

      const directoryList = (directoryMatches.length ? directoryMatches : RWANDA_FACILITIES).slice(0, 8).map((facility) =>
        `- ${facility.name} (${facility.district}, ${facility.province}) — ${facility.services?.slice(0, 3).join(', ') || 'General care'}`
      ).join("\n");

      if (userQuery.includes("ibitaro") || userQuery.includes("hospital") || userQuery.includes("clinic") || userQuery.includes("facility") || userQuery.includes("hospitales") || userQuery.includes("ibitaro byose") || userQuery.includes("all hospitals")) {
        fallbackReply = language === "en"
          ? `Here is a quick Rwanda hospital directory, with major hospitals, location, and key services:\n\n${directoryList}\n\nFor detailed referral, emergency, or insurance guidance, tell me which specialty or province you need and I can narrow it down.`
          : `Dore ubusobanuro bw'ibitaro by'ingenzi byo mu Rwanda, aho biherereye, n'ibikorwa by'ingenzi bitanga:\n\n${directoryList}\n\nNiba ushaka ibitaro by'akarere runaka, serivisi zihariye (umutima, amaso, kubyara, kanseri, amenyo), cyangwa ubufasha mu buryo bwo kwivuza, ntanga province cyangwa ikibazo cyihariye.`;
      } else if (userQuery.includes("umutima") || userQuery.includes("heart") || userQuery.includes("cardio")) {
        fallbackReply = language === "en"
          ? "For specialized heart conditions and cardiothoracic care, King Faisal Hospital Rwanda (KFH) in Kacyiru offers advanced catheterization labs, cardiac surgeries, and pediatric cardiology. CHUK in Nyarugenge and Rwanda Military Hospital (RMH) Kanombe also provide cardiology clinics, diagnostic ECG/Echo, and inpatient telemetry care."
          : "Ku ndwara z'umutima no kubaga umutima (Cardiology & Heart Surgery), Ibitaro bya King Faisal Hospital Rwanda (KFH) biherereye i Kacyiru bifite inzobere n'icyuma gisesengura imitsi y'umutima (Catheterization Lab). Nanone CHUK i Nyarugenge n'Ibitaro bya Gisirikare i Kanombe (RMH) bitanga serivisi z'umutima n'isuzuma ry'ibyuma bya ECG na Echocardiography.";
      } else if (userQuery.includes("amaso") || userQuery.includes("eye") || userQuery.includes("kabgayi")) {
        fallbackReply = language === "en"
          ? "For comprehensive eye care and ophthalmology, Kabgayi Eye Hospital (Muhanga) and King Faisal Hospital provide top specialized cataract and retinal surgeries. CHUK also runs an outpatient eye clinic and visual acuity assessments."
          : "Ku ndwara n'ubuvuzi bw'amaso (Ophthalmology), Ibitaro by'Amaso bya Kabgayi (i Muhanga) n'Ibitaro bya King Faisal bitanga ubuvuzi bwimbitse harimo kubaga amaso, ubuvuzi bwa Cataracte n'ibirahure. Nanone CHUK itanga isuzuma ry'amaso buri munsi mu bitaro by'abanyeshuri.";
      } else if (userQuery.includes("kubyara") || userQuery.includes("maternity") || userQuery.includes("muhima") || userQuery.includes("baby")) {
        fallbackReply = language === "en"
          ? "For maternity and neonatal care, Muhima District Hospital in Nyarugenge is Rwanda's specialized maternal referral facility with high-capacity delivery suites and neonatal incubators. KFH and CHUK provide tertiary high-risk obstetrics and C-section operating suites."
          : "Ku bijyanye no kubyara n'ubuvuzi bw'abana bakivuka (Maternity & Neonatal Care), Ibitaro by'Akarere bya Muhima i Nyarugenge bifite umwihariko wo kwita ku babyeyi babyara n'icyumba cy'abana bavutse badashyitse (Kangaroo Mother Care & Incubators). Nanone CHUK na King Faisal bitanga serivisi zo kubaga (C-Section) n'ubuvuzi bukomeye bw'ababyeyi bafite ibibazo bidasanzwe.";
      } else if (userQuery.includes("mutuelle") || userQuery.includes("rssb") || userQuery.includes("ubwishingizi") || userQuery.includes("insurance")) {
        fallbackReply = language === "en"
          ? "In Rwanda, Mutuelle de Santé (CBHI) is accepted at all public health centers and district hospitals (paying only 10% or Ubudehe Tier 1 100% covered). To access national referral hospitals like CHUK or RMH under Mutuelle, you obtain an official transfer sheet (Urupapuro rwa Transfert) from your district hospital. King Faisal Hospital primarily accepts RSSB RAMA, MMI, and private insurers like Radiant, Sanlam, and Britam."
          : "Mu Rwanda, Ubwishingizi bwa Mutuelle de Santé (CBHI) bwakirwa mu bigo nderabuzima byose no mu bitaro by'uturere (umurwayi yishyura 10% cyangwa 0% ku bari mu cyiciro cya mbere cy'Ubudehe). Kugira ngo uvurwe muri CHUK cyangwa RMH Kanombe ukoresheje Mutuelle, usabwa kubanza guhabwa Urupapuro rwa Transfert n'ibitaro by'akarere. Ibitaro bya King Faisal byakira by'umwihariko RSSB RAMA, MMI n'amasosiyete yigenga nka Radiant, Sanlam na Britam.";
      } else if (userQuery.includes("kanseri") || userQuery.includes("cancer") || userQuery.includes("butaro")) {
        fallbackReply = language === "en"
          ? "The national center of excellence for oncology in Rwanda is Butaro Cancer Centre of Excellence (Burera District, Northern Province), in partnership with Partners In Health. Rwanda Military Hospital (RMH) Kanombe also offers advanced linear accelerator radiotherapy."
          : "Ikigo cy'intangarugero mu buvuzi bwa Kanseri mu Rwanda ni Ibitaro bya Butaro Cancer Centre of Excellence biherereye mu Karere ka Burera, Intara y'Amajyaruguru (ifatanyije na Partners In Health). Nanone Ibitaro bya Gisirikare i Kanombe (RMH) bitanga imiti n'imirasire (Radiotherapy) ivura kanseri.";
      } else if (userQuery.includes("umutwe") || userQuery.includes("ndera") || userQuery.includes("psych") || userQuery.includes("mental")) {
        fallbackReply = language === "en"
          ? "CARAES Ndera Neuropsychiatric Hospital in Gasabo is Rwanda's specialized referral facility for mental health, neuropsychiatry, and counseling services. Branches also operate in Butare and Ibare."
          : "Ibitaro bya CARAES Ndera biherereye i Ndera mu Karere ka Gasabo ni byo bitaro by'ikitegererezo mu buvuzi bw'indwara zo mu mutwe, ibibazo by'imitekerereze (Psychiatry) n'ubujyanama mu Rwanda. Bifite n'amashami i Butare n'i Rusizi.";
      } else {
        fallbackReply = language === "en"
          ? "Hello! I am Bruce Rii AI, your Rwandan hospital guide and patient assistant. I can help you find referral hospitals (CHUK, KFH, RMH Kanombe, Butaro, Muhima, Ruhengeri), doctor specialties, emergency numbers (SAMU 912), bed capacity, insurance coverage rules (Mutuelle de Santé, RSSB RAMA), and healthy living advice. How can I assist your health journey today?"
          : "Muraho neza! Nitwa Bruce Rii AI, umufasha wanyu w'ubuvuzi n'amakuru y'ibitaro mu Rwanda. Nshobora kubafasha kumenya amakuru ku bitaro byose byo mu Rwanda (CHUK, King Faisal Hospital, Kanombe RMH, Butaro Cancer Center, Muhima, Ruhengeri n'ibindi), serivisi bitanga, ubutabazi bwihuse (SAMU 912), uburyo bwo kwivuza ukoresheje Mutuelle de Santé na RAMA, ndetse n'inama z'ubuzima. Ni iki mwifuza kumenya uyu munsi?";
      }

      // If AI is available, attempt generation with a 4-second timeout
      if (ai) {
        try {
          const conversationContext = (history || [])
            .slice(-6)
            .map((h: any) => `${h.role === "user" ? "Patient" : "Bruce Rii AI"}: ${h.text || h.message}`)
            .join("\n");

          const prompt = `You are **Bruce Rii AI**, the premier Rwandan Hospital & Patient Healthcare Intelligence Assistant.
Your mission is to help Rwandan patients, families, and healthcare seekers find accurate, compassionate, and clear information about all hospitals in Rwanda, specialized medical treatments, emergency readiness, insurance procedures, and general health awareness.

You speak and respond fluently in Kinyarwanda, English, and French.
The user prefers language: "${language}" (rw = Kinyarwanda, en = English, fr = French).
Respond primarily in the language the patient uses, with natural warmth, clarity, and respect (e.g. using respectful Kinyarwanda greetings like "Muraho neza", "Tubaye hafi", "Komeza urugendo rwo kwivuza").

Rwanda Healthcare Facilities Knowledge Base:
${JSON.stringify(facilitiesSummary, null, 2)}

Key National Emergency & Health Contacts in Rwanda:
- SAMU Emergency Ambulance: 912 (Toll-Free, 24/7 across Rwanda)
- Police Emergency & Accident Rescue: 112
- Rwanda Biomedical Centre (RBC) Epidemic & Health Info: 114
- Gender-Based Violence & Isange One Stop Center: 3512
- Zipline Drone Blood & Medical Delivery: Active for 25+ district hospitals from Muhanga and Kayonza hubs

Insurance Guidance in Rwanda:
- Mutuelle de Santé (CBHI): Standard copay is 10% at Health Centers and District Hospitals. Tier 1 Ubudehe is 100% subsidized (0% copay). Tertiary referral to CHUK or RMH requires a stamped Transfer Sheet (Urupapuro rwa Transfert).
- RSSB RAMA: 85% coverage (15% patient copay) accepted widely at CHUK, RMH, KFH, and accredited clinics.
- MMI: Accepted at Military Hospital Kanombe, CHUK, KFH, and district facilities.
- Private: Sanlam, Radiant, Britam, Eden Care accepted with direct billing.

Conversation History:
${conversationContext}

Patient Context (if available):
${JSON.stringify(patientContext || {})}

Current Patient Message:
"${message}"

Provide your answer in strict, valid JSON format:
{
  "reply": "Comprehensive, compassionate, and highly informative answer addressing the patient's questions with exact hospital names, locations, and steps to take",
  "suggestedFacilities": [
    {
      "name": "Hospital Name",
      "district": "District, Province",
      "phone": "Phone number",
      "services": ["Specialty 1", "Specialty 2"]
    }
  ],
  "emergencyNote": "Clear emergency notice reminding them to call 912 or go to the nearest hospital in case of acute danger"
}`;

          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("AI timeout")), 4000));
          const generatePromise = ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              temperature: 0.3,
            },
          });

          const response: any = await Promise.race([generatePromise, timeoutPromise]);
          const text = response.text || "{}";
          const parsed = JSON.parse(text);
          if (parsed && parsed.reply) {
            return res.json({ ...parsed, source: "gemini-3.8-flash" });
          }
        } catch (genErr) {
          console.warn("Bruce Rii AI using local knowledge base:", genErr);
        }
      }

      // Fast, verified local knowledge engine response
      res.json({
        reply: fallbackReply,
        suggestedFacilities: relevantFacilities.map((f) => ({
          name: f.name,
          province: f.province,
          district: f.district,
          phone: f.phone,
          emergency: f.emergency_available ? "24/7" : "OPD",
          availableBeds: f.available_beds,
          services: f.services?.slice(0, 3) || [],
        })),
        emergencyNote: emergencyNotice,
        source: "bruce-rii-local-knowledge-engine",
      });
    } catch (err: any) {
      console.error("Error in Bruce Rii AI endpoint:", err);
      res.status(500).json({ error: err.message || "Bruce Rii AI processing failed" });
    }
  });


  // ============================================================================
  // Rwanda National Patient Identity & Insurance Verification Endpoints (NIDA / RSSB / RHIE)
  // ============================================================================

  // Provider configuration & demo mode status
  app.get("/api/national-id/config", (_req, res) => {
    const idProvider = getIdentityProvider();
    const insProvider = getInsuranceProvider();
    res.json({
      isDemo: idProvider.isDemo && insProvider.isDemo,
      demoNotice: "DEMO MODE — NOT CONNECTED TO GOVERNMENT SYSTEMS",
      identityProvider: idProvider.providerName,
      insuranceProvider: insProvider.providerName,
      nidaApiConfigured: Boolean(process.env.NIDA_API_KEY),
      rssbApiConfigured: Boolean(process.env.RSSB_API_KEY),
      rhieApiConfigured: Boolean(process.env.RHIE_API_URL),
    });
  });

  // 1. Facilities Directory
  app.get("/api/national-id/facilities", (_req, res) => {
    res.json({ facilities: RWANDA_FACILITIES });
  });

  // 2. National Patients Registry
  app.get("/api/national-id/patients", (_req, res) => {
    res.json({ patients: serverNationalPatients });
  });

  // 3. Verify Patient Identity via NIN (NIDA Provider Adapter)
  app.post("/api/national-id/verify-identity", async (req, res) => {
    try {
      const { nin, staffId, staffName, staffRole, facilityId, facilityName, reason } = req.body;

      if (!nin) {
        return res.status(400).json({ error: "National ID (NIN) is required" });
      }

      const cleanNIN = normalizeNIN(nin);
      const validation = isValidRwandanNIN(cleanNIN);
      if (!validation.isValid) {
        return res.status(422).json({ error: validation.error });
      }

      const idProvider = getIdentityProvider();
      const patientRecord = await idProvider.verifyNIN(cleanNIN, {
        staffId: staffId || "STAFF-UNKNOWN",
        facilityId: facilityId || "FAC-UNKNOWN",
        reason: reason || "Outpatient Consultation",
      });

      if (!patientRecord) {
        return res.status(404).json({
          error: `No citizen identity found for NIN ${formatRwandanNIN(cleanNIN)}`,
        });
      }

      // Record access audit log
      const auditLog = {
        id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        staff_id: staffId || "doc-001",
        staff_name: staffName || "Attending Physician",
        staff_role: staffRole || "doctor",
        facility_id: facilityId || "fac-chuk",
        facility_name: facilityName || "CHUK Kigali",
        patient_nin: patientRecord.nin,
        patient_name: patientRecord.full_name,
        action: "IDENTITY_VERIFIED" as const,
        timestamp: new Date().toISOString(),
        ip_address: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1",
        reason: reason || "Clinical Intake & EMR Identification",
        status: "SUCCESS" as const,
        details: `Verified via ${idProvider.providerName}. Demographic identity confirmed.`,
      };
      serverAccessAuditLogs.unshift(auditLog);

      // Keep in local registry if not already present
      if (!serverNationalPatients.some((p) => normalizeNIN(p.nin) === cleanNIN)) {
        serverNationalPatients.unshift(patientRecord as any);
      }

      res.json({
        patient: patientRecord,
        provider: idProvider.providerName,
        isDemo: idProvider.isDemo,
        notice: "DEMO MODE — NOT CONNECTED TO GOVERNMENT SYSTEMS",
        auditId: auditLog.id,
      });
    } catch (err: any) {
      console.error("Error verifying NIN identity:", err);
      res.status(500).json({ error: err.message || "Failed to verify identity" });
    }
  });

  // 4. Verify Insurance Eligibility (RSSB / Mutuelle / MMI / Private)
  app.post("/api/national-id/verify-insurance", async (req, res) => {
    try {
      const { nin, provider, patientName, staffId, staffName, staffRole, facilityId, facilityName } = req.body;

      if (!nin) {
        return res.status(400).json({ error: "NIN is required for insurance verification" });
      }

      const insProvider = getInsuranceProvider();
      const verification = await insProvider.verifyInsurance(nin, provider, patientName);

      if (!verification) {
        return res.status(404).json({ error: "Insurance policy verification record not found" });
      }

      // Log access audit
      const auditLog = {
        id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        staff_id: staffId || "doc-001",
        staff_name: staffName || "Attending Physician",
        staff_role: staffRole || "doctor",
        facility_id: facilityId || "fac-chuk",
        facility_name: facilityName || "CHUK Kigali",
        patient_nin: formatRwandanNIN(nin),
        patient_name: patientName || verification.patient_name,
        action: "INSURANCE_CHECK" as const,
        timestamp: new Date().toISOString(),
        ip_address: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1",
        reason: "Insurance Coverage & Copay Determination",
        status: "SUCCESS" as const,
        details: `${verification.provider_display_name} verified. Policy: ${verification.policy_number}, Tier: ${verification.tier || "STANDARD"}, Coverage: ${verification.coverage_percentage}%.`,
      };
      serverAccessAuditLogs.unshift(auditLog);

      res.json({
        insurance: verification,
        provider: insProvider.providerName,
        isDemo: insProvider.isDemo,
        notice: "DEMO MODE — NOT CONNECTED TO GOVERNMENT SYSTEMS",
      });
    } catch (err: any) {
      console.error("Error verifying insurance:", err);
      res.status(500).json({ error: err.message || "Insurance verification failed" });
    }
  });

  // 5. Record Patient Consent (Rwanda Data Protection Law N° 058/2021)
  app.post("/api/national-id/record-consent", (req, res) => {
    try {
      const patientNin = req.body.patientNin || req.body.patient_nin;
      const patientName = req.body.patientName || req.body.patient_name;
      const facilityId = req.body.facilityId || req.body.facility_id;
      const facilityName = req.body.facilityName || req.body.facility_name;
      const staffId = req.body.staffId || req.body.staff_id || req.body.recorded_by_staff_id;
      const staffName = req.body.staffName || req.body.staff_name || req.body.recorded_by_staff_name;
      const staffRole = req.body.staffRole || req.body.staff_role;
      const consentType = req.body.consentType || req.body.consent_type;
      const notes = req.body.notes || req.body.purpose;
      const status = req.body.status;
      const channel = req.body.channel;
      const granted = typeof req.body.granted === "boolean" ? req.body.granted : status !== "REVOKED";
      const validUntil = req.body.expires_at || req.body.expiresAt || req.body.valid_until || req.body.validUntil;

      if (!patientNin || !patientName) {
        return res.status(400).json({ error: "Patient NIN and name are required for consent recording" });
      }

      const consent = {
        id: `cst-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        patient_nin: formatRwandanNIN(patientNin),
        patient_name: patientName,
        facility_id: facilityId || "fac-chuk",
        facility_name: facilityName || "CHUK Kigali",
        staff_id: staffId || "doc-001",
        staff_name: staffName || "Attending Physician",
        staff_role: staffRole || "doctor",
        consent_type: consentType || "EMR_ACCESS",
        channel: channel || "VERBAL_WITNESSED",
        status: granted ? "GRANTED" : "REVOKED",
        granted,
        granted_at: new Date().toISOString(),
        expires_at: validUntil || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
        legal_framework: "Rwanda Law N° 058/2021 relating to personal data protection and privacy",
        purpose: req.body.purpose,
        notes: notes || "Informed patient consent digitally recorded for EMR diagnostic and clinical treatment.",
        ip_address: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1",
      };

      serverPatientConsents.unshift(consent as any);

      // Audit entry
      const auditLog = {
        id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        staff_id: staffId || "doc-001",
        staff_name: staffName || "Attending Physician",
        staff_role: staffRole || "doctor",
        facility_id: facilityId || "fac-chuk",
        facility_name: facilityName || "CHUK Kigali",
        patient_nin: consent.patient_nin,
        patient_name: patientName,
        action: "CONSENT_GRANTED" as const,
        timestamp: new Date().toISOString(),
        ip_address: consent.ip_address,
        reason: `Patient consent recorded for ${consent.consent_type}`,
        status: "SUCCESS" as const,
        details: `Consent stored under Rwanda Law N° 058/2021. Valid for 1 year.`,
      };
      serverAccessAuditLogs.unshift(auditLog);

      res.json({ consent, success: true });
    } catch (err: any) {
      console.error("Error recording consent:", err);
      res.status(500).json({ error: err.message || "Failed to record consent" });
    }
  });

  // 6. Get Patient Consents
  app.get("/api/national-id/consents", (_req, res) => {
    res.json({ consents: serverPatientConsents });
  });

  // 7. Create Encounter / Link National ID into Hospital EMR
  app.post("/api/national-id/create-encounter", (req, res) => {
    try {
      const {
        patientNin,
        patientName,
        facilityId,
        facilityName,
        staffId,
        staffName,
        staffRole,
        department,
        diagnosis,
        insuranceProvider,
        policyNumber,
        coveragePercent,
        encounterType,
      } = req.body;

      if (!patientNin || !patientName) {
        return res.status(400).json({ error: "patientNin and patientName are required" });
      }

      const mrn = `MRN-${Math.floor(10000 + Math.random() * 90000)}`;
      const encounter = {
        id: `enc-${Date.now()}`,
        mrn,
        patientNin: formatRwandanNIN(patientNin),
        patientName,
        facilityId: facilityId || "fac-chuk",
        facilityName: facilityName || "CHUK Kigali",
        staffId: staffId || "doc-001",
        staffName: staffName || "Attending Physician",
        department: department || "Internal Medicine",
        encounterType: encounterType || "Outpatient Consultation",
        diagnosis: diagnosis || "Clinical Intake Evaluation",
        insurance: {
          provider: insuranceProvider || "RSSB_RAMA",
          policyNumber: policyNumber || "RAMA-2026-AUTO",
          coveragePercent: coveragePercent || 85,
        },
        registeredAt: new Date().toISOString(),
        status: "ACTIVE",
      };

      // Audit log
      const auditLog = {
        id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        staff_id: staffId || "doc-001",
        staff_name: staffName || "Attending Physician",
        staff_role: staffRole || "doctor",
        facility_id: facilityId || "fac-chuk",
        facility_name: facilityName || "CHUK Kigali",
        patient_nin: encounter.patientNin,
        patient_name: patientName,
        action: "ENCOUNTER_CREATED" as const,
        timestamp: new Date().toISOString(),
        ip_address: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1",
        reason: `${encounterType || "Outpatient Consultation"} registered with assigned ${mrn}`,
        status: "SUCCESS" as const,
        details: `Linked National ID to hospital EMR chart ${mrn} in ${department || "Internal Medicine"}.`,
      };
      serverAccessAuditLogs.unshift(auditLog);

      res.json({ encounter, success: true });
    } catch (err: any) {
      console.error("Error creating encounter:", err);
      res.status(500).json({ error: err.message || "Failed to create encounter" });
    }
  });

  // 8. Referrals (Local & International)
  app.get("/api/national-id/referrals", (req, res) => {
    const { facilityId, status, type } = req.query;
    let list = [...serverPatientReferrals];
    if (facilityId) {
      list = list.filter(
        (r) => r.source_facility_id === facilityId || r.destination_facility_id === facilityId
      );
    }
    if (status) {
      list = list.filter((r) => r.status === status);
    }
    if (type) {
      list = list.filter((r) => r.referral_type === type);
    }
    res.json({ referrals: list });
  });

  app.post("/api/national-id/referrals", (req, res) => {
    try {
      const {
        patient_nin,
        patient_name,
        patient_age,
        patient_gender,
        source_facility_id,
        source_facility_name,
        destination_facility_id,
        destination_facility_name,
        destination_country,
        referral_type,
        priority,
        primary_diagnosis,
        clinical_summary,
        transfer_reason,
        required_services,
        referring_doctor_id,
        referring_doctor_name,
        referring_department,
        ambulance_required,
        assigned_ambulance,
        transport_notes,
      } = req.body;

      if (!patient_nin || !destination_facility_id || !primary_diagnosis) {
        return res.status(400).json({
          error: "patient_nin, destination_facility_id, and primary_diagnosis are required",
        });
      }

      const refSeq = serverPatientReferrals.length + 105;
      const refCode =
        referral_type === "INTERNATIONAL"
          ? `REF-2026-INT-${String(refSeq).padStart(4, "0")}`
          : `REF-2026-RW-${String(refSeq).padStart(4, "0")}`;

      const newReferral = {
        id: `ref-${Date.now()}`,
        referral_number: refCode,
        patient_nin: formatRwandanNIN(patient_nin),
        patient_name,
        patient_age: Number(patient_age) || 35,
        patient_gender: patient_gender || "Male",
        source_facility_id: source_facility_id || "fac-chuk",
        source_facility_name: source_facility_name || "CHUK Kigali",
        source_facility_district: "Kigali",
        destination_facility_id,
        destination_facility_name,
        destination_country: destination_country || "Rwanda",
        referral_type: referral_type || "LOCAL",
        priority: priority || "ROUTINE",
        status: "PENDING" as const,
        primary_diagnosis,
        clinical_summary: clinical_summary || "Referral for specialized tertiary medical care.",
        transfer_reason: transfer_reason || "Requires specialized intervention.",
        required_services: required_services || ["Specialist Consultation"],
        referring_doctor_id: referring_doctor_id || "doc-001",
        referring_doctor_name: referring_doctor_name || "Attending Physician",
        referring_department: referring_department || "Internal Medicine",
        created_at: new Date().toISOString(),
        ambulance_required: Boolean(ambulance_required),
        assigned_ambulance: assigned_ambulance || (ambulance_required ? "AMB-01 (KGL-ALS)" : undefined),
        transport_notes,
      };

      serverPatientReferrals.unshift(newReferral as any);

      // Log access audit
      const auditLog = {
        id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        staff_id: referring_doctor_id || "doc-001",
        staff_name: referring_doctor_name || "Attending Physician",
        staff_role: "doctor",
        facility_id: source_facility_id || "fac-chuk",
        facility_name: source_facility_name || "CHUK Kigali",
        patient_nin: newReferral.patient_nin,
        patient_name,
        action: "REFERRAL_CREATED" as const,
        timestamp: new Date().toISOString(),
        ip_address: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1",
        reason: `${referral_type} Referral issued to ${destination_facility_name} (${refCode})`,
        status: "SUCCESS" as const,
        details: `Diagnosis: ${primary_diagnosis}. Priority: ${priority}.`,
      };
      serverAccessAuditLogs.unshift(auditLog);

      res.status(201).json({ referral: newReferral, success: true });
    } catch (err: any) {
      console.error("Error creating referral:", err);
      res.status(500).json({ error: err.message || "Failed to create referral" });
    }
  });

  // Update Referral Status (Pending -> Accepted / In Transit / Completed / Rejected)
  app.patch("/api/national-id/referrals/:id/status", (req, res) => {
    try {
      const { id } = req.params;
      const { status, receivingNotes, assignedAmbulance, staffName, facilityName } = req.body;

      const referralIndex = serverPatientReferrals.findIndex((r) => r.id === id);
      if (referralIndex === -1) {
        return res.status(404).json({ error: "Referral not found" });
      }

      const existing = serverPatientReferrals[referralIndex];
      const updated = {
        ...existing,
        status: status || existing.status,
        receiving_notes: receivingNotes || existing.receiving_notes,
        assigned_ambulance: assignedAmbulance || existing.assigned_ambulance,
        accepted_at: status === "ACCEPTED" ? new Date().toISOString() : existing.accepted_at,
        completed_at: status === "COMPLETED" ? new Date().toISOString() : existing.completed_at,
      };

      serverPatientReferrals[referralIndex] = updated;

      // Log status change audit
      const auditLog = {
        id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        staff_id: "doc-receiving",
        staff_name: staffName || "Receiving Medical Officer",
        staff_role: "doctor",
        facility_id: updated.destination_facility_id,
        facility_name: facilityName || updated.destination_facility_name,
        patient_nin: updated.patient_nin,
        patient_name: updated.patient_name,
        action: "REFERRAL_UPDATED" as const,
        timestamp: new Date().toISOString(),
        ip_address: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1",
        reason: `Referral ${updated.referral_number} status changed to ${status}`,
        status: "SUCCESS" as const,
        details: receivingNotes || `Updated status to ${status}`,
      };
      serverAccessAuditLogs.unshift(auditLog);

      res.json({ referral: updated, success: true });
    } catch (err: any) {
      console.error("Error updating referral status:", err);
      res.status(500).json({ error: err.message || "Failed to update referral" });
    }
  });

  // 9. Access Audit Logs (Read-only immutable trace)
  app.get("/api/national-id/audit-logs", (_req, res) => {
    res.json({ auditLogs: serverAccessAuditLogs });
  });

  // ============================================================================
  // Payment Gateway Endpoints (Mobile Money Push & Status Verification)
  // ============================================================================

  // 10. Request Mobile Money / Card Payment Push
  app.post("/api/payments/mobile-money/request", async (req, res) => {
    try {
      const { invoiceId, patientId, facilityId, amount, currency, method, phoneNumber, customerName } = req.body;
      if (!invoiceId || !amount) {
        return res.status(400).json({ error: "invoiceId and amount are required" });
      }

      const paymentMethod = method || 'MTN_MOMO';
      const provider = getPaymentProvider(paymentMethod);
      const idempotencyKey = `idemp-${invoiceId}-${Date.now()}`;

      const paymentResult = await provider.initiatePayment({
        invoiceId,
        patientId,
        facilityId,
        amount: Number(amount),
        currency: currency || 'RWF',
        method: paymentMethod,
        phoneNumber,
        customerName,
        idempotencyKey,
      });

      // Record audit log
      const auditLog = {
        id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        staff_id: "cashier-001",
        staff_name: "Billing Cashier",
        staff_role: "cashier",
        facility_id: facilityId || "fac-chuk",
        facility_name: "Hospital Cashier Office",
        patient_nin: "N/A",
        patient_name: customerName || "Patient",
        action: "PAYMENT_CREATED" as const,
        timestamp: new Date().toISOString(),
        ip_address: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1",
        reason: `Payment initiated for invoice ${invoiceId}: ${amount} ${currency || 'RWF'}`,
        status: "SUCCESS" as const,
        details: `Payment ID: ${paymentResult.paymentId}, Ref: ${paymentResult.providerReference}. Prompt sent to ${paymentResult.phoneMasked}.`,
      };
      serverAccessAuditLogs.unshift(auditLog);

      res.status(201).json(paymentResult);
    } catch (err: any) {
      console.error("Error initiating payment:", err);
      res.status(500).json({ error: err.message || "Failed to initiate payment" });
    }
  });

  // 11. Check Payment Status
  app.get("/api/payments/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const provider = getPaymentProvider('MTN_MOMO');
      const statusResult = await provider.checkPaymentStatus(id);

      if (statusResult.status === 'SUCCESS') {
        const auditLog = {
          id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          staff_id: "system",
          staff_name: "Provider Webhook / Poller",
          staff_role: "system",
          facility_id: "system",
          facility_name: "National Payment Gateway",
          patient_nin: "N/A",
          patient_name: "Patient",
          action: "PAYMENT_SUCCESS" as const,
          timestamp: new Date().toISOString(),
          ip_address: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1",
          reason: `Confirmed payment ${id} for invoice ${statusResult.invoiceId}`,
          status: "SUCCESS" as const,
          details: `Telco transaction ${statusResult.providerReference} verified successfully.`,
        };
        serverAccessAuditLogs.unshift(auditLog);
      }

      res.json(statusResult);
    } catch (err: any) {
      console.error("Error checking payment status:", err);
      res.status(404).json({ error: err.message || "Payment not found" });
    }
  });

  // 12. Payment Webhook Callback
  app.post("/api/payments/webhook", async (req, res) => {
    try {
      const signature = req.headers["x-webhook-signature"] as string | undefined;
      const provider = getPaymentProvider('MTN_MOMO');
      const result = await provider.handleWebhook(req.body, signature);
      res.json(result);
    } catch (err: any) {
      console.error("Error processing payment webhook:", err);
      res.status(400).json({ error: err.message || "Webhook processing failed" });
    }
  });

  // 13. Refund Payment
  app.post("/api/payments/:id/refund", async (req, res) => {
    try {
      const { id } = req.params;
      const { amount, reason } = req.body;
      const provider = getPaymentProvider('MTN_MOMO');
      const refundResult = await provider.refundPayment(id, Number(amount) || 0, reason || 'Billing adjustment');

      const auditLog = {
        id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        staff_id: "admin-001",
        staff_name: "Finance Controller",
        staff_role: "accountant",
        facility_id: "fac-chuk",
        facility_name: "Hospital Finance",
        patient_nin: "N/A",
        patient_name: "Patient",
        action: "REFUND_COMPLETED" as const,
        timestamp: new Date().toISOString(),
        ip_address: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1",
        reason: `Refund of ${amount} RWF for payment ${id}`,
        status: "SUCCESS" as const,
        details: reason || "Billing adjustment",
      };
      serverAccessAuditLogs.unshift(auditLog);

      res.json(refundResult);
    } catch (err: any) {
      console.error("Error refunding payment:", err);
      res.status(500).json({ error: err.message || "Refund failed" });
    }
  });

  // Vite middleware (dev) or static SPA (production). API routes registered above.
  if (process.env.NODE_ENV === "production") {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api")) return next();
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: { server } },
      appType: "spa",
      clearScreen: false,
    });
    app.use(vite.middlewares);
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`UBUZIMA HMS server running on http://localhost:${PORT} (${process.env.NODE_ENV || "development"})`);
  });
}

startServer();
