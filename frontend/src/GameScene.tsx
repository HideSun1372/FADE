type Props = {
    roomID: number;
    playerDirection: string;
    description: string;
    playerX: number;
    playerY: number;
    hasKey: boolean;
    hasRoom62Key: boolean;
    northDoorUnlocked: boolean;
    requirementsMet: boolean;
    enemyX: number;
    enemyY: number;
    enemyAggravated: boolean;
    battleWon: boolean;
    roomVisited: boolean;
}

const battleRooms = new Set([4, 6, 22, 32, 33, 41, 63, 7, 73]);

const backgrounds: Record<number, string> = {
    0:  'radial-gradient(ellipse at 50% 40%, #3b1f6b 0%, #1a0533 50%, #06000f 100%)',
    1:  'radial-gradient(ellipse at 50% 85%, #0d2e14 0%, #061a0b 45%, #020a10 100%)',
    2:  'radial-gradient(ellipse at 50% 60%, #0e1f0a 0%, #060d04 55%, #020502 100%)',
    3:  'radial-gradient(ellipse at 50% 80%, #3a1000 0%, #1c0500 55%, #080200 100%)',
    4:  'radial-gradient(ellipse at 50% 95%, #6e1e00 0%, #320a00 50%, #0f0200 100%)',
    5:  'radial-gradient(ellipse at 35% 55%, #0f1d0b 0%, #0c0800 50%, #080200 100%)',
    61: 'linear-gradient(180deg, #080606 0%, #050404 55%, #030303 100%)',
    62: 'radial-gradient(ellipse at 50% 50%, #100010 0%, #070008 55%, #030004 100%)',
    63: 'radial-gradient(ellipse at 50% 50%, #00000f 0%, #000008 50%, #000005 100%)',
    6:  'radial-gradient(ellipse at 50% 40%, #1a0808 0%, #0f0404 50%, #060202 100%)',
    7:  'radial-gradient(ellipse at 50% 50%, #0f000f 0%, #080008 50%, #040004 100%)',
    71: 'radial-gradient(ellipse at 50% 80%, #001a2e 0%, #000d18 55%, #000508 100%)',
    72: 'linear-gradient(180deg, #0a0a0a 0%, #060606 55%, #030303 100%)',
    73: 'radial-gradient(ellipse at 50% 50%, #00000d 0%, #000008 50%, #000004 100%)',
    74: 'radial-gradient(ellipse at 50% 70%, #001520 0%, #000b15 55%, #000508 100%)',
    75: 'radial-gradient(ellipse at 50% 25%, #1c0800 0%, #0f0400 55%, #050200 100%)',
    11: 'linear-gradient(180deg, #06000f 0%, #150830 60%, #1a0533 100%)',
    31: 'linear-gradient(180deg, #141008 0%, #0c0904 55%, #060503 100%)',
    32: 'radial-gradient(ellipse at 50% 40%, #0b1c07 0%, #050d03 55%, #020502 100%)',
    33: 'radial-gradient(ellipse at 50% 40%, #0b1c07 0%, #050d03 55%, #020502 100%)',
    41: 'radial-gradient(ellipse at 50% 20%, #1f0800 0%, #0c0300 55%, #030100 100%)',
    21: 'linear-gradient(180deg, #0a0905 0%, #141008 55%, #0d0b06 100%)',
    22: 'radial-gradient(ellipse at 50% 25%, #3d1800 0%, #1f0d00 50%, #0a0400 100%)',
}

