import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { Invoice, PaymentTransaction } from '../types';
import { translations } from '../utils/translations';
import {
  Smartphone,
  CreditCard,
  Building2,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Printer,
  Send,
  AlertCircle,
  RotateCcw,
  X,
  Lock,
} from 'lucide-react';

interface RwandaPaymentModalProps {
  invoice: Invoice;
  onClose: () => void;
  onPaymentCompleted?: (tx: PaymentTransaction) => void;
}

export const RwandaPaymentModal: React.FC<RwandaPaymentModalProps> = ({
  invoice,
  onClose,
  onPaymentCompleted,
}) => {
  const { initiatePayment, verifyPayment, recordRefund, language, patients, sendNotification, addToast } = useHospital();
  const t = translations[language];

  const patient = patients.find((p) => p.id === invoice.patientId);

  const balanceDue = Math.max(0, invoice.total - invoice.paidAmount);

  // Form states
  const [paymentType, setPaymentType] = useState<'full' | 'partial' | 'deposit' | 'refund'>('full');
  const [provider, setProvider] = useState<PaymentTransaction['provider']>('MTN MoMo');
  const [amount, setAmount] = useState<number>(balanceDue > 0 ? balanceDue : invoice.total);
  const [phoneNumber, setPhoneNumber] = useState<string>(patient?.phone || '+250 788 123 456');
  const [refundReason, setRefundReason] = useState<string>('Discharge billing adjustment');
  const [notes, setNotes] = useState<string>('');

  // Processing state
  const [stage, setStage] = useState<'form' | 'processing' | 'verifying' | 'success' | 'receipt'>('form');
  const [currentTx, setCurrentTx] = useState<PaymentTransaction | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const handleStartPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentType === 'refund') {
      try {
        setStage('processing');
        setProgress(35);
        setStatusMessage(language === 'rw' ? 'Gusaba gusubiza amafaranga...' : 'Processing refund request...');
        const tx = await recordRefund(
          invoice.id,
          amount,
          refundReason || 'Patient account adjustment'
        );
        setProgress(100);
        setCurrentTx(tx);
        setStage('success');
        if (onPaymentCompleted) onPaymentCompleted(tx);
      } catch (err: any) {
        addToast({ type: 'error', title: 'Refund Failed', message: err.message || 'Could not process refund.' });
        setStage('form');
      }
      return;
    }

    try {
      setStage('processing');
      setStatusMessage(
        provider === 'MTN MoMo' || provider === 'Airtel Money'
          ? (language === 'rw' ? 'Kwohereza ubutumwa bwa USSD kuri telefoni y’umurwayi...' : 'Initiating Telco USSD push prompt on patient device...')
          : (language === 'rw' ? 'Gusuzuma uburyo bwo kwishyura...' : 'Validating payment channel...')
      );

      const newTx = await initiatePayment({
        invoiceId: invoice.id,
        amount,
        provider,
        payerPhone: phoneNumber,
        notes: notes || `${paymentType === 'partial' ? 'Partial Installment' : paymentType === 'deposit' ? 'Admission Deposit' : 'Full Payment'}`,
      });

      setCurrentTx(newTx);

      if (provider === 'Cash' || provider === 'Insurance') {
        setStage('success');
        if (onPaymentCompleted) onPaymentCompleted(newTx);
      } else {
        // Simulate Telco round-trip
        let currentProg = 25;
        setProgress(currentProg);
        const timer1 = setTimeout(() => {
          currentProg = 65;
          setProgress(currentProg);
          setStatusMessage(
            language === 'rw'
              ? 'Tugitegereje ko umurwayi yemeza umubare w’ibanga (PIN)...'
              : 'Waiting for patient PIN authorization on mobile phone...'
          );
        }, 1200);

        const timer2 = setTimeout(async () => {
          setStage('verifying');
          setProgress(90);
          setStatusMessage(
            language === 'rw'
              ? 'Guhita twemeza ko amafaranga yageze kuri konti y’ibitaro...'
              : 'Verifying bank & telecom settlement with National Switch...'
          );
          try {
            const verified = await verifyPayment(newTx.id);
            setCurrentTx(verified);
            setProgress(100);
            setStage('success');
            if (onPaymentCompleted) onPaymentCompleted(verified);
          } catch {
            setStage('form');
          }
        }, 3200);

        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
        };
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Payment Failed', message: err.message || 'Payment initiation failed.' });
      setStage('form');
    }
  };

  const handleSendSmsReceipt = () => {
    if (!currentTx) return;
    sendNotification({
      recipientType: 'patient',
      recipientId: currentTx.patientId,
      recipientName: currentTx.patientName,
      recipientContact: phoneNumber,
      title: 'SMS Receipt Dispatched',
      message: `CHUK Receipt: Mwishyuye ${currentTx.amount.toLocaleString()} RWF kuri Fagitire #${currentTx.invoiceNumber}. Ref: ${currentTx.transactionReference}. Murakoze!`,
      type: 'billing',
      channel: 'sms',
    });
    addToast({
      type: 'success',
      title: 'SMS Receipt Sent',
      message: `Official electronic SMS receipt sent to ${phoneNumber}`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl text-slate-100 my-8 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {t.payment.rwandaPaymentGateway}
              </h3>
              <p className="text-xs text-slate-400">
                {invoice.invoiceNumber} • {invoice.patientName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {stage === 'form' && (
            <form onSubmit={handleStartPayment} className="space-y-5">
              {/* Payment Type Selector */}
              <div className="grid grid-cols-4 gap-2 p-1.5 bg-slate-800/80 rounded-xl border border-slate-700/60 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentType('full');
                    setAmount(balanceDue > 0 ? balanceDue : invoice.total);
                  }}
                  className={`py-1.5 px-2 rounded-lg font-medium transition-all ${
                    paymentType === 'full'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {language === 'rw' ? 'Kwishyura Yose' : 'Full Payment'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentType('partial');
                    setAmount(Math.round(balanceDue / 2) || 10000);
                  }}
                  className={`py-1.5 px-2 rounded-lg font-medium transition-all ${
                    paymentType === 'partial'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {language === 'rw' ? 'Kwishyura Igice' : 'Partial / Copay'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentType('deposit');
                    setAmount(50000);
                  }}
                  className={`py-1.5 px-2 rounded-lg font-medium transition-all ${
                    paymentType === 'deposit'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {language === 'rw' ? 'Ingwate (Deposit)' : 'Advance Deposit'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentType('refund');
                    setAmount(invoice.paidAmount > 0 ? invoice.paidAmount : 15000);
                  }}
                  className={`py-1.5 px-2 rounded-lg font-medium transition-all ${
                    paymentType === 'refund'
                      ? 'bg-amber-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {language === 'rw' ? 'Gusubiza (Refund)' : 'Refund / Credit'}
                </button>
              </div>

              {/* Invoice Summary Card */}
              <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/70 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">{t.common.patient}:</span>
                  <span className="font-semibold text-white">{invoice.patientName} ({invoice.patientMrn})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t.common.total}:</span>
                  <span className="font-mono text-white">{invoice.total.toLocaleString()} RWF</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t.common.paid}:</span>
                  <span className="font-mono text-emerald-400">{invoice.paidAmount.toLocaleString()} RWF</span>
                </div>
                <div className="flex justify-between font-bold pt-1.5 border-t border-slate-700">
                  <span className="text-slate-200">{t.common.balance}:</span>
                  <span className="font-mono text-amber-300">
                    {balanceDue.toLocaleString()} RWF
                  </span>
                </div>
              </div>

              {paymentType !== 'refund' ? (
                <>
                  {/* Select Payment Provider */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-2">
                      {t.payment.chooseMethod}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'MTN MoMo', label: 'MTN MoMo (*182#)', icon: Smartphone, color: 'text-yellow-400 border-yellow-500/30' },
                        { id: 'Airtel Money', label: 'Airtel Money (*500#)', icon: Smartphone, color: 'text-red-400 border-red-500/30' },
                        { id: 'Visa', label: 'Visa / Mastercard', icon: CreditCard, color: 'text-blue-400 border-blue-500/30' },
                        { id: 'Bank Transfer', label: 'Bank of Kigali / I&M', icon: Building2, color: 'text-cyan-400 border-cyan-500/30' },
                        { id: 'Cash', label: 'Cashier Desk (Cash)', icon: Banknote, color: 'text-emerald-400 border-emerald-500/30' },
                        { id: 'Insurance', label: 'Direct Insurance', icon: ShieldCheck, color: 'text-purple-400 border-purple-500/30' },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isSelected = provider === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setProvider(item.id as any)}
                            className={`p-2.5 rounded-xl border text-left flex flex-col gap-1.5 transition-all ${
                              isSelected
                                ? 'bg-slate-800 border-emerald-500 text-white ring-1 ring-emerald-500'
                                : 'bg-slate-850 border-slate-700/70 text-slate-400 hover:bg-slate-800'
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                            <span className="text-xs font-medium line-clamp-1">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Phone Number Input (if MoMo / Airtel) */}
                  {(provider === 'MTN MoMo' || provider === 'Airtel Money') && (
                    <div>
                      <label className="text-xs text-slate-300 block mb-1">
                        {t.payment.enterPhone}
                      </label>
                      <div className="relative">
                        <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="+250 788 000 000"
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Amount to Pay */}
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">
                      {t.payment.amountToPay}
                    </label>
                    <input
                      type="number"
                      step="500"
                      min="1000"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-base font-mono text-white font-bold focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                </>
              ) : (
                /* Refund Options */
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">
                      {language === 'rw' ? 'Amafaranga asubizwa (RWF)' : 'Refund Amount (RWF)'}
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-base font-mono text-amber-300 font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">
                      {language === 'rw' ? 'Impamvu yo gusubiza' : 'Reason for Refund'}
                    </label>
                    <select
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    >
                      <option value="Discharge billing adjustment">Discharge billing adjustment</option>
                      <option value="Cancelled outpatient procedure">Cancelled outpatient procedure</option>
                      <option value="Excess deposit reimbursement">Excess deposit reimbursement</option>
                      <option value="Duplicate transaction correction">Duplicate transaction correction</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Security Banner Mandate */}
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-start gap-2.5 text-[11px] text-slate-400">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  <strong>{language === 'rw' ? 'Umutekano Wihariye:' : 'Security Mandate:'}</strong>{' '}
                  {language === 'rw'
                    ? 'Nta PIN cyangwa secret bya Mobile Money bibikwa muri sisitemu. Byose bica mu muyoboro wizewe w’itumanaho (Rwanda National Switch).'
                    : 'PINs and secrets are never stored in client database. All authorization occurs directly on the subscriber device via encrypted Telco gateway.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-2 shadow-lg transition-all ${
                    paymentType === 'refund'
                      ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                      : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
                  }`}
                >
                  {paymentType === 'refund' ? (
                    <>
                      <RotateCcw className="w-4 h-4" />
                      {language === 'rw' ? 'Subiza Amafaranga' : 'Process Refund'}
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      {language === 'rw' ? 'Kwishyura Ako Kanya' : `Authorize ${amount.toLocaleString()} RWF`}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Processing / Verification State */}
          {(stage === 'processing' || stage === 'verifying') && (
            <div className="py-8 px-4 text-center space-y-5">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                <Smartphone className="w-7 h-7 text-emerald-400 absolute inset-0 m-auto animate-pulse" />
              </div>

              <div className="space-y-1.5">
                <h4 className="text-base font-bold text-white">
                  {stage === 'processing' ? t.payment.processingTransaction : t.payment.verifyingNetwork}
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">{statusMessage}</p>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                <div
                  className="bg-emerald-500 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 text-[11px] text-slate-400 max-w-sm mx-auto">
                {language === 'rw'
                  ? 'Reba kuri telefoni yawe wemeze umubare w’ibanga (PIN ya MoMo/Airtel). Iyi paji irahita yivugurura.'
                  : 'Check your mobile handset to enter your PIN. This window will automatically update once verified.'}
              </div>
            </div>
          )}

          {/* Success / Official Receipt State */}
          {stage === 'success' && currentTx && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-white">{t.payment.paymentSuccess}</h4>
                  <p className="text-xs text-slate-300">
                    {language === 'rw' ? 'Amafaranga' : 'Amount'}:{' '}
                    <strong className="text-emerald-300 font-mono">{currentTx.amount.toLocaleString()} RWF</strong> • Ref:{' '}
                    <span className="font-mono text-cyan-300">{currentTx.transactionReference}</span>
                  </p>
                </div>
              </div>

              {/* Official Hospital Receipt Preview */}
              <div className="p-4 bg-white text-slate-900 rounded-xl font-mono text-xs shadow-lg space-y-3 border border-slate-300">
                <div className="text-center border-b border-slate-200 pb-2.5">
                  <div className="font-bold text-sm text-slate-950 tracking-wider">
                    CENTRE HOSPITALIER UNIVERSITAIRE DE KIGALI (CHUK)
                  </div>
                  <div className="text-[10px] text-slate-600">
                    KN 4 Ave, Kigali - RWANDA • TIN: 100029381 • Phone: 114 / +250 788 123 456
                  </div>
                  <div className="font-bold text-xs text-emerald-800 mt-1 uppercase">
                    OFFICIAL PAYMENT RECEIPT / INYEMEZABWISHYU
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500">Receipt Ref:</span>
                    <div className="font-bold">{currentTx.transactionReference}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Date & Time:</span>
                    <div>{currentTx.verifiedAt || currentTx.createdAt}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Patient:</span>
                    <div className="font-bold">{currentTx.patientName}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Invoice #:</span>
                    <div>{currentTx.invoiceNumber}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Method:</span>
                    <div className="font-bold text-slate-800">{currentTx.provider}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Cashier:</span>
                    <div>{currentTx.cashierName}</div>
                  </div>
                </div>

                <div className="border-t border-b border-slate-300 py-2 flex justify-between items-center text-sm font-bold">
                  <span>TOTAL PAID (RWF):</span>
                  <span className="text-emerald-700">{currentTx.amount.toLocaleString()} RWF</span>
                </div>

                <div className="text-center text-[10px] text-slate-500 pt-1">
                  Thank you for using CHUK Healthcare Services. Murakoze cyane!
                </div>
              </div>

              {/* Post-Payment Action Buttons */}
              <div className="flex flex-wrap gap-2 justify-between pt-2 border-t border-slate-800">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white flex items-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    {t.common.print}
                  </button>
                  <button
                    type="button"
                    onClick={handleSendSmsReceipt}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-cyan-300 flex items-center gap-1.5 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    {t.common.sendSms}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition-colors"
                >
                  {language === 'rw' ? 'Byarangiye (Funga)' : 'Done (Close)'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
