
import React from 'react';
import { X, User, Wallet, CreditCard, History, Settings, HelpCircle, LogOut, ChevronRight, Shield, Bell, Moon, Smartphone, Dices, Trophy, Sun, Lock, FileCheck, Gift } from 'lucide-react';
import { AppView, AppSettings, UserProfile } from '../types';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: AppView) => void;
  onLogout: () => void;
  settings?: AppSettings;
  onSettingsUpdate?: (s: AppSettings) => void;
  user?: UserProfile;
}

const MenuDrawer: React.FC<MenuDrawerProps> = ({ isOpen, onClose, onNavigate, onLogout, settings, onSettingsUpdate, user }) => {
  
  const handleNav = (view: AppView) => {
      onNavigate(view);
  };

  const toggleTheme = () => {
    if (settings && onSettingsUpdate) {
        onSettingsUpdate({ ...settings, theme: settings.theme === 'dark' ? 'light' : 'dark' });
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 w-[85%] max-w-sm bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header / Profile */}
        <div className="bg-gradient-to-br from-emerald-600 to-slate-800 dark:from-emerald-900 dark:to-slate-900 p-6 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div className="flex justify-between items-start mb-4">
             <div onClick={() => handleNav('profile')} className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-500/30 cursor-pointer hover:scale-105 transition-transform border-2 border-white/20">
                {user?.avatar || 'JD'}
             </div>
             <button onClick={onClose} className="p-1 text-white/70 hover:text-white bg-black/20 rounded-full">
                <X size={20} />
             </button>
          </div>
          <div>
             <h2 onClick={() => handleNav('profile')} className="text-white font-bold text-lg cursor-pointer hover:text-emerald-400 transition-colors">{user?.name || 'John Doe'}</h2>
             <p className="text-emerald-300 text-sm font-mono mb-3">ID: {user?.id || '88239102'}</p>
             <div className="flex gap-2">
                <div className="flex-1 bg-black/20 rounded-lg p-2 border border-white/10">
                   <div className="text-[10px] text-slate-300 uppercase font-bold">Main Balance</div>
                   <div className="text-white font-bold">$2,450.50</div>
                </div>
                <div className="flex-1 bg-black/20 rounded-lg p-2 border border-white/10">
                   <div className="text-[10px] text-slate-300 uppercase font-bold">Bonus</div>
                   <div className="text-amber-400 font-bold">$150.00</div>
                </div>
             </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
           
           {/* Quick Actions */}
           <div className="grid grid-cols-2 gap-3">
              <button 
                  onClick={() => handleNav('deposit')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors shadow-sm"
              >
                 <Wallet size={24} />
                 <span className="font-bold text-sm">Deposit</span>
              </button>
              <button 
                  onClick={() => handleNav('withdraw')}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white p-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors border border-slate-200 dark:border-slate-700"
              >
                 <CreditCard size={24} />
                 <span className="font-bold text-sm">Withdraw</span>
              </button>
           </div>

           {/* Games Section */}
           <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">Games</h3>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                 <MenuItem icon={<Dices size={18} className="text-purple-500 dark:text-purple-400" />} label="Casino & Slots" onClick={() => handleNav('casino')} />
                 <MenuItem icon={<Trophy size={18} className="text-amber-500 dark:text-amber-400" />} label="Jackpots" onClick={() => handleNav('jackpot')} />
              </div>
           </div>

           {/* Account Section */}
           <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">Account</h3>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                 <MenuItem icon={<User size={18} />} label="My Dashboard" onClick={() => handleNav('profile')} />
                 <MenuItem icon={<FileCheck size={18} />} label="Verification Center" badge={`Lvl ${user?.level || 2}`} onClick={() => handleNav('verification')} />
                 <MenuItem icon={<Gift size={18} />} label="My Bonuses" badge="1 Active" onClick={() => handleNav('bonuses')} />
                 <MenuItem icon={<History size={18} />} label="Bet History" onClick={() => handleNav('my-bets')} />
                 <MenuItem icon={<History size={18} />} label="Transaction History" onClick={() => handleNav('transactions')} />
              </div>
           </div>

           {/* Settings Section */}
           <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">Settings</h3>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                 <MenuItem icon={<Settings size={18} />} label="Preferences" onClick={() => handleNav('settings')} />
                 <MenuItem icon={<Shield size={18} />} label="Security Center" onClick={() => handleNav('security')} />

                 {/* Dark Mode Toggle */}
                 <div 
                   onClick={toggleTheme}
                   className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                 >
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                       {settings?.theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                       <span className="text-sm font-medium">Dark Mode</span>
                    </div>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${settings?.theme === 'dark' ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                       <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all ${settings?.theme === 'dark' ? 'right-1' : 'left-1'}`}></div>
                    </div>
                 </div>

                 <div className="flex items-center justify-between p-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer" onClick={() => handleNav('settings')}>
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                       <Smartphone size={18} />
                       <span className="text-sm font-medium">Odds Format</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded capitalize">{settings?.oddsFormat || 'Decimal'}</span>
                 </div>
              </div>
           </div>

            {/* Support Section */}
           <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">Support</h3>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                 <MenuItem icon={<HelpCircle size={18} />} label="Help Center" onClick={() => handleNav('help')} />
                 <MenuItem icon={<Shield size={18} />} label="Responsible Gaming" onClick={() => handleNav('responsible-gaming')} />
              </div>
           </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
           <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 font-bold p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors mb-4"
           >
              <LogOut size={18} /> Log Out
           </button>
           
           {/* Sponsors */}
           <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
              <p className="text-[10px] uppercase font-bold text-slate-500 text-center mb-2">Powered By</p>
              <div className="flex items-center justify-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
                  <span className="font-black text-slate-400 dark:text-slate-400 italic">JOVIBES</span>
                  <span className="text-slate-400 dark:text-slate-700">•</span>
                  <span className="font-bold text-slate-400 dark:text-slate-400 text-xs">BATOSAM LTD</span>
              </div>
           </div>
        </div>
      </div>
    </>
  );
};

interface MenuItemProps {
   icon: React.ReactNode;
   label: string;
   badge?: string;
   onClick: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, badge, onClick }) => (
   <div 
      onClick={onClick}
      className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700/50 last:border-0 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
   >
      <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
         {React.cloneElement(icon as React.ReactElement, { className: 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200' })}
         <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2">
         {badge && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{badge}</span>}
         <ChevronRight size={16} className="text-slate-400 dark:text-slate-600 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors" />
      </div>
   </div>
);

export default MenuDrawer;
