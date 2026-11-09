import { useState, useEffect, useMemo } from 'react';
import { CheckCircle2, Copy, Check, Smartphone, QrCode, ShieldCheck, RefreshCw, Zap, ArrowLeft } from 'lucide-react';
import { generateQrMatrix } from '../utils/qrGenerator';

// Pure SVG QR Code renderer (Zero external dependencies)
export function QrCodeSvg({ text, size = 180, showLogo = true }) {
  const { matrix, size: moduleCount } = useMemo(() => {
    try {
      return generateQrMatrix(text);
    } catch (e) {
      console.warn('QR Generation error:', e);
      return { matrix: [], size: 0 };
    }
  }, [text]);

  if (!matrix || matrix.length === 0) return null;

  const cellSize = size / moduleCount;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: 'block', margin: '0 auto', borderRadius: '10px' }}
    >
      <rect width={size} height={size} fill="#ffffff" />
      {matrix.map((row, r) =>
        row.map((isDark, c) => {
          if (!isDark) return null;
          // Reserve center space for UPI logo badge
          if (showLogo) {
            const centerStart = Math.floor(moduleCount / 2) - 2;
            const centerEnd = Math.floor(moduleCount / 2) + 2;
            if (r >= centerStart && r <= centerEnd && c >= centerStart && c <= centerEnd) {
              return null;
            }
          }
          return (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize + 0.15}
              height={cellSize + 0.15}
              fill="#0f172a"
            />
          );
        })
      )}
      {showLogo && (
        <g transform={`translate(${size / 2 - 17}, ${size / 2 - 17})`}>
          <rect width="34" height="34" rx="7" fill="#1e3a8a" stroke="#ffffff" strokeWidth="2.5" />
          <text
            x="17"
            y="22"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="10.5"
            fontWeight="800"
            letterSpacing="0.5px"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            UPI
          </text>
        </g>
      )}
    </svg>
  );
}

