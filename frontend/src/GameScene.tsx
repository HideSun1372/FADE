type Props = {
    roomID: number;
    playerDirection: string;
    description: string;
    playerX: number;
    playerY: number;
    hasKey: boolean;
    northDoorUnlocked: boolean;
}

const backgrounds: Record<number, string> = {
    0: 'radial-gradient(ellipse at 50% 40%, #3b1f6b 0%, #1a0533 50%, #06000f 100%)',
    11: 'linear-gradient(180deg, #06000f 0%, #150830 60%, #1a0533 100%)',
}

export default function GameScene({ roomID, playerDirection, description, playerX, playerY, hasKey, northDoorUnlocked }: Props) {
    const bg = backgrounds[roomID] ?? 'radial-gradient(ellipse at center, #111, #000)';

    const playerStyle: React.CSSProperties = {
        left: `${playerX}%`,
        top: `${playerY}%`,
        transform: 'translate(-50%, -50%)',
        transition: 'none',
    };

    return (
        <div className="game-scene" style={{ background: bg }}>
            <p className="scene-desc">{description}</p>

            {roomID === 0 && <>
                <div className="door door-east"></div>
                <div className={`door door-north${northDoorUnlocked ? '' : ' door-locked'}`}></div>
            </>}

            {roomID === 11 && <>
                {!hasKey && <div className="scene-key">🗝</div>}
                <div className="door door-west"></div>
            </>}

            <div className={`player player-${playerDirection}`} style={playerStyle}>
                <div className="player-eyes">
                    <div className="eye"><div className="pupil"></div></div>
                    <div className="eye"><div className="pupil"></div></div>
                </div>
            </div>
        </div>
    );
}
