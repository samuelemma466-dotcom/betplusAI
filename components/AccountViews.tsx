
import React, { useState, useEffect } from 'react';
import { CreditCard, Wallet, ArrowRight, User, Mail, Phone, Shield, Calendar, AlertCircle, CheckCircle2, ChevronRight, Lock, Settings, ToggleLeft, ToggleRight, Smartphone, BellRing, MousePointer2, Copy, QrCode, Building2, History, ArrowUpRight, ArrowDownLeft, Loader2, XCircle, Globe, MapPin, Coins, Check, Clock, Trophy, Upload, FileCheck, Gift, Percent, BarChart, Eye, EyeOff, Info, HelpCircle, PhoneCall, MessageSquare, ShieldCheck, Filter, Ban, Hourglass, Edit2, Camera, ChevronDown, ChevronUp, AlertTriangle, KeyRound, Banknote, Search, Landmark, RefreshCw } from 'lucide-react';
import { AppSettings, OddsFormat, Transaction, PaymentMethod, Country, CurrencyCode, Language, Bonus, AppView, UserProfile } from '../types';
import { CountUp } from './UiEffects';

// --- SHARED HEADER ---
const ViewHeader = ({ title, icon: Icon, subtitle }: { title: string, icon: any, subtitle?: string }) => (
  <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
    <div className="bg-emerald-500/10 p-3 rounded-xl text-emerald-600 dark:text-emerald-500 shadow-sm border border-emerald-500/20">
      <Icon size={28} />
    </div>
    <div>
       <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h2>
       {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
    </div>
  </div>
);

// --- CONFIGURATION CONSTANTS ---
const LOCALIZATION_CONFIG = {
  languages: [
    { id: 'en-US', label: 'English (US)', flag: '🇺🇸' },
    { id: 'en-UK', label: 'English (UK)', flag: '🇬🇧' },
    { id: 'fr', label: 'Français', flag: '🇫🇷' },
    { id: 'es', label: 'Español', flag: '🇪🇸' },
    { id: 'de', label: 'Deutsch', flag: '🇩🇪' },
  ],
  countries: [
    { id: 'US', label: 'United States', flag: '🇺🇸', defaultCurrency: 'USD', defaultLang: 'en-US' },
    { id: 'UK', label: 'United Kingdom', flag: '🇬🇧', defaultCurrency: 'GBP', defaultLang: 'en-UK' },
    { id: 'EU', label: 'Europe (General)', flag: '🇪🇺', defaultCurrency: 'EUR', defaultLang: 'en-UK' },
    { id: 'NG', label: 'Nigeria', flag: '🇳🇬', defaultCurrency: 'NGN', defaultLang: 'en-UK' },
    { id: 'KE', label: 'Kenya', flag: '🇰🇪', defaultCurrency: 'KES', defaultLang: 'en-UK' },
    { id: 'CA', label: 'Canada', flag: '🇨🇦', defaultCurrency: 'CAD', defaultLang: 'en-US' },
  ],
  currencies: [
    { id: 'USD', symbol: '$', label: 'US Dollar' },
    { id: 'GBP', symbol: '£', label: 'British Pound' },
    { id: 'EUR', symbol: '€', label: 'Euro' },
    { id: 'NGN', symbol: '₦', label: 'Nigerian Naira' },
    { id: 'KES', symbol: 'KSh', label: 'Kenyan Shilling' },
    { id: 'CAD', symbol: 'C$', label: 'Canadian Dollar' },
  ]
} as const;

export const getCurrencySymbol = (code: CurrencyCode) => {
    return LOCALIZATION_CONFIG.currencies.find(c => c.id === code)?.symbol || '$';
};

// --- EXTENSIVE BANK LIST DATABASE ---
interface Bank {
    id: string;
    name: string;
    code: string;
    country: string;
    type: 'Commercial' | 'Fintech' | 'Mobile Money';
    logo?: string; // Optional URL
}

const BANK_DATABASE: Bank[] = [
    // Nigeria (Commercial)
    { id: 'ng-access', name: 'Access Bank', code: '044', country: 'NG', type: 'Commercial' },
    { id: 'ng-gtb', name: 'Guaranty Trust Bank (GTB)', code: '058', country: 'NG', type: 'Commercial' },
    { id: 'ng-zenith', name: 'Zenith Bank', code: '057', country: 'NG', type: 'Commercial' },
    { id: 'ng-uba', name: 'United Bank for Africa (UBA)', code: '033', country: 'NG', type: 'Commercial' },
    { id: 'ng-fbn', name: 'First Bank of Nigeria', code: '011', country: 'NG', type: 'Commercial' },
    { id: 'ng-fcmb', name: 'FCMB', code: '214', country: 'NG', type: 'Commercial' },
    { id: 'ng-fidelity', name: 'Fidelity Bank', code: '070', country: 'NG', type: 'Commercial' },
    { id: 'ng-stanbic', name: 'Stanbic IBTC', code: '221', country: 'NG', type: 'Commercial' },
    
    // Nigeria (Fintech/Neobanks)
    { id: 'ng-opay', name: 'OPay (Paycom)', code: '994', country: 'NG', type: 'Fintech' },
    { id: 'ng-palmpay', name: 'PalmPay', code: '998', country: 'NG', type: 'Fintech' },
    { id: 'ng-kuda', name: 'Kuda Microfinance Bank', code: '50211', country: 'NG', type: 'Fintech' },
    { id: 'ng-moniepoint', name: 'Moniepoint MFB', code: '50515', country: 'NG', type: 'Fintech' },
    { id: 'ng-fairmoney', name: 'FairMoney MFB', code: '51318', country: 'NG', type: 'Fintech' },

    // Kenya (Mobile Money & Banks)
    { id: 'ke-mpesa', name: 'M-Pesa (Safaricom)', code: 'MPS', country: 'KE', type: 'Mobile Money' },
    { id: 'ke-equity', name: 'Equity Bank', code: 'EQTY', country: 'KE', type: 'Commercial' },
    { id: 'ke-kcb', name: 'KCB Bank', code: 'KCB', country: 'KE', type: 'Commercial' },
    { id: 'ke-coop', name: 'Co-operative Bank', code: 'COOP', country: 'KE', type: 'Commercial' },
    { id: 'ke-ncba', name: 'NCBA Bank', code: 'NCBA', country: 'KE', type: 'Commercial' },

    // International / Global
    { id: 'us-chase', name: 'Chase Bank', code: 'CHASE', country: 'US', type: 'Commercial' },
    { id: 'us-boa', name: 'Bank of America', code: 'BOA', country: 'US', type: 'Commercial' },
    { id: 'gb-barclays', name: 'Barclays', code: 'BARC', country: 'UK', type: 'Commercial' },
    { id: 'gb-revolut', name: 'Revolut', code: 'REV', country: 'Global', type: 'Fintech' },
    { id: 'gb-wise', name: 'Wise (TransferWise)', code: 'WISE', country: 'Global', type: 'Fintech' },
    { id: 'gb-monzo', name: 'Monzo', code: 'MNZ', country: 'UK', type: 'Fintech' },
];

// --- MOCK PAYMENT METHODS ---
const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'card', name: 'Credit / Debit Card', type: 'card', icon: CreditCard, minLimit: 10, maxLimit: 5000, fee: 'Free', detail: 'Instant' },
  { id: 'crypto', name: 'Crypto (BTC/USDT)', type: 'crypto', icon: Coins, minLimit: 50, maxLimit: 100000, fee: 'Network Fee', detail: '10-30 Mins' },
  { id: 'bank', name: 'Bank Transfer', type: 'bank', icon: Building2, minLimit: 100, maxLimit: 50000, fee: 'Free', detail: '1-3 Days' },
];

