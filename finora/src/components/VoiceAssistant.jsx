import React, { useState, useEffect, useRef } from 'react';
import { analyzeVoiceProblem, speakAssistantText, stopAssistantSpeech } from '../utils/voiceAnalyzer';
import './VoiceAssistant.css';

export default function VoiceAssistant({ 
  isEmbedded = false, 
  onApplyToInsurance = null, 
  onApplyToLoans = null,
  initialPrompt = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState(initialPrompt || '');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [recognitionSupported, setRecognitionSupported] = useState(true);
  const [manualInput, setManualInput] = useState('');

  const recognitionRef = useRef(null);

  // Initialize Web Speech API SpeechRecognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRecognitionSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN'; // Indian English / Global English support

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let currentTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition notice/error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
      stopAssistantSpeech();
    };
  }, []);

  // Cleanup speech when unmounting
  useEffect(() => {
    return () => {
      stopAssistantSpeech();
    };
  }, []);

  // Toggle Microphone Listening
  const handleToggleListening = () => {
    stopAssistantSpeech();
    setIsSpeaking(false);

    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) {}
      }
      setIsListening(false);
      if (transcript.trim()) {
        runVoiceAnalysis(transcript);
      }
    } else {
      setTranscript('');
      setAnalysisResult(null);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.warn('Recognition start retry:', e);
          setIsListening(true);
        }
      } else {
        // Fallback simulated listening for environments with restricted mic permissions
        simulateVoiceListening();
      }
    }
  };

  // Simulated listening fallback if mic is blocked or unsupported
  const simulateVoiceListening = () => {
    setIsListening(true);
    const sampleSpoken = "I am 52 years old, diagnosed with heart disease at Fortis Hospital and need cardiac stent surgery. What will be the hospital treatment cost and what agent traps should I avoid?";
    let index = 0;
    const interval = setInterval(() => {
      if (index < sampleSpoken.length) {
        setTranscript(sampleSpoken.substring(0, index + 8));
        index += 8;
      } else {
        clearInterval(interval);
        setIsListening(false);
        runVoiceAnalysis(sampleSpoken);
      }
    }, 120);
  };

  // Run AI Problem Analysis & trigger Google Assistant Voice response
  const runVoiceAnalysis = (textToAnalyze) => {
    if (!textToAnalyze || !textToAnalyze.trim()) return;

    const result = analyzeVoiceProblem(textToAnalyze);
    setAnalysisResult(result);

    // Speak response out loud using Google Assistant voice
    if (result.aiSpeechResponse) {
      setIsSpeaking(true);
      speakAssistantText(
        result.aiSpeechResponse,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    }
  };

  // Quick Prompt Chips
  const handleQuickPrompt = (promptText) => {
    stopAssistantSpeech();
    setIsSpeaking(false);
    setTranscript(promptText);
    runVoiceAnalysis(promptText);
  };

  // Replay Assistant Voice
  const handleReplayVoice = () => {
    if (analysisResult?.aiSpeechResponse) {
      setIsSpeaking(true);
      speakAssistantText(
        analysisResult.aiSpeechResponse,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    }
  };

  // Stop Assistant Voice
  const handleStopVoice = () => {
    stopAssistantSpeech();
    setIsSpeaking(false);
  };

  // Handle Apply to Insurance
  const handleApplyInsurance = () => {
    if (analysisResult?.autoFillPayload && onApplyToInsurance) {
      onApplyToInsurance(analysisResult.autoFillPayload);
      if (!isEmbedded) setIsOpen(false);
    } else {
      window.location.hash = '#insurance';
      if (!isEmbedded) setIsOpen(false);
    }
  };

  // Handle Apply to Loans
  const handleApplyLoan = () => {
    if (analysisResult?.autoFillPayload && onApplyToLoans) {
      onApplyToLoans(analysisResult.autoFillPayload);
      if (!isEmbedded) setIsOpen(false);
    } else {
      window.location.hash = '#loans';
      if (!isEmbedded) setIsOpen(false);
    }
  };

  // Content for the Assistant (shared between Modal and Embedded mode)
  const assistantContent = (
    <div className={isEmbedded ? "voice-embedded-panel" : "va-body"}>
      
      {/* 1. VISUALIZER & MIC STAGE */}
      <div className="va-visualizer-stage">
        
        {/* Animated Google Assistant 4-Color Dots */}
        <div className={`google-assistant-dots ${isListening || isSpeaking ? 'ga-dots-active' : ''}`} style={{ marginBottom: '16px' }}>
          <div className="ga-dot blue"></div>
          <div className="ga-dot red"></div>
          <div className="ga-dot yellow"></div>
          <div className="ga-dot green"></div>
        </div>

        {/* Audio Waveform Bars */}
        <div className={`va-waveform-bars ${isListening || isSpeaking ? 'animating' : ''}`}>
          <div className="va-bar"></div>
          <div className="va-bar"></div>
          <div className="va-bar"></div>
          <div className="va-bar"></div>
          <div className="va-bar"></div>
          <div className="va-bar"></div>
          <div className="va-bar"></div>
        </div>

        {/* Big Mic Button */}
        <button
          type="button"
          className={`va-mic-btn ${isListening ? 'active' : ''}`}
          onClick={handleToggleListening}
          aria-label={isListening ? "Stop Listening" : "Start Voice Input"}
        >
          {isListening ? '⏹️' : '🎙️'}
        </button>

        <div className="va-status-text">
          {isListening ? 'Listening to your problem...' : isSpeaking ? 'Finora Assistant is speaking...' : 'Tap microphone to speak'}
        </div>

        <div className="va-instruction">
          {isListening
            ? 'Speak your medical diagnosis & hospital name, or loan query (e.g. "treated at Apollo Hospital for knee replacement")'
            : 'Tell us your medical condition, hospital name, or loan requirement like Google Assistant.'}
        </div>

        {/* Realtime Spoken Transcript Box */}
        {transcript && (
          <div className="va-transcript-box">
            <span className="va-transcript-label">What you said:</span>
            <div className="va-transcript-text">"{transcript}"</div>
          </div>
        )}

        {/* Manual text fallback / typing option */}
        <div style={{ display: 'flex', gap: '8px', width: '100%', maxWidth: '520px', marginTop: '12px' }}>
          <input
            type="text"
            className="med-notes-textarea"
            style={{ minHeight: '38px', height: '38px', padding: '6px 12px', fontSize: '12.5px', borderRadius: '8px' }}
            placeholder="Or type your problem here (e.g., Apollo Hospital, diabetes)..."
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && manualInput.trim()) {
                setTranscript(manualInput);
                runVoiceAnalysis(manualInput);
                setManualInput('');
              }
            }}
          />
          <button
            type="button"
            className="btn-invalid-action primary"
            style={{ whiteSpace: 'nowrap', padding: '6px 14px', borderRadius: '8px' }}
            onClick={() => {
              if (manualInput.trim()) {
                setTranscript(manualInput);
                runVoiceAnalysis(manualInput);
                setManualInput('');
              }
            }}
          >
            Analyze
          </button>
        </div>
      </div>

      {/* 2. QUICK VOICE PROMPTS */}
      <div className="va-quick-prompts-section">
        <span className="va-prompts-title">Try saying or clicking a sample voice query:</span>
        <div className="va-chips-grid">
          <button
            type="button"
            className="va-prompt-chip"
            onClick={() => handleQuickPrompt('Patient: Rajesh, 54 yrs. Advised cardiac stent angioplasty at Fortis Hospital. Estimated cost 11 Lakhs.')}
          >
            🫀 "Fortis Hospital: Heart Stent Surgery"
          </button>
          <button
            type="button"
            className="va-prompt-chip"
            onClick={() => handleQuickPrompt('Patient: Sunita, 48 yrs. Apollo Health Center: Diabetes and Hypertension checkup, advised private room 4.5 Lakhs.')}
          >
            🩸 "Apollo Health: Diabetes & BP Consultation"
          </button>
          <button
            type="button"
            className="va-prompt-chip"
            onClick={() => handleQuickPrompt('Patient: Meena, 61 yrs. Total knee replacement surgery at Max Hospital, cost 8.5 Lakhs.')}
          >
            🦴 "Max Hospital: Knee Joint Replacement"
          </button>
          <button
            type="button"
            className="va-prompt-chip"
            onClick={() => handleQuickPrompt('My salary is 1 lakh, I want a 10 lakh personal loan.')}
          >
            💳 "Salary 1L, Want 10L Personal Loan"
          </button>
          <button
            type="button"
            className="va-prompt-chip"
            onClick={() => handleQuickPrompt('My monthly salary is 95000, I need a 25 lakh home loan for 20 years.')}
          >
            🏠 "Salary 95K, Want 25L Home Loan"
          </button>
          <button
            type="button"
            className="va-prompt-chip"
            onClick={() => handleQuickPrompt('I earn 50000 per month and want a 40 lakh home loan.')}
          >
            ⚠️ "50K Salary, Want 40L Loan (Over Limit)"
          </button>
          <button
            type="button"
            className="va-prompt-chip warning"
            onClick={() => handleQuickPrompt('I have severe fever and stomach pain, need health insurance.')}
            title="Tests IRDAI rule requiring an accredited hospital/clinic name"
          >
            🚫 "Test Invalid: Fever (No Hospital)"
          </button>
        </div>
      </div>

      {/* 3. AI ANALYSIS & GOOGLE ASSISTANT VOICE RESPONSE */}
      {analysisResult && (
        <div className={`va-result-card ${analysisResult.isValid ? 'verified' : 'invalid'}`}>
          
          <div className="va-result-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="google-assistant-dots">
                <div className="ga-dot blue"></div>
                <div className="ga-dot red"></div>
                <div className="ga-dot yellow"></div>
                <div className="ga-dot green"></div>
              </div>
              <strong style={{ fontSize: '14px', color: '#0f172a' }}>
                Finora Assistant Analysis
              </strong>
            </div>

            <span className={`va-category-badge ${analysisResult.category === 'loan_banking' ? 'loan' : analysisResult.isValid ? 'medical' : 'invalid'}`}>
              {analysisResult.category === 'loan_banking' 
                ? '💳 Loan Intelligence' 
                : analysisResult.isValid 
                  ? '🏥 Verified Clinical Facility' 
                  : '🚫 Missing Hospital Header'}
            </span>
          </div>

          {/* AUDIO PLAYBACK CONTROLS */}
          <div className="va-speech-control-bar">
            <div className="va-speech-status">
              <span>{isSpeaking ? '🔊 Assistant Speaking...' : '🔈 Voice Speech Ready'}</span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {isSpeaking ? (
                <button type="button" className="va-speech-btn" onClick={handleStopVoice}>
                  ⏸️ Stop Audio
                </button>
              ) : (
                <button type="button" className="va-speech-btn" onClick={handleReplayVoice}>
                  ▶️ Replay Assistant Voice
                </button>
              )}
            </div>
          </div>

          {/* HEADLINE & COST BREAKDOWN */}
          <div className="va-cost-banner">
            <div>
              <div className="va-cost-title">{analysisResult.analysisBreakdown.heading}</div>
              <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                {analysisResult.analysisBreakdown.hospitalStatus || analysisResult.analysisBreakdown.subheading || analysisResult.userProblemSummary}
              </div>
            </div>
            <div className="va-cost-value">
              {analysisResult.analysisBreakdown.costEstimate}
            </div>
          </div>

          {/* SALARY-BASED ELIGIBILITY BANNER (Loan Queries) */}
          {analysisResult.category === 'loan_banking' && (
            <div style={{ margin: '0 0 12px 0' }}>
              {/* Salary & EMI Capacity Row */}
              {analysisResult.keyEntities?.salary && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '10px',
                  padding: '14px',
                  background: analysisResult.keyEntities.isAffordable ? '#f0fdf4' : '#fef2f2',
                  border: `1px solid ${analysisResult.keyEntities.isAffordable ? '#bbf7d0' : '#fecaca'}`,
                  borderRadius: '10px',
                  marginBottom: '10px'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Monthly Salary</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>₹{(analysisResult.keyEntities.salary / 1000).toFixed(0)}K</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Max EMI (60% FOIR)</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#059669', marginTop: '2px' }}>₹{Math.round(analysisResult.keyEntities.salary * 0.6).toLocaleString('en-IN')}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Your Loan EMI</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: analysisResult.keyEntities.isAffordable ? '#0f172a' : '#dc2626', marginTop: '2px' }}>₹{analysisResult.keyEntities.estEmi?.toLocaleString('en-IN')}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Eligibility</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, marginTop: '4px', color: analysisResult.keyEntities.isAffordable ? '#16a34a' : '#dc2626' }}>
                      {analysisResult.keyEntities.isAffordable ? '✅ Eligible' : '❌ Exceeds Limit'}
                    </div>
                  </div>
                </div>
              )}

              {/* FOIR Warning if over limit */}
              {analysisResult.keyEntities?.foirWarning && (
                <div style={{
                  background: '#fff7ed',
                  border: '1px solid #fed7aa',
                  borderLeft: '4px solid #f97316',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#7c2d12',
                  marginBottom: '6px'
                }}>
                  <strong>⚠️ Income Limit Alert:</strong> {analysisResult.keyEntities.foirWarning}
                </div>
              )}

              {/* Max Eligible Loan Recommendation */}
              {analysisResult.keyEntities?.maxEligibleLoan && !analysisResult.keyEntities.isAffordable && (
                <div style={{
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#065f46',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span><strong>💡 Recommended:</strong> Apply for ₹{(analysisResult.keyEntities.maxEligibleLoan / 100000).toFixed(1)} Lakhs instead.</span>
                  <span style={{ fontWeight: 700, fontSize: '11px', background: '#d1fae5', padding: '2px 8px', borderRadius: '4px' }}>SAFE LIMIT</span>
                </div>
              )}
            </div>
          )}

          {/* DETAILED COST BREAKDOWN LIST (IF CLINICAL) */}
          {analysisResult.analysisBreakdown.costBreakdownList && (
            <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.04em' }}>
                Hospital Inpatient Charge Breakdown:
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginTop: '6px' }}>
                {analysisResult.analysisBreakdown.costBreakdownList.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#475569' }}>{item.item}</span>
                    <strong style={{ color: '#0f172a' }}>{item.amount}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AGENT TRAP SHIELD EXPOSÉ */}
          {analysisResult.analysisBreakdown.criticalAgentTraps && (
            <div className="va-traps-section">
              <div className="va-traps-title">
                <span>🛡️ Agent Trap Shield: Fine-Print Traps to Avoid</span>
              </div>
              {analysisResult.analysisBreakdown.criticalAgentTraps.map((t, idx) => (
                <div key={idx} className="va-trap-item">
                  <div className="va-trap-name">⚠️ {t.trap}</div>
                  <div className="va-trap-warn">{t.warning}</div>
                  <div className="va-trap-shield">✓ Finora Safeguard: {t.safeguard}</div>
                </div>
              ))}
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="va-action-row">
            {analysisResult.category === 'loan_banking' ? (
              <button type="button" className="va-btn-primary" onClick={handleApplyLoan}>
                🏦 Compare Pre-Approved Loan Offers →
              </button>
            ) : analysisResult.isValid ? (
              <button type="button" className="va-btn-primary" onClick={handleApplyInsurance}>
                🛡️ Run Full 6-Stage Policy Match with Shield →
              </button>
            ) : (
              <button 
                type="button" 
                className="va-btn-primary" 
                style={{ background: '#b91c1c' }}
                onClick={() => handleQuickPrompt('Patient: Rajesh, 54 yrs. Advised cardiac stent angioplasty at Fortis Hospital. Estimated cost ₹11 Lakhs.')}
              >
                🏥 Try with Verified Facility (Fortis Hospital)
              </button>
            )}

            {!isEmbedded && (
              <button type="button" className="va-btn-secondary" onClick={() => setIsOpen(false)}>
                Done
              </button>
            )}
          </div>

        </div>
      )}

    </div>
  );

  // If used as Embedded Panel inside another component (e.g. MedicalDocScanner)
  if (isEmbedded) {
    return assistantContent;
  }

  // Floating Trigger & Modal Presentation
  return (
    <>
      {/* FLOATING ACTION BUTTON (GOOGLE ASSISTANT STYLE) */}
      <button
        type="button"
        className={`voice-assistant-fab ${isListening ? 'listening' : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label="Open Finora Voice Assistant"
      >
        <div className="google-assistant-dots">
          <div className="ga-dot blue"></div>
          <div className="ga-dot red"></div>
          <div className="ga-dot yellow"></div>
          <div className="ga-dot green"></div>
        </div>
        <span>Voice Assistant</span>
      </button>

      {/* POPUP MODAL */}
      {isOpen && (
        <div className="voice-modal-backdrop" onClick={() => setIsOpen(false)}>
          <div 
            className="voice-assistant-card" 
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* MODAL HEADER */}
            <div className="va-header">
              <div className="va-brand">
                <div className="google-assistant-dots">
                  <div className="ga-dot blue"></div>
                  <div className="ga-dot red"></div>
                  <div className="ga-dot yellow"></div>
                  <div className="ga-dot green"></div>
                </div>
                <div>
                  <div className="va-brand-title">Finora Voice Assistant</div>
                  <div className="va-subtext">Speech-to-text problem analysis & agent trap shield</div>
                </div>
              </div>

              <button 
                type="button" 
                className="va-close-btn"
                onClick={() => {
                  stopAssistantSpeech();
                  setIsOpen(false);
                }}
                aria-label="Close Assistant"
              >
                ✕
              </button>
            </div>

            {/* MODAL BODY */}
            {assistantContent}
          </div>
        </div>
      )}
    </>
  );
}
