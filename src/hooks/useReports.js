import { useState } from "react";
import { supabase } from "../lib/supabase";

const REASONS = [
  { id: "spam", label: "Spam or misleading" },
  { id: "harassment", label: "Harassment or bullying" },
  { id: "hate", label: "Hate speech" },
  { id: "violence", label: "Violence or dangerous content" },
  { id: "nudity", label: "Nudity or sexual content" },
  { id: "false_info", label: "False information" },
  { id: "scam", label: "Scam or fraud" },
  { id: "other", label: "Something else" },
];

export function useReports() {
  const [loading, setLoading] = useState(false);

  const submit = async ({ reporterId, targetType, targetId, reason, details }) => {
    if (!reporterId || !targetType || !targetId || !reason) {
      return { error: "Missing required fields" };
    }
    setLoading(true);
    const { error } = await supabase.from("reports").insert({
      reporter_id: reporterId,
      target_type: targetType,
      target_id: targetId,
      reason,
      details: details?.trim() || null,
    });
    setLoading(false);
    if (error) return { error: error.message };
    return {};
  };

  return { submit, loading, REASONS };
}
