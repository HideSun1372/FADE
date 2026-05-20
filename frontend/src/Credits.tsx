import { useEffect } from 'react';

export default function Credits({ onBack }: { onBack: () => void }) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            e.preventDefault();
            if (e.key.toLowerCase() === 'z' || e.key.toLowerCase() === 'x') onBack();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onBack]);

    return (
        <div className="credits-screen">
            <h1 className="credits-title">CREDITS</h1>
            <div className="credits-body">

                <div className="credits-section">
                    <p className="credits-role">GAME DESIGN</p>
                    <p className="credits-name">Justin Chen</p>
                </div>

                <div className="credits-section">
                    <p className="credits-role">PROGRAMMING</p>
                    <p className="credits-name">Justin Chen & Partly AI for coding small functions</p>
                </div>

                <div className="credits-section">
                    <p className="credits-role">NARRATIVE &amp; DIALOGUE</p>
                    <p className="credits-name">Justin Chen</p>
                </div>

                <div className="credits-section">
                    <p className="credits-role">ART &amp; VISUAL DESIGN</p>
                    <p className="credits-name">All visual styles are generated with AI</p>
                </div>

                <div className="credits-divider" />

                <div className="credits-section">
                    <p className="credits-role">SPECIAL THANKS</p>
                    <p className="credits-name">Mr. Register</p>
                </div>

                <div className="credits-divider" />

                <p className="credits-footnote">Made with React &amp; Spring Boot</p>
                <p className="credits-footnote">2026</p>

            </div>
            <div className="credits-back-btn credits-back-btn-selected">
                BACK
            </div>
            <p className="credits-back-hint">Z: Back to Title</p>
        </div>
    );
}