// --- COMPONENTS ---

const BankSearchModal = ({ isOpen, onClose, onSelect }: { isOpen: boolean, onClose: () => void, onSelect: (bank: Bank) => void }) => {
    const [search, setSearch] = useState('');
    
    if (!isOpen) return null;

    const filteredBanks = BANK_DATABASE.filter(bank => 
        bank.name.toLowerCase().includes(search.toLowerCase()) || 
        bank.code.includes(search)
    );

    return (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl border-t sm:border border-slate-200 dark:border-slate-800 shadow-2xl h-[85vh] sm:h-[600px] flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Select Bank</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500">
                        <XCircle size={20} />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 shrink-0">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search bank name..." 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            autoFocus
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
                    {filteredBanks.map(bank => (
                        <div 
                            key={bank.id} 
                            onClick={() => { onSelect(bank); onClose(); }}
                            className="flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl cursor-pointer transition-colors group"
                        >
                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold text-xs border border-slate-200 dark:border-slate-700 group-hover:border-emerald-500/30 group-hover:text-emerald-500">
                                {bank.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{bank.name}</h4>
                                <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                    <span className="bg-slate-200 dark:bg-slate-800 px-1 rounded">{bank.type}</span>
                                    <span>•</span>
                                    <span>{bank.country}</span>
                                </p>
                            </div>
                            <ChevronRight size={16} className="text-slate-300 dark:text-slate-700 group-hover:text-emerald-500" />
                        </div>
                    ))}
                    
                    {filteredBanks.length === 0 && (
                        <div className="text-center py-10 text-slate-500">
                            <Banknote size={48} className="mx-auto mb-2 opacity-20" />
                            <p className="text-sm">No banks found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- EXPERT DEPOSIT VIEW ---
export const DepositView = ({ onDeposit, currencySymbol }: { onDeposit: (amount: number, method: string) => void, currencySymbol: string }) => {
    const [step, setStep] = useState(1); // 1: Method, 2: Amount & Details, 3: Processing
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Card Form State
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');

    const handleMethodSelect = (method: PaymentMethod) => {
        setSelectedMethod(method);
        setStep(2);
    };

    const handleProcessDeposit = () => {
        setIsLoading(true);
        setTimeout(() => {
            onDeposit(Number(amount), selectedMethod?.name || 'Deposit');
            setIsLoading(false);
            setStep(1);
            setAmount('');
            setCardNumber('');
            setCardExpiry('');
            setCardCvv('');
        }, 2000);
    };

    // Simulated Crypto Wallet
    const cryptoAddress = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(cryptoAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-2xl mx-auto p-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <ViewHeader title="Deposit Funds" icon={Wallet} subtitle="Securely fund your account" />
            
            {/* Step 1: Select Method */}
            {step === 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {PAYMENT_METHODS.map(pm => (
                        <div 
                            key={pm.id}
                            onClick={() => handleMethodSelect(pm)}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-500 transition-all shadow-sm hover:shadow-md group"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 group-hover:text-emerald-500 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 transition-colors">
                                    <pm.icon size={24} />
                                </div>
                                <span className="bg-slate-100 dark:bg-slate-800 text-[10px] font-bold px-2 py-1 rounded text-slate-500">{pm.fee}</span>
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white mb-1">{pm.name}</h3>
                            <p className="text-xs text-slate-500">{pm.detail} • Limit: {currencySymbol}{pm.maxLimit}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Step 2: Amount & Details */}
            {step === 2 && selectedMethod && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl animate-in slide-in-from-right-8">
                    <button onClick={() => setStep(1)} className="text-xs font-bold text-slate-500 hover:text-emerald-500 mb-6 flex items-center gap-1">
                        <ArrowRight className="rotate-180" size={12} /> Back to methods
                    </button>

                    <div className="flex items-center gap-3 mb-6 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                        <selectedMethod.icon className="text-emerald-500" size={24} />
                        <div>
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white">{selectedMethod.name}</h3>
                            <p className="text-xs text-slate-500">{selectedMethod.detail}</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Amount Input */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Deposit Amount</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">{currencySymbol}</span>
                                <input 
                                    type="number" 
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-4 pl-10 pr-4 text-2xl font-bold text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-all"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
                                {[50, 100, 200, 500].map(val => (
                                    <button 
                                        key={val} 
                                        onClick={() => setAmount(val.toString())}
                                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 transition-colors"
                                    >
                                        +{currencySymbol}{val}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Dynamic Form based on Method */}
                        {selectedMethod.id === 'card' && (
                            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Card Details</label>
                                    <div className="relative mb-3">
                                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input 
                                            type="text" 
                                            placeholder="Card Number" 
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-12 pr-4 text-sm font-medium text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                                            value={cardNumber}
                                            onChange={e => setCardNumber(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <input 
                                            type="text" 
                                            placeholder="MM/YY" 
                                            className="w-1/2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-medium text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                                            value={cardExpiry}
                                            onChange={e => setCardExpiry(e.target.value)}
                                        />
                                        <input 
                                            type="text" 
                                            placeholder="CVV" 
                                            className="w-1/2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-medium text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                                            value={cardCvv}
                                            onChange={e => setCardCvv(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedMethod.id === 'crypto' && (
                            <div className="bg-slate-950 p-6 rounded-xl text-center border border-slate-800">
                                <div className="bg-white p-2 rounded-lg inline-block mb-4">
                                    <QrCode size={120} className="text-black" />
                                </div>
                                <p className="text-xs text-slate-400 mb-2">Send only BTC to this address</p>
                                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-2">
                                    <code className="text-xs text-emerald-400 truncate flex-1">{cryptoAddress}</code>
                                    <button onClick={handleCopy} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors">
                                        {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {selectedMethod.id === 'bank' && (
                            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                                <Building2 size={32} className="mx-auto text-emerald-500 mb-2" />
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Designated Transfer Account</h4>
                                <p className="text-xs text-slate-500 mb-4">Transfer the exact amount to the account below. Your wallet will be credited automatically.</p>
                                
                                <div className="text-left space-y-2 text-sm">
                                    <div className="flex justify-between border-b border-dashed border-slate-300 dark:border-slate-700 pb-1">
                                        <span className="text-slate-500">Bank</span>
                                        <span className="font-bold text-slate-900 dark:text-white">Wema Bank</span>
                                    </div>
                                    <div className="flex justify-between border-b border-dashed border-slate-300 dark:border-slate-700 pb-1">
                                        <span className="text-slate-500">Account No</span>
                                        <span className="font-bold text-emerald-600 font-mono">8829 3910 22</span>
                                    </div>
                                    <div className="flex justify-between pb-1">
                                        <span className="text-slate-500">Name</span>
                                        <span className="font-bold text-slate-900 dark:text-white">BetPulse Global</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <button 
                            onClick={handleProcessDeposit}
                            disabled={!amount || isLoading || (selectedMethod.id === 'card' && !cardNumber)}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : <ShieldCheck size={20} />}
                            {isLoading ? 'Processing securely...' : `Pay ${currencySymbol}${Number(amount).toFixed(2)}`}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- EXPERT WITHDRAW VIEW ---
export const WithdrawView = ({ balance, onWithdraw, currencySymbol }: { balance: number, onWithdraw: (amount: number, method: string) => void, currencySymbol: string }) => {
    const [step, setStep] = useState(1); // 1: Amount, 2: Method/Details, 3: Security PIN
    const [amount, setAmount] = useState('');
    
    // Bank Selection State
    const [showBankSearch, setShowBankSearch] = useState(false);
    const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    const [pin, setPin] = useState(['', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);

    // Simulated Name Resolution
    useEffect(() => {
        if (accountNumber.length === 10 && selectedBank) {
            setIsVerifying(true);
            setTimeout(() => {
                setAccountName('JOHN DOE (Verified)');
                setIsVerifying(false);
            }, 1500);
        } else {
            setAccountName('');
        }
    }, [accountNumber, selectedBank]);

    const handlePinChange = (index: number, value: string) => {
        if (value.length > 1) return;
        const newPin = [...pin];
        newPin[index] = value;
        setPin(newPin);
        
        // Auto focus next
        if (value && index < 3) {
            const nextInput = document.getElementById(`pin-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleFinalWithdraw = () => {
        setIsLoading(true);
        setTimeout(() => {
            onWithdraw(Number(amount), selectedBank ? `${selectedBank.name} - ${accountNumber}` : 'Crypto Wallet');
            setIsLoading(false);
            setStep(1);
            setAmount('');
            setPin(['', '', '', '']);
            setSelectedBank(null);
            setAccountNumber('');
        }, 2000);
    };

    return (
        <div className="max-w-2xl mx-auto p-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <ViewHeader title="Withdraw Funds" icon={CreditCard} subtitle="Fast and secure cashouts" />
            
            <BankSearchModal 
                isOpen={showBankSearch} 
                onClose={() => setShowBankSearch(false)} 
                onSelect={(bank) => { setSelectedBank(bank); setAccountNumber(''); }} 
            />

            {/* Step 1: Amount */}
            {step === 1 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold">Available to Withdraw</p>
                            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-500">{currencySymbol}{balance.toFixed(2)}</p>
                        </div>
                        <Wallet className="text-emerald-300 opacity-50" size={32} />
                    </div>

                    <div className="mb-6">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Withdrawal Amount</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">{currencySymbol}</span>
                            <input 
                                type="number" 
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-4 pl-10 pr-4 text-2xl font-bold text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                                placeholder="0.00"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                            />
                        </div>
                        {Number(amount) > balance && (
                            <p className="text-xs text-red-500 mt-2 font-bold flex items-center gap-1"><AlertCircle size={12} /> Insufficient funds</p>
                        )}
                    </div>

                    <button 
                        onClick={() => setStep(2)}
                        disabled={!amount || Number(amount) <= 0 || Number(amount) > balance}
                        className="w-full bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next Step <ArrowRight size={18} />
                    </button>
                </div>
            )}

            {/* Step 2: Select Destination */}
            {step === 2 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm animate-in slide-in-from-right-8">
                    <button onClick={() => setStep(1)} className="text-xs font-bold text-slate-500 hover:text-emerald-500 mb-6 flex items-center gap-1">
                        <ArrowRight className="rotate-180" size={12} /> Back to amount
                    </button>

                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">Destination Account</h3>
                    
                    {/* Bank Selector Input */}
                    <div className="mb-4">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Bank</label>
                        <div 
                            onClick={() => setShowBankSearch(true)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 flex items-center justify-between cursor-pointer hover:border-emerald-500 transition-colors"
                        >
                            {selectedBank ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                                        {selectedBank.name.substring(0,2).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{selectedBank.name}</span>
                                </div>
                            ) : (
                                <span className="text-sm text-slate-400">Choose a bank...</span>
                            )}
                            <ChevronDown size={16} className="text-slate-400" />
                        </div>
                    </div>

                    {/* Account Number Input */}
                    {selectedBank && (
                        <div className="mb-6 animate-in slide-in-from-top-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Account Number</label>
                            <input 
                                type="tel" 
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-lg font-mono font-bold text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                                placeholder="0123456789"
                                value={accountNumber}
                                onChange={e => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            />
                            
                            {/* Verification State */}
                            <div className="mt-2 h-6">
                                {isVerifying ? (
                                    <div className="flex items-center gap-2 text-xs text-amber-500 font-bold">
                                        <Loader2 size={12} className="animate-spin" /> Verifying account name...
                                    </div>
                                ) : accountName ? (
                                    <div className="flex items-center gap-2 text-xs text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-900/10 px-2 py-1 rounded w-fit">
                                        <CheckCircle2 size={12} /> {accountName}
                                    </div>
                                ) : accountNumber.length === 10 ? (
                                    <p className="text-xs text-red-500">Could not resolve account.</p>
                                ) : null}
                            </div>
                        </div>
                    )}

                    <button 
                        onClick={() => setStep(3)}
                        disabled={!selectedBank || !accountName}
                        className="w-full bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Review Withdrawal
                    </button>
                </div>
            )}

            {/* Step 3: Security PIN */}
            {step === 3 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm animate-in slide-in-from-right-8 text-center">
                    <button onClick={() => setStep(2)} className="text-xs font-bold text-slate-500 hover:text-emerald-500 mb-6 flex items-center gap-1">
                        <ArrowRight className="rotate-180" size={12} /> Back
                    </button>

                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400">
                        <KeyRound size={32} />
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Security Check</h3>
                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg mb-6 border border-slate-200 dark:border-slate-800 text-left">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-500">Amount</span>
                            <span className="font-bold text-slate-900 dark:text-white">{currencySymbol}{amount}</span>
                        </div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-500">To</span>
                            <span className="font-bold text-slate-900 dark:text-white">{selectedBank?.name}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Account</span>
                            <span className="font-bold text-slate-900 dark:text-white">{accountNumber}</span>
                        </div>
                    </div>
                    
                    <p className="text-xs text-slate-500 mb-6">Enter your 4-digit security PIN to confirm.</p>

                    <div className="flex justify-center gap-4 mb-8">
                        {[0, 1, 2, 3].map(i => (
                            <input
                                key={i}
                                id={`pin-${i}`}
                                type="password"
                                maxLength={1}
                                className="w-12 h-14 text-center text-2xl font-bold bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl focus:border-emerald-500 outline-none transition-all"
                                value={pin[i]}
                                onChange={e => handlePinChange(i, e.target.value)}
                            />
                        ))}
                    </div>

                    <button 
                        onClick={handleFinalWithdraw}
                        disabled={isLoading || pin.some(p => !p)}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />}
                        {isLoading ? 'Processing...' : 'Confirm Withdrawal'}
                    </button>
                </div>
            )}
        </div>
    );
};

// --- EDIT PROFILE MODAL ---
const EditProfileModal = ({ user, onClose, onSave }: { user: UserProfile, onClose: () => void, onSave: (u: UserProfile) => void }) => {
    const [formData, setFormData] = useState(user);
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setTimeout(() => {
            onSave(formData);
            setIsSaving(false);
            onClose();
        }, 1000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                    <XCircle size={20} />
                </button>
                
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Edit Profile</h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center text-white text-3xl font-bold mb-2 relative group cursor-pointer border-4 border-slate-100 dark:border-slate-800">
                            {formData.avatar}
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera size={24} />
                            </div>
                        </div>
                        <input 
                            type="text" 
                            className="bg-transparent text-center border-b border-slate-200 dark:border-slate-700 text-xs text-slate-500 focus:outline-none focus:border-emerald-500 w-24 uppercase"
                            value={formData.avatar}
                            onChange={e => setFormData({...formData, avatar: e.target.value.slice(0,2)})}
                            maxLength={2}
                            placeholder="Initials"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                        <input 
                            type="text" 
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                        <input 
                            type="email" 
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                        <input 
                            type="tel" 
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                            value={formData.phone}
                            onChange={e => setFormData({...formData, phone: e.target.value})}
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-sm bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                        <button type="submit" disabled={isSaving} className="flex-1 py-3 rounded-xl font-bold text-sm bg-emerald-600 text-white hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2">
                            {isSaving && <Loader2 className="animate-spin" size={16} />} Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- PROFILE VIEW ---
export const ProfileView = ({ onNavigate, settings, user, onUpdateUser }: { onNavigate: (view: AppView) => void, settings: AppSettings, user: UserProfile, onUpdateUser: (u: UserProfile) => void }) => {
  const [showEdit, setShowEdit] = useState(false);

  return (
    <div className="max-w-3xl mx-auto p-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {showEdit && <EditProfileModal user={user} onClose={() => setShowEdit(false)} onSave={onUpdateUser} />}
      
      <ViewHeader title="My Dashboard" icon={User} subtitle={`Member since ${user.joinDate}`} />

      {/* User Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl border border-slate-700 mb-8 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
         
         <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
            <div className="relative">
               <div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center text-3xl font-bold border-4 border-slate-800 shadow-xl">
                  {user.avatar}
               </div>
               <div className="absolute bottom-0 right-0 bg-slate-900 rounded-full p-1.5 border border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => setShowEdit(true)}>
                  <Edit2 size={14} className="text-white" />
               </div>
            </div>
            
            <div className="text-center sm:text-left flex-1">
               <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <h3 className="text-2xl font-bold">{user.name}</h3>
                  <span className="bg-emerald-500 text-[10px] font-black px-2 py-0.5 rounded text-white shadow-sm uppercase tracking-wider">
                     Level {user.level}
                  </span>
               </div>
               <p className="text-slate-400 text-sm mb-4">{user.email}</p>
               
               <div className="flex gap-2 justify-center sm:justify-start">
                  <span className="text-xs bg-slate-800 px-3 py-1 rounded-full border border-slate-700 flex items-center gap-1.5 text-slate-300">
                     <ShieldCheck size={12} className={settings.privacyMode ? "text-emerald-400" : "text-slate-500"} />
                     {settings.privacyMode ? 'Privacy Mode On' : 'Standard View'}
                  </span>
                  <span className="text-xs bg-slate-800 px-3 py-1 rounded-full border border-slate-700 flex items-center gap-1.5 text-slate-300">
                     <Globe size={12} /> {settings.country}
                  </span>
               </div>
            </div>
         </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
         <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center gap-2 text-center">
             <div className="bg-emerald-100 dark:bg-emerald-900/20 p-2 rounded-lg text-emerald-600 dark:text-emerald-400">
                <Trophy size={20} />
             </div>
             <div>
                <div className="font-bold text-slate-900 dark:text-white">12</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Wins</div>
             </div>
         </div>
         <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center gap-2 text-center">
             <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                <History size={20} />
             </div>
             <div>
                <div className="font-bold text-slate-900 dark:text-white">45</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Bets</div>
             </div>
         </div>
         <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center gap-2 text-center">
             <div className="bg-amber-100 dark:bg-amber-900/20 p-2 rounded-lg text-amber-600 dark:text-amber-400">
                <Gift size={20} />
             </div>
             <div>
                <div className="font-bold text-slate-900 dark:text-white">1</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Bonus</div>
             </div>
         </div>
         <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center gap-2 text-center">
             <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded-lg text-purple-600 dark:text-purple-400">
                <Shield size={20} />
             </div>
             <div>
                <div className="font-bold text-slate-900 dark:text-white">Ver. 2</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">KYC Lvl</div>
             </div>
         </div>
      </div>
    </div>
  );
};

// --- TRANSACTIONS VIEW ---
export const TransactionsView = ({ transactions, currencySymbol }: { transactions: Transaction[], currencySymbol: string }) => {
    return (
        <div className="max-w-2xl mx-auto p-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <ViewHeader title="Transaction History" icon={History} subtitle="Track your deposits and withdrawals" />
            
            <div className="space-y-3">
                {transactions.length > 0 ? (
                    transactions.map(tx => (
                        <div key={tx.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-full ${tx.type === 'Deposit' || tx.type === 'Bet Win' ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                    {tx.type === 'Deposit' ? <ArrowDownLeft size={20} /> : tx.type === 'Withdrawal' ? <ArrowUpRight size={20} /> : <Trophy size={20} />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{tx.type}</h4>
                                    <p className="text-xs text-slate-500">{tx.date} • {tx.method}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-bold ${tx.type === 'Deposit' || tx.type === 'Bet Win' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                                    {tx.type === 'Deposit' || tx.type === 'Bet Win' ? '+' : '-'}{currencySymbol}{tx.amount.toFixed(2)}
                                </p>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tx.status === 'Success' ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600' : tx.status === 'Pending' ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-600' : 'bg-red-100 dark:bg-red-900/20 text-red-600'}`}>
                                    {tx.status}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 text-slate-500">
                        <History size={48} className="mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No transactions yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- SETTINGS VIEW ---
export const SettingsView = ({ settings, onUpdate }: { settings: AppSettings, onUpdate: (s: AppSettings) => void }) => {
    return (
        <div className="max-w-2xl mx-auto p-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <ViewHeader title="Preferences" icon={Settings} subtitle="Customize your betting experience" />
            
            <div className="space-y-6">
                {/* Appearance */}
                <section>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">Appearance & Locale</h3>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                                <Globe size={20} />
                                <span className="font-medium text-sm">Language</span>
                            </div>
                            <select 
                                value={settings.language}
                                onChange={(e) => onUpdate({...settings, language: e.target.value as Language})}
                                className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-xs font-bold px-2 py-1 text-slate-900 dark:text-white outline-none"
                            >
                                {LOCALIZATION_CONFIG.languages.map(l => (
                                    <option key={l.id} value={l.id}>{l.flag} {l.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                                <MapPin size={20} />
                                <span className="font-medium text-sm">Country</span>
                            </div>
                            <select 
                                value={settings.country}
                                onChange={(e) => onUpdate({...settings, country: e.target.value as Country})}
                                className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-xs font-bold px-2 py-1 text-slate-900 dark:text-white outline-none"
                            >
                                {LOCALIZATION_CONFIG.countries.map(c => (
                                    <option key={c.id} value={c.id}>{c.flag} {c.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                                <Coins size={20} />
                                <span className="font-medium text-sm">Currency</span>
                            </div>
                            <select 
                                value={settings.currency}
                                onChange={(e) => onUpdate({...settings, currency: e.target.value as CurrencyCode})}
                                className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-xs font-bold px-2 py-1 text-slate-900 dark:text-white outline-none"
                            >
                                {LOCALIZATION_CONFIG.currencies.map(c => (
                                    <option key={c.id} value={c.id}>{c.symbol} {c.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </section>

                {/* Betting */}
                <section>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">Betting Configuration</h3>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                                <Percent size={20} />
                                <span className="font-medium text-sm">Odds Format</span>
                            </div>
                            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                                {['decimal', 'fractional', 'american'].map(fmt => (
                                    <button
                                        key={fmt}
                                        onClick={() => onUpdate({...settings, oddsFormat: fmt as OddsFormat})}
                                        className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${settings.oddsFormat === fmt ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'}`}
                                    >
                                        {fmt}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                                <BarChart size={20} />
                                <span className="font-medium text-sm">Default Stake</span>
                            </div>
                            <input 
                                type="number" 
                                value={settings.defaultStake}
                                onChange={(e) => onUpdate({...settings, defaultStake: Number(e.target.value)})}
                                className="w-20 text-right bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm font-bold px-2 py-1 text-slate-900 dark:text-white outline-none"
                            />
                        </div>
                         <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                                <Check size={20} />
                                <span className="font-medium text-sm">Auto-Accept Odds Changes</span>
                            </div>
                            <button 
                                onClick={() => onUpdate({...settings, autoAcceptOdds: !settings.autoAcceptOdds})}
                                className={`w-11 h-6 rounded-full p-1 cursor-pointer transition-colors ${settings.autoAcceptOdds ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${settings.autoAcceptOdds ? 'translate-x-5' : 'translate-x-0'}`}></div>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Privacy */}
                <section>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">Privacy</h3>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                                {settings.privacyMode ? <EyeOff size={20} /> : <Eye size={20} />}
                                <div>
                                    <span className="font-medium text-sm block">Privacy Mode</span>
                                    <span className="text-[10px] text-slate-500">Hide balance in header</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => onUpdate({...settings, privacyMode: !settings.privacyMode})}
                                className={`w-11 h-6 rounded-full p-1 cursor-pointer transition-colors ${settings.privacyMode ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${settings.privacyMode ? 'translate-x-5' : 'translate-x-0'}`}></div>
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

// --- VERIFICATION VIEW (KYC) ---
export const VerificationView = () => {
    return (
        <div className="max-w-2xl mx-auto p-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <ViewHeader title="Verification Center" icon={FileCheck} subtitle="Level 2 Verified" />

            {/* Level Progress */}
            <div className="flex items-center justify-between mb-8 px-2">
                {[1, 2, 3].map(level => (
                    <div key={level} className="flex flex-col items-center gap-2 relative z-10">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-4 ${level <= 2 ? 'bg-emerald-500 border-emerald-100 text-white' : 'bg-slate-200 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500'}`}>
                            {level < 2 ? <Check size={16} /> : level}
                        </div>
                        <span className={`text-[10px] font-bold uppercase ${level <= 2 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                            Level {level}
                        </span>
                    </div>
                ))}
                {/* Connector Line */}
                <div className="absolute left-8 right-8 h-1 bg-slate-200 dark:bg-slate-800 top-[110px] -z-0 hidden md:block"></div>
            </div>

            <div className="space-y-4">
                <div className="bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3">
                         <div className="bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                             <CheckCircle2 size={12} /> Verified
                         </div>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">Level 1: Basic Info</h3>
                    <p className="text-sm text-slate-500 mb-4">Email, Phone Number, and Personal Details.</p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-3">
                         <div className="bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                             <CheckCircle2 size={12} /> Verified
                         </div>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">Level 2: Identity Document</h3>
                    <p className="text-sm text-slate-500 mb-4">Valid Government ID (Passport, Drivers License).</p>
                </div>

                 <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3">
                         <div className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                             <Lock size={12} /> Locked
                         </div>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">Level 3: Proof of Address</h3>
                    <p className="text-sm text-slate-500 mb-6">Utility Bill or Bank Statement showing your address.</p>
                    
                    <button className="w-full border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 hover:text-emerald-500 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all cursor-pointer">
                        <Upload size={32} className="mb-2" />
                        <span className="font-bold text-sm">Upload Document</span>
                        <span className="text-xs mt-1">PDF, JPG or PNG (Max 5MB)</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- BONUS VIEW ---
export const BonusView = () => {
    return (
        <div className="max-w-2xl mx-auto p-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <ViewHeader title="My Bonuses" icon={Gift} subtitle="Active rewards and promotions" />
            
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden mb-6">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                 <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                        <div className="text-xs font-bold bg-white/20 px-2 py-1 rounded w-fit mb-2">WELCOME BONUS</div>
                        <h3 className="text-3xl font-black">100% Match</h3>
                        <p className="text-purple-200 text-sm">Up to $500 on your first deposit</p>
                    </div>
                    <Gift size={48} className="text-white/80" />
                 </div>
                 
                 <div className="relative z-10">
                     <div className="flex justify-between text-xs font-bold mb-2">
                        <span>Wager Requirement</span>
                        <span>$250 / $1000</span>
                     </div>
                     <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400 w-1/4"></div>
                     </div>
                     <p className="text-[10px] text-purple-300 mt-2">Expires in 14 days</p>
                 </div>
            </div>

            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">Available Promotions</h3>
            <div className="space-y-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex gap-4">
                    <div className="bg-amber-100 dark:bg-amber-900/20 p-3 rounded-xl text-amber-600 h-fit">
                        <Trophy size={24} />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-slate-900 dark:text-white">Accumulator Boost</h4>
                        <p className="text-xs text-slate-500 mb-3">Get up to 50% extra on your multi-bets with 5+ selections.</p>
                        <button className="text-xs font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-emerald-500 hover:text-white transition-colors">View Details</button>
                    </div>
                </div>

                 <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex gap-4">
                    <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-xl text-blue-600 h-fit">
                        <RefreshCw size={24} />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-slate-900 dark:text-white">Weekly Cashback</h4>
                        <p className="text-xs text-slate-500 mb-3">Get 5% cashback on all losses every Monday.</p>
                        <button className="text-xs font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-emerald-500 hover:text-white transition-colors">Opt In</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- HELP VIEW ---
export const HelpView = () => {
    return (
        <div className="max-w-2xl mx-auto p-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <ViewHeader title="Help Center" icon={HelpCircle} subtitle="24/7 Support & FAQs" />
            
            <div className="grid grid-cols-2 gap-4 mb-8">
                <button className="bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-xl flex flex-col items-center gap-2 shadow-lg shadow-emerald-500/20 transition-transform hover:-translate-y-1">
                    <MessageSquare size={28} />
                    <span className="font-bold text-sm">Live Chat</span>
                </button>
                <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 p-4 rounded-xl flex flex-col items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <PhoneCall size={28} />
                    <span className="font-bold text-sm">Call Us</span>
                </button>
            </div>

            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">Frequently Asked Questions</h3>
            <div className="space-y-2">
                {[
                    "How do I deposit funds?",
                    "What is the minimum withdrawal?",
                    "How to verify my account?",
                    "Why was my bet voided?",
                    "Forgot password?"
                ].map((q, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex justify-between items-center cursor-pointer hover:border-emerald-500/50 transition-colors group">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{q}</span>
                        <ChevronRight size={16} className="text-slate-400 group-hover:text-emerald-500" />
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- RESPONSIBLE GAMING VIEW ---
export const ResponsibleGamingView = () => {
    return (
        <div className="max-w-2xl mx-auto p-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <ViewHeader title="Responsible Gaming" icon={ShieldCheck} subtitle="Tools to stay in control" />
            
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 flex gap-3 mb-8">
                <AlertTriangle className="text-amber-500 shrink-0" size={24} />
                <div>
                    <h4 className="font-bold text-sm text-amber-900 dark:text-amber-200">Play Responsibly</h4>
                    <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-1 leading-relaxed">
                        Gambling should be entertaining. Remember that you risk losing money when you play. Never bet money you cannot afford to lose.
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Ban size={18} className="text-slate-500" />
                            <h4 className="font-bold text-slate-900 dark:text-white">Self Exclusion</h4>
                        </div>
                        <p className="text-xs text-slate-500">Temporarily lock your account.</p>
                    </div>
                    <button className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700">Configure</button>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Wallet size={18} className="text-slate-500" />
                            <h4 className="font-bold text-slate-900 dark:text-white">Deposit Limits</h4>
                        </div>
                        <p className="text-xs text-slate-500">Cap your daily/monthly deposits.</p>
                    </div>
                    <button className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700">Set Limit</button>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Hourglass size={18} className="text-slate-500" />
                            <h4 className="font-bold text-slate-900 dark:text-white">Reality Check</h4>
                        </div>
                        <p className="text-xs text-slate-500">Reminders of your session time.</p>
                    </div>
                    <button className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700">Set Reminder</button>
                </div>
            </div>
        </div>
    );
};
