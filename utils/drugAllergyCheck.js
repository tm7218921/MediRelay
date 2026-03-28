/**
 * Checks submitted medications array against patient allergy list.
 * @param {Array} medications - [{ name: "Metronidazole" }]
 * @param {Array} allergies - ["Penicillin", "Sulfa"]
 * @returns {Array} List of conflict strings or empty array.
 */
export const checkDrugAllergyConflicts = (medications, allergies) => {
  if (!medications || !allergies || medications.length === 0 || allergies.length === 0) {
    return [];
  }

  const conflicts = [];
  const normalizedAllergies = allergies.map(a => a.toLowerCase().trim());
  
  const lookupTable = {
    "penicillin": ["amoxicillin", "ampicillin", "augmentin", "piperacillin", "penicillin"],
    "sulfa": ["co-trimoxazole", "sulfamethoxazole", "bactrim", "septra"],
    "aspirin": ["ibuprofen", "naproxen", "diclofenac", "aspirin", "nsaid"],
    "codeine": ["tramadol", "morphine", "fentanyl", "oxycodone", "codeine"]
  };

  medications.forEach(med => {
    if (!med.name) return;
    const medName = med.name.toLowerCase().trim();

    // Direct match check (e.g. they put "amoxicillin" in allergies and "amoxicillin" in meds)
    if (normalizedAllergies.includes(medName)) {
      conflicts.push(`Direct Conflict: Patient is allergic to ${med.name}`);
      return;
    }

    // Cross-reactivity / Drug class check
    for (const [allergyGroup, dangerousDrugs] of Object.entries(lookupTable)) {
      if (normalizedAllergies.some(a => a.includes(allergyGroup) || allergyGroup.includes(a))) {
        // Patient has allergy to this group
        if (dangerousDrugs.some(dangerMed => medName.includes(dangerMed))) {
          conflicts.push(`Severe Risk: ${med.name} is contraindicated due to ${allergyGroup} allergy.`);
        }
      }
    }
  });

  return [...new Set(conflicts)]; // return unique warnings
};
