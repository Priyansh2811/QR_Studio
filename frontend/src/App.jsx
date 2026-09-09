import { useCallback, useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const STARTER_URL = 'https://example.com/your-next-idea';

function isValidUrl(value) {
  try {
    const url = new URL(value.trim());
    return ['http:', 'https:'].includes(url.protocol) && Boolean(url.hostname);
  } catch { return false; }
}

function timeAgo(iso) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function App() {
  const [url, setUrl] = useState('');
  const [label, setLabel] = useState('');
  const [foreground, setForeground] = useState('#17211f');
  const [background, setBackground] = useState('#fffdf8');
  const [size, setSize] = useState(320);
  const [level, setLevel] = useState('M');
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);

  const drawQr = useCallback(async () => {
    if (!isValidUrl(url)) return;
    await QRCode.toCanvas(canvasRef.current, url.trim(), {
      width: size, margin: 2, errorCorrectionLevel: level,
      color: { dark: foreground, light: background }
    });
  }, [url, size, level, foreground, background]);

  useEffect(() => { drawQr().catch(() => setError('This link is too long to fit in a QR code.')); }, [drawQr]);

  useEffect(() => {
    fetch(`${API_URL}/generations?limit=20`)
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then(setHistory).catch(() => setNotice('History is offline — your QR codes still work locally.'));
  }, []);

  function useStarter() { setUrl(STARTER_URL); setError(''); setNotice(''); }

  async function generate(event) {
    event.preventDefault();
    setError(''); setNotice('');
    const value = url.trim();
    if (!isValidUrl(value)) { setError('Use a complete link beginning with http:// or https://.'); return; }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/generations`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: value, label: label.trim() })
      });
      if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.error || 'Could not save this link.'); }
      const saved = await response.json();
      setHistory((items) => [saved, ...items.filter((item) => item.id !== saved.id)].slice(0, 20));
      setNotice('Saved to your recent links.');
    } catch (err) {
      setNotice('QR ready — history is offline right now.');
      if (err.message && !err.message.includes('Failed to fetch')) setError(err.message);
    } finally { setLoading(false); }
  }

  async function copyLink() {
    if (!isValidUrl(url)) { setError('Enter a valid link before copying.'); return; }
    await navigator.clipboard.writeText(url.trim());
    setNotice('Link copied to clipboard.');
  }

  function downloadPng() {
    if (!canvasRef.current) return;
    const anchor = document.createElement('a');
    anchor.download = `${(label.trim() || 'qr-code').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.png`;
    anchor.href = canvasRef.current.toDataURL('image/png'); anchor.click();
    setNotice('PNG downloaded.');
  }

  async function removeItem(id) {
    setHistory((items) => items.filter((item) => item.id !== id));
    await fetch(`${API_URL}/generations/${id}`, { method: 'DELETE' }).catch(() => {});
  }

  async function clearHistory() {
    setHistory([]); setNotice('History cleared.');
    await fetch(`${API_URL}/generations`, { method: 'DELETE' }).catch(() => {});
  }

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="/" aria-label="QR Studio home"><span className="brand-mark">⌁</span><span>QR Studio</span></a>
      <span className="topbar-note">simple tools for useful links</span>
    </header>

    <main>
      <section className="hero">
        <div className="hero-copy">
          <h1>Make any link<br /><em>easy to find.</em></h1>
          <p className="hero-description">A clean QR code, made in a moment. Customize it, download it, and keep your recent links close by.</p>
        </div>
        <div className="hero-stamp" aria-hidden="true"><span>made for</span><strong>sharing</strong><span>one scan at a time</span></div>
      </section>

      <section className="workspace" aria-label="QR code maker">
        <div className="form-card">
          <div className="card-heading"><span className="step-number"></span><div><h2>Drop in a link</h2><p>Paste a website, menu, profile, or anything with a URL.</p></div></div>
          <form onSubmit={generate}>
            <label htmlFor="url">Your link</label>
            <div className={`url-field ${error ? 'has-error' : ''}`}><span className="url-prefix">https://</span><input id="url" value={url} onChange={(e) => { setUrl(e.target.value); setError(''); }} placeholder="yourwebsite.com/page" autoComplete="url" /></div>
            <label htmlFor="label">Label <span>(optional)</span></label>
            <input id="label" className="text-input" value={label} maxLength="80" onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Spring menu" />
            {error && <p className="form-error" role="alert">{error}</p>}
            <div className="form-actions"><button className="primary-button" type="submit" disabled={loading}>{loading ? 'Saving…' : 'Create QR code'} <span>↗</span></button><button className="text-button" type="button" onClick={useStarter}>Try an example</button></div>
          </form>
          <div className="fine-print"><span className="lock-icon">⌑</span> Your links stay in this browser and your local history.</div>
        </div>

        <div className="preview-card">
          <div className="qr-stage"><div className="qr-paper">{isValidUrl(url) ? <canvas ref={canvasRef} aria-label="Generated QR code" /> : <div className="empty-qr"><div className="empty-icon">▦</div><p>Your QR code<br />will appear here</p></div>}</div></div>
          <div className="preview-actions"><button className="secondary-button" type="button" onClick={downloadPng} disabled={!isValidUrl(url)}>Download PNG <span>↓</span></button><button className="copy-button" type="button" onClick={copyLink} disabled={!isValidUrl(url)} aria-label="Copy link">▣</button></div>
          <div className="customize"><div className="customize-heading"><span>Fine tune it</span><span className="customize-line" /></div><div className="control-row"><label>Ink <span className="color-swatch" style={{ background: foreground }}><input type="color" aria-label="QR ink color" value={foreground} onChange={(e) => setForeground(e.target.value)} /></span></label><label>Paper <span className="color-swatch" style={{ background: background }}><input type="color" aria-label="QR paper color" value={background} onChange={(e) => setBackground(e.target.value)} /></span></label><label className="size-control">Size <input type="range" min="220" max="480" step="10" value={size} onChange={(e) => setSize(Number(e.target.value))} /><output>{size}px</output></label></div><div className="control-row second"><label>Recovery <select value={level} onChange={(e) => setLevel(e.target.value)}><option value="L">Low</option><option value="M">Medium</option><option value="Q">Quartile</option><option value="H">High</option></select></label><span className="tip">Higher recovery helps if your code gets printed small.</span></div></div>
        </div>
      </section>

      {notice && <p className="notice" role="status">{notice}</p>}

      <section className="history-section"><div className="section-heading"><div><p className="eyebrow">your shelf</p><h2>Recent links <span>{history.length}</span></h2></div>{history.length > 0 && <button className="clear-button" onClick={clearHistory}>Clear all</button>}</div>{history.length === 0 ? <div className="history-empty"><span>◌</span><p>Your saved links will live here.<br />Make your first code above.</p></div> : <div className="history-grid">{history.map((item) => <article className="history-item" key={item.id}><div className="history-icon">▦</div><div className="history-info"><strong>{item.label || 'Untitled link'}</strong><span title={item.url}>{item.url}</span><small>{timeAgo(item.createdAt)}</small></div><div className="history-actions"><button onClick={() => { setUrl(item.url); setLabel(item.label || ''); window.scrollTo({ top: 0, behavior: 'smooth' }); }} aria-label={`Use ${item.label || item.url}`}>↗</button><button onClick={() => removeItem(item.id)} aria-label={`Delete ${item.label || item.url}`}>×</button></div></article>)}</div>}</section>
    </main>
    <footer><span>QR Studio</span><span></span><span>made for the little moments that need a scan</span></footer>
  </div>;
}

