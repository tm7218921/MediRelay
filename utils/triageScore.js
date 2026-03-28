/**
 * Calculates a basic triage score based on supplied vitals.
 * Input: { bp: "string", hr: number, temp: string|number, spo2: number }
 * Output: "CRITICAL" | "MEDIUM" | "LOW"
 */
export const calculateTriageScore = (vitals) => {
  if (!vitals) return "LOW";
  
  const hr = parseFloat(vitals.hr) || 0;
  const spo2 = parseFloat(vitals.spo2) || 100;
  const temp = parseFloat(vitals.temp) || 37.0;
  
  // Extract systolic from "120/80" -> 120
  let sysBp = 120;
  if (vitals.bp && vitals.bp.includes('/')) {
    sysBp = parseFloat(vitals.bp.split('/')[0]) || 120;
  } else if (vitals.bp) {
    sysBp = parseFloat(vitals.bp) || 120;
  }

  // CRITICAL logic
  if (hr > 120 || spo2 < 90 || sysBp < 90) {
    return "CRITICAL";
  }

  // MEDIUM logic
  if (hr > 100 || spo2 < 95 || temp > 38.5) {
    return "MEDIUM";
  }

  // LOW logic (fallback)
  return "LOW";
};
