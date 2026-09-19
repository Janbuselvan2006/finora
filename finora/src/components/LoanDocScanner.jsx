import React, { useState, useEffect } from 'react';
import { LOAN_TYPES, PRESET_INCOME_DOCUMENTS } from '../data/loanInstitutions';
import { analyzeSalaryDocument, evaluateLendersForLoan } from '../utils/salaryOcr';
import './LoanDocScanner.css';

export default function LoanDocScanner() {
  const [selectedPreset, setSelectedPreset] = useState(PRESET_INCOME_DOCUMENTS[0]);
  const [selectedLoanType, setSelectedLoanType] = useState(LOAN_TYPES[0]); // Home loan default
  const [loanAmount, setLoanAmount] = useState(4500000);
  const [tenureYears, setTenureYears] = useState(20);
  const [isScanning, setIsScanning] = useState(false);
  const [extractedSalary, setExtractedSalary] = useState(null);
  const [rankedLenders, setRankedLenders] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'matrix'
  const [selectedLoanModal, setSelectedLoanModal] = useState(null);

  const handleScanSalary = async (docInput) => {
    setIsScanning(true);
    setExtractedSalary(null);

    try {
      const parsed = await analyzeSalaryDocument(docInput);
      setExtractedSalary(parsed);

      const evaluated = evaluateLendersForLoan(
        parsed,
        selectedLoanType.id,
        loanAmount,
        tenureYears
      );
      setRankedLenders(evaluated);
    } catch (err) {
      console.error('Error scanning salary document:', err);
    } finally {
      setIsScanning(false);
    }
  };

  // Auto scan on load
  useEffect(() => {
    handleScanSalary(PRESET_INCOME_DOCUMENTS[0]);
  }, []);

  // Recalculate lenders whenever loan type, amount, or tenure changes
  useEffect(() => {
    if (extractedSalary) {
      const evaluated = evaluateLendersForLoan(
        extractedSalary,
        selectedLoanType.id,
        loanAmount,
        tenureYears
      );
      setRankedLenders(evaluated);
    }
  }, [selectedLoanType, loanAmount, tenureYears, extractedSalary]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedPreset(null);
      handleScanSalary(file);
    }
  };

  const handleLoanTypeChange = (type) => {
    setSelectedLoanType(type);
    setLoanAmount(type.defaultAmount);
    setTenureYears(type.defaultTenure);
  };

  return (
    <section className="loan-scanner-container" id="loan-ocr-section">
      
      {/* Header */}
      <div className="loan-header">
        <div className="loan-title-group">
          <h2>
            <span>💰 AI Salary Finder & Loan Lender Recommendation</span>
          </h2>
          <p>Scan your payslip, Form 16 or bank statement to unlock pre-approved borrowing limits and compare lowest interest rate lenders.</p>
        </div>
        <div className="loan-ai-pill">
          <span>AI Income OCR & FOIR Engine Active</span>
        </div>
      </div>

      {/* Step 1: Document Intake */}
      <div className="loan-intake-section">
        
        {/* Upload Zone */}
        <div className="loan-upload-zone" onClick={() => document.getElementById('salaryFileInput').click()}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📑</div>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '4px' }}>
            Upload Salary Slip / Form 16 / Bank Statement
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '14px' }}>
            Supports PDF, images, or scanned income proofs
          </div>
          <input 
            type="file" 
            id="salaryFileInput" 
            accept="image/*,.pdf,.txt" 
            style={{ display: 'none' }} 
            onChange={handleFileUpload}
          />
          <button type="button" className="btn-file-select">
            📁 Select Salary Document
          </button>
        </div>

        {/* Preset Selector */}
        <div className="loan-presets-card">
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '12px' }}>
            <span>Or test with Sample Income Profiles:</span>
            <span style={{ fontSize: '0.75rem', color: '#34d399', display: 'block', marginTop: '2px' }}>
              Instant 1-click test with real-world Indian income brackets
            </span>
          </div>

          <div className="loan-preset-list">
            {PRESET_INCOME_DOCUMENTS.map((preset) => (
              <button
                key={preset.id}
                className={`loan-preset-item ${selectedPreset?.id === preset.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedPreset(preset);
                  handleScanSalary(preset);
                }}
              >
                <div style={{ fontSize: '1.4rem' }}>{preset.icon}</div>
                <div style={{ flexGrow: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9' }}>{preset.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Net In-Hand: <strong style={{ color: '#34d399' }}>₹{preset.netMonthlySalary.toLocaleString('en-IN')}/mo</strong> • {preset.employerCategory}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* OCR Loader */}
      {isScanning && (
        <div className="med-ocr-loader">
          <div className="spinner-ring" style={{ borderTopColor: '#10b981' }}></div>
          <h3 style={{ margin: '0 0 8px 0', color: '#34d399' }}>Analyzing Income Document with AI OCR...</h3>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>
            Extracting gross salary, net in-hand pay, employer risk categorization, calculating FOIR debt limit and CIBIL tier...
          </p>
        </div>
      )}

      {/* Step 2: Extracted Financial Metrics Card */}
      {!isScanning && extractedSalary && (
        <div className="loan-extracted-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
            <div style={{ color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>✅ Verified Financial Profile:</span>
              <span style={{ color: '#fff' }}>{extractedSalary.employeeName}</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Employer: <strong style={{ color: '#e2e8f0' }}>{extractedSalary.employerName}</strong> ({extractedSalary.employerCategory})
            </div>
          </div>

          <div className="loan-extracted-grid">
            <div className="loan-field-box">
              <div className="loan-field-label">Net In-Hand Salary</div>
              <div className="loan-field-value" style={{ color: '#34d399' }}>
                ₹{extractedSalary.netMonthlySalary.toLocaleString('en-IN')} / mo
              </div>
            </div>

            <div className="loan-field-box">
              <div className="loan-field-label">Gross Monthly Pay</div>
              <div className="loan-field-value">
                ₹{extractedSalary.grossMonthlySalary.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="loan-field-box">
              <div className="loan-field-label">Existing EMI Commitments</div>
              <div className="loan-field-value" style={{ color: extractedSalary.deductions.existingEmi > 0 ? '#fbbf24' : '#94a3b8' }}>
                ₹{extractedSalary.deductions.existingEmi.toLocaleString('en-IN')} / mo
              </div>
            </div>

            <div className="loan-field-box">
              <div className="loan-field-label">Assessed Credit Score</div>
              <div className="loan-field-value" style={{ color: '#38bdf8' }}>
                ⭐ {extractedSalary.cibilEstimate} (Prime Tier)
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.8rem', color: '#cbd5e1', background: 'rgba(0,0,0,0.2)', padding: '10px 14px', borderRadius: '8px' }}>
            <strong>💡 AI Financial Summary:</strong> {extractedSalary.notes}
          </div>
        </div>
      )}

      {/* Step 3: Customer What-to-Want Configuration */}
      {!isScanning && (
        <div className="loan-config-card">
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
            🎯 What loan do you want to accomplish?
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
            Choose your loan purpose and adjust amount & tenure to compare personalized offers.
          </p>

          {/* Loan Category Selector Buttons */}
          <div className="loan-type-buttons-group">
            {LOAN_TYPES.map((type) => (
              <button
                key={type.id}
                className={`loan-type-btn ${selectedLoanType.id === type.id ? 'active' : ''}`}
                onClick={() => handleLoanTypeChange(type)}
              >
                <span>{type.icon}</span>
                <span>{type.name}</span>
              </button>
            ))}
          </div>

          {/* Amount & Tenure Sliders */}
          <div className="slider-group">
            
            {/* Amount Slider */}
            <div className="slider-item">
              <div className="slider-label-row">
                <span>Requested Loan Amount</span>
                <span className="slider-val-highlight">₹{(loanAmount/100000).toFixed(1)} Lakhs</span>
              </div>
              <input 
                type="range" 
                min={100000} 
                max={selectedLoanType.id === 'home' ? 15000000 : (selectedLoanType.id === 'business' ? 5000000 : 2500000)} 
                step={50000}
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#2563eb' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b' }}>
                <span>₹1 Lakh</span>
                <span>₹{(loanAmount/100000).toFixed(1)} Lakhs</span>
                <span>Max ₹1.5 Cr</span>
              </div>
            </div>

            {/* Tenure Slider */}
            <div className="slider-item">
              <div className="slider-label-row">
                <span>Tenure Duration</span>
                <span className="slider-val-highlight">{tenureYears} Years ({tenureYears * 12} Months)</span>
              </div>
              <input 
                type="range" 
                min={1} 
                max={selectedLoanType.maxTenure} 
                step={1}
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#10b981' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b' }}>
                <span>1 Year</span>
                <span>{tenureYears} Years</span>
                <span>Max {selectedLoanType.maxTenure} Years</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Step 4 & 5: Lenders Comparison & Results */}
      {!isScanning && rankedLenders.length > 0 && (
        <div>
          
          <div className="med-results-header">
            <div className="med-results-title">
              <span>🏛️ Financial Institutions Comparison ({selectedLoanType.name})</span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className={`btn-file-select ${activeTab === 'overview' ? 'active' : ''}`}
                style={{ background: activeTab === 'overview' ? '#10b981' : 'rgba(255,255,255,0.05)', color: '#fff' }}
                onClick={() => setActiveTab('overview')}
              >
                🏆 Ranked Offers
              </button>
              <button 
                className={`btn-file-select ${activeTab === 'matrix' ? 'active' : ''}`}
                style={{ background: activeTab === 'matrix' ? '#10b981' : 'rgba(255,255,255,0.05)', color: '#fff' }}
                onClick={() => setActiveTab('matrix')}
              >
                📊 Side-by-Side Table
              </button>
            </div>
          </div>

          {/* OVERVIEW TAB: Lender Cards */}
          {activeTab === 'overview' && (
            <div className="med-policies-grid">
              {rankedLenders.map((lender, index) => (
                <div 
                  key={lender.institutionId}
                  className={`lender-card ${index === 0 ? 'top-match' : ''}`}
                >
                  {index === 0 && (
                    <div className="lender-ribbon">⭐ AI Best Pick #1</div>
                  )}

                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                      {lender.type}
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', margin: '4px 0' }}>
                      {lender.name}
                    </div>

                    <div className="policy-fit-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                      <span>🎯 {lender.matchScore}% Match Score</span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>• Rating {lender.rating}</span>
                    </div>

                    {/* Rate of Interest */}
                    <div className="lender-roi-highlight">
                      <span className="lender-roi-value">{lender.interestRate}%</span>
                      <span className="lender-roi-sub">p.a. ({lender.rateType})</span>
                    </div>

                    {/* Calculated EMI */}
                    <div className="emi-preview-box">
                      <div>
                        <div className="emi-label">Monthly EMI:</div>
                        <div className="emi-value">₹{lender.monthlyEmi.toLocaleString('en-IN')}</div>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#94a3b8' }}>
                        Total Interest:<br/>
                        <strong style={{ color: '#cbd5e1' }}>₹{(lender.totalInterest/100000).toFixed(1)} Lakhs</strong>
                      </div>
                    </div>

                    {/* Key Loan Parameters */}
                    <div className="lender-details-list">
                      <div className="lender-detail-row">
                        <span style={{ color: '#94a3b8' }}>Max Loan Capacity:</span>
                        <strong style={{ color: lender.isAffordable ? '#34d399' : '#f87171' }}>
                          ₹{(lender.maxEligibility/100000).toFixed(1)} Lakhs
                        </strong>
                      </div>
                      <div className="lender-detail-row">
                        <span style={{ color: '#94a3b8' }}>Processing Fee:</span>
                        <span>{lender.processingFee.split('-')[0]}</span>
                      </div>
                      <div className="lender-detail-row">
                        <span style={{ color: '#94a3b8' }}>Prepayment Charges:</span>
                        <span style={{ color: '#38bdf8' }}>{lender.prepaymentFee}</span>
                      </div>
                      <div className="lender-detail-row">
                        <span style={{ color: '#94a3b8' }}>Approval Speed:</span>
                        <span>⚡ {lender.disbursalTime}</span>
                      </div>
                    </div>

                    {/* AI Rationale Box */}
                    <div className="ai-rationale-box" style={{ borderLeftColor: '#10b981' }}>
                      <div className="ai-rationale-title" style={{ color: '#10b981' }}>
                        Why Finora AI Recommends This:
                      </div>
                      <ul className="ai-rationale-list">
                        {lender.aiMatchRationale.map((rat, i) => (
                          <li key={i}>{rat}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button 
                    className="btn-apply-loan"
                    onClick={() => setSelectedLoanModal(lender)}
                  >
                    Select & Get Instant In-Principle Sanction →
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* MATRIX TAB: Side-by-Side Comparison Table */}
          {activeTab === 'matrix' && (
            <div className="matrix-container">
              <div className="matrix-title">
                📊 Side-by-Side Parameter Matrix ({selectedLoanType.name} - ₹{(loanAmount/100000).toFixed(1)}L for {tenureYears} Years)
              </div>
              <table className="matrix-table">
                <thead>
                  <tr>
                    <th>Loan Parameters</th>
                    {rankedLenders.map((l) => (
                      <th key={l.institutionId} style={{ color: l.matchScore > 90 ? '#34d399' : '#e2e8f0' }}>
                        {l.shortName}
                        <div style={{ fontSize: '0.7rem', color: '#38bdf8' }}>({l.matchScore}% Match)</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* 1. Interest Rate */}
                  <tr>
                    <td><span className="dim-badge" style={{ color: '#34d399', background: 'rgba(16,185,129,0.1)' }}>1. Interest Rate (ROI)</span></td>
                    {rankedLenders.map(l => (
                      <td key={l.institutionId}>
                        <strong style={{ fontSize: '1rem', color: '#38bdf8' }}>{l.interestRate}% p.a.</strong><br/>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{l.rateType}</span>
                      </td>
                    ))}
                  </tr>

                  {/* 2. Monthly EMI */}
                  <tr>
                    <td><span className="dim-badge" style={{ color: '#34d399', background: 'rgba(16,185,129,0.1)' }}>2. Monthly EMI</span></td>
                    {rankedLenders.map(l => (
                      <td key={l.institutionId}>
                        <strong style={{ color: '#10b981' }}>₹{l.monthlyEmi.toLocaleString('en-IN')}</strong><br/>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Total Int: ₹{(l.totalInterest/100000).toFixed(1)}L</span>
                      </td>
                    ))}
                  </tr>

                  {/* 3. Max Loan Eligibility */}
                  <tr>
                    <td><span className="dim-badge" style={{ color: '#34d399', background: 'rgba(16,185,129,0.1)' }}>3. Max Eligibility (FOIR)</span></td>
                    {rankedLenders.map(l => (
                      <td key={l.institutionId}>
                        <strong style={{ color: l.isAffordable ? '#34d399' : '#f87171' }}>
                          ₹{(l.maxEligibility/100000).toFixed(1)} Lakhs
                        </strong>
                      </td>
                    ))}
                  </tr>

                  {/* 4. Processing Fee */}
                  <tr>
                    <td><span className="dim-badge" style={{ color: '#34d399', background: 'rgba(16,185,129,0.1)' }}>4. Processing Charges</span></td>
                    {rankedLenders.map(l => (
                      <td key={l.institutionId} style={{ fontSize: '0.78rem' }}>
                        {l.processingFee}
                      </td>
                    ))}
                  </tr>

                  {/* 5. Prepayment / Foreclosure */}
                  <tr>
                    <td><span className="dim-badge" style={{ color: '#34d399', background: 'rgba(16,185,129,0.1)' }}>5. Prepayment Charges</span></td>
                    {rankedLenders.map(l => (
                      <td key={l.institutionId} style={{ fontSize: '0.78rem', color: '#38bdf8' }}>
                        {l.prepaymentFee}
                      </td>
                    ))}
                  </tr>

                  {/* 6. Disbursal Speed */}
                  <tr>
                    <td><span className="dim-badge" style={{ color: '#34d399', background: 'rgba(16,185,129,0.1)' }}>6. Approval & Disbursal</span></td>
                    {rankedLenders.map(l => (
                      <td key={l.institutionId} style={{ fontSize: '0.8rem' }}>
                        ⚡ {l.disbursalTime}
                      </td>
                    ))}
                  </tr>

                  {/* 7. Special Perks */}
                  <tr>
                    <td><span className="dim-badge" style={{ color: '#34d399', background: 'rgba(16,185,129,0.1)' }}>7. Special Concessions</span></td>
                    {rankedLenders.map(l => (
                      <td key={l.institutionId} style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                        {l.specialBenefit}
                      </td>
                    ))}
                  </tr>

                  {/* Action Row */}
                  <tr>
                    <td><strong>Action</strong></td>
                    {rankedLenders.map(l => (
                      <td key={l.institutionId}>
                        <button 
                          className="btn-apply-loan"
                          onClick={() => setSelectedLoanModal(l)}
                        >
                          Apply Now
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

      {/* Selected Loan Modal: Instant In-Principle Sanction Letter */}
      {selectedLoanModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '20px'
        }}>
          <div style={{
            background: '#0f172a', border: '1px solid #10b981', borderRadius: '16px',
            maxWidth: '620px', width: '100%', padding: '28px', color: '#fff', boxShadow: '0 25px 50px rgba(0,0,0,0.9)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#10b981', textTransform: 'uppercase', fontWeight: 700 }}>
                  Finora AI In-Principle Sanction
                </span>
                <h3 style={{ margin: '4px 0 0 0', color: '#fff', fontSize: '1.4rem' }}>
                  🏛️ {selectedLoanModal.name}
                </h3>
              </div>
              <div style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '4px 10px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                {selectedLoanModal.matchScore}% Match
              </div>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '18px' }}>
              Congratulations! Based on your uploaded salary slip ({extractedSalary?.employerName}), you are pre-qualified for this loan.
            </p>

            <div style={{ background: 'rgba(30, 41, 59, 0.7)', padding: '16px', borderRadius: '10px', marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Approved Loan Amount:</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff' }}>₹{(loanAmount/100000).toFixed(1)} Lakhs</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Interest Rate:</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#38bdf8' }}>{selectedLoanModal.interestRate}% p.a.</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Estimated Monthly EMI:</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#10b981' }}>₹{selectedLoanModal.monthlyEmi.toLocaleString('en-IN')} / mo</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Selected Tenure:</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff' }}>{tenureYears} Years ({tenureYears * 12} Mos)</div>
              </div>
            </div>

            <div style={{ background: 'rgba(16, 185, 129, 0.1)', borderLeft: '3px solid #10b981', padding: '10px 14px', borderRadius: '0 8px 8px 0', marginBottom: '20px', fontSize: '0.8rem', color: '#cbd5e1' }}>
              <strong>⚡ Next Milestone:</strong> Express e-KYC and digital bank verification via DigiLocker. Zero branch visits required.
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="btn-apply-loan"
                onClick={() => {
                  alert(`Thank you! Your instant in-principle application for ${selectedLoanModal.name} (${selectedLoanType.name}) has been submitted.`);
                  setSelectedLoanModal(null);
                }}
              >
                Proceed to Digital KYC Verification →
              </button>
              <button 
                style={{ background: 'transparent', border: '1px solid #64748b', color: '#cbd5e1', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' }}
                onClick={() => setSelectedLoanModal(null)}
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
