import React, { useState } from 'react';
import { Lock, Delete, ShieldCheck, User } from 'lucide-react';
import { UserProfile } from '../types';
import { SanoLogo } from './SanoLogo';

interface PinLockScreenProps {
  userProfile: UserProfile;
  onUnlock: () => void;
}

export const PinLockScreen: React.FC<PinLockScreenProps> = ({
  userProfile,
  onUnlock,
}) => {
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);

  const handleDigit = (digit: string) => {
    if (enteredPin.length >= 6) return;
    const next = enteredPin + digit;
    setEnteredPin(next);
    setIsError(false);

    if (userProfile.pin && next === userProfile.pin) {
      onUnlock();
    } else if (userProfile.pin && next.length === userProfile.pin.length && next !== userProfile.pin) {
      setIsError(true);
      setTimeout(() => {
        setEnteredPin('');
      }, 400);
    }
  };

  const handleDelete = () => {
    setEnteredPin((prev) => prev.slice(0, -1));
    setIsError(false);
  };

  return (
    <div
      id="screen-pin-lock"
      className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-between p-6 text-white"
    >
      <div className="pt-10 flex flex-col items-center text-center space-y-3">
        {/* Brand Mark */}
        <div className="flex items-center gap-2 mb-2 bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-700/60">
          <SanoLogo size="sm" />
          <span className="text-xs font-bold tracking-wider text-slate-300 uppercase">Sano</span>
        </div>

        <div className="relative">
          {userProfile.photoUrl ? (
            <img
              src={userProfile.photoUrl}
              alt={userProfile.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-indigo-500 shadow-xl"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-400">
              <User size={36} />
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 p-1 bg-indigo-600 rounded-full border-2 border-slate-900">
            <Lock size={12} />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-100">
            {userProfile.name ? `Olá, ${userProfile.name}` : 'Sano'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Digite seu PIN de acesso para continuar</p>
        </div>

        {/* PIN dots */}
        <div className="flex items-center gap-3 pt-4">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = index < enteredPin.length;
            return (
              <div
                key={index}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                  isError
                    ? 'bg-rose-500 animate-shake scale-110'
                    : isFilled
                    ? 'bg-indigo-400 scale-110 shadow-sm shadow-indigo-400/50'
                    : 'bg-slate-700'
                }`}
              />
            );
          })}
        </div>

        {isError && (
          <p className="text-xs text-rose-400 font-medium">PIN incorreto. Tente novamente.</p>
        )}
      </div>

      {/* Numeric Keypad */}
      <div className="w-full max-w-xs pb-8">
        <div className="grid grid-cols-3 gap-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="h-16 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-indigo-600 text-xl font-bold text-slate-100 transition-all flex items-center justify-center shadow-xs border border-slate-700/50"
            >
              {digit}
            </button>
          ))}
          <div />
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-16 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-indigo-600 text-xl font-bold text-slate-100 transition-all flex items-center justify-center shadow-xs border border-slate-700/50"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="h-16 rounded-2xl bg-slate-800/40 hover:bg-slate-700/60 active:bg-slate-700 text-slate-400 hover:text-slate-200 transition-all flex items-center justify-center"
          >
            <Delete size={22} />
          </button>
        </div>
      </div>
    </div>
  );
};