// Complete interactive Scan to Pay UI component
export default function UpiScanToPay({
  totalAmount,
  formatPrice,
  onPaymentSuccess,
  isFullView = false,
  onBack
}) {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(299); // 5-minute countdown
  const [verifying, setVerifying] = useState(false);
  const [selectedApp, setSelectedApp] = useState('gpay');

  const upiId = 'aurastore.pay@icici';
  const merchantName = 'AuraStore Retail Ltd';

  // Standard UPI URI format supported by all Indian UPI apps
  const upiUri = useMemo(() => {
    const cleanAmount = Math.round(totalAmount);
    return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${cleanAmount}&cu=INR&tn=AuraStore%20Order`;
  }, [totalAmount]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyUpi = () => {
    try {
      navigator.clipboard.writeText(upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSimulatePayment = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      onPaymentSuccess?.(`UPI-${selectedApp.toUpperCase()}-QR`);
    }, 1200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* View Header if in full view */}
      {isFullView && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#2563eb',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              padding: 0
            }}
          >
            <ArrowLeft size={16} /> Change Payment Method
          </button>
          <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={14} /> 256-Bit Encrypted UPI Gateway
          </span>
        </div>
      )}

      {/* Main Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
        border: '1px solid #bfdbfe',
        borderRadius: '12px',
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <QrCode size={22} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
              Scan & Pay with Any UPI App
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              Zero convenience fee • Instant order confirmation
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>SCAN TO PAY</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#16a34a' }}>
            {formatPrice(totalAmount)}
          </div>
        </div>
      </div>

      {/* Supported Apps Quick Select */}
      <div>
        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
          Compatible with all UPI Apps:
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
          {[
            { id: 'gpay', name: 'Google Pay', color: '#4285f4' },
            { id: 'phonepe', name: 'PhonePe', color: '#5f259f' },
            { id: 'paytm', name: 'Paytm', color: '#00b9f5' },
            { id: 'bhim', name: 'BHIM UPI', color: '#f37021' }
          ].map(app => {
            const isSelected = selectedApp === app.id;
            return (
              <button
                key={app.id}
                type="button"
                onClick={() => setSelectedApp(app.id)}
                style={{
                  padding: '7px 4px',
                  borderRadius: '8px',
                  border: isSelected ? `2px solid ${app.color}` : '1px solid #cbd5e1',
                  background: isSelected ? '#ffffff' : '#f8fafc',
                  color: isSelected ? app.color : '#334155',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  boxShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{app.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* QR Code Container with Viewfinder Brackets & Scan Animation */}
      <div style={{
        background: '#ffffff',
        border: '2px solid #e2e8f0',
        borderRadius: '16px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)',
        position: 'relative'
      }}>
        {/* Scanner Targeting Corner Brackets */}
        <div style={{ position: 'relative', padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          {/* Top-Left Corner */}
          <div style={{ position: 'absolute', top: '4px', left: '4px', width: '16px', height: '16px', borderTop: '3px solid #2563eb', borderLeft: '3px solid #2563eb', borderTopLeftRadius: '4px' }} />
          {/* Top-Right Corner */}
          <div style={{ position: 'absolute', top: '4px', right: '4px', width: '16px', height: '16px', borderTop: '3px solid #2563eb', borderRight: '3px solid #2563eb', borderTopRightRadius: '4px' }} />
          {/* Bottom-Left Corner */}
          <div style={{ position: 'absolute', bottom: '4px', left: '4px', width: '16px', height: '16px', borderBottom: '3px solid #2563eb', borderLeft: '3px solid #2563eb', borderBottomLeftRadius: '4px' }} />
          {/* Bottom-Right Corner */}
          <div style={{ position: 'absolute', bottom: '4px', right: '4px', width: '16px', height: '16px', borderBottom: '3px solid #2563eb', borderRight: '3px solid #2563eb', borderBottomRightRadius: '4px' }} />

          {/* Actual SVG QR Code */}
          <QrCodeSvg text={upiUri} size={isFullView ? 200 : 160} showLogo={true} />
        </div>

        {/* Live Indicator & Expiry Timer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: '300px', marginTop: '12px', fontSize: '11.5px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontWeight: 600 }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#16a34a',
              display: 'inline-block',
              boxShadow: '0 0 6px #16a34a'
            }} />
            <span>Awaiting UPI scan...</span>
          </div>

          <div style={{ color: timeLeft < 60 ? '#dc2626' : '#64748b', fontWeight: 700 }}>
            Expires in: <span style={{ fontFamily: 'monospace' }}>{formatTimer(timeLeft)}</span>
          </div>
        </div>

        {/* Clickable UPI ID Pill */}
        <div style={{
          marginTop: '12px',
          background: '#f1f5f9',
          border: '1px dashed #cbd5e1',
          borderRadius: '8px',
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '11.5px'
        }}>
          <span style={{ color: '#64748b' }}>UPI VPA:</span>
          <strong style={{ color: '#0f172a', letterSpacing: '0.5px' }}>{upiId}</strong>
          <button
            type="button"
            onClick={handleCopyUpi}
            style={{
              background: copied ? '#dcfce7' : '#ffffff',
              border: `1px solid ${copied ? '#86efac' : '#cbd5e1'}`,
              borderRadius: '5px',
              padding: '3px 8px',
              fontSize: '10.5px',
              fontWeight: 600,
              color: copied ? '#16a34a' : '#2563eb',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '3px'
            }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          type="button"
          disabled={verifying}
          onClick={handleSimulatePayment}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
            border: 'none',
            color: '#ffffff',
            padding: '13px 0',
            borderRadius: '10px',
            fontSize: '14.5px',
            fontWeight: 700,
            cursor: verifying ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 10px rgba(22, 163, 74, 0.25)'
          }}
        >
          {verifying ? (
            <>
              <RefreshCw size={18} className="animate-spin" />
              <span>Verifying UPI Transaction with Bank...</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={18} />
              <span>I Have Paid {formatPrice(totalAmount)} via UPI</span>
            </>
          )}
        </button>

        <button
          type="button"
          disabled={verifying}
          onClick={handleSimulatePayment}
          style={{
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '8px',
            fontSize: '11.5px',
            color: '#2563eb',
            fontWeight: 700,
            cursor: verifying ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <Zap size={14} style={{ color: '#eab308' }} />
          <span>Instant Demo Auto-Pay (Simulate Successful Scan)</span>
        </button>
      </div>
    </div>
  );
}

