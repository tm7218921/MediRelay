import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export const generateAndSharePDF = async (record) => {
  if (!record) return;

  const htmlContent = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #2C3E50; }
          .header { text-align: center; border-bottom: 2px solid #C0392B; padding-bottom: 15px; margin-bottom: 20px; }
          .title { font-size: 24px; font-weight: bold; color: #C0392B; margin: 0; }
          .subtitle { font-size: 14px; color: #7F8C8D; margin-top: 5px; }
          .section { margin-bottom: 20px; background-color: #F8F9FA; padding: 15px; border-radius: 8px; border: 1px solid #E2E8F0; }
          .critical { background-color: #FDEDEC; border: 2px solid #E74C3C; }
          .label { font-weight: bold; font-size: 14px; text-transform: uppercase; color: #7F8C8D; margin-bottom: 5px; }
          .value { font-size: 18px; margin: 0; }
          .red-text { color: #E74C3C; font-weight: bold; }
          .meds-list { margin: 0; padding-left: 20px; font-size: 16px; }
          .vitals-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .vital-box { padding: 10px; background: white; border-radius: 4px; border: 1px solid #E2E8F0; }
          .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #95A5A6; }
        </style>
      </head>
      <body>
        <div class="header">
          <p class="title">MediRelay Transfer Record</p>
          <p class="subtitle">Generated on ${new Date().toLocaleString()}</p>
        </div>

        <div class="section critical">
          <p class="label">CRITICAL ALLERGIES</p>
          <p class="value red-text">${record.allergies.length > 0 ? record.allergies.join(", ") : "NO KNOWN ALLERGIES"}</p>
        </div>

        <div class="section">
          <p class="label">Patient Information</p>
          <p class="value"><strong>Name:</strong> ${record.patientName} (${record.age} ${record.gender || 'Unknown'})</p>
          <p class="value" style="margin-top: 8px;"><strong>Diagnosis:</strong> ${record.diagnosis}</p>
          <p class="value" style="margin-bottom: 0;"><strong>Triage Score:</strong> <span style="font-weight: bold; color: ${record.triageScore === 'CRITICAL' ? '#C0392B' : record.triageScore === 'MEDIUM' ? '#E67E22' : '#27AE60'}">${record.triageScore}</span></p>
        </div>

        <div class="section">
          <p class="label">Active Medications</p>
          <ul class="meds-list">
            ${record.medications.map(m => `<li><strong>${m.name}</strong> - ${m.dose} (${m.route})</li>`).join('')}
          </ul>
        </div>

        <div class="section">
          <p class="label">Vitals</p>
          <div class="vitals-grid">
            <div class="vital-box"><strong>BP:</strong> ${record.vitals.bp || 'N/A'} mmHg</div>
            <div class="vital-box"><strong>HR:</strong> ${record.vitals.hr || 'N/A'} bpm</div>
            <div class="vital-box"><strong>Temp:</strong> ${record.vitals.temp || 'N/A'} °C</div>
            <div class="vital-box"><strong>SpO2:</strong> ${record.vitals.spo2 || 'N/A'} %</div>
          </div>
        </div>

        <div class="section">
          <p class="label">Clinical Summary & Reason for Transfer</p>
          <p class="value" style="font-size: 16px; font-style: italic;">${record.reasonForTransfer}</p>
          <p class="value" style="font-size: 15px; margin-top: 10px; line-height: 1.4;">${record.clinicalSummary}</p>
        </div>

        <div class="section">
          <p class="label">Transfer Logistics</p>
          <p class="value" style="font-size: 16px;"><strong>From:</strong> ${record.sendingHospital}</p>
          <p class="value" style="font-size: 16px;"><strong>To:</strong> ${record.receivingHospital}</p>
        </div>

        <div class="footer">
          <p>Scan the digital QR code to import this record securely into MediRelay natively.</p>
          <p>CONFIDENTIAL MEDICAL RECORD • ID: ${record.id}</p>
        </div>
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html: htmlContent });
    await Sharing.shareAsync(uri, { UTARL: uri, dialogTitle: 'Share Patient Record PDF' });
  } catch (err) {
    console.error("PDF Error: ", err);
    alert("Could not generate PDF");
  }
};
