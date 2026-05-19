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

export default function Battle({roomID, onBattleEnd, setBattlesWon, waterAmount, setWaterAmount}) {

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
    const [showLoseScreen, setShowLoseScreen] = useState(false);
    const [isEnemyTurn, setIsEnemyTurn] = useState(false);
    const [dodgePhaseActive, setDodgePhaseActive] = useState(false);
    const [enemyTaunt, setEnemyTaunt] = useState<string | null>(null);
    const pendingDefendRef = useRef(false);
    const currentPlayerHPRef = useRef(100);
    currentPlayerHPRef.current = currentPlayerHP;

    const [tutLine, setTutLine] = useState(0);
    const [tutChars, setTutChars] = useState(0);
    const [tutDone, setTutDone] = useState(roomID !== 22);

    const [xHeld, setXHeld] = useState(false);
    const [cHeld, setCHeld] = useState(false);

    function getRandomDamage(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    useEffect(() => {
        const fetchEnemy = async () => {
            const response = await fetch(`http://localhost:8080/api/enemy?EnemyID=${roomID}`);
            const text = await response.text();
            setEnemy(JSON.parse(text));
        };
        fetchEnemy();
    }, []);

    useEffect(() => {
        if (enemy?.health) setCurrentEnemyHP(enemy.health);
    }, [enemy]);

    useEffect(() => {
        if (playerWin) setBattlesWon(prev => new Set([...prev, roomID]));
    }, [playerWin, roomID, setBattlesWon]);

    useEffect(() => {
        if (playerWin) {
            const timer = setTimeout(() => setShowWinScreen(true), 1000);
            return () => clearTimeout(timer);
        }
    }, [playerWin]);

    useEffect(() => {
        if (enemyWin) {
            const timer = setTimeout(() => setShowLoseScreen(true), 1000);
            return () => clearTimeout(timer);
        }
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

            if (tutChars < tutorialDialogue[tutLine].length) {
                setTutChars(tutorialDialogue[tutLine].length);
                return;
            }
            if (tutLine < tutorialDialogue.length - 1) {
                setTutLine(prev => prev + 1);
                setTutChars(0);
            } else {
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
            setDodgePhaseActive(true);
        }
    };

    const handlePhaseEnd = (damageTaken: number) => {
        let d = damageTaken;
        if (pendingDefendRef.current) {
            d = Math.floor(d / 2);
            pendingDefendRef.current = false;
            setIsDefending(false);
        }
        const newHP = Math.max(0, currentPlayerHPRef.current - d);
        setCurrentPlayerHP(newHP);
        if (newHP <= 0) setEnemyWin(true);
        setDodgePhaseActive(false);
        setIsEnemyTurn(false);
    };

    const handleAttack = () => {
        setIsEnemyTurn(true);
        let damage = getRandomDamage(20, 40);
        if (roomID === 6) damage *= 2;
        const newEnemyHP = Math.max(0, currentEnemyHP - damage);
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
        const newEnemyHP = Math.max(0, currentEnemyHP - damage);
        setCurrentEnemyHP(newEnemyHP);
        if (newEnemyHP <= 0) {
            setPlayerWin(true);
        } else {
            beginEnemyRetaliation();
        }
    };

    if (showLoseScreen) {
        return (
            <>
                <h1>{roomID === 7 ? 'Huh. I expected better from you. Pathetic.' : 'The enemy have won!'}</h1>
                <button onClick={() => onBattleEnd(false)}>Go back</button>
            </>
        );
    }

    if (showWinScreen) {
        return (
            <>
                <h1>You have won!</h1>
                <button onClick={() => onBattleEnd(true)}>Go back</button>
            </>
        );
    }

    return (
        <div className="battle-container">
            <div style={{ flex: 1 }}>
                <h1>{enemy?.name}</h1>
                <div className="hp-bars-container">
                    {enemy ? (
                        <div className="hp-bar-enemy">
                            <span>Enemy Health: {currentEnemyHP}/{enemy.health}</span>
                            <div className="hp-fill" style={{ width: `${(currentEnemyHP / enemy.health) * 100}%` }}></div>
                        </div>
                    ) : (
                        <p>Loading enemy...</p>
                    )}
                    <div className="hp-bar-player">
                        <span>Your Health: {currentPlayerHP}/100</span>
                        <div className="hp-fill" style={{ width: `${currentPlayerHP}%` }}></div>
                    </div>
                </div>
                {tutDone && (
                    dodgePhaseActive
                        ? <DodgePhase roomID={roomID} onPhaseEnd={handlePhaseEnd} />
                        : enemyTaunt
                            ? <p style={{ color: '#ff6666', fontStyle: 'italic', padding: '12px 20px' }}>{enemyTaunt}</p>
                            : <>
                                {(roomID !== 6 || waterAmount === 0)
                                    ? <button onClick={handleAttack} disabled={isEnemyTurn || !enemy}>Attack</button>
                                    : <button onClick={handleSplashWater} disabled={isEnemyTurn || waterAmount === 0}>Splash Water</button>
                                }
                                <button onClick={handleDefend} disabled={isEnemyTurn || !enemy}>Defend</button>
                            </>
                )}
            </div>
            {!tutDone && (
                <div className="dialogue-area">
                    <p className="dialogue-text">{tutorialDialogue[tutLine].substring(0, tutChars)}</p>
                </div>
            )}
            <div className="controls-bar">
                <p className="controls-hint">
                    {!tutDone
                        ? 'Z: Next  ·  X: Skip text  ·  C: Auto-advance'
                        : dodgePhaseActive
                            ? 'Arrow Keys: Move your soul  ·  Dodge the bullets!'
                            : enemyTaunt
                                ? '...'
                                : 'Attack / Defend'
                    }
                </p>
            </div>
        </div>
    );
}
