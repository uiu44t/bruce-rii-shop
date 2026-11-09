import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Phone,
  MapPin,
  Building2,
  HeartPulse,
  ShieldCheck,
  AlertTriangle,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RefreshCw,
  X,
  Search,
  ExternalLink,
  ChevronRight,
  Flame,
  Globe,
  BedDouble,
  Baby,
  Smile,
  Eye,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { RWANDA_FACILITIES } from '../data/mockRwandaNationalData';
import { Facility } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'bruce';
  text: string;
  timestamp: string;
  suggestedFacilities?: any[];
  emergencyNote?: string;
  source?: string;
}

interface BruceRiiAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuestion?: string;
}

export const BruceRiiAiModal: React.FC<BruceRiiAiModalProps> = ({
  isOpen,
  onClose,
  initialQuestion,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'hospitals' | 'emergency' | 'insurance'>('chat');
  const [language, setLanguage] = useState<'rw' | 'en' | 'fr'>('rw');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Hospital directory search state
  const [hospitalSearch, setHospitalSearch] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<string>('All');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialWelcomeMessages: Record<'rw' | 'en' | 'fr', Message> = {
    rw: {
      id: 'welcome-rw',
      sender: 'bruce',
      text: "Muraho neza! Nitwa **Bruce Rii AI**, umufasha wanyu w'ubuvuzi n'amakuru y'ibitaro byose mu Rwanda. Nshobora kubafasha kumenya:\n\n• Ibitaro bitanga serivisi zihariye (Umutima, Amaso, Kubyara, Kanseri, Amenyo, n'ibindi)\n• Nimero z'ubutabazi bwihuse (SAMU 912, Polisi 112, RBC 114)\n• Uburyo bwo kwivuza ukoresheje Mutuelle de Santé (CBHI) na RSSB RAMA\n• Aho ibitaro biherereye n'uburyo bwo kubona Transfert (Referral)\n• Inama z'ubuzima n'isuku yo kwirinda indwara\n\nNi iki mwifuza kumenya uyu munsi?",
      timestamp: 'Ubu',
      suggestedFacilities: [
        {
          name: 'Centre Hospitalier Universitaire de Kigali (CHUK)',
          district: 'Nyarugenge, Kigali',
          phone: '+250 252 575 555',
          services: ['Level 1 Trauma Emergency', 'Catheterization Lab', 'Surgery'],
        },
        {
          name: 'King Faisal Hospital Rwanda (KFH)',
          district: 'Gasabo, Kigali',
          phone: '+250 252 588 888',
          services: ['Kidney Transplant', 'Heart Surgery', 'Gamma Knife'],
        },
      ],
      emergencyNote: '🚨 Ubutabazi bwihuse: Ku bibazo bikomeye byihutirwa, hamagara SAMU kuri 912 ako kanya.',
    },
    en: {
      id: 'welcome-en',
      sender: 'bruce',
      text: "Hello! I am **Bruce Rii AI**, your Rwanda hospital intelligence and patient navigation assistant. I am here to help you with:\n\n• Locating specialized care across all referral & district hospitals (Cardiology, Eye Care, Maternity, Oncology, Dental)\n• Emergency hotlines (SAMU Ambulance 912, Police 112, RBC 114)\n• Insurance copays & procedures (Mutuelle de Santé, RSSB RAMA, MMI)\n• Hospital bed availability, locations, and referral (Transfert) steps\n• General health advice, symptom awareness, and medication guidance\n\nHow can I support your health inquiries today?",
      timestamp: 'Just now',
      suggestedFacilities: [
        {
          name: 'Centre Hospitalier Universitaire de Kigali (CHUK)',
          district: 'Nyarugenge, Kigali',
          phone: '+250 252 575 555',
          services: ['Level 1 Trauma ED', 'Catheterization Lab', 'Neurosurgery'],
        },
        {
          name: 'King Faisal Hospital Rwanda (KFH)',
          district: 'Gasabo, Kigali',
          phone: '+250 252 588 888',
          services: ['Kidney Transplant', 'Coronary Angioplasty', 'ICU/CCU'],
        },
      ],
      emergencyNote: '🚨 Emergency Hotline: In severe medical emergencies, dial SAMU at 912 immediately.',
    },
    fr: {
      id: 'welcome-fr',
      sender: 'bruce',
      text: "Bonjour! Je suis **Bruce Rii AI**, votre assistant hospitalier et guide médical au Rwanda. Je suis disponible pour vous renseigner sur les hôpitaux de référence, les spécialités médicales, les urgences (SAMU 912), et les assurances (Mutuelle, RAMA). Comment puis-je vous aider aujourd'hui?",
      timestamp: 'Maintenant',
      emergencyNote: '🚨 Urgence Médicale: Appelez le SAMU au 912 en cas de danger immédiat.',
    },
  };

  const [messages, setMessages] = useState<Message[]>([initialWelcomeMessages[language]]);

  // Pre-fill question if opened with one
  useEffect(() => {
    if (initialQuestion && isOpen) {
      sendMessage(initialQuestion);
    }
  }, [initialQuestion, isOpen]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const quickPrompts = language === 'rw' ? [
    { label: '🫀 Ubuvuzi bw\'umutima & KFH/CHUK', prompt: 'Ese ni ayahe bitaro bitanga ubuvuzi bwo kubaga umutima n\'imitsi mu Rwanda?' },
    { label: '👁️ Amaso i Kabgayi & KFH', prompt: 'Nkeneye kumenya ibitaro bifite inzobere z\'amaso nka Kabgayi na King Faisal Hospital.' },
    { label: '🤰 Kubyara & Muhima Hospital', prompt: 'Ibitaro bya Muhima bitanga izihe serivisi ku babyeyi bitegura kubyara n\'abana bavutse?' },
    { label: '🛡️ Mutuelle de Santé & Transfert', prompt: 'Ubwishingizi bwa Mutuelle de Santé bukorera he kandi ni gute mbona urupapuro rwa transfert?' },
    { label: '🎗️ Kanseri i Butaro & RMH', prompt: 'Ndashaka amakuru ku buvuzi bwa Kanseri mu bitaro bya Butaro Cancer Center na Kanombe RMH.' },
    { label: '🧠 Ubuzima bwo mu Mutwe (Ndera)', prompt: 'Amakuru ku buvuzi bw\'indwara zo mu mutwe n\'ubujyanama mu bitaro bya CARAES Ndera.' },
    { label: '🚑 Ubutabazi bwa SAMU 912', prompt: 'Ni gute nahamagara imbangukiragutabara ya SAMU 912 mu gihe cy\'impanuka cyangwa indembe?' },
    { label: '🦷 Amenyo & Dental Clinic', prompt: 'Ni he nakura serivisi zihariye zo kwisuzumisha no kuvura amenyo mu Rwanda?' },
  ] : [
    { label: '🫀 Cardiac & Heart Care', prompt: 'Which referral hospitals in Rwanda offer advanced cardiology and open heart surgery?' },
    { label: '👁️ Eye Surgeries & Kabgayi', prompt: 'Tell me about eye treatment and ophthalmology at Kabgayi Eye Hospital and KFH.' },
    { label: '🤰 Muhima Maternity Center', prompt: 'What maternal and neonatal services are provided at Muhima District Hospital?' },
    { label: '🛡️ Mutuelle (CBHI) & Referral Rules', prompt: 'How does Mutuelle de Santé work across district and national referral hospitals in Rwanda?' },
    { label: '🎗️ Butaro Oncology Center', prompt: 'What cancer diagnosis, chemotherapy, and radiotherapy services exist in Rwanda?' },
    { label: '🧠 Mental Health (Ndera CARAES)', prompt: 'What services does CARAES Ndera Hospital provide for neuropsychiatry and mental wellness?' },
    { label: '🚑 SAMU Emergency Ambulance (912)', prompt: 'How does the national SAMU 912 emergency dispatch ambulance system work?' },
  ];

  const sendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const res = await fetch('/api/ai/bruce-rii', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history: historyPayload,
          language,
        }),
      });

      const data = await res.json();

      const aiMsg: Message = {
        id: `bruce-${Date.now()}`,
        sender: 'bruce',
        text: data.reply || "Murakoze. Nshobora kubafasha gushaka amakuru ku bitaro byose byo mu Rwanda.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFacilities: data.suggestedFacilities,
        emergencyNote: data.emergencyNote,
        source: data.source,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Error querying Bruce Rii AI:', err);
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'bruce',
        text: language === 'en'
          ? "I am temporarily offline but you can reach emergency services at 912 (SAMU) or visit CHUK (+250 252 575 555) / King Faisal Hospital (+250 252 588 888)."
          : "Ntabwo mbashe guhura na seriveri ako kanya, ariko mwakwifashisha nimero ya SAMU 912 ku butabazi bwihuse cyangwa mugahamagara CHUK (+250 252 575 555) na King Faisal Hospital (+250 252 588 888).",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const cleanText = text.replace(/[*_#]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === 'en' ? 'en-US' : language === 'fr' ? 'fr-FR' : 'rw';
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Filter facilities in directory
  const filteredFacilities = RWANDA_FACILITIES.filter((f) => {
    const matchesSearch =
      hospitalSearch === '' ||
      f.name.toLowerCase().includes(hospitalSearch.toLowerCase()) ||
      f.district.toLowerCase().includes(hospitalSearch.toLowerCase()) ||
      f.province.toLowerCase().includes(hospitalSearch.toLowerCase()) ||
      (f.services || []).some((s) => s.toLowerCase().includes(hospitalSearch.toLowerCase())) ||
      (f.departments || []).some((d) => d.toLowerCase().includes(hospitalSearch.toLowerCase()));

    const matchesProvince = selectedProvince === 'All' || f.province.toLowerCase().includes(selectedProvince.toLowerCase());

    const matchesSpecialty =
      selectedSpecialty === 'All' ||
      (f.services || []).some((s) => s.toLowerCase().includes(selectedSpecialty.toLowerCase())) ||
      (f.departments || []).some((d) => d.toLowerCase().includes(selectedSpecialty.toLowerCase()));

    return matchesSearch && matchesProvince && matchesSpecialty;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-indigo-700/60 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl shadow-indigo-950/80 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-indigo-950/90 to-slate-900 border-b border-indigo-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-rose-500 p-0.5 shadow-lg shadow-indigo-500/20">
                <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
                  <Bot className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-wide flex items-center gap-1.5">
                  Bruce Rii AI
                  <span className="bg-gradient-to-r from-cyan-500 to-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Patient Companion
                  </span>
                </h2>
              </div>
              <p className="text-xs text-indigo-200/80">
                {language === 'rw'
                  ? "Ubufasha bw'Abarwayi & Amakuru y'Ibitaro byose mu Rwanda (CHUK, KFH, RMH, Butaro...)"
                  : 'Rwanda Hospital Intelligence & Patient Healthcare Navigator'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl p-1 text-xs">
              <button
                onClick={() => {
                  setLanguage('rw');
                  setMessages((prev) => (prev.length === 1 ? [initialWelcomeMessages.rw] : prev));
                }}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  language === 'rw' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="Kinyarwanda"
              >
                <span className="inline-flex items-center gap-1.5">
                  <svg
                    aria-hidden="true"
                    className="h-auto w-4"
                    viewBox="0 0 30 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect width="30" height="10" fill="#00A1DE" />
                    <rect y="10" width="30" height="5" fill="#FAD201" />
                    <rect y="15" width="30" height="5" fill="#20603D" />
                    <g stroke="#FAD201" strokeWidth="1.2">
                      <path d="M25 1v7M21.5 4.5h7M22.5 2l5 5m0-5-5 5" />
                    </g>
                    <circle cx="25" cy="4.5" r="2" fill="#FAD201" />
                  </svg>
                  RW
                </span>
              </button>
              <button
                onClick={() => {
                  setLanguage('en');
                  setMessages((prev) => (prev.length === 1 ? [initialWelcomeMessages.en] : prev));
                }}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  language === 'en' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="English"
              >
                🇬🇧 EN
              </button>
              <button
                onClick={() => {
                  setLanguage('fr');
                  setMessages((prev) => (prev.length === 1 ? [initialWelcomeMessages.fr] : prev));
                }}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  language === 'fr' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="Français"
              >
                🇫🇷 FR
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/60 px-4 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'chat'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {language === 'rw' ? 'Baza Bruce Rii (Chat)' : 'Ask Bruce Rii (AI Chat)'}
          </button>

          <button
            onClick={() => setActiveTab('hospitals')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'hospitals'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            {language === 'rw' ? "Ibitaro byose mu Rwanda (Directory)" : 'All Hospitals Directory'}
            <span className="bg-indigo-950 text-indigo-300 text-[10px] px-1.5 py-0.2 rounded-full">
              {RWANDA_FACILITIES.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('emergency')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'emergency'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            {language === 'rw' ? 'Ubutabazi bwa SAMU (912)' : 'Emergency & Hotlines (912)'}
          </button>

          <button
            onClick={() => setActiveTab('insurance')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'insurance'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            {language === 'rw' ? 'Mutuelle & RAMA Guide' : 'Insurance & Transfers'}
          </button>
        </div>

        {/* Tab 1: Chat View */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-900/50">
            {/* Quick Prompts Bar */}
            <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                {language === 'rw' ? 'Ibibazo Bikunze Kubazwa:' : 'Suggested Questions:'}
              </span>
              {quickPrompts.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(q.prompt)}
                  className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-indigo-900/40 hover:text-indigo-200 border border-slate-700/60 text-slate-300 text-[11px] font-medium whitespace-nowrap transition-all active:scale-95"
                >
                  {q.label}
                </button>
              ))}
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 max-w-3xl ${
                    m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className="shrink-0">
                    {m.sender === 'user' ? (
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                        <User className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl p-4 text-xs leading-relaxed space-y-2.5 shadow-sm ${
                      m.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-slate-800/90 text-slate-100 border border-slate-700/80 rounded-tl-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans">{m.text}</div>

                    {/* Suggested Facilities Card List if present */}
                    {m.suggestedFacilities && m.suggestedFacilities.length > 0 && (
                      <div className="pt-2 border-t border-slate-700/60 space-y-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {language === 'rw' ? "Ibitaro Byasabwe & Serivisi zabyo:" : "Recommended Hospitals & Units:"}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {m.suggestedFacilities.map((fac, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 flex flex-col justify-between hover:border-indigo-500/60 transition-colors"
                            >
                              <div>
                                <div className="font-bold text-white text-[11px]">{fac.name}</div>
                                <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                  <MapPin className="w-2.5 h-2.5 text-indigo-400 shrink-0" />
                                  {fac.district}
                                </div>
                                {fac.services && (
                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                    {fac.services.map((s: string, sIdx: number) => (
                                      <span
                                        key={sIdx}
                                        className="text-[9px] bg-indigo-950/80 text-indigo-300 border border-indigo-800/40 px-1.5 py-0.2 rounded"
                                      >
                                        {s}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {fac.phone && (
                                <a
                                  href={`tel:${fac.phone}`}
                                  className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 hover:text-emerald-300"
                                >
                                  <Phone className="w-2.5 h-2.5" />
                                  {fac.phone}
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Emergency Banner inside bubble */}
                    {m.emergencyNote && (
                      <div className="p-2 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-[10px] flex items-center gap-2">
                        <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0 animate-pulse" />
                        <span>{m.emergencyNote}</span>
                      </div>
                    )}

                    {/* Bottom Metadata & Controls */}
                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                      <span>{m.timestamp}</span>

                      {m.sender === 'bruce' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => speakText(m.text)}
                            className="hover:text-cyan-300 transition-colors"
                            title="Soma mu ijwi (Text-to-Speech)"
                          >
                            {isSpeaking ? (
                              <VolumeX className="w-3.5 h-3.5 text-cyan-400" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => copyToClipboard(m.text, m.id)}
                            className="hover:text-cyan-300 transition-colors"
                            title="Koporora (Copy text)"
                          >
                            {copiedId === m.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 max-w-xl">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white">
                    <Bot className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-none p-3 text-xs text-slate-300 flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                    <span>Bruce Rii ari gusesengura amakuru y'ibitaro...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar */}
            <div className="p-3 bg-slate-950 border-t border-slate-800">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={
                    language === 'rw'
                      ? "Baza Bruce Rii amakuru ku bitaro, serivisi, cyangwa ubuzima (urugero: CHUK, Mutuelle, Amaso)..."
                      : "Ask Bruce Rii about hospitals, specialties, emergency care, or insurances..."
                  }
                  className="flex-1 bg-slate-850 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />

                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-indigo-900/30 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{language === 'rw' ? 'Ohereza' : 'Send'}</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 2: All Hospitals Directory */}
        {activeTab === 'hospitals' && (
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-900/50">
            {/* Filter and Search Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={hospitalSearch}
                  onChange={(e) => setHospitalSearch(e.target.value)}
                  placeholder={language === 'rw' ? "Shakisha ibitaro cyangwa serivisi..." : "Search hospital or specialty..."}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="All">🇷🇼 Intara Zose (All Provinces)</option>
                  <option value="Kigali City">Umujyi wa Kigali (Kigali City)</option>
                  <option value="Northern">Amajyaruguru (Northern)</option>
                  <option value="Southern">Amajyepfo (Southern)</option>
                  <option value="Eastern">Iburasirazuba (Eastern)</option>
                  <option value="Western">Iburengerazuba (Western)</option>
                </select>
              </div>

              <div>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="All">🩺 Serivisi Zose (All Specialties)</option>
                  <option value="Trauma">Level 1 Emergency & Trauma</option>
                  <option value="Cardio">Umutima (Cardiology / Catheterization)</option>
                  <option value="Transplant">Kidney Transplant & Nephrology</option>
                  <option value="Maternity">Kubyara & Neonatal (Maternity)</option>
                  <option value="Cancer">Kanseri & Oncology (Butaro / RMH)</option>
                  <option value="Neuro">Umutwe & Neurosurgery</option>
                  <option value="Eye">Amaso (Ophthalmology)</option>
                </select>
              </div>
            </div>

            {/* Hospital Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredFacilities.map((fac) => (
                <div
                  key={fac.id}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-indigo-600/60 transition-all flex flex-col justify-between group shadow-sm"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/40">
                            {fac.type}
                          </span>
                          {fac.emergency_available && (
                            <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1">
                              <Flame className="w-3 h-3 text-rose-500" /> 24/7 ED
                            </span>
                          )}
                        </div>
                        <h3 className="font-extrabold text-white text-sm mt-1 group-hover:text-cyan-300 transition-colors">
                          {fac.name}
                        </h3>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-300 flex items-center gap-1 mb-2">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{fac.address || `${fac.district}, ${fac.province}`}</span>
                    </div>

                    {/* Bed Capacity and Doctors */}
                    <div className="grid grid-cols-2 gap-2 my-2 p-2 rounded-xl bg-slate-900 border border-slate-800 text-[10px]">
                      <div>
                        <span className="text-slate-400 block">Ibitanda Bihari (Beds):</span>
                        <span className="font-mono font-bold text-emerald-400 text-xs">
                          {fac.available_beds} / {fac.total_beds || 'N/A'} free
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Abaganga (Doctors):</span>
                        <span className="font-mono font-bold text-indigo-300 text-xs">
                          {fac.doctors_count || 12} specialists
                        </span>
                      </div>
                    </div>

                    {/* Top Services */}
                    {fac.services && fac.services.length > 0 && (
                      <div className="space-y-1 mb-3">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                          {language === 'rw' ? 'Serivisi z\'ingenzi:' : 'Key Specialties:'}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {fac.services.slice(0, 4).map((s, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700/60"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <a
                      href={`tel:${fac.phone}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold transition-colors"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{fac.phone}</span>
                    </a>

                    <button
                      onClick={() => {
                        setActiveTab('chat');
                        sendMessage(`Mbwire amakuru arambuye ku bitaro bya ${fac.name} biherereye muri ${fac.district}. Ni izihe serivisi bitanga kandi ni ubuhe bwishingizi byakira?`);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all active:scale-95 shadow-sm"
                    >
                      <Sparkles className="w-3 h-3 text-cyan-200" />
                      <span>{language === 'rw' ? 'Baza Bruce Rii' : 'Ask Bruce Rii'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Emergency & SAMU Hotlines */}
        {activeTab === 'emergency' && (
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5 bg-slate-900/50">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/80 via-slate-900 to-slate-900 border border-rose-800/80 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-rose-950">
                <Flame className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-white">
                  {language === 'rw' ? 'Ubutabazi Bwihuse mu Rwanda (National Emergency)' : 'National Medical Emergency Protocols'}
                </h3>
                <p className="text-xs text-rose-200/90 leading-relaxed">
                  {language === 'rw'
                    ? "Mugihe habaye impanuka ikomeye, guhagarara k'umutima, kuvirirana gukabije, cyangwa ikibazo gikomeye cy'ubuzima, hamagara nimero z'ubutabazi zikurikira ako kanya bitishyurwa."
                    : 'In case of severe acute trauma, cardiac arrest, respiratory failure, or life-threatening emergencies, contact the national toll-free emergency dispatch lines immediately.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* SAMU 912 */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-rose-600/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 bg-rose-950 px-2 py-0.5 rounded-full">
                    Ambulance Toll-Free
                  </span>
                  <Phone className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-2xl font-black text-white font-mono">912</div>
                <div className="font-bold text-white text-xs">SAMU Rwanda (Ambulance Dispatch)</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {language === 'rw'
                    ? "Imbangukiragutabara zihariye zoherezwa mu Turere twose tw'u Rwanda 24/7."
                    : 'National emergency pre-hospital ambulance dispatch covering all 30 districts.'}
                </p>
              </div>

              {/* Police 112 */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-sky-600/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-sky-400 bg-sky-950 px-2 py-0.5 rounded-full">
                    Police & Accidents
                  </span>
                  <Phone className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-2xl font-black text-white font-mono">112</div>
                <div className="font-bold text-white text-xs">RNP Emergency / Traffic Accident</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {language === 'rw'
                    ? "Ubutabazi ku mpanuka zo mu muhanda no gucunga umutekano w'abarwayi."
                    : 'Police rescue, road traffic accident triage, and critical security.'}
                </p>
              </div>

              {/* RBC 114 */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-600/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full">
                    Health Info & Epidemics
                  </span>
                  <Phone className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-white font-mono">114</div>
                <div className="font-bold text-white text-xs">RBC Epidemic & Health Advisory</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {language === 'rw'
                    ? "Amakuru ku cyorezo, inkingo z'abana, Malaria, n'ubuzima bwa rusange."
                    : 'Rwanda Biomedical Centre public health guidance, child vaccines, and epidemic alerts.'}
                </p>
              </div>

              {/* GBV & Isange 3512 */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-purple-600/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 bg-purple-950 px-2 py-0.5 rounded-full">
                    Gender-Based Violence
                  </span>
                  <Phone className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-black text-white font-mono">3512</div>
                <div className="font-bold text-white text-xs">Isange One Stop Center (Toll-Free)</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {language === 'rw'
                    ? "Ubufasha bw'ubuvuzi, ubujyanama mu by'amategeko no mu by'imitekerereze ku bahohotewe."
                    : 'Comprehensive medical, legal, and psycho-social support for survivors of abuse.'}
                </p>
              </div>

              {/* Zipline Autonomous Drones */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-600/40 space-y-2 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full">
                    Autonomous Drone Blood Delivery
                  </span>
                  <Activity className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="font-bold text-white text-xs">Zipline Distribution Hubs (Muhanga & Kayonza)</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {language === 'rw'
                    ? "Zipline itwara amaraso yihutirwa, imiti y'uburozi bw'inzoka, n'inkingo mu bitaro by'uturere birenga 25 mu minota 15-30 gusa."
                    : 'Delivers emergency red blood cells, platelets, fresh frozen plasma, and antivenom to 25+ district hospitals within 15–30 minutes via autonomous electric drones.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Insurance & Referral Guide */}
        {activeTab === 'insurance' && (
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-900/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mutuelle de Sante Guide */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-700/60 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-sm">Mutuelle de Santé (CBHI)</h4>
                    <span className="text-[10px] text-emerald-400 font-bold">RSSB Community Health Scheme</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                  <p>
                    <strong>1. Ikigo Nderabuzima (Health Center):</strong> Umurwayi yishyura 200 RWF gusa ku ifishi y'isuzuma cyangwa 0 RWF ku bari mu cyiciro cya 1 cy'Ubudehe.
                  </p>
                  <p>
                    <strong>2. Ibitaro by'Akarere (District Hospital):</strong> Yishyura 10% by'ikiguzi cyose cy'imiti, ibizamini n'ibitanda.
                  </p>
                  <p>
                    <strong>3. Urupapuro rwa Transfert:</strong> Kugira ngo wemererwe kuvurirwa muri CHUK, CHUB, cyangwa RMH Kanombe kuri Mutuelle, ugomba guhabwa urupapuro rwa transfert n'umuganga w'ibitaro by'akarere.
                  </p>
                </div>
              </div>

              {/* RSSB RAMA Guide */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-indigo-700/60 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-sm">RSSB RAMA</h4>
                    <span className="text-[10px] text-indigo-400 font-bold">Public & Private Formal Sector</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                  <p>
                    <strong>1. Ikiguzi Gitangwa na RAMA:</strong> Yishyura 85% by'amafaranga yose y'ubuvuzi n'imiti yanditswe ku rutonde rwa RSSB formulary.
                  </p>
                  <p>
                    <strong>2. Umugabane w'Umurwayi (Copay):</strong> Umurwayi yishyura 15% gusa by'ikiguzi.
                  </p>
                  <p>
                    <strong>3. Ibitaro byakira RAMA:</strong> Byakirwa muri CHUK, King Faisal Hospital Rwanda (KFH), Rwanda Military Hospital (RMH), Ibitaro by'Uturere byose na Farumasi zemewe.
                  </p>
                </div>
              </div>

              {/* Private Insurance Guide */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 md:col-span-2">
                <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  {language === 'rw' ? 'Ubwishingizi bwigenga (MMI, Sanlam, Britam, Radiant, Eden Care)' : 'Private & Military Insurers'}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Ibi bigo bitanga amasezerano yo kwivuza mu bitaro byose byo mu Rwanda harimo na serivisi z'umwihariko (VIP clinics, private rooms, international transfers). Mugihe mugiye kwivuza, mutwaze ikarita y'ubwishingizi n'Indangamuntu (National ID).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Bruce Rii AI • Grounded in Rwanda National Health System (MoH / RHIE)</span>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold text-xs transition-colors"
          >
            {language === 'rw' ? 'Funga (Close)' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
