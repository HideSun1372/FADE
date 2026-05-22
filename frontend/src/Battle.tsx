import { useEffect, useState, useRef } from "react"
import DodgePhase from "./DodgePhase"

const tutorialDialogue = [
    "Welcome to your first battle! Let me explain how this works.",
    "Attack: Deals 20-40 damage to the enemy. Your main move every turn.",
    "Defend: Halves all damage you receive during the enemy's next attack.",
    "After you act, the enemy fires projectiles at you.",
    "A battle box appears — use the Arrow Keys to move your soul and dodge the bullets!",
    "Your soul is that little red heart. Take as few hits as possible to stay healthy.",
    "That's everything. Now go get 'em!",
];

const backgrounds: Record<number, string> = {
    0:  'radial-gradient(ellipse at 50% 40%, #3b1f6b 0%, #1a0533 50%, #06000f 100%)',
    1:  'radial-gradient(ellipse at 50% 85%, #0d2e14 0%, #061a0b 45%, #020a10 100%)',
    2:  'radial-gradient(ellipse at 50% 60%, #0e1f0a 0%, #060d04 55%, #020502 100%)',
    3:  'radial-gradient(ellipse at 50% 80%, #3a1000 0%, #1c0500 55%, #080200 100%)',
    4:  'radial-gradient(ellipse at 50% 95%, #6e1e00 0%, #320a00 50%, #0f0200 100%)',
    5:  'radial-gradient(ellipse at 35% 55%, #0f1d0b 0%, #0c0800 50%, #080200 100%)',
    6:  'radial-gradient(ellipse at 50% 40%, #1a0808 0%, #0f0404 50%, #060202 100%)',
    7:  'radial-gradient(ellipse at 50% 50%, #0f000f 0%, #080008 50%, #040004 100%)',
    11: 'linear-gradient(180deg, #06000f 0%, #150830 60%, #1a0533 100%)',
    21: 'linear-gradient(180deg, #0a0905 0%, #141008 55%, #0d0b06 100%)',
    22: 'radial-gradient(ellipse at 50% 25%, #3d1800 0%, #1f0d00 50%, #0a0400 100%)',
    31: 'linear-gradient(180deg, #141008 0%, #0c0904 55%, #060503 100%)',
    32: 'radial-gradient(ellipse at 50% 40%, #0b1c07 0%, #050d03 55%, #020502 100%)',
    33: 'radial-gradient(ellipse at 50% 40%, #0b1c07 0%, #050d03 55%, #020502 100%)',
    41: 'radial-gradient(ellipse at 50% 20%, #1f0800 0%, #0c0300 55%, #030100 100%)',
    61: 'linear-gradient(180deg, #080606 0%, #050404 55%, #030303 100%)',
    62: 'radial-gradient(ellipse at 50% 50%, #100010 0%, #070008 55%, #030004 100%)',
    63: 'radial-gradient(ellipse at 50% 50%, #00000f 0%, #000008 50%, #000005 100%)',
    71: 'radial-gradient(ellipse at 50% 80%, #001a2e 0%, #000d18 55%, #000508 100%)',
    72: 'linear-gradient(180deg, #0a0a0a 0%, #060606 55%, #030303 100%)',
    73: 'radial-gradient(ellipse at 50% 50%, #00000d 0%, #000008 50%, #000004 100%)',
    74: 'radial-gradient(ellipse at 50% 70%, #001520 0%, #000b15 55%, #000508 100%)',
    75: 'radial-gradient(ellipse at 50% 25%, #1c0800 0%, #0f0400 55%, #050200 100%)',
};

