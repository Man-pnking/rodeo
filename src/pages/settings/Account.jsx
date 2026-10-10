import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Key, Trash2, Shield } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { SettingsRow, SettingsSection } from "../../components/SettingsRow.jsx";
import SlideIn from "../../components/SlideIn.jsx";
import ChangePasswordModal from "../../components/ChangePasswordModal.jsx";
import ChangeEmailModal from "../../components/ChangeEmailModal.jsx";
import TwoFactorModal from "../../components/TwoFactorModal.jsx";
import DeleteAccountModal from "../../components/DeleteAccountModal.jsx";

export default function Account() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [open, setOpen] = useState({ pw: false, email: false, tfa: false, del: false });
  const close = (k) => setOpen((o) => ({ ...o, [k]: false }));
  const openM = (k) => setOpen((o) => ({ ...o, [k]: true }));

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 w-full">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 -m-2 rounded-full hover:bg-white/5" aria-label="Back">
          <ArrowLeft className="w-5 h-5 text-warm" />
        </button>
        <h1 className="display-lg">Account</h1>
      </div>

      <SlideIn variant="up">
        <SettingsSection title="Security">
          <SettingsRow icon={Shield} label="Two-step verification" subtitle="Extra layer of security" onClick={() => openM("tfa")} />
          <SettingsRow icon={Key} label="Change password" subtitle="Update your login password" onClick={() => openM("pw")} />
        </SettingsSection>
      </SlideIn>

      <SlideIn variant="up" delay={0.05}>
        <SettingsSection title="Contact">
          <SettingsRow icon={Mail} label="Email address" subtitle={user?.email} onClick={() => openM("email")} />
        </SettingsSection>
      </SlideIn>

      <SlideIn variant="up" delay={0.1}>
        <SettingsSection title="Danger zone">
          <SettingsRow icon={Trash2} label="Delete my account" subtitle="Permanently removes all data" onClick={() => openM("del")} />
        </SettingsSection>
      </SlideIn>

      <ChangePasswordModal open={open.pw} onClose={() => close("pw")} />
      <ChangeEmailModal open={open.email} onClose={() => close("email")} />
      <TwoFactorModal open={open.tfa} onClose={() => close("tfa")} />
      <DeleteAccountModal open={open.del} onClose={() => close("del")} />
    </div>
  );
}
