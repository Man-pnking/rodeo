import { useState } from "react";
import { supabase } from "../lib/supabase";

export function useAccount() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const changePassword = async (newPassword) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) {
      setError(error.message);
      return { error: error.message };
    }
    return {};
  };

  const changeEmail = async (newEmail) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    setLoading(false);
    if (error) {
      setError(error.message);
      return { error: error.message };
    }
    return {};
  };

  const deleteAccount = async () => {
    setLoading(true);
    setError(null);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return { error: "Not signed in" };
    }
    const { data, error } = await supabase.functions.invoke("delete-account", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return { error: error.message };
    }
    if (data?.error) {
      setError(data.error);
      return { error: data.error };
    }
    await supabase.auth.signOut();
    return {};
  };

  // Two-factor (TOTP)
  const listFactors = async () => {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) return { error: error.message };
    return { totp: data?.totp || [], all: data?.all || [] };
  };

  const enrollTotp = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
    setLoading(false);
    if (error) {
      setError(error.message);
      return { error: error.message };
    }
    return {
      factorId: data.id,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
    };
  };

  const verifyTotp = async (factorId, code) => {
    setLoading(true);
    setError(null);
    const { data: challenge, error: chErr } = await supabase.auth.mfa.challenge({ factorId });
    if (chErr) {
      setLoading(false);
      return { error: chErr.message };
    }
    const { error: vErr } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code,
    });
    setLoading(false);
    if (vErr) {
      setError(vErr.message);
      return { error: vErr.message };
    }
    return {};
  };

  const unenrollTotp = async (factorId) => {
    setLoading(true);
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    setLoading(false);
    if (error) return { error: error.message };
    return {};
  };

  return {
    loading,
    error,
    changePassword,
    changeEmail,
    deleteAccount,
    listFactors,
    enrollTotp,
    verifyTotp,
    unenrollTotp,
  };
}
