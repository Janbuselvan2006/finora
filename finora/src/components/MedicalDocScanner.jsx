import React, { useState, useEffect, useMemo } from 'react';
import { PRESET_MEDICAL_DOCUMENTS } from '../data/insurancePolicies';
import { analyzeMedicalDocument, evaluatePoliciesForMedicalDoc } from '../utils/medicalOcr';
import { getN8nWebhookUrl, setN8nWebhookUrl } from '../utils/n8nService';
import VoiceAssistant from './VoiceAssistant';
import './MedicalDocScanner.css';

export default function MedicalDocScanner() {
  const [selectedPreset, setSelectedPreset] = useState(PRESET_MEDICAL_DOCUMENTS[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [activeTab, setActiveTab] = useState('cards'); // 'cards' or 'matrix'
  const [selectedPolicyModal, setSelectedPolicyModal] = useState(null);
  const [decisionConfirmed, setDecisionConfirmed] = useState(false);
  const [scanError, setScanError] = useState(null);
  
  // n8n Webhook Integration State
  const [n8nWebhookUrl, setN8nWebhookState] = useState(getN8nWebhookUrl());
  const [showN8nModal, setShowN8nModal] = useState(false);
  const [tempN8nUrl, setTempN8nUrl] = useState(getN8nWebhookUrl());
  const [n8nTestStatus, setN8nTestStatus] = useState(null);

  // Step 1 Intake mode: 'upload' | 'paste' | 'preset' | 'voice'
  const [intakeMode, setIntakeMode] = useState('paste');
  const [customFileNote, setCustomFileNote] = useState(
    'Patient: Sunita Sen, Age: 48 yrs, Female. Apollo Health Center: Diagnosed with Type-2 Diabetes Mellitus (HbA1c 8.2%) and Essential Hypertension (BP 145/95). Prescribed Metformin & Telmisartan. Advised single private AC room inpatient care and knee arthroscopy checkup. Estimated treatment cost ₹4,50,000.'
  );
  const [uploadedFile, setUploadedFile] = useState(null);

  // Step 4: User's Requirements & Preferences
  const [userRequirements, setUserRequirements] = useState({
    sumInsured: 1000000, // ₹10 Lakhs
    roomRent: 'no_cap',  // 'no_cap' | 'any'
    pedPriority: 'shortest', // 'shortest' | 'standard'
    coPay: 'zero'        // 'zero' | 'allowed'
  });

  // Run AI Document Scan
  const handleScanDocument = async (docInput) => {
    setIsScanning(true);
    setScanError(null);
    setExtractedData(null);

    try {
      const parsed = await analyzeMedicalDocument(docInput);
      if (!parsed || parsed.isValid === false) {
        // Document has NO hospital/clinic name -> Push INVALID!
        setScanError(parsed || {
          isValid: false,
          errorMessage: 'Invalid Document: No Hospital or Clinic Name Found',
          errorDetails: 'The uploaded medical document or consultation note does not contain any recognized hospital, clinic, or healthcare facility header. IRDAI underwriting guidelines require hospital or clinic accreditation to evaluate claim eligibility and protect against agent fraud.',
          snippet: typeof docInput === 'string' ? docInput.slice(0, 140) : (docInput?.name || 'Uploaded document')
        });
        setExtractedData(null);
      } else {
        setScanError(null);
        setExtractedData(parsed);
      }
    } catch (err) {
      console.error('Error scanning document:', err);
      setScanError({
        isValid: false,
        errorMessage: 'Document Processing Error',
        errorDetails: 'Unable to parse clinical information from this document. Please ensure it is an accredited hospital or clinic report.'
      });
      setExtractedData(null);
    } finally {
      setIsScanning(false);
    }
  };

  // Initial auto scan on mount
  useEffect(() => {
    handleScanDocument(PRESET_MEDICAL_DOCUMENTS[0]);
  }, []);

  // Compute ranked policies whenever extractedData or userRequirements change
  const rankedPolicies = useMemo(() => {
    if (!extractedData) return [];
    return evaluatePoliciesForMedicalDoc(extractedData, userRequirements);
  }, [extractedData, userRequirements]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      setSelectedPreset(null);
      handleScanDocument(file);
    }
  };

  const handleCustomNoteSubmit = (e) => {
    if (e) e.preventDefault();
    if (!customFileNote.trim()) return;
    setSelectedPreset(null);
    handleScanDocument(customFileNote);
  };

  const handleQuickTemplate = (text) => {
    setCustomFileNote(text);
    setSelectedPreset(null);
    handleScanDocument(text);
  };

  // Interactive condition toggle in Extracted Clinical Parameters
  const handleToggleCondition = (condition) => {
    if (!extractedData) return;
    const currentPeds = [...(extractedData.preExistingDiseases || [])];
    const index = currentPeds.indexOf(condition);
    let updatedPeds;
    if (index > -1) {
      updatedPeds = currentPeds.filter(c => c !== condition);
    } else {
      updatedPeds = [...currentPeds, condition];
    }
    setExtractedData({
      ...extractedData,
      preExistingDiseases: updatedPeds.length > 0 ? updatedPeds : ['General Pre-Existing Condition Check']
    });
  };

  return (
    <section className="med-scanner-container" id="medical-ocr-section" aria-label="AI Insurance Policy Finder">
      
      {/* ====================================================================
          FLOW PROGRESSION STEPPER BANNER
          ==================================================================== */}
      <div className="med-flow-stepper" aria-label="Insurance Evaluation Pipeline">
        <div className={`flow-step-item ${uploadedFile || customFileNote ? 'completed' : 'active'}`}>
          <span className="flow-step-num">1</span>
          <span>Upload Document</span>
        </div>
        <span className="flow-step-divider">→</span>

        <div className={`flow-step-item ${scanError ? 'error' : isScanning ? 'active' : extractedData ? 'completed' : ''}`}>
          <span className="flow-step-num">{scanError ? '⚠️' : '2'}</span>
          <span>{scanError ? 'Doc Invalid' : 'AI OCR Scan'}</span>
        </div>
        <span className="flow-step-divider">→</span>

        <div className={`flow-step-item ${extractedData ? 'completed' : ''}`}>
          <span className="flow-step-num">3</span>
          <span>Extract Info</span>
        </div>
        <span className="flow-step-divider">→</span>

        <div className={`flow-step-item ${extractedData ? 'active' : ''}`}>
          <span className="flow-step-num">4</span>
          <span>Your Requirements</span>
        </div>
        <span className="flow-step-divider">→</span>

        <div className={`flow-step-item ${rankedPolicies.length > 0 ? 'completed' : ''}`}>
          <span className="flow-step-num">5</span>
          <span>7-Dimension Comparison</span>
        </div>
        <span className="flow-step-divider">→</span>

        <div className={`flow-step-item ${selectedPolicyModal ? 'active' : ''}`}>
          <span className="flow-step-num">6</span>
          <span>Final Decision</span>
        </div>
      </div>

      {/* ====================================================================
          HEADER
          ==================================================================== */}
      <div className="med-header">
        <div className="med-title-group">
          <h2>
            <span>🛡️ Medical Document AI Policy Finder</span>
          </h2>
          <p>
            An end-to-end explainable insurance comparison pipeline matching clinical reports against IRDAI guidelines.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="med-ai-pill"
            style={{
              cursor: 'pointer',
              background: n8nWebhookUrl ? '#ecfdf5' : '#f8fafc',
              color: n8nWebhookUrl ? '#065f46' : '#334155',
              border: n8nWebhookUrl ? '1px solid #a7f3d0' : '1px solid #e2e8f0'
            }}
            onClick={() => {
              setTempN8nUrl(n8nWebhookUrl || '');
              setShowN8nModal(true);
            }}
            title="Configure n8n automation webhook"
          >
            <span>{n8nWebhookUrl ? '⚡ n8n Connected' : '🔗 Connect n8n'}</span>
          </button>
          <div className="med-ai-pill">
            <span>✨ Gemini OCR Vision Active</span>
          </div>
        </div>
      </div>

      {/* ====================================================================
          STEP 1: USER UPLOADS MEDICAL DOCUMENTS / ENTERS DOCTOR CHECKUP
          ==================================================================== */}
      <div className="med-intake-mode-bar" role="tablist">
        <button
          type="button"
          className={`intake-mode-pill ${intakeMode === 'paste' ? 'active' : ''}`}
          onClick={() => setIntakeMode('paste')}
        >
          ✍️ Type or Paste Doctor Checkup
        </button>
        <button
          type="button"
          className={`intake-mode-pill ${intakeMode === 'upload' ? 'active' : ''}`}
          onClick={() => setIntakeMode('upload')}
        >
          📁 Upload Doctor Form (PDF / Image)
        </button>
        <button
          type="button"
          className={`intake-mode-pill ${intakeMode === 'preset' ? 'active' : ''}`}
          onClick={() => setIntakeMode('preset')}
        >
          📋 Sample Doctor Checkup Presets
        </button>
        <button
          type="button"
          className={`intake-mode-pill ${intakeMode === 'voice' ? 'active' : ''}`}
          onClick={() => setIntakeMode('voice')}
        >
          🎙️ Speak Problem (Voice Assistant)
        </button>
      </div>

      <div className="med-intake-box">
        {/* MODE 1: PASTE DOCTOR CHECKUP NOTES */}
        {intakeMode === 'paste' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, fontSize: '13.5px' }}>
                Enter Doctor Diagnosis, Prescription, or Discharge Summary:
              </span>
              <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                NLP extracts clinical indicators & PED waiting periods
              </span>
            </div>

            <textarea
              className="med-notes-textarea"
              value={customFileNote}
              onChange={(e) => setCustomFileNote(e.target.value)}
              rows={4}
              placeholder="e.g. Patient: John Doe, 48 yrs Male. Apollo Hospital: Diagnosed with Type-2 Diabetes & Hypertension. Advised single private room. Estimated cost ₹4,50,000."
            />

            <div className="quick-templates-row">
              <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Sample Notes:</span>
              <button
                type="button"
                className="btn-template-chip"
                onClick={() => handleQuickTemplate('Patient: Rajesh Patel, 54 yrs, Male. Fortis Hospital: Diagnosis: Coronary Artery Disease & Hypertension. Advised Cardiac Stent Angioplasty. Estimated cost ₹11,00,000.')}
              >
                🫀 Fortis Hospital (Cardiac)
              </button>
              <button
                type="button"
                className="btn-template-chip"
                onClick={() => handleQuickTemplate('Patient: Sunita Sen, 48 yrs, Female. Apollo Health Center: Diagnosis: Type-2 Diabetes (HbA1c 8.4%) & Stage-2 Hypertension. Advised single private AC room. Estimated treatment ₹5,00,000.')}
              >
                🩸 Apollo Health (Diabetes)
              </button>
              <button
                type="button"
                className="btn-template-chip"
                onClick={() => handleQuickTemplate('Patient: Meena Gupta, 61 yrs, Female. Max Super Speciality Hospital: Diagnosis: Severe Bilateral Knee Osteoarthritis. Advised Total Knee Replacement Surgery. Estimated cost ₹8,50,000.')}
              >
                🦴 Max Hospital (Knee Joint)
              </button>
              <button
                type="button"
                className="btn-template-chip"
                style={{ borderColor: '#fca5a5', color: '#b91c1c', background: '#fef2f2' }}
                onClick={() => handleQuickTemplate('Patient: Ramesh Kumar, 38 yrs. Diagnosed with acute fever and high blood pressure. Needs health insurance.')}
                title="Click to see what happens when document has NO hospital or clinic name"
              >
                ⚠️ Test Invalid Note (No Hospital)
              </button>
            </div>

            <button
              type="button"
              className="btn-scan-action"
              onClick={handleCustomNoteSubmit}
            >
              <span>⚡ Run AI Document OCR & Extract Info</span>
            </button>
          </div>
        )}

        {/* MODE 2: UPLOAD FILE (PDF / IMAGE / SCAN) */}
        {intakeMode === 'upload' && (
          <div 
            className="med-upload-zone"
            onClick={() => document.getElementById('medFileInput').click()}
          >
            <div className="med-upload-icon">🏥</div>
            <div className="med-upload-title">
              {uploadedFile ? `Selected: ${uploadedFile.name}` : 'Upload Doctor Certificate, Report, or Prescription'}
            </div>
            <div className="med-upload-subtitle">
              {uploadedFile ? `${(uploadedFile.size / 1024).toFixed(1)} KB • Click to re-upload` : 'Must contain verified hospital or clinic letterhead (PDF, PNG, JPG)'}
            </div>
            <input 
              id="medFileInput"
              type="file" 
              accept=".pdf,.png,.jpg,.jpeg,.txt"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          </div>
        )}

        {/* MODE 3: SAMPLE PRESET DOCUMENTS */}
        {intakeMode === 'preset' && (
          <div className="med-presets-selector">
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Select Accredited Hospital Discharge / Checkup Preset:</span>
            <div className="presets-pill-list">
              {PRESET_MEDICAL_DOCUMENTS.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  className={`preset-pill ${selectedPreset?.id === doc.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedPreset(doc);
                    handleScanDocument(doc);
                  }}
                >
                  <span>{doc.icon}</span>
                  <span>{doc.title.split(':')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MODE 4: VOICE ASSISTANT INTAKE */}
        {intakeMode === 'voice' && (
          <VoiceAssistant 
            isEmbedded={true}
            onApplyToInsurance={(payload) => {
              const formattedNote = `Patient: Clinical Voice Consultation, Age: ${payload.patientAge || 45} yrs. ${payload.hospital}: Diagnosed with ${payload.diagnosis}. Prescribed inpatient treatment. Estimated treatment cost ₹${(payload.estimatedCost || 500000).toLocaleString('en-IN')}.`;
              setCustomFileNote(formattedNote);
              setIntakeMode('paste');
              handleScanDocument(formattedNote);
            }}
          />
        )}
      </div>

      {/* ====================================================================
          STEP 2: AI DOCUMENT OCR SCANNING STATE
          ==================================================================== */}
      {isScanning && (
        <div className="med-ocr-loader">
          <div className="spinner-ring"></div>
          <h3 style={{ margin: '0', fontSize: '15px', fontWeight: 700 }}>
            Analyzing Medical Document with AI OCR...
          </h3>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '12.5px' }}>
            Verifying hospital/clinic accreditation, extracting patient clinical profile, PEDs, and procedure costs...
          </p>
        </div>
      )}

      {/* ====================================================================
          INVALID DOCUMENT ALERT (Pushed when no hospital or clinic is detected)
          ==================================================================== */}
      {!isScanning && scanError && (
        <div className="med-invalid-doc-card">
          <div className="invalid-header-row">
            <div className="invalid-status-badge">
              <span>🚫 INVALID DOCUMENT: REJECTED</span>
            </div>
            <span className="invalid-irda-tag">IRDAI Underwriting Rule §45</span>
          </div>

          <h3 className="invalid-heading">{scanError.errorMessage}</h3>
          <p className="invalid-desc">{scanError.errorDetails}</p>

          {scanError.snippet && (
            <div className="invalid-snippet-box">
              <span className="snippet-label">Scanned Text / Snippet:</span>
              <div className="snippet-text">"{scanError.snippet}"</div>
            </div>
          )}

          <div className="invalid-checklist">
            <div className="checklist-item">
              <span className="check-icon">❌</span>
              <span><strong>No Hospital or Clinic Name:</strong> Could not identify an accredited healthcare institution header (e.g. Apollo, Fortis, Max, City Clinic).</span>
            </div>
            <div className="checklist-item">
              <span className="check-icon">🛡️</span>
              <span><strong>Anti-Fraud Shield:</strong> Finora AI strictly evaluates authentic hospital records to protect claim settlement and prevent agent fraud.</span>
            </div>
          </div>

          <div className="invalid-actions">
            <button
              type="button"
              className="btn-invalid-action primary"
              onClick={() => {
                setScanError(null);
                handleQuickTemplate('Patient: Sunita Sen, 48 yrs, Female. Apollo Health Center: Diagnosis: Type-2 Diabetes (HbA1c 8.4%) & Stage-2 Hypertension. Advised single private AC room. Estimated treatment ₹5,00,000.');
              }}
            >
              📄 Load Verified Hospital Document (Apollo)
            </button>
            <button
              type="button"
              className="btn-invalid-action secondary"
              onClick={() => {
                setScanError(null);
                setIntakeMode('paste');
                if (!customFileNote.includes('Hospital') && !customFileNote.includes('Clinic')) {
                  setCustomFileNote(prev => `Apollo Clinic: ${prev}`);
                }
              }}
            >
              ✏️ Add Hospital / Clinic Name & Retry
            </button>
          </div>
        </div>
      )}

      {/* ====================================================================
          STEP 3: EXTRACT RELEVANT INFORMATION (Clinical Data Card)
          ==================================================================== */}
      {!isScanning && extractedData && (
        <div className="med-extracted-card">
          <div className="med-extracted-header">
            <div className="med-extracted-title">
              <span>✅ Extracted Clinical Profile</span>
              <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text-muted)' }}>
                (Scanned on {extractedData.date})
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span className="hospital-verified-badge">🏥 Verified Facility: {extractedData.hospital}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>• {extractedData.doctorName}</span>
            </div>
          </div>

          <div className="med-extracted-grid">
            <div className="med-field-box">
              <span className="med-field-label">Patient Identity</span>
              <span className="med-field-value">
                {extractedData.patientName} ({extractedData.patientAge} yrs, {extractedData.gender})
              </span>
            </div>

            <div className="med-field-box">
              <span className="med-field-label">Clinical Diagnosis</span>
              <span className="med-field-value">
                {extractedData.diagnosis}
              </span>
            </div>

            <div className="med-field-box">
              <span className="med-field-label">Pre-Existing Diseases (PED)</span>
              <div className="ped-tag-group">
                {extractedData.preExistingDiseases?.map((ped, idx) => (
                  <span 
                    key={idx} 
                    className="ped-tag" 
                    title="Click to remove"
                    onClick={() => handleToggleCondition(ped)}
                    style={{ cursor: 'pointer' }}
                  >
                    ⚠️ {ped} <span style={{ opacity: 0.6, marginLeft: '4px' }}>✕</span>
                  </span>
                ))}
              </div>
              {/* Quick condition toggles */}
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px', alignItems: 'center' }}>
                <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>+ Add:</span>
                {['Diabetes', 'Hypertension', 'Cardiac Condition', 'Osteoarthritis', 'Asthma', 'Thyroid Disorder'].map(cond => (
                  !(extractedData.preExistingDiseases || []).includes(cond) && (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => handleToggleCondition(cond)}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '12px',
                        color: 'var(--text-secondary)',
                        fontSize: '10.5px',
                        padding: '1px 6px',
                        cursor: 'pointer'
                      }}
                    >
                      + {cond}
                    </button>
                  )
                ))}
              </div>
            </div>

            <div className="med-field-box">
              <span className="med-field-label">Est. Treatment / Surgery Cost</span>
              <span className="med-field-value" style={{ color: 'var(--accent-emerald, #10b981)' }}>
                ₹{extractedData.estimatedCost.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', background: 'var(--bg-surface-subtle)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
            <strong>💡 Clinical Finding:</strong> {extractedData.extractedNotes}
          </div>

          {/* SUGGESTED TREATMENT COST ESTIMATION BREAKDOWN */}
          <div className="treatment-cost-card">
            <div className="cost-header-row">
              <div>
                <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>
                  🏥 Suggested Inpatient Treatment Cost Estimate: ₹{extractedData.estimatedCost.toLocaleString('en-IN')}
                </strong>
                <p style={{ margin: '2px 0 0 0', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  Estimated market benchmark for {extractedData.recommendedProcedure} at NABH/JCI accredited hospitals.
                </p>
              </div>
              <span className="traps-pill-badge">
                AI Cost Modeling
              </span>
            </div>

            <div className="cost-breakdown-grid">
              <div className="cost-breakdown-item">
                <span className="cost-item-label">Surgeon & Specialists</span>
                <span className="cost-item-val">₹{Math.round(extractedData.estimatedCost * 0.40).toLocaleString('en-IN')}</span>
                <span className="cost-item-hint">~40% of hospital bill</span>
              </div>
              <div className="cost-breakdown-item">
                <span className="cost-item-label">Room & ICU Nursing</span>
                <span className="cost-item-val">₹{Math.round(extractedData.estimatedCost * 0.25).toLocaleString('en-IN')}</span>
                <span className="cost-item-hint">~25% of hospital bill</span>
              </div>
              <div className="cost-breakdown-item">
                <span className="cost-item-label">Diagnostics & Tests</span>
                <span className="cost-item-val">₹{Math.round(extractedData.estimatedCost * 0.15).toLocaleString('en-IN')}</span>
                <span className="cost-item-hint">~15% of hospital bill</span>
              </div>
              <div className="cost-breakdown-item">
                <span className="cost-item-label">Consumables & Medicine</span>
                <span className="cost-item-val">₹{Math.round(extractedData.estimatedCost * 0.20).toLocaleString('en-IN')}</span>
                <span className="cost-item-hint">~20% of hospital bill</span>
              </div>
            </div>
          </div>

          {/* AGENT TRAP SHIELD EXPOSÉ */}
          <div className="agent-traps-shield-card">
            <div className="traps-header">
              <div className="traps-title-group">
                <h4 className="traps-title">
                  <span>⚠️ Where People Get Fooled by Insurance Agents</span>
                </h4>
                <p className="traps-subtitle">
                  Common agent mis-selling tricks, hidden fine-print clauses, and how Finora AI protects your claim.
                </p>
              </div>
              <span className="traps-pill-badge">
                🛡️ Finora Consumer Protection
              </span>
            </div>

            <div className="traps-grid">
              {/* Trap 1: Room Rent */}
              <div className="trap-card">
                <div className="trap-card-header">
                  <span>1. 🚨 Room-Rent Proportionate Deduction</span>
                </div>
                <div className="trap-agent-say">
                  <strong>What Agents Say:</strong>
                  "1% room rent (₹5,000/day) is plenty. You can always pay a small room upgrade difference."
                </div>
                <div className="trap-reality">
                  <strong>The Reality:</strong>
                  If your room is ₹8,000/day, insurers apply a 37.5% deduction to your ENTIRE hospital bill (surgeon fees, ICU, investigations). A ₹6.5L claim gets cut by ₹2.4 Lakhs out-of-pocket!
                </div>
                <div className="trap-safeguard">
                  <strong>Finora Safeguard:</strong>
                  We only recommend policies with "No Room-Rent Capping / Single Private Room" to eliminate proportionate deductions completely.
                </div>
              </div>

              {/* Trap 2: Co-Payment */}
              <div className="trap-card">
                <div className="trap-card-header">
                  <span>2. 💸 The Hidden 10%–20% Co-Pay</span>
                </div>
                <div className="trap-agent-say">
                  <strong>What Agents Say:</strong>
                  "This policy is 30% cheaper! Great budget plan for your family."
                </div>
                <div className="trap-reality">
                  <strong>The Reality:</strong>
                  Cheaper premiums often hide a mandatory 10%–20% co-payment or zone co-pay. On a ₹10 Lakh procedure, you are legally forced to pay ₹2 Lakhs directly from your savings.
                </div>
                <div className="trap-safeguard">
                  <strong>Finora Safeguard:</strong>
                  We flag co-pay rules and highlight verified 0% Zero Co-Pay plans with nationwide cashless networks.
                </div>
              </div>

              {/* Trap 3: Sub-Limits */}
              <div className="trap-card">
                <div className="trap-card-header">
                  <span>3. ✂️ Disease-Specific Sub-Limits</span>
                </div>
                <div className="trap-agent-say">
                  <strong>What Agents Say:</strong>
                  "You have ₹10 Lakhs total cover, all illnesses and surgeries are covered."
                </div>
                <div className="trap-reality">
                  <strong>The Reality:</strong>
                  Fine print caps specific procedures: Joint Replacement capped at ₹2.5L, Cataract at ₹30K, Stents capped. Hospital charges ₹4.5L; insurer pays only ₹2.5L.
                </div>
                <div className="trap-safeguard">
                  <strong>Finora Safeguard:</strong>
                  Our 7-dimension matrix reveals hidden sub-limits for your specific diagnosis upfront.
                </div>
              </div>

              {/* Trap 4: Don't Disclose PED */}
              <div className="trap-card">
                <div className="trap-card-header">
                  <span>4. 🤫 "Don't Disclose Pre-Existing Diseases"</span>
                </div>
                <div className="trap-agent-say">
                  <strong>What Agents Say:</strong>
                  "Don't mention your diabetes/BP now, otherwise premium increases. Just wait 2 years and claim."
                </div>
                <div className="trap-reality">
                  <strong>The Reality:</strong>
                  During hospitalization, TPAs demand 3-year medical history. When past records show pre-existing condition, the claim is rejected for 100% material fraud, policy cancelled, and premiums lost.
                </div>
                <div className="trap-safeguard">
                  <strong>Finora Safeguard:</strong>
                  100% upfront disclosure with Day-1 or 12/24m waiting period riders ensures legally bulletproof claim approval.
                </div>
              </div>

              {/* Trap 5: Restoration Benefit */}
              <div className="trap-card">
                <div className="trap-card-header">
                  <span>5. 🔄 Single-Claim Sum Insured Exhaustion</span>
                </div>
                <div className="trap-agent-say">
                  <strong>What Agents Say:</strong>
                  "A standard policy is fine, you won't need to claim twice in a year."
                </div>
                <div className="trap-reality">
                  <strong>The Reality:</strong>
                  Without unlimited restoration, one major surgery exhausts the full ₹10 Lakhs. If a second hospitalization occurs that year, you have ₹0 coverage remaining.
                </div>
                <div className="trap-safeguard">
                  <strong>Finora Safeguard:</strong>
                  We prioritize 100% Unlimited Automatic Restoration for related and unrelated illnesses.
                </div>
              </div>

              {/* Trap 6: Non-Medical Consumables */}
              <div className="trap-card">
                <div className="trap-card-header">
                  <span>6. 🩹 Uncovered Hospital Consumables</span>
                </div>
                <div className="trap-agent-say">
                  <strong>What Agents Say:</strong>
                  "Cashless covers everything on the final bill."
                </div>
                <div className="trap-reality">
                  <strong>The Reality:</strong>
                  Gloves, PPE kits, needles, administrative charges, and sanitizers (making up 10%–15% of modern hospital bills) are excluded as non-medical items by default.
                </div>
                <div className="trap-safeguard">
                  <strong>Finora Safeguard:</strong>
                  We recommend policies that include Consumables Shield Add-on riders for 100% zero out-of-pocket settlement.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          STEP 4: UNDERSTAND USER'S REQUIREMENTS & PREFERENCES
          ==================================================================== */}
      {!isScanning && extractedData && (
        <div className="med-requirements-card">
          <div className="requirements-title-row">
            <div className="requirements-title">
              <span>⚙️ Step 4 — Understand Your Coverage Requirements</span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Tune preferences to calculate personalized fit scores
            </span>
          </div>

          <div className="requirements-grid">
            {/* Requirement 1: Desired Sum Insured */}
            <div className="req-group">
              <span className="req-label">Desired Sum Insured</span>
              <div className="req-pills">
                {[
                  { label: '₹10L', val: 1000000 },
                  { label: '₹25L', val: 2500000 },
                  { label: '₹50L', val: 5000000 },
                  { label: '₹1.00 Cr', val: 10000000 }
                ].map(opt => (
                  <button
                    key={opt.val}
                    type="button"
                    className={`req-pill-btn ${userRequirements.sumInsured === opt.val ? 'active' : ''}`}
                    onClick={() => setUserRequirements(prev => ({ ...prev, sumInsured: opt.val }))}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Requirement 2: Room Rent Preference */}
            <div className="req-group">
              <span className="req-label">Room-Rent Capping Preference</span>
              <div className="req-pills">
                <button
                  type="button"
                  className={`req-pill-btn ${userRequirements.roomRent === 'no_cap' ? 'active' : ''}`}
                  onClick={() => setUserRequirements(prev => ({ ...prev, roomRent: 'no_cap' }))}
                >
                  No Room Rent Capping
                </button>
                <button
                  type="button"
                  className={`req-pill-btn ${userRequirements.roomRent === 'any' ? 'active' : ''}`}
                  onClick={() => setUserRequirements(prev => ({ ...prev, roomRent: 'any' }))}
                >
                  Standard / 1% Cap OK
                </button>
              </div>
            </div>

            {/* Requirement 3: Pre-Existing Waiting Period Priority */}
            <div className="req-group">
              <span className="req-label">PED Waiting Period Priority</span>
              <div className="req-pills">
                <button
                  type="button"
                  className={`req-pill-btn ${userRequirements.pedPriority === 'shortest' ? 'active' : ''}`}
                  onClick={() => setUserRequirements(prev => ({ ...prev, pedPriority: 'shortest' }))}
                >
                  Shortest (12–24m / Day 1)
                </button>
                <button
                  type="button"
                  className={`req-pill-btn ${userRequirements.pedPriority === 'standard' ? 'active' : ''}`}
                  onClick={() => setUserRequirements(prev => ({ ...prev, pedPriority: 'standard' }))}
                >
                  Standard (36m)
                </button>
              </div>
            </div>

            {/* Requirement 4: Co-Pay Tolerance */}
            <div className="req-group">
              <span className="req-label">Co-Payment Preference</span>
              <div className="req-pills">
                <button
                  type="button"
                  className={`req-pill-btn ${userRequirements.coPay === 'zero' ? 'active' : ''}`}
                  onClick={() => setUserRequirements(prev => ({ ...prev, coPay: 'zero' }))}
                >
                  0% Zero Co-Pay
                </button>
                <button
                  type="button"
                  className={`req-pill-btn ${userRequirements.coPay === 'allowed' ? 'active' : ''}`}
                  onClick={() => setUserRequirements(prev => ({ ...prev, coPay: 'allowed' }))}
                >
                  Co-Pay Allowed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          STEP 5: COMPARE AVAILABLE POLICIES (7-DIMENSION EVALUATION)
          ==================================================================== */}
      {!isScanning && rankedPolicies.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* 7-DIMENSION CRITERIA BANNER */}
          <div className="criteria-badge-bar" aria-label="7 Evaluation Dimensions">
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              7 Evaluation Criteria:
            </span>
            <span className="criteria-badge-pill">1. Inpatient & Daycare Coverage</span>
            <span className="criteria-badge-pill">2. PED Waiting Period (12–24m)</span>
            <span className="criteria-badge-pill">3. Permanent Exclusions</span>
            <span className="criteria-badge-pill">4. Base Sum Insured & Restoration</span>
            <span className="criteria-badge-pill">5. Age-Specific Annual Premium</span>
            <span className="criteria-badge-pill">6. Room-Rent & ICU Capping</span>
            <span className="criteria-badge-pill">7. Disease-Specific Sub-limits</span>
          </div>

          <div className="med-results-header">
            <div className="med-results-title">
              <span>🎯 Step 5 — Explainable Policy Recommendations ({rankedPolicies.length} Evaluated)</span>
            </div>

            <div className="view-toggle-group">
              <button 
                type="button"
                className={`btn-view-toggle ${activeTab === 'cards' ? 'active' : ''}`}
                onClick={() => setActiveTab('cards')}
              >
                🏆 Recommendation Cards
              </button>
              <button 
                type="button"
                className={`btn-view-toggle ${activeTab === 'matrix' ? 'active' : ''}`}
                onClick={() => setActiveTab('matrix')}
              >
                📊 7-Dimension Matrix Table
              </button>
            </div>
          </div>

          {/* VIEW A: POLICY CARDS */}
          {activeTab === 'cards' && (
            <div className="med-policies-grid">
              {rankedPolicies.map((policy, index) => (
                <article 
                  key={policy.id} 
                  className={`policy-card ${index === 0 ? 'top-match' : ''}`}
                >
                  {index === 0 && (
                    <div className="best-match-ribbon">⭐ AI Best Fit #1</div>
                  )}

                  <div>
                    <div className="policy-provider">{policy.provider}</div>
                    <h3 className="policy-name">{policy.name}</h3>

                    <div className="policy-fit-badge">
                      <span>🎯 {policy.fitScore}% Match Score</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        • CSR: {policy.claimSettlementRatio}
                      </span>
                    </div>

                    {/* Features Mini: 7-Dimension Highlights */}
                    <div className="policy-features-mini">
                      <div className="mini-feature-item">
                        <span className="mini-feature-label">Base Sum Insured:</span>
                        <span className="mini-feature-val">₹{(policy.baseSumInsured/100000).toFixed(0)} Lakhs</span>
                      </div>
                      <div className="mini-feature-item">
                        <span className="mini-feature-label">PED Waiting Period:</span>
                        <span className="mini-feature-val">
                          {policy.waitingPeriod.ped}
                        </span>
                      </div>
                      <div className="mini-feature-item">
                        <span className="mini-feature-label">Room Rent Limit:</span>
                        <span className="mini-feature-val">{policy.roomRent.limitText.split('(')[0]}</span>
                      </div>
                      <div className="mini-feature-item">
                        <span className="mini-feature-label">Est. Annual Premium:</span>
                        <span className="mini-feature-val" style={{ fontWeight: 700 }}>
                          ₹{policy.currentPremium.toLocaleString('en-IN')}/yr
                        </span>
                      </div>
                    </div>

                    {/* Anti-Agent Trap Badges */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '12px 0 6px' }}>
                      {policy.roomRent.cappingPercentage === 0 ? (
                        <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '12px', background: '#ecfdf5', color: '#065f46', fontWeight: 600, border: '1px solid #a7f3d0' }}>
                          🛡️ Zero Room-Rent Cap
                        </span>
                      ) : (
                        <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '12px', background: '#fef2f2', color: '#991b1b', fontWeight: 600, border: '1px solid #fecaca' }}>
                          ⚠️ {policy.roomRent.cappingPercentage}% Room-Rent Cap
                        </span>
                      )}
                      <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '12px', background: '#eff6ff', color: '#1e40af', fontWeight: 600, border: '1px solid #bfdbfe' }}>
                        🛡️ 0% Co-Payment
                      </span>
                      {policy.coverage.restoration.includes('Unlimited') && (
                        <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '12px', background: '#f5f3ff', color: '#5b21b6', fontWeight: 600, border: '1px solid #ddd6fe' }}>
                          🛡️ Unlimited Refill
                        </span>
                      )}
                      {policy.diseaseSpecificConditions.jointReplacement.includes('None') && (
                        <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '12px', background: '#ecfdf5', color: '#065f46', fontWeight: 600, border: '1px solid #a7f3d0' }}>
                          🛡️ No Sub-limits
                        </span>
                      )}
                    </div>

                    {/* Explainable AI Rationale */}
                    <div className="ai-rationale-box">
                      <div className="ai-rationale-title">Why Finora AI Recommends This:</div>
                      <ul className="ai-rationale-list">
                        {policy.aiMatchRationale.slice(0, 3).map((rat, i) => (
                          <li key={i}>{rat}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* STEP 6 ACTION: FINAL DECISION */}
                  <button 
                    type="button"
                    className="btn-select-policy"
                    onClick={() => setSelectedPolicyModal(policy)}
                  >
                    Select & Review Decision →
                  </button>
                </article>
              ))}
            </div>
          )}

          {/* VIEW B: 7-DIMENSION SIDE-BY-SIDE MATRIX TABLE */}
          {activeTab === 'matrix' && (
            <div className="matrix-container">
              <table className="matrix-table">
                <thead>
                  <tr>
                    <th style={{ minWidth: '180px' }}>7 Evaluation Dimensions</th>
                    {rankedPolicies.map((p) => (
                      <th key={p.id} style={{ minWidth: '200px' }}>
                        <div>{p.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--accent-emerald, #10b981)', fontWeight: 600 }}>
                          {p.fitScore}% Match ({p.provider})
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* 1. Coverage */}
                  <tr>
                    <td><span className="dim-badge">1. Coverage</span></td>
                    {rankedPolicies.map(p => (
                      <td key={p.id}>{p.coverage.summary}</td>
                    ))}
                  </tr>

                  {/* 2. Waiting Period */}
                  <tr>
                    <td><span className="dim-badge">2. Waiting Period</span></td>
                    {rankedPolicies.map(p => (
                      <td key={p.id}>
                        <strong>PED:</strong> {p.waitingPeriod.ped}<br/>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Initial: {p.waitingPeriod.initial}</span>
                      </td>
                    ))}
                  </tr>

                  {/* 3. Exclusions */}
                  <tr>
                    <td><span className="dim-badge">3. Exclusions</span></td>
                    {rankedPolicies.map(p => (
                      <td key={p.id}>
                        <ul style={{ paddingLeft: '14px', margin: 0, fontSize: '11.5px' }}>
                          {p.exclusions.slice(0, 2).map((ex, i) => <li key={i}>{ex}</li>)}
                        </ul>
                      </td>
                    ))}
                  </tr>

                  {/* 4. Sum Insured */}
                  <tr>
                    <td><span className="dim-badge">4. Sum Insured</span></td>
                    {rankedPolicies.map(p => (
                      <td key={p.id}>
                        ₹{(p.baseSumInsured/100000).toFixed(0)} Lakhs Base<br/>
                        <span style={{ fontSize: '11px', color: 'var(--accent-emerald, #10b981)' }}>Bonus: {p.sumInsuredDetails.noClaimBonusMax}</span>
                      </td>
                    ))}
                  </tr>

                  {/* 5. Premium */}
                  <tr>
                    <td><span className="dim-badge">5. Premium</span></td>
                    {rankedPolicies.map(p => (
                      <td key={p.id}>
                        <strong>₹{p.currentPremium.toLocaleString('en-IN')} / yr</strong><br/>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.premiumDetails.monthly}</span>
                      </td>
                    ))}
                  </tr>

                  {/* 6. Room-Rent Limits */}
                  <tr>
                    <td><span className="dim-badge">6. Room-Rent Limits</span></td>
                    {rankedPolicies.map(p => (
                      <td key={p.id}>{p.roomRent.limitText}</td>
                    ))}
                  </tr>

                  {/* 7. Disease-Specific Conditions */}
                  <tr>
                    <td><span className="dim-badge">7. Disease Sub-Limits</span></td>
                    {rankedPolicies.map(p => (
                      <td key={p.id} style={{ fontSize: '11.5px' }}>
                        Joint: {p.diseaseSpecificConditions.jointReplacement.split('.')[0]}<br/>
                        Cardiac: {p.diseaseSpecificConditions.cardiacCare.split('.')[0]}
                      </td>
                    ))}
                  </tr>

                  {/* Action Row */}
                  <tr>
                    <td><span className="dim-badge">Decision</span></td>
                    {rankedPolicies.map(p => (
                      <td key={p.id}>
                        <button
                          type="button"
                          className="btn-select-policy"
                          onClick={() => setSelectedPolicyModal(p)}
                        >
                          Select Policy
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ====================================================================
          STEP 6: FINAL DECISION MODAL
          ==================================================================== */}
      {selectedPolicyModal && (
        <div className="med-modal-overlay" onClick={() => setSelectedPolicyModal(null)}>
          <div className="med-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Step 6 — Final Decision & Policy Sanction
                </div>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: 700 }}>
                  {selectedPolicyModal.name}
                </h3>
                <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                  Provided by {selectedPolicyModal.provider} • Claim Settlement: {selectedPolicyModal.claimSettlementRatio}
                </span>
              </div>
              <button 
                type="button" 
                className="modal-close-btn"
                onClick={() => setSelectedPolicyModal(null)}
              >
                ✕
              </button>
            </div>

            {decisionConfirmed ? (
              <div style={{ textAlign: 'center', padding: '24px 10px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '36px' }}>🎉</div>
                <h4 style={{ margin: 0, fontSize: '17px', fontWeight: 700 }}>
                  Policy Decision Confirmed!
                </h4>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13px' }}>
                  Your medical checkup parameters and {selectedPolicyModal.name} details have been packaged into your digital proposal dossier.
                </p>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '12px' }}>
                  <button
                    type="button"
                    className="btn-scan-action"
                    onClick={() => {
                      setSelectedPolicyModal(null);
                      setDecisionConfirmed(false);
                      alert('DigiLocker KYC credential exchange initialized for health policy issuance.');
                    }}
                  >
                    Proceed with DigiLocker Paperless KYC →
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="modal-decision-grid">
                  <div>
                    <span className="med-field-label">Selected Sum Insured</span>
                    <strong style={{ fontSize: '14px', display: 'block' }}>
                      ₹{(selectedPolicyModal.baseSumInsured / 100000).toFixed(0)} Lakhs (with unlimited restore)
                    </strong>
                  </div>
                  <div>
                    <span className="med-field-label">Annual Premium</span>
                    <strong style={{ fontSize: '14px', display: 'block' }}>
                      ₹{selectedPolicyModal.currentPremium.toLocaleString('en-IN')} / yr
                    </strong>
                  </div>
                  <div>
                    <span className="med-field-label">PED Waiting Period</span>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                      {selectedPolicyModal.waitingPeriod.ped}
                    </span>
                  </div>
                  <div>
                    <span className="med-field-label">Room-Rent Clause</span>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                      {selectedPolicyModal.roomRent.limitText}
                    </span>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    Clinical Condition Disclosure Checklist:
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {extractedData?.preExistingDiseases?.map((ped, i) => (
                      <span key={i} className="ped-tag">
                        ✓ Disclosed: {ped}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button
                    type="button"
                    className="req-pill-btn"
                    onClick={() => setSelectedPolicyModal(null)}
                  >
                    Back to Comparison
                  </button>
                  <button
                    type="button"
                    className="btn-scan-action"
                    onClick={() => setDecisionConfirmed(true)}
                  >
                    Confirm Selection & Generate Proposal →
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ====================================================================
          n8n WEBHOOK CONFIGURATION MODAL
          ==================================================================== */}
      {showN8nModal && (
        <div className="med-modal-overlay" onClick={() => setShowN8nModal(false)}>
          <div 
            className="med-modal-card" 
            style={{ maxWidth: '580px' }} 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="med-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>⚡</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Connect n8n Automation Webhook
                  </h3>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                    Trigger custom AI pipelines, CRM sync, or WhatsApp notifications
                  </span>
                </div>
              </div>
              <button 
                type="button" 
                className="med-modal-close"
                onClick={() => setShowN8nModal(false)}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                  n8n Webhook URL (POST):
                </label>
                <input
                  type="url"
                  className="med-notes-textarea"
                  style={{ minHeight: '42px', height: '42px', padding: '8px 12px', fontSize: '13px', borderRadius: '8px', width: '100%', boxSizing: 'border-box' }}
                  placeholder="https://your-n8n-instance.com/webhook/finora-webhook"
                  value={tempN8nUrl}
                  onChange={(e) => setTempN8nUrl(e.target.value)}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  Paste your n8n Production or Test Webhook URL.
                </span>
              </div>

              {n8nTestStatus && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  background: n8nTestStatus.success ? '#ecfdf5' : '#fef2f2',
                  color: n8nTestStatus.success ? '#065f46' : '#991b1b',
                  border: n8nTestStatus.success ? '1px solid #a7f3d0' : '1px solid #fecaca'
                }}>
                  {n8nTestStatus.message}
                </div>
              )}

              <div style={{ background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)', padding: '12px 14px', borderRadius: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                  📥 Pre-built Workflow Template:
                </strong>
                Download our ready-to-import n8n workflow containing hospital verification, Gemini OCR extraction, and lead routing:
                <div style={{ marginTop: '8px' }}>
                  <a 
                    href="/finora-n8n-workflow.json" 
                    download="finora-n8n-workflow.json"
                    className="btn-invalid-action secondary"
                    style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', padding: '6px 12px' }}
                  >
                    ⬇️ Download finora-n8n-workflow.json
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '6px' }}>
                {n8nWebhookUrl && (
                  <button
                    type="button"
                    className="btn-invalid-action secondary"
                    style={{ color: '#b91c1c', borderColor: '#fca5a5' }}
                    onClick={() => {
                      setN8nWebhookUrl('');
                      setN8nWebhookState('');
                      setTempN8nUrl('');
                      setN8nTestStatus({ success: true, message: 'n8n webhook disconnected.' });
                    }}
                  >
                    Disconnect
                  </button>
                )}
                <button
                  type="button"
                  className="btn-invalid-action secondary"
                  onClick={async () => {
                    if (!tempN8nUrl.trim()) return;
                    setN8nTestStatus({ success: true, message: 'Testing webhook connection...' });
                    try {
                      const res = await fetch(tempN8nUrl.trim(), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ event: 'PING_TEST', source: 'Finora App' })
                      });
                      if (res.ok) {
                        setN8nTestStatus({ success: true, message: '✓ Connection successful! n8n webhook is active and responding.' });
                      } else {
                        setN8nTestStatus({ success: false, message: `Webhook reached but responded with HTTP ${res.status}.` });
                      }
                    } catch (err) {
                      setN8nTestStatus({ success: false, message: `Could not reach URL: ${err.message}` });
                    }
                  }}
                >
                  ⚡ Test Ping
                </button>
                <button
                  type="button"
                  className="btn-invalid-action primary"
                  onClick={() => {
                    setN8nWebhookUrl(tempN8nUrl);
                    setN8nWebhookState(tempN8nUrl.trim());
                    setShowN8nModal(false);
                  }}
                >
                  Save & Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
