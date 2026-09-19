import React, { useState } from 'react';
import { getN8nWebhookUrl, setN8nWebhookUrl, testN8nWebhookConnection } from '../utils/n8nService';

export default function N8nConfigModal({ isOpen, onClose, onSave }) {
  const [currentUrl, setCurrentUrl] = useState(getN8nWebhookUrl());
  const [inputUrl, setInputUrl] = useState(getN8nWebhookUrl());
  const [status, setStatus] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  if (!isOpen) return null;

  const handleTest = async () => {
    if (!inputUrl.trim()) {
      setStatus({ success: false, message: 'Please enter an n8n webhook URL first.' });
      return;
    }
    setIsTesting(true);
    setStatus({ success: true, message: 'Testing webhook connection...' });
    const res = await testN8nWebhookConnection(inputUrl);
    setStatus(res);
    setIsTesting(false);
  };

  const handleSave = () => {
    const trimmed = inputUrl.trim();
    setN8nWebhookUrl(trimmed);
    setCurrentUrl(trimmed);
    if (onSave) onSave(trimmed);
    onClose();
  };

  const handleDisconnect = () => {
    setN8nWebhookUrl('');
    setCurrentUrl('');
    setInputUrl('');
    setStatus({ success: true, message: 'n8n webhook disconnected. Finora will use local fallback AI engine.' });
    if (onSave) onSave('');
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          maxWidth: '600px',
          width: '100%',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>⚡</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                Connect n8n Automation Engine
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Unified AI OCR, Loan Underwriting & Lead Automations
              </span>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.25rem',
              cursor: 'pointer',
              color: '#94a3b8',
              lineHeight: 1
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '6px' }}>
              n8n Webhook URL (POST):
            </label>
            <input 
              type="url"
              placeholder="https://your-n8n-instance.com/webhook/finora-webhook"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.88rem',
                color: '#0f172a',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
              Works with local n8n (<code style={{ background: '#f1f5f9', padding: '2px 4px', borderRadius: '4px' }}>http://localhost:5678/webhook/finora-webhook</code>) or cloud instances.
            </span>
          </div>

          {/* Test Status */}
          {status && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              background: status.success ? '#ecfdf5' : '#fef2f2',
              color: status.success ? '#065f46' : '#991b1b',
              border: status.success ? '1px solid #a7f3d0' : '1px solid #fecaca'
            }}>
              {status.message}
            </div>
          )}

          {/* Supported Events Card */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
              🤖 Supported Workflows in this Webhook:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.78rem', color: '#475569' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🩺</span> <span>Medical Bill OCR & Hospital Gate</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>💰</span> <span>Salary Slip OCR & FOIR Engine</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🛡️</span> <span>Insurance Policy Selection Lead</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🏛️</span> <span>Loan Sanction Dispatch Lead</span>
              </div>
            </div>
          </div>

          {/* Template Download */}
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e40af' }}>
                📦 Importable n8n Workflow Template
              </div>
              <div style={{ fontSize: '0.74rem', color: '#3b82f6' }}>
                Pre-wired switch router, OCR entity parser, and response nodes.
              </div>
            </div>
            <a 
              href="/finora-n8n-workflow.json"
              download="finora-n8n-workflow.json"
              style={{
                textDecoration: 'none',
                background: '#2563eb',
                color: '#fff',
                padding: '7px 12px',
                borderRadius: '6px',
                fontSize: '0.76rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              ⬇️ Download JSON
            </a>
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            {currentUrl && (
              <button 
                type="button"
                onClick={handleDisconnect}
                style={{
                  background: 'transparent',
                  border: '1px solid #fca5a5',
                  color: '#dc2626',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Disconnect
              </button>
            )}
            <button 
              type="button"
              onClick={handleTest}
              disabled={isTesting}
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                color: '#334155',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {isTesting ? 'Testing...' : '⚡ Test Ping'}
            </button>
            <button 
              type="button"
              onClick={handleSave}
              style={{
                background: '#059669',
                border: 'none',
                color: '#ffffff',
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)'
              }}
            >
              Save & Connect Webhook
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
