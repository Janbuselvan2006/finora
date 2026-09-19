import React, { useState, useEffect } from 'react';
import { PRESET_MEDICAL_DOCUMENTS } from '../data/insurancePolicies';
import { analyzeMedicalDocument, evaluatePoliciesForMedicalDoc } from '../utils/medicalOcr';
import './MedicalDocScanner.css';

export default function MedicalDocScanner() {
  const [selectedPreset, setSelectedPreset] = useState(PRESET_MEDICAL_DOCUMENTS[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [rankedPolicies, setRankedPolicies] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'matrix'
  const [selectedPolicyModal, setSelectedPolicyModal] = useState(null);

  const handleScanDocument = async (docInput) => {
    setIsScanning(true);
    setExtractedData(null);

    try {
      const parsed = await analyzeMedicalDocument(docInput);
      setExtractedData(parsed);

      const evaluated = evaluatePoliciesForMedicalDoc(parsed);
      setRankedPolicies(evaluated);
    } catch (err) {
      console.error('Error scanning document:', err);
    } finally {
      setIsScanning(false);
    }
  };

  // Auto scan first preset on load
  useEffect(() => {
    handleScanDocument(PRESET_MEDICAL_DOCUMENTS[0]);
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedPreset(null);
      handleScanDocument(file);
    }
  };

  const handleCustomNoteSubmit = (e) => {
    e.preventDefault();
    if (!customFileNote.trim()) return;
    setSelectedPreset(null);
    handleScanDocument(customFileNote);
  };

  return (
    <section className="med-scanner-container" id="medical-ocr-section">
      
      {/* Header */}
      <div className="med-header">
        <div className="med-title-group">
          <h2>
            <span>📄 Medical Document AI Scanner</span>
          </h2>
          <p>Scan doctor certificates or prescriptions to find the best fit health insurance policy with explainable AI rationale.</p>
        </div>
        <div className="med-ai-pill">
          <span>Gemini OCR Vision Active</span>
        </div>
      </div>

      {/* Document Intake: File Upload OR Select Doctor Certificate Preset */}
      <div className="med-intake-section">
        
        {/* Upload / Custom Note Box */}
        <div className="med-upload-zone" onClick={() => document.getElementById('medFileInput').click()}>
          <div className="med-upload-icon">🏥</div>
          <div className="med-upload-title">Upload Doctor Certificate / Prescriptions</div>
          <div className="med-upload-subtitle">Supports PDF, PNG, JPG or clinical discharge notes</div>
          <input 
            type="file" 
            id="medFileInput" 
            accept="image/*,.pdf,.txt" 
            style={{ display: 'none' }} 
            onChange={handleFileUpload}
          />
          <button type="button" className="btn-file-select">
            📁 Browse Medical File
          </button>
        </div>

        {/* Preset Selector */}
        <div className="med-presets-card">
          <div className="med-presets-title">
            <span>Or test with Sample Doctor Certificates:</span>
            <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>Click to run instant AI OCR</span>
          </div>

          <div className="med-preset-list">
            {PRESET_MEDICAL_DOCUMENTS.map((preset) => (
              <button
                key={preset.id}
                className={`med-preset-item ${selectedPreset?.id === preset.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedPreset(preset);
                  handleScanDocument(preset);
                }}
              >
                <div className="med-preset-icon">{preset.icon}</div>
                <div className="med-preset-info">
                  <div className="med-preset-name">{preset.title}</div>
                  <div className="med-preset-sub">
                    {preset.patientName} ({preset.patientAge} yrs) • {preset.diagnosis.substring(0, 45)}...
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* OCR Processing State */}
      {isScanning && (
        <div className="med-ocr-loader">
          <div className="spinner-ring"></div>
          <h3 style={{ margin: '0 0 8px 0', color: '#06b6d4' }}>Analyzing Medical Certificate with AI OCR...</h3>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>
            Extracting clinical diagnosis, pre-existing conditions, surgery requirements, age profile, and estimating coverage limits...
          </p>
        </div>
      )}

      {/* Extracted Clinical Data Card */}
      {!isScanning && extractedData && (
        <div className="med-extracted-card">
          <div className="med-extracted-header">
            <div className="med-extracted-title">
              <span>✅ Extracted Clinical Parameters</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: '#94a3b8' }}>
                ({extractedData.date})
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
              Facility: <strong>{extractedData.hospital}</strong>
            </div>
          </div>

          <div className="med-extracted-grid">
            <div className="med-field-box">
              <div className="med-field-label">Patient Details</div>
              <div className="med-field-value">{extractedData.patientName} ({extractedData.patientAge} yrs, {extractedData.gender})</div>
            </div>

            <div className="med-field-box">
              <div className="med-field-label">Primary Diagnosis</div>
              <div className="med-field-value" style={{ color: '#38bdf8' }}>{extractedData.diagnosis}</div>
            </div>

            <div className="med-field-box">
              <div className="med-field-label">Pre-Existing Conditions (PED)</div>
              <div className="ped-tag-group">
                {extractedData.preExistingDiseases?.map((ped, idx) => (
                  <span key={idx} className="ped-tag">⚠️ {ped}</span>
                ))}
              </div>
            </div>

            <div className="med-field-box">
              <div className="med-field-label">Est. Treatment / Surgery Cost</div>
              <div className="med-field-value" style={{ color: '#10b981' }}>
                ₹{extractedData.estimatedCost.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.8rem', color: '#cbd5e1', background: 'rgba(0,0,0,0.2)', padding: '10px 14px', borderRadius: '8px' }}>
            <strong>💡 Doctor's Recommendation Note:</strong> {extractedData.extractedNotes}
          </div>
        </div>
      )}

      {/* Recommendation Results & Navigation Tabs */}
      {!isScanning && rankedPolicies.length > 0 && (
        <div>
          
          <div className="med-results-header">
            <div className="med-results-title">
              <span>🎯 Policy Recommendations & Explainable Comparison</span>
            </div>

            {/* View Switcher Tabs */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className={`btn-file-select ${activeTab === 'overview' ? 'active' : ''}`}
                style={{ background: activeTab === 'overview' ? '#2563eb' : 'rgba(255,255,255,0.05)', color: '#fff' }}
                onClick={() => setActiveTab('overview')}
              >
                🏆 Top Matches
              </button>
              <button 
                className={`btn-file-select ${activeTab === 'matrix' ? 'active' : ''}`}
                style={{ background: activeTab === 'matrix' ? '#2563eb' : 'rgba(255,255,255,0.05)', color: '#fff' }}
                onClick={() => setActiveTab('matrix')}
              >
                📊 7-Dimension Matrix Table
              </button>
            </div>
          </div>

          {/* OVERVIEW TAB: Policy Cards */}
          {activeTab === 'overview' && (
            <div className="med-policies-grid">
              {rankedPolicies.map((policy, index) => (
                <div 
                  key={policy.id} 
                  className={`policy-card ${index === 0 ? 'top-match' : ''}`}
                >
                  {index === 0 && (
                    <div className="best-match-ribbon">⭐ AI Best Fit #1</div>
                  )}

                  <div>
                    <div className="policy-card-header">
                      <div className="policy-provider">{policy.provider}</div>
                      <div className="policy-name">{policy.name}</div>
                      <div className="policy-fit-badge">
                        <span>🎯 {policy.fitScore}% Match Score</span>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>(CSR: {policy.claimSettlementRatio})</span>
                      </div>
                    </div>

                    {/* Features Mini */}
                    <div className="policy-features-mini">
                      <div className="mini-feature-item">
                        <span className="mini-feature-label">Base Sum Insured:</span>
                        <span className="mini-feature-val">₹{(policy.baseSumInsured/100000).toFixed(0)} Lakhs</span>
                      </div>
                      <div className="mini-feature-item">
                        <span className="mini-feature-label">PED Wait Period:</span>
                        <span className="mini-feature-val" style={{ color: policy.waitingPeriod.ped.includes('24') ? '#34d399' : '#fbbf24' }}>
                          {policy.waitingPeriod.ped}
                        </span>
                      </div>
                      <div className="mini-feature-item">
                        <span className="mini-feature-label">Room Rent Limit:</span>
                        <span className="mini-feature-val">{policy.roomRent.limitText.split('(')[0]}</span>
                      </div>
                      <div className="mini-feature-item">
                        <span className="mini-feature-label">Est. Annual Premium:</span>
                        <span className="mini-feature-val" style={{ color: '#60a5fa', fontWeight: '700' }}>
                          ₹{policy.currentPremium.toLocaleString('en-IN')}/yr
                        </span>
                      </div>
                    </div>

                    {/* AI Rationale */}
                    <div className="ai-rationale-box">
                      <div className="ai-rationale-title">Why Finora AI Recommends This:</div>
                      <ul className="ai-rationale-list">
                        {policy.aiMatchRationale.map((rat, i) => (
                          <li key={i}>{rat}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button 
                    className="btn-select-policy"
                    onClick={() => setSelectedPolicyModal(policy)}
                  >
                    Select & Compare Details →
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* MATRIX TAB: 7-Dimension Side-by-Side Table */}
          {activeTab === 'matrix' && (
            <div className="matrix-container">
              <div className="matrix-title">
                📊 Side-by-Side 7-Dimension Comparison Matrix for Doctor Certificate
              </div>
              <table className="matrix-table">
                <thead>
                  <tr>
                    <th>Evaluation Criteria</th>
                    {rankedPolicies.map((p) => (
                      <th key={p.id} style={{ color: p.fitScore > 90 ? '#38bdf8' : '#e2e8f0' }}>
                        {p.name}
                        <div style={{ fontSize: '0.7rem', color: '#34d399' }}>({p.fitScore}% Fit)</div>
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
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Initial: {p.waitingPeriod.initial}</span>
                      </td>
                    ))}
                  </tr>

                  {/* 3. Exclusions */}
                  <tr>
                    <td><span className="dim-badge">3. Exclusions</span></td>
                    {rankedPolicies.map(p => (
                      <td key={p.id}>
                        <ul style={{ paddingLeft: '12px', margin: 0, fontSize: '0.75rem' }}>
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
                        <span style={{ fontSize: '0.75rem', color: '#34d399' }}>Bonus: {p.sumInsuredDetails.noClaimBonusMax}</span>
                      </td>
                    ))}
                  </tr>

                  {/* 5. Premium */}
                  <tr>
                    <td><span className="dim-badge">5. Premium</span></td>
                    {rankedPolicies.map(p => (
                      <td key={p.id}>
                        <strong style={{ color: '#60a5fa' }}>₹{p.currentPremium.toLocaleString('en-IN')} / yr</strong><br/>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{p.premiumDetails.monthly}</span>
                      </td>
                    ))}
                  </tr>

                  {/* 6. Room-Rent Limits */}
                  <tr>
                    <td><span className="dim-badge">6. Room Rent Limits</span></td>
                    {rankedPolicies.map(p => (
                      <td key={p.id} style={{ color: p.roomRent.cappingPercentage === 0 ? '#34d399' : '#fca5a5' }}>
                        {p.roomRent.limitText}
                      </td>
                    ))}
                  </tr>

                  {/* 7. Disease-Specific Conditions */}
                  <tr>
                    <td><span className="dim-badge">7. Disease Conditions</span></td>
                    {rankedPolicies.map(p => (
                      <td key={p.id}>
                        {p.diseaseSpecificConditions.diabetes || p.diseaseSpecificConditions.jointReplacement || 'Covered as per terms'}
                      </td>
                    ))}
                  </tr>

                  {/* Action Row */}
                  <tr>
                    <td><strong>Action</strong></td>
                    {rankedPolicies.map(p => (
                      <td key={p.id}>
                        <button 
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

      {/* Selected Policy Decision Modal */}
      {selectedPolicyModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '20px'
        }}>
          <div style={{
            background: '#0f172a', border: '1px solid #38bdf8', borderRadius: '16px',
            maxWidth: '600px', width: '100%', padding: '28px', color: '#fff', boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
          }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#38bdf8', fontSize: '1.4rem' }}>
              🎉 Policy Selection Confirmed
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '20px' }}>
              You selected <strong>{selectedPolicyModal.name}</strong> by {selectedPolicyModal.provider} based on AI Certificate OCR Analysis.
            </p>

            <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '16px', borderRadius: '10px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>AI Fit Score:</span>
                <span style={{ color: '#34d399', fontWeight: 'bold' }}>{selectedPolicyModal.fitScore}% Match</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Selected Coverage:</span>
                <span>₹{(selectedPolicyModal.baseSumInsured/100000).toFixed(0)} Lakhs</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Annual Premium Payable:</span>
                <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>₹{selectedPolicyModal.currentPremium.toLocaleString('en-IN')} / year</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="btn-select-policy"
                onClick={() => {
                  alert(`Thank you! Your application for ${selectedPolicyModal.name} has been initiated with Finora AI guidance.`);
                  setSelectedPolicyModal(null);
                }}
              >
                Proceed to Instant Cashless Policy Activation →
              </button>
              <button 
                style={{ background: 'transparent', border: '1px solid #64748b', color: '#cbd5e1', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' }}
                onClick={() => setSelectedPolicyModal(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