export default function Battle({roomID, onBattleEnd, setBattlesWon, waterAmount, setWaterAmount, playerDirection}) {

    const room7Taunts = [
        "You shall not escape my journey to rule over this land.",
        "Stop trying, it's futile.",
        "I am now the strongest being here! Fighting me is pointless!",
        "Once I defeat you, I shall now be the one pulling the strings!",
        "So if you give up now, I'll still let you be my right-hand man!",
    ];

    const [enemy, setEnemy] = useState<any>(null);
    const [currentEnemyHP, setCurrentEnemyHP] = useState(0);
    const [currentPlayerHP, setCurrentPlayerHP] = useState(100);
    const [playerWin, setPlayerWin] = useState(false);
    const [enemyWin, setEnemyWin] = useState(false);
    const [isDefending, setIsDefending] = useState(false);
    const [showWinScreen, setShowWinScreen] = useState(false);
    const [showWinButton, setShowWinButton] = useState(false);
    const [gameOverPhase, setGameOverPhase] = useState<null | 'frozen' | 'black' | 'heading' | 'dialogue' | 'done'>(null);
    const [goLine, setGoLine] = useState(0);
    const [goChars, setGoChars] = useState(0);
    const [isEnemyTurn, setIsEnemyTurn] = useState(false);
    const [dodgePhaseActive, setDodgePhaseActive] = useState(false);
    const [enemyTaunt, setEnemyTaunt] = useState<string | null>(null);
    const [battlePhase, setBattlePhase] = useState<'entering' | 'idle'>('entering');
    const pendingDefendRef = useRef(false);
    const currentPlayerHPRef = useRef(100);
    currentPlayerHPRef.current = currentPlayerHP;
    const currentEnemyHPRef = useRef(0);
    currentEnemyHPRef.current = currentEnemyHP;
    const gameOverPhaseRef = useRef<null | 'frozen' | 'black' | 'heading' | 'dialogue' | 'done'>(null);
    gameOverPhaseRef.current = gameOverPhase;
    const goLineRef = useRef(0);
    goLineRef.current = goLine;
    const goCharsRef = useRef(0);
    goCharsRef.current = goChars;

    const gameOverDialogue =
        roomID === 7 ? ["Pathetic mortal.", "I expected better from you.", "Try harder next time."] :
        roomID === 6 ? ["You're close to the end!", "Are you going to fall that easily?"] :
                       ["I'm counting on you!", "Don't give up!"];

    const [tutLine, setTutLine] = useState(0);
    const [tutChars, setTutChars] = useState(0);
    const [tutDone, setTutDone] = useState(roomID !== 22);

    const [xHeld, setXHeld] = useState(false);
    const [cHeld, setCHeld] = useState(false);
    const [selectedAction, setSelectedAction] = useState(0);
    const selectedActionRef = useRef(0);
    selectedActionRef.current = selectedAction;

    function getRandomDamage(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    useEffect(() => {
        const t = setTimeout(() => setBattlePhase('idle'), 50);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        const fetchEnemy = async () => {
            const response = await fetch(`http://localhost:8080/api/enemy?EnemyID=${roomID}`);
            const text = await response.text();
            const parsed = JSON.parse(text);
            setEnemy(parsed);
            if (parsed?.health) setCurrentEnemyHP(parsed.health);
        };
        fetchEnemy();
    }, []);

    useEffect(() => {
        if (playerWin) setBattlesWon(prev => new Set([...prev, roomID]));
    }, [playerWin, roomID, setBattlesWon]);

    useEffect(() => {
        if (!playerWin) return;
        const t1 = setTimeout(() => setShowWinScreen(true), 1000);
        const t2 = setTimeout(() => setShowWinButton(true), 2500);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [playerWin]);

    useEffect(() => {
        if (!enemyWin) return;
        setGameOverPhase('frozen');
        const t1 = setTimeout(() => setGameOverPhase('black'), 3000);
        const t2 = setTimeout(() => setGameOverPhase('heading'), 5000);
        const t3 = setTimeout(() => setGameOverPhase('dialogue'), 6500);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [enemyWin]);

    useEffect(() => {
        if (tutDone) return;
        const interval = setInterval(() => {
            setTutChars(prev => prev >= tutorialDialogue[tutLine].length ? prev : prev + 1);
        }, 40);
        return () => clearInterval(interval);
    }, [tutLine, tutDone]);

    useEffect(() => {
        if (tutDone) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();

            if (key === 'x') {
                setXHeld(true);
                setTutChars(tutorialDialogue[tutLine].length);
                return;
            }
            if (key === 'c') { setCHeld(true); return; }
            if (key !== 'z') return;

            if (tutLine < tutorialDialogue.length - 1 && tutChars >= tutorialDialogue[tutLine].length) {
                setTutLine(prev => prev + 1);
                setTutChars(0);
            } else if (tutLine >= tutorialDialogue.length - 1){
                setTutDone(true);
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            if (key === 'x') setXHeld(false);
            if (key === 'c') setCHeld(false);
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [tutDone, tutLine, tutChars]);

    useEffect(() => {
        if (!xHeld || tutDone) return;
        setTutChars(tutorialDialogue[tutLine].length);
    }, [xHeld, tutLine]);

    useEffect(() => {
        if (!cHeld || tutDone) return;
        const interval = setInterval(() => {
            setTutLine(prev => {
                if (prev < tutorialDialogue.length - 1) {
                    setTutChars(tutorialDialogue[prev + 1].length);
                    return prev + 1;
                }
                setTutChars(tutorialDialogue[prev].length);
                return prev;
            });
        }, 20);
        return () => clearInterval(interval);
    }, [cHeld, tutDone]);

    useEffect(() => {
        if (!cHeld || tutDone) return;
        if (tutLine === tutorialDialogue.length - 1 && tutChars >= tutorialDialogue[tutLine].length) {
            setTutDone(true);
        }
    }, [cHeld, tutLine, tutChars, tutDone]);

    const beginEnemyRetaliation = () => {
        if (roomID === 7) {
            const taunt = room7Taunts[Math.floor(Math.random() * room7Taunts.length)];
            setEnemyTaunt(taunt);
            setTimeout(() => { setEnemyTaunt(null); setDodgePhaseActive(true); }, 1800);
        } else {
            setTimeout(() => setDodgePhaseActive(true), 1000);
        }
    };

    useEffect(() => {
        if (!showWinScreen || !showWinButton) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'z') onBattleEnd(true);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [showWinScreen, showWinButton]);

    useEffect(() => {
        if (!tutDone || dodgePhaseActive || isEnemyTurn || !!enemyTaunt || showWinScreen || gameOverPhase !== null || !enemy) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                setSelectedAction(prev => prev === 0 ? 1 : 0);
            } else if (e.key.toLowerCase() === 'z') {
                if (selectedActionRef.current === 0) {
                    if (roomID !== 6 || waterAmount === 0) handleAttack();
                    else handleSplashWater();
                } else {
                    handleDefend();
                }
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [tutDone, dodgePhaseActive, isEnemyTurn, enemyTaunt, showWinScreen, gameOverPhase, roomID, waterAmount, enemy]);

    useEffect(() => {
        if (gameOverPhase !== 'dialogue') return;
        const interval = setInterval(() => {
            setGoChars(prev => prev >= gameOverDialogue[goLine].length ? prev : prev + 1);
        }, 40);
        return () => clearInterval(interval);
    }, [gameOverPhase, goLine]);

    useEffect(() => {
        if (gameOverPhase !== 'dialogue' && gameOverPhase !== 'done') return;
        const handler = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() !== 'z') return;
            if (gameOverPhaseRef.current === 'done') { onBattleEnd(false); return; }
            const line = goLineRef.current;
            const chars = goCharsRef.current;
            if (chars < gameOverDialogue[line].length) return;
            if (line < gameOverDialogue.length - 1) {
                setGoLine(line + 1);
                setGoChars(0);
            } else {
                setGameOverPhase('done');
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [gameOverPhase]);

    const handleDodgeDamage = (dmg: number) => {
        const d = pendingDefendRef.current ? Math.floor(dmg / 2) : dmg;
        const newHP = Math.max(0, currentPlayerHPRef.current - d);
        currentPlayerHPRef.current = newHP;
        setCurrentPlayerHP(newHP);
        if (newHP <= 0) {
            if (pendingDefendRef.current) { pendingDefendRef.current = false; setIsDefending(false); }
            setEnemyWin(true);
        }
    };

    const handlePhaseEnd = (_damageTaken: number) => {
        if (pendingDefendRef.current) { pendingDefendRef.current = false; setIsDefending(false); }
        setDodgePhaseActive(false);
        setIsEnemyTurn(false);
    };

    const handleAttack = () => {
        setIsEnemyTurn(true);
        let damage = getRandomDamage(20, 40);
        if (roomID === 6) damage *= 2;
        const newEnemyHP = Math.max(0, currentEnemyHPRef.current - damage);
        setCurrentEnemyHP(newEnemyHP);
        if (newEnemyHP <= 0) {
            setPlayerWin(true);
        } else {
            beginEnemyRetaliation();
        }
    };

    const handleDefend = () => {
        setIsDefending(true);
        pendingDefendRef.current = true;
        setIsEnemyTurn(true);
        beginEnemyRetaliation();
    };

    const handleSplashWater = () => {
        setIsEnemyTurn(true);
        setWaterAmount(prev => prev - 1);
        const damage = getRandomDamage(50, 90);
        const newEnemyHP = Math.max(0, currentEnemyHPRef.current - damage);
        setCurrentEnemyHP(newEnemyHP);
        if (newEnemyHP <= 0) {
            setPlayerWin(true);
        } else {
            beginEnemyRetaliation();
        }
    };

    const roomBg = backgrounds[roomID] ?? 'radial-gradient(ellipse at center, #111, #000)';
    const dir = playerDirection ?? 'south';

    return (
        <div className="battle-screen" style={{ background: roomBg }}>

            <div className="battle-sprites-area" style={{ opacity: dodgePhaseActive ? 0.15 : 1 }}>
                <div className={`battle-sprite-slot left ${battlePhase}`}>
                    <div className="enemy" />
                </div>
                <div className={`battle-sprite-slot right ${battlePhase}`}>
                    <div className={`player player-${dir}`}>
                        <div className="player-eyes">
                            <div className="eye"><div className="pupil"></div></div>
                            <div className="eye"><div className="pupil"></div></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="battle-panel" style={{ opacity: dodgePhaseActive ? 0.15 : 1 }}>
                <p className="battle-enemy-name">{enemy?.name ?? ''}</p>

                <div style={{ width: '100%' }}>
                    <div className="hp-bars-container">
                        {enemy ? (
                            <div className="hp-bar-enemy">
                                <span>Enemy HP: {currentEnemyHP}/{enemy.health}</span>
                                <div className="hp-fill" style={{ width: `${(currentEnemyHP / enemy.health) * 100}%` }}></div>
                            </div>
                        ) : (
                            <p style={{ color: '#888', fontSize: '12px' }}>Loading...</p>
                        )}
                        <div className="hp-bar-player">
                            <span>Your HP: {currentPlayerHP}/100</span>
                            <div className="hp-fill" style={{ width: `${currentPlayerHP}%` }}></div>
                        </div>
                    </div>
                </div>

                {!tutDone && (
                    <div className="dialogue-area" style={{ width: '100%' }}>
                        <p className="dialogue-text">{tutorialDialogue[tutLine].substring(0, tutChars)}</p>
                    </div>
                )}

                {tutDone && !dodgePhaseActive && (
                    enemyTaunt
                        ? <p style={{ color: '#ff6666', fontStyle: 'italic', padding: '8px 0' }}>{enemyTaunt}</p>
                        : <div className="battle-actions">
                            {(roomID !== 6 || waterAmount === 0)
                                ? <button onClick={handleAttack} disabled={isEnemyTurn || !enemy || enemyWin} className={selectedAction === 0 ? 'battle-action-selected' : ''}>Attack</button>
                                : <button onClick={handleSplashWater} disabled={isEnemyTurn || waterAmount === 0 || enemyWin} className={selectedAction === 0 ? 'battle-action-selected' : ''}>Splash Water</button>
                            }
                            <button onClick={handleDefend} disabled={isEnemyTurn || !enemy || enemyWin} className={selectedAction === 1 ? 'battle-action-selected' : ''}>Defend</button>
                          </div>
                )}

                <div className="controls-bar" style={{ width: '100%' }}>
                    <p className="controls-hint">
                        {!tutDone
                            ? 'Z: Next  ·  X: Skip text  ·  C: Auto-advance'
                            : enemyTaunt
                                ? '...'
                                : '← →: Select  ·  Z: Confirm'
                        }
                    </p>
                </div>
            </div>

            {dodgePhaseActive && (
                <div className="dodge-overlay">
                    <div className="dodge-overlay-content">
                        <div className="hp-bars-container" style={{ padding: '0 0 8px' }}>
                            {enemy && (
                                <div className="hp-bar-enemy">
                                    <span>Enemy HP: {currentEnemyHP}/{enemy.health}</span>
                                    <div className="hp-fill" style={{ width: `${(currentEnemyHP / enemy.health) * 100}%` }}></div>
                                </div>
                            )}
                            <div className="hp-bar-player">
                                <span>Your HP: {currentPlayerHP}/100</span>
                                <div className="hp-fill" style={{ width: `${currentPlayerHP}%` }}></div>
                            </div>
                        </div>
                        <DodgePhase roomID={roomID} onPhaseEnd={handlePhaseEnd} onDamage={handleDodgeDamage} frozen={enemyWin} />
                        <p className="controls-hint" style={{ marginTop: '6px', textAlign: 'center' }}>
                            Arrow Keys: Move your soul  ·  Dodge the bullets!
                        </p>
                    </div>
                </div>
            )}

            {showWinScreen && (
                <div className="gameover-overlay">
                    <h1 className="gameover-heading">Victory!</h1>
                    {showWinButton && (
                        <>
                            <button onClick={() => onBattleEnd(true)}>Go back</button>
                            <p style={{ fontSize: '11px', color: '#555', marginTop: '-20px' }}>Z: Go back</p>
                        </>
                    )}
                </div>
            )}

            {gameOverPhase !== null && gameOverPhase !== 'frozen' && (
                <div className="gameover-overlay">
                    {gameOverPhase !== 'black' && (
                        <h1 className="gameover-heading">GAME OVER</h1>
                    )}
                    {(gameOverPhase === 'dialogue' || gameOverPhase === 'done') && (
                        <div className="gameover-dialogue-box">
                            <p className="gameover-dialogue-text">
                                {gameOverDialogue[goLine].substring(0, goChars)}
                            </p>
                            {gameOverPhase === 'dialogue' && goChars >= gameOverDialogue[goLine].length && (
                                <p className="gameover-hint">Z: Next</p>
                            )}
                        </div>
                    )}
                    {gameOverPhase === 'done' && (
                        <>
                            <button onClick={() => onBattleEnd(false)}>Go back</button>
                            <p style={{ fontSize: '11px', color: '#555', marginTop: '-20px' }}>Z: Go back</p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}