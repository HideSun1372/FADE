import { useEffect, useRef, useState } from 'react'

interface Props {
    dialogue: string[]
    onDone: () => void
}

export default function Intro({ dialogue, onDone }: Props) {
    const [spritesReady, setSpritesReady] = useState(false)
    const [currentLine, setCurrentLine] = useState(0)
    const [visibleChars, setVisibleChars] = useState(0)
    const [dismissed, setDismissed] = useState(false)
    const [xHeld, setXHeld] = useState(false)
    const [cHeld, setCHeld] = useState(false)

    const currentLineRef = useRef(0)
    const visibleCharsRef = useRef(0)
    const dismissedRef = useRef(false)

    currentLineRef.current = currentLine
    visibleCharsRef.current = visibleChars
    dismissedRef.current = dismissed

    useEffect(() => {
        const t = setTimeout(() => setSpritesReady(true), 9000)
        return () => clearTimeout(t)
    }, [])

    useEffect(() => {
        if (dismissed) onDone()
    }, [dismissed])

    useEffect(() => {
        if (!spritesReady || dismissed) return
        const interval = setInterval(() => {
            setVisibleChars(prev => {
                if (prev >= (dialogue[currentLine]?.length ?? 0)) return prev
                return prev + 1
            })
        }, 50)
        return () => clearInterval(interval)
    }, [spritesReady, currentLine, dismissed])

    useEffect(() => {
        if (!cHeld || !spritesReady) return
        const interval = setInterval(() => {
            setCurrentLine(prev => {
                if (prev < dialogue.length - 1) {
                    setVisibleChars(dialogue[prev + 1].length)
                    return prev + 1
                }
                setVisibleChars(dialogue[prev]?.length)
                return prev
            })
        }, 20)
        return () => clearInterval(interval)
    }, [cHeld, spritesReady])

    useEffect(() => {
        if (!cHeld || dismissedRef.current || !spritesReady) return
        if (currentLine === dialogue.length - 1 && visibleChars >= (dialogue[currentLine]?.length ?? 0)) {
            setDismissed(true)
        }
    }, [cHeld, currentLine, visibleChars, spritesReady])

    useEffect(() => {
        if (xHeld && spritesReady) {
            setVisibleChars(dialogue[currentLine]?.length)
        }
    }, [xHeld, currentLine, spritesReady])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!spritesReady) return
            const key = e.key.toLowerCase()
            if (key === 'z') {
                if (dismissedRef.current) return
                if (visibleCharsRef.current < (dialogue[currentLineRef.current]?.length ?? 0)) return
                if (currentLineRef.current < dialogue.length - 1) {
                    const next = currentLineRef.current + 1
                    setCurrentLine(next)
                    setVisibleChars(0)
                } else {
                    setDismissed(true)
                }
            } else if (key === 'x') {
                setXHeld(true)
                setVisibleChars(dialogue[currentLineRef.current]?.length)
            } else if (key === 'c') {
                setCHeld(true)
            }
        }
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'x') setXHeld(false)
            if (e.key.toLowerCase() === 'c') setCHeld(false)
        }
        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [spritesReady, dialogue])

    return (
        <div className="intro-screen">
            <div className="intro-sprite-area">
                <div className="intro-figure" />
                <div className={`intro-player${spritesReady ? ' intro-player-looking-left' : ''}`}>
                    <div className="player-eyes">
                        <div className="eye"><div className="pupil" /></div>
                        <div className="eye"><div className="pupil" /></div>
                    </div>
                </div>
            </div>
            {spritesReady && !dismissed && (
                <div className="dialogue-area">
                    <p className="dialogue-text">
                        {dialogue[currentLine]?.substring(0, visibleChars)}
                    </p>
                </div>
            )}
            {spritesReady && !dismissed && (
                <div className="controls-bar">
                    <p className="controls-hint">Z: Next &nbsp;·&nbsp; X: Skip text &nbsp;·&nbsp; C: Auto-advance</p>
                </div>
            )}
        </div>
    )
}
