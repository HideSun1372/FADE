import { useEffect, useState, useRef } from "react"

export default function Battle({roomID, setIsBattling, setBattlesWon, waterAmount, setWaterAmount}) {

    const [enemy, setEnemy] = useState<any>(null);
    const [currentEnemyHP, setCurrentEnemyHP] = useState(0);
    const [currentPlayerHP, setCurrentPlayerHP] = useState(100);
    const [playerWin, setPlayerWin] = useState(false);
    const [enemyWin, setEnemyWin] = useState(false);
    const [isDefending, setIsDefending] = useState(false);
    const [showWinScreen, setShowWinScreen] = useState(false);
    const [showLoseScreen, setShowLoseScreen] = useState(false);
    const [isEnemyTurn, setIsEnemyTurn] = useState(false);
    const hasDodgedRef = useRef(false);
    const [canDodge, setCanDodge] = useState(false);

    function getRandomDamage(min: number, max: number): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    useEffect(() => {
        const fetchEnemy = async() => {
            const response = await fetch (`http://localhost:8080/api/enemy?EnemyID=${roomID}`);
            const text = await response.text();
            const enemy = JSON.parse(text)
            setEnemy(enemy);
        }
        fetchEnemy();
    }, [])

    useEffect(() => {
        if (enemy?.health) {
            setCurrentEnemyHP(enemy.health);
        }
    }, [enemy]);

    useEffect(() => {
        if (playerWin) {
            setBattlesWon(prev => new Set([...prev, roomID]));
        }
    }, [playerWin, roomID, setBattlesWon])

    useEffect(() => {
        if (playerWin) {
            const timer = setTimeout(() => {
                setShowWinScreen(true);
            }, 1000)
            return () => clearTimeout(timer);
        }
    }, [playerWin])

    useEffect(() => {
        if (enemyWin) {
            const timer = setTimeout(() => {
                setShowLoseScreen(true);
            }, 1000)
            return () => clearTimeout(timer);
        }
    }, [enemyWin])

    const handleDodge = () => {
        hasDodgedRef.current = true;
    }

    const handleAttack = () => {
        setIsEnemyTurn(true)

        let damage = getRandomDamage(20, 40);

        if (roomID === 6) {
            damage *= 2;
        }

        setCurrentEnemyHP(prev => {
            const newHP = Math.max(0, prev - damage);
            if (newHP <= 0) {
                setPlayerWin(true);
            }
            return newHP;
        });

        setTimeout(() => {
            setCanDodge(true);
            setTimeout(() => {
                if(!hasDodgedRef.current) {
                    handleEnemyAttack()
                }
            }, 500)
        }, getRandomDamage(1000, 2500))

        setTimeout(() => {
            hasDodgedRef.current = false;
            setIsEnemyTurn(false);
            setCanDodge(false);
        }, 3000);
    };

    const handleEnemyAttack = () => {
        let enemyDamage = getRandomDamage(10, 20);

        if (isDefending) {
            enemyDamage *= 0.5;
            setIsDefending(false)
        }

        setCurrentPlayerHP(prev => {
            const newHP = Math.max(0, prev - enemyDamage);
            if (newHP <= 0) {
                setEnemyWin(true)
            }
            return newHP;
        });

        setIsEnemyTurn(false);
    }

    const handleDefend = () => {
        setIsDefending(true);
        setIsEnemyTurn(true);
        setTimeout(() => {
            setCanDodge(true);
            setTimeout(() => {
                if(!hasDodgedRef.current) {
                    handleEnemyAttack()
                }
            }, 500)
        }, getRandomDamage(1000, 2500))

        setTimeout(() => {
            hasDodgedRef.current = false;
            setIsEnemyTurn(false);
            setCanDodge(false);
        }, 3000);
    }

    const handleSplashWater = () => {
        setIsEnemyTurn(true);
        setWaterAmount(prev => prev - 1);

        let damage = getRandomDamage(50, 90);

        setCurrentEnemyHP(prev => {
            const newHP = Math.max(0, prev - damage);
            if (newHP <= 0) {
                setPlayerWin(true);
            }
            return newHP;
        });

        setTimeout(() => {
            setCanDodge(true);
            setTimeout(() => {
                if(!hasDodgedRef.current) {
                    handleEnemyAttack()
                }
            }, 500)
        }, getRandomDamage(1000, 2500))

        setTimeout(() => {
            hasDodgedRef.current = false;
            setIsEnemyTurn(false);
            setCanDodge(false);
        }, 3000);
    }

    if (showLoseScreen) {
        return (
            <>
                <h1>The enemy have won!</h1>
                <button onClick = {() => {setIsBattling(false)}}>Go back</button>
            </>
        )
    } else if (showWinScreen) {
        return (
            <>
                <h1>You have won!</h1>
                <button onClick = {() => {setIsBattling(false)}}>Go back</button>
            </>
        )
    } else {
        return (
            <div className="battle-container">
                <h1>{enemy?.name}</h1>
                <div className="hp-bars-container">
                    {enemy ? (
                        <div className="hp-bar-enemy">
                            <span>Enemy Health: {currentEnemyHP}/{enemy.health}</span>
                            <div className="hp-fill" style={{width: `${(currentEnemyHP / enemy.health) * 100}%`}}></div>
                        </div>
                    ) : (
                        <p>Loading enemy...</p>
                    )}
                    <div className="hp-bar-player">
                        <span>Your Health: {currentPlayerHP}/100</span>
                        <div className="hp-fill" style={{width: `${currentPlayerHP}%`}}></div>
                    </div>
                </div>
                {canDodge && <p>Dodge Now!</p>}

                {(roomID !== 6 || waterAmount === 0) ? <button onClick = {() => handleAttack()} disabled={isEnemyTurn}>Attack</button> : <button onClick = {() => handleSplashWater()} disabled={isEnemyTurn || waterAmount === 0}>Splash Water</button>}
                <button onClick = {() => handleDefend()} disabled={isEnemyTurn}>Defend</button>
                <button onClick = {() => handleDodge()} disabled={!canDodge}>Dodge</button>
            </div>
        )
    }
}