export default function GameScene({ roomID, playerDirection, description, playerX, playerY, hasKey, hasRoom62Key, northDoorUnlocked, requirementsMet, enemyX, enemyY, enemyAggravated, battleWon, roomVisited }: Props) {
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

            {roomID === 1 && <>
                <div className="door door-south"></div>
                <div className="door door-north"></div>
                <div className={`door door-east${requirementsMet ? '' : ' door-locked'}`}></div>
                <div className="scene-moon">🌙</div>
            </>}

            {roomID === 11 && <>
                {!hasKey && <div className="scene-key">🗝</div>}
                <div className={`door door-west${hasKey ? '' : ' door-locked'}`}></div>
            </>}

            {roomID === 21 && <>
                <div className="door door-south"></div>
                <div className="door door-west"></div>
            </>}

            {roomID === 2 && <>
                <div className="door door-west"></div>
                <div className="door door-north"></div>
                <div className={`door door-south${requirementsMet ? '' : ' door-locked'}`}></div>
                <div className="scene-tree-left">🌳</div>
                <div className="scene-tree-right">🌳</div>
            </>}

            {roomID === 3 && <>
                <div className="door door-north"></div>
                <div className="door door-south"></div>
                <div className={`door door-west${requirementsMet ? '' : ' door-locked'}`}></div>
                <div className="scene-volcano">🌋</div>
                <div className="scene-embers">🔥</div>
            </>}

            {roomID === 22 && <>
                <div className={`door door-east${battleWon ? '' : ' door-locked'}`}></div>
            </>}

            {roomID === 31 && <>
                <div className="door door-south"></div>
                <div className="door door-east"></div>
                <div className="door door-west"></div>
            </>}

            {roomID === 32 && <>
                <div className={`door door-west${battleWon ? '' : ' door-locked'}`}></div>
                <div className="scene-tree-left">🌳</div>
            </>}

            {roomID === 33 && <>
                <div className={`door door-east${battleWon ? '' : ' door-locked'}`}></div>
                <div className="scene-tree-right">🌳</div>
            </>}

            {roomID === 41 && <>
                <div className={`door door-north${battleWon ? '' : ' door-locked'}`}></div>
                <div className="scene-skull">💀</div>
            </>}

            {roomID === 4 && <>
                <div className={`door door-north${battleWon ? '' : ' door-locked'}`}></div>
                <div className={`door door-east${battleWon ? '' : ' door-locked'}`}></div>
                <div className="scene-fire-left">🔥</div>
                <div className="scene-fire-right">🔥</div>
            </>}

            {roomID === 5 && <>
                <div className="door door-south"></div>
                <div className="door door-east"></div>
                <div className={`door door-west${requirementsMet ? '' : ' door-locked'}`}></div>
                <div className="scene-tree-center">🌳</div>
            </>}

            {roomID === 61 && <>
                <div className="door door-west"></div>
                <div className="door door-south"></div>
            </>}

            {roomID === 62 && <>
                <div className={`door door-east${hasRoom62Key ? '' : ' door-locked'}`}></div>
                <div className={`door door-north${requirementsMet ? '' : ' door-locked'}`}></div>
                {!hasRoom62Key && <div className="scene-key">🗝</div>}
            </>}

            {roomID === 63 && <>
                <div className={`door door-west${battleWon ? '' : ' door-locked'}`}></div>
                <div className="scene-skull">💀</div>
            </>}

            {roomID === 6 && <>
                <div className={`door door-south${battleWon ? '' : ' door-locked'}`}></div>
                <div className={`door door-west${battleWon ? '' : ' door-locked'}`}></div>
                <div className="scene-crown">👑</div>
            </>}

            {roomID === 7 && <>
                <div className={`door door-east${battleWon ? '' : ' door-locked'}`}></div>
                {battleWon && <div className="door door-north"></div>}
            </>}

            {roomID === 71 && <>
                <div className="door door-east"></div>
                <div className="door door-north"></div>
                {!roomVisited && <div className="scene-bucket">🪣</div>}
            </>}

            {roomID === 72 && <>
                <div className="door door-south"></div>
                <div className="door door-west"></div>
                <div className="door door-north"></div>
                <div className="door door-east"></div>
                {!roomVisited && <div className="scene-bucket-left">🪣</div>}
                {!roomVisited && <div className="scene-bucket-right">🪣</div>}
            </>}

            {roomID === 73 && <>
                <div className={`door door-east${battleWon ? '' : ' door-locked'}`}></div>
            </>}

            {roomID === 74 && <>
                <div className="door door-south"></div>
                <div className="door door-north"></div>
                {!roomVisited && <div className="scene-bucket">🪣</div>}
            </>}

            {roomID === 75 && <>
                <div className="door door-west"></div>
                <div className="door door-south"></div>
                <div className="door door-north"></div>
                <div className="scene-throne">🔱</div>
            </>}

            {battleRooms.has(roomID) && !battleWon && (
                <div
                    className={`enemy${enemyAggravated ? ' enemy-aggravated' : ''}`}
                    style={{ left: `${enemyX}%`, top: `${enemyY}%`, transform: 'translate(-50%, -50%)', transition: 'none' }}
                />
            )}

            <div className={`player player-${playerDirection}`} style={playerStyle}>
                <div className="player-eyes">
                    <div className="eye"><div className="pupil"></div></div>
                    <div className="eye"><div className="pupil"></div></div>
                </div>
            </div>
        </div>
    );
}