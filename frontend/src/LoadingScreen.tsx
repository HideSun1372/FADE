import { useEffect, useState } from 'react';

export default function LoadingScreen() {
    const [showError, setShowError] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setShowError(true), 180000);
        return () => clearTimeout(t);
    }, []);

    return (
        <>
            <style>{`
                @keyframes ls-pulse {
                    0%, 100% { opacity: 0.2; }
                    50% { opacity: 0.7; }
                }
            `}</style>
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
                <h1 style={{ fontSize: '52px', letterSpacing: '12px', marginBottom: '32px' }}>FADE</h1>
                <p style={{ fontSize: '13px', animation: 'ls-pulse 1.5s ease-in-out infinite' }}>
                    The Render backend is currently cold-starting, please hold on... (Up to 3 minutes)
                </p>
                {showError && (
                    <p style={{ fontSize: '13px', opacity: 0.6, marginTop: '16px' }}>
                        The app seems to be having trouble connecting. Are you connected to the internet?
                    </p>
                )}
            </div>
        </>
    );
}
