import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Check,
  User,
  Camera,
  Lock,
  Shield,
  Trash2,
  KeyRound,
  Mail,
  Coins,
  Sparkles,
} from 'lucide-react';
import { UserProfile } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaveProfile: (updatedProfile: UserProfile) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
}) => {
  const [name, setName] = useState(userProfile.name || '');
  const [email, setEmail] = useState(userProfile.email || '');
  const [photoUrl, setPhotoUrl] = useState(userProfile.photoUrl || '');
  const [isPinEnabled, setIsPinEnabled] = useState(userProfile.isPinEnabled || false);
  const [pin, setPin] = useState(userProfile.pin || '');
  const [pinConfirm, setPinConfirm] = useState(userProfile.pin || '');
  const [currency, setCurrency] = useState(userProfile.currency || 'BRL (R$)');
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'prefs'>('profile');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(userProfile.name || '');
      setEmail(userProfile.email || '');
      setPhotoUrl(userProfile.photoUrl || '');
      setIsPinEnabled(userProfile.isPinEnabled || false);
      setPin(userProfile.pin || '');
      setPinConfirm(userProfile.pin || '');
      setCurrency(userProfile.currency || 'BRL (R$)');
      setErrorMessage(null);
    }
  }, [isOpen, userProfile]);

  if (!isOpen) return null;

  // Handle local photo file upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('A imagem deve ter no máximo 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPhotoUrl(event.target.result as string);
        setErrorMessage(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Por favor, informe seu nome.');
      setActiveTab('profile');
      return;
    }

    if (isPinEnabled) {
      if (pin.length < 4) {
        setErrorMessage('O PIN de segurança deve ter pelo menos 4 dígitos numéricos.');
        setActiveTab('security');
        return;
      }
      if (pin !== pinConfirm) {
        setErrorMessage('Os PINs digitados não coincidem.');
        setActiveTab('security');
        return;
      }
    }

    const updated: UserProfile = {
      name: name.trim(),
      email: email.trim(),
      photoUrl,
      pin: isPinEnabled ? pin : '',
      isPinEnabled,
      currency,
    };

    onSaveProfile(updated);
    onClose();
  };

  return (
    <div
      id="modal-user-profile-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        id="modal-user-profile-sheet"
        className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
              <User size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Preferências do Usuário</h2>
              <p className="text-xs text-slate-400">Perfil, foto e senha de acesso</p>
            </div>
          </div>
          <button
            id="btn-close-user-profile"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Section Navigation Tabs */}
        <div className="px-5 pt-3 pb-1 flex gap-2 border-b border-slate-100">
          <button
            type="button"
            id="tab-profile-info"
            onClick={() => {
              setActiveTab('profile');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'profile'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
            }`}
          >
            <User size={14} />
            <span>Perfil</span>
          </button>

          <button
            type="button"
            id="tab-security-pin"
            onClick={() => {
              setActiveTab('security');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'security'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Shield size={14} />
            <span>Segurança</span>
          </button>

          <button
            type="button"
            id="tab-general-prefs"
            onClick={() => {
              setActiveTab('prefs');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'prefs'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Coins size={14} />
            <span>Geral</span>
          </button>
        </div>

        {/* Error Feedback */}
        {errorMessage && (
          <div className="mx-5 mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-700">
            {errorMessage}
          </div>
        )}

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* TAB 1: PERFIL & FOTO */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              {/* Photo Upload Section */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="relative group">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={name || 'Avatar'}
                      className="w-20 h-20 rounded-full object-cover border-2 border-indigo-500 shadow-md"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-2xl border-2 border-indigo-200 shadow-xs">
                      {name ? name.slice(0, 2).toUpperCase() : <User size={36} />}
                    </div>
                  )}

                  {/* Upload button over photo */}
                  <button
                    type="button"
                    id="btn-upload-photo"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-md transition-transform active:scale-95"
                    title="Adicionar ou alterar foto"
                  >
                    <Camera size={14} />
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="input-avatar-file"
                />

                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-white border border-indigo-200 px-3 py-1 rounded-lg hover:bg-indigo-50 transition-colors shadow-xs"
                  >
                    {photoUrl ? 'Trocar Foto' : 'Adicionar Foto'}
                  </button>

                  {photoUrl && (
                    <button
                      type="button"
                      id="btn-remove-photo"
                      onClick={handleRemovePhoto}
                      className="text-xs font-medium text-rose-500 hover:text-rose-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-colors"
                    >
                      Remover
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Formatos suportados: PNG, JPG ou GIF (até 2MB)
                </p>
              </div>

              {/* Name Field */}
              <div className="space-y-1.5">
                <label htmlFor="input-profile-name" className="text-xs font-bold text-slate-700 block">
                  Nome Completo / Como prefere ser chamado(a) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="input-profile-name"
                    type="text"
                    required
                    placeholder="Ex: Carine Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  />
                  <User size={15} className="absolute left-3 top-3 text-slate-400" />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-1.5">
                <label htmlFor="input-profile-email" className="text-xs font-bold text-slate-700 block">
                  E-mail <span className="text-slate-400 font-normal">(Opcional para backup)</span>
                </label>
                <div className="relative">
                  <input
                    id="input-profile-email"
                    type="email"
                    placeholder="seu.email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  />
                  <Mail size={15} className="absolute left-3 top-3 text-slate-400" />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SEGURANÇA / SENHA DE ACESSO */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              {/* PIN Toggle Card */}
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                    <KeyRound size={18} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Bloqueio com Senha / PIN
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Exigir código de 4 dígitos para abrir o app
                    </span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="toggle-pin-enabled"
                    checked={isPinEnabled}
                    onChange={(e) => setIsPinEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {isPinEnabled ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="space-y-1.5">
                    <label htmlFor="input-security-pin" className="text-xs font-bold text-slate-700 block">
                      Definir Senha / PIN (4 a 6 números)
                    </label>
                    <div className="relative">
                      <input
                        id="input-security-pin"
                        type="password"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        placeholder="••••"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-center tracking-widest text-lg font-bold bg-slate-50 border border-slate-200 rounded-xl py-2 text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all"
                      />
                      <Lock size={15} className="absolute left-3 top-3 text-slate-400" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="input-security-pin-confirm" className="text-xs font-bold text-slate-700 block">
                      Confirmar Senha / PIN
                    </label>
                    <div className="relative">
                      <input
                        id="input-security-pin-confirm"
                        type="password"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        placeholder="••••"
                        value={pinConfirm}
                        onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-center tracking-widest text-lg font-bold bg-slate-50 border border-slate-200 rounded-xl py-2 text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all"
                      />
                      <Lock size={15} className="absolute left-3 top-3 text-slate-400" />
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500">
                    🔒 Sua senha fica gravada de forma segura localmente no seu dispositivo.
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-500 flex items-start gap-2">
                  <Shield size={16} className="text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    O aplicativo pode ser aberto diretamente sem senha. Ative a chave acima se desejar proteger a visualização dos seus valores financeiros.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PREFERÊNCIAS GERAIS */}
          {activeTab === 'prefs' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Moeda Principal
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['BRL (R$)', 'USD ($)', 'EUR (€)'].map((curr) => (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => setCurrency(curr)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        currency === curr
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                  <Sparkles size={14} className="text-indigo-600" />
                  <span>Personalização Salva Localmente</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Todas as suas preferências são salvas de forma privada e instantânea no armazenamento do seu aparelho.
                </p>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white flex gap-2">
          <button
            type="button"
            id="btn-cancel-user-profile"
            onClick={onClose}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            id="btn-save-user-profile"
            onClick={handleSubmit}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl transition-colors shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5"
          >
            <Check size={16} className="stroke-[3]" />
            <span>Salvar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
