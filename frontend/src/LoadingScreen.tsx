import { useEffect, useRef, useState } from 'react';

export default function LoadingScreen() {
    const [elapsed, setElapsed] = useState(0);
    const [showError, setShowError] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        intervalRef.current = setInterval(() => setElapsed(e => e + 500), 500);
        const t = setTimeout(() => setShowError(true), 180000);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            clearTimeout(t);
        };
    }, []);

    const progress = Math.min((elapsed / 120_000) * 90, 90);

    return (
        <div style={{
            background: '#000',
            color: '#fff',
            fontFamily: 'monospace',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            margin: 0,
            userSelect: 'none',
        }}>
            <h1 style={{ fontSize: '52px', letterSpacing: '12px', marginBottom: '40px' }}>FADE</h1>
            <p style={{ fontSize: '13px', marginBottom: '16px', opacity: 0.8 }}>
                The void stirs...
            </p>
            <div style={{ width: '240px', height: '3px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px', marginBottom: '10px' }}>
                <div style={{
                    height: '100%',
                    width: `${progress}%`,
                    background: '#fff',
                    borderRadius: '2px',
                    transition: 'width 0.5s ease-out',
                }} />
            </div>
            <p style={{ fontSize: '11px', opacity: 0.4, marginBottom: '24px' }}>
                {Math.floor(elapsed / 1000)}s
            </p>
            <p style={{ fontSize: '12px', opacity: 0.5, maxWidth: '320px', textAlign: 'center', lineHeight: '1.6' }}>
                The server sleeps after inactivity. It should wake within 2 minutes.
            </p>
            {showError && (
                <p style={{ fontSize: '12px', opacity: 0.45, marginTop: '20px', maxWidth: '320px', textAlign: 'center' }}>
                    The connection fades. Are you connected to the internet?
                </p>
            )}
        </div>
    );
}
