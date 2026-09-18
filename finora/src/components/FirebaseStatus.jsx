import React, { useState, useEffect } from 'react';
import { isFirebaseConfigured } from '../firebase/config';
import {
  addDocument,
  getDocuments,
  deleteDocument,
  subscribeToCollection,
  setRtdbData,
  getRtdbData,
  subscribeToRtdb
} from '../firebase/db';

export default function FirebaseStatus() {
  const [configured, setConfigured] = useState(false);
  const [activeTab, setActiveTab] = useState('firestore');
  
  // Firestore state
  const [firestoreItems, setFirestoreItems] = useState([]);
  const [newItemText, setNewItemText] = useState('');
  const [loadingFs, setLoadingFs] = useState(false);
  const [fsError, setFsError] = useState(null);

  // Realtime DB state
  const [rtdbValue, setRtdbValue] = useState('');
  const [rtdbInput, setRtdbInput] = useState('');
  const [loadingRtdb, setLoadingRtdb] = useState(false);
  const [rtdbError, setRtdbError] = useState(null);

  useEffect(() => {
    const isConfig = isFirebaseConfigured();
    setConfigured(isConfig);

    if (isConfig) {
      // Subscribe to test collection in Firestore
      const unsubscribeFs = subscribeToCollection('demo_items', (docs) => {
        setFirestoreItems(docs);
        setFsError(null);
      });

      // Subscribe to test key in Realtime DB
      const unsubscribeRtdb = subscribeToRtdb('demo_status', (val) => {
        setRtdbValue(val || 'No data set yet');
        setRtdbError(null);
      });

      return () => {
        if (typeof unsubscribeFs === 'function') unsubscribeFs();
        if (typeof unsubscribeRtdb === 'function') unsubscribeRtdb();
      };
    }
  }, []);

  // Handle Add Firestore Doc
  const handleAddFirestoreDoc = async (e) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    setLoadingFs(true);
    setFsError(null);
    try {
      await addDocument('demo_items', { title: newItemText });
      setNewItemText('');
    } catch (err) {
      setFsError(err.message || 'Failed to add Firestore item');
    } finally {
      setLoadingFs(false);
    }
  };

  // Handle Delete Firestore Doc
  const handleDeleteFirestoreDoc = async (id) => {
    try {
      await deleteDocument('demo_items', id);
    } catch (err) {
      setFsError(err.message || 'Failed to delete item');
    }
  };

  // Handle Save Realtime DB
  const handleSaveRtdb = async (e) => {
    e.preventDefault();
    if (!rtdbInput.trim()) return;
    setLoadingRtdb(true);
    setRtdbError(null);
    try {
      await setRtdbData('demo_status', rtdbInput);
      setRtdbInput('');
    } catch (err) {
      setRtdbError(err.message || 'Failed to update Realtime DB');
    } finally {
      setLoadingRtdb(false);
    }
  };

  return (
    <div style={styles.card}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.titleGroup}>
          <div style={styles.icon}>🔥</div>
          <div>
            <h2 style={styles.title}>Firebase Database Integration</h2>
            <p style={styles.subtitle}>Cloud Firestore & Realtime Database Ready</p>
          </div>
        </div>
        <div style={configured ? styles.badgeSuccess : styles.badgeWarning}>
          <span style={styles.dot}>●</span>
          {configured ? 'Configured & Connected' : 'Demo Mode (.env setup required)'}
        </div>
      </div>

      {/* Environment Config Warning Notice if not fully configured */}
      {!configured && (
        <div style={styles.warningBox}>
          <h4 style={styles.warningTitle}>⚠️ Quick Setup Required</h4>
          <p style={styles.warningText}>
            To connect to your live Firebase database, replace the placeholder credentials in <code>.env</code> with your project config from the{' '}
            <a
              href="https://console.firebase.google.com/"
              target="_blank"
              rel="noreferrer"
              style={styles.link}
            >
              Firebase Console
            </a>.
          </p>
          <div style={styles.codeSnippet}>
            <code>VITE_FIREBASE_API_KEY=your_actual_api_key</code><br/>
            <code>VITE_FIREBASE_PROJECT_ID=your_actual_project_id</code>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabContainer}>
        <button
          style={activeTab === 'firestore' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('firestore')}
        >
          📁 Cloud Firestore
        </button>
        <button
          style={activeTab === 'rtdb' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('rtdb')}
        >
          ⚡ Realtime Database
        </button>
      </div>

      {/* Tab 1: Cloud Firestore */}
      {activeTab === 'firestore' && (
        <div style={styles.tabContent}>
          <h3 style={styles.sectionTitle}>Firestore Live Collection: <code>demo_items</code></h3>
          
          <form onSubmit={handleAddFirestoreDoc} style={styles.form}>
            <input
              type="text"
              placeholder="Enter item title..."
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              style={styles.input}
            />
            <button type="submit" disabled={loadingFs} style={styles.button}>
              {loadingFs ? 'Adding...' : 'Add to Firestore'}
            </button>
          </form>

          {fsError && <div style={styles.errorBox}>{fsError}</div>}

          <div style={styles.list}>
            {firestoreItems.length === 0 ? (
              <p style={styles.emptyText}>No documents in <code>demo_items</code> collection yet.</p>
            ) : (
              firestoreItems.map((item) => (
                <div key={item.id} style={styles.listItem}>
                  <div>
                    <strong style={styles.itemTitle}>{item.title}</strong>
                    <div style={styles.itemId}>ID: {item.id}</div>
                  </div>
                  <button
                    onClick={() => handleDeleteFirestoreDoc(item.id)}
                    style={styles.deleteBtn}
                    title="Delete item"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Realtime Database */}
      {activeTab === 'rtdb' && (
        <div style={styles.tabContent}>
          <h3 style={styles.sectionTitle}>Realtime Database Key: <code>demo_status</code></h3>

          <div style={styles.valueDisplay}>
            <span style={styles.valueLabel}>Current Live Value:</span>
            <span style={styles.valueText}>{String(rtdbValue)}</span>
          </div>

          <form onSubmit={handleSaveRtdb} style={styles.form}>
            <input
              type="text"
              placeholder="Enter new value..."
              value={rtdbInput}
              onChange={(e) => setRtdbInput(e.target.value)}
              style={styles.input}
            />
            <button type="submit" disabled={loadingRtdb} style={styles.button}>
              {loadingRtdb ? 'Saving...' : 'Update Realtime DB'}
            </button>
          </form>

          {rtdbError && <div style={styles.errorBox}>{rtdbError}</div>}
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    background: '#111827',
    color: '#f9fafb',
    borderRadius: '16px',
    padding: '24px',
    maxWidth: '680px',
    margin: '32px auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
    border: '1px solid #1f2937',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '20px',
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  icon: {
    fontSize: '32px',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '700',
    color: '#ffffff',
  },
  subtitle: {
    margin: '4px 0 0 0',
    fontSize: '13px',
    color: '#9ca3af',
  },
  badgeSuccess: {
    background: '#065f46',
    color: '#34d399',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  badgeWarning: {
    background: '#78350f',
    color: '#fbbf24',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  dot: {
    fontSize: '10px',
  },
  warningBox: {
    background: '#1e1b4b',
    border: '1px solid #4338ca',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '20px',
  },
  warningTitle: {
    margin: '0 0 6px 0',
    color: '#818cf8',
    fontSize: '14px',
    fontWeight: '600',
  },
  warningText: {
    margin: 0,
    fontSize: '13px',
    color: '#c7d2fe',
    lineHeight: '1.5',
  },
  link: {
    color: '#93c5fd',
    textDecoration: 'underline',
  },
  codeSnippet: {
    background: '#0f172a',
    padding: '10px 12px',
    borderRadius: '8px',
    marginTop: '10px',
    fontSize: '12px',
    color: '#38bdf8',
    fontFamily: 'monospace',
  },
  tabContainer: {
    display: 'flex',
    gap: '8px',
    borderBottom: '1px solid #1f2937',
    paddingBottom: '12px',
    marginBottom: '20px',
  },
  tab: {
    background: 'transparent',
    border: 'none',
    color: '#9ca3af',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
  },
  tabActive: {
    background: '#374151',
    border: 'none',
    color: '#ffffff',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
  },
  tabContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '15px',
    fontWeight: '600',
    color: '#e5e7eb',
  },
  form: {
    display: 'flex',
    gap: '10px',
  },
  input: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #374151',
    background: '#1f2937',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
  },
  button: {
    padding: '10px 18px',
    borderRadius: '8px',
    border: 'none',
    background: '#2563eb',
    color: '#ffffff',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '8px',
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#1f2937',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #374151',
  },
  itemTitle: {
    color: '#f3f4f6',
    fontSize: '14px',
  },
  itemId: {
    color: '#6b7280',
    fontSize: '11px',
    marginTop: '2px',
    fontFamily: 'monospace',
  },
  deleteBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    opacity: 0.8,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: '13px',
    fontStyle: 'italic',
  },
  valueDisplay: {
    background: '#1f2937',
    padding: '14px 18px',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valueLabel: {
    color: '#9ca3af',
    fontSize: '13px',
  },
  valueText: {
    color: '#34d399',
    fontWeight: '600',
    fontSize: '15px',
  },
  errorBox: {
    background: '#7f1d1d',
    color: '#fca5a5',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
  },
};
