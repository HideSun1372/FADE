import { useEffect, useState } from 'react';

interface SlotDisplay {
    id: number;
    roomName: string;
    fadePercent: number;
    visitedCount: number;
}

interface TitleScreenProps {
    slots: (SlotDisplay | null)[];
    onNewGame: (slotId: number) => void;
    onLoadGame: (slotId: number) => void;
    onDeleteSave: (slotId: number) => void;
    onCopySave: (fromId: number, toId: number) => void;
    onCredits: () => void;
}

type Mode = 'slots' | 'actions' | 'delete_confirm' | 'copy_target';
type Focus = 'slots' | 'credits_btn';

const ACTIONS = ['Load', 'Delete', 'Copy'];

export default function TitleScreen({ slots, onNewGame, onLoadGame, onDeleteSave, onCopySave, onCredits }: TitleScreenProps) {
    const [slotCursor, setSlotCursor] = useState(0);
    const [mode, setMode] = useState<Mode>('slots');
    const [actionCursor, setActionCursor] = useState(0);
    const [copyCursor, setCopyCursor] = useState(0);
    const [focus, setFocus] = useState<Focus>('slots');

    const copyTargets = [0, 1, 2].filter(i => i !== slotCursor);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            e.preventDefault();

            if (mode === 'slots') {
                if (focus === 'slots') {
                    if (e.key === 'ArrowLeft') {
                        setSlotCursor(prev => (prev + 2) % 3);
                    } else if (e.key === 'ArrowRight') {
                        setSlotCursor(prev => (prev + 1) % 3);
                    } else if (e.key === 'ArrowDown') {
                        setFocus('credits_btn');
                    } else if (e.key.toLowerCase() === 'z') {
                        if (slots[slotCursor] === null) {
                            onNewGame(slotCursor + 1);
                        } else {
                            setActionCursor(0);
                            setMode('actions');
                        }
                    }
                } else if (focus === 'credits_btn') {
                    if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'x') {
                        setFocus('slots');
                    } else if (e.key.toLowerCase() === 'z') {
                        onCredits();
                    }
                }
            } else if (mode === 'actions') {
                if (e.key === 'ArrowLeft') {
                    setActionCursor(prev => (prev + ACTIONS.length - 1) % ACTIONS.length);
                } else if (e.key === 'ArrowRight') {
                    setActionCursor(prev => (prev + 1) % ACTIONS.length);
                } else if (e.key.toLowerCase() === 'z') {
                    const action = ACTIONS[actionCursor];
                    if (action === 'Load') onLoadGame(slotCursor + 1);
                    else if (action === 'Delete') setMode('delete_confirm');
                    else if (action === 'Copy') { setCopyCursor(0); setMode('copy_target'); }
                } else if (e.key.toLowerCase() === 'x') {
                    setMode('slots');
                }
            } else if (mode === 'delete_confirm') {
                if (e.key.toLowerCase() === 'z') {
                    onDeleteSave(slotCursor + 1);
                    setMode('slots');
                } else if (e.key.toLowerCase() === 'x') {
                    setMode('actions');
                }
            } else if (mode === 'copy_target') {
                if (e.key === 'ArrowLeft') {
                    setCopyCursor(prev => (prev + copyTargets.length - 1) % copyTargets.length);
                } else if (e.key === 'ArrowRight') {
                    setCopyCursor(prev => (prev + 1) % copyTargets.length);
                } else if (e.key.toLowerCase() === 'z') {
                    onCopySave(slotCursor + 1, copyTargets[copyCursor] + 1);
                    setMode('slots');
                } else if (e.key.toLowerCase() === 'x') {
                    setMode('actions');
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [mode, focus, slotCursor, actionCursor, copyCursor, slots, copyTargets, onNewGame, onLoadGame, onDeleteSave, onCopySave, onCredits]);

    const renderPrompt = () => {
        if (mode === 'slots') {
            if (focus === 'credits_btn') {
                return <p className="title-prompt">▲: Back  ·  Z: Open Credits</p>;
            }
            const slot = slots[slotCursor];
            return (
                <p className="title-prompt">
                    {slot ? 'Z: Open  ·  ◄►: Switch slot  ·  ▼: Credits' : 'Z: New Game  ·  ◄►: Switch slot  ·  ▼: Credits'}
                </p>
            );
        }
        if (mode === 'actions') {
            return (
                <div className="title-actions">
                    {ACTIONS.map((a, i) => (
                        <span key={a} className={`title-action ${actionCursor === i ? 'title-action-selected' : ''}`}>{a}</span>
                    ))}
                    <span className="title-action-hint">◄►: Select  ·  Z: Confirm  ·  X: Back</span>
                </div>
            );
        }
        if (mode === 'delete_confirm') {
            return (
                <div className="title-confirm">
                    <p>Delete Slot {slotCursor + 1}? This cannot be undone.</p>
                    <p><span className="title-confirm-yes">Z: Delete</span>&nbsp;&nbsp;<span className="title-confirm-no">X: Cancel</span></p>
                </div>
            );
        }
        if (mode === 'copy_target') {
            return (
                <div className="title-actions">
                    <span className="title-action-hint">Copy to: </span>
                    {copyTargets.map((ti, i) => (
                        <span key={ti} className={`title-action ${copyCursor === i ? 'title-action-selected' : ''}`}>Slot {ti + 1}</span>
                    ))}
                    <span className="title-action-hint">◄►: Select  ·  Z: Confirm  ·  X: Cancel</span>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="title-screen">
            <h1 className="title-game-name">FADE</h1>
            <div className="title-slots-row">
                {[0, 1, 2].map(index => {
                    const slot = slots[index];
                    const isSelected = slotCursor === index && mode !== 'copy_target' && focus === 'slots';
                    const isCopyHighlight = mode === 'copy_target' && copyTargets[copyCursor] === index;
                    return (
                        <div
                            key={index}
                            className={`title-slot${isSelected ? ' title-slot-selected' : ''}${isCopyHighlight ? ' title-slot-copy-target' : ''}`}
                        >
                            <div className="title-slot-header">SLOT {index + 1}</div>
                            {slot ? (
                                <div className="title-slot-data">
                                    <p className="title-slot-room">{slot.roomName}</p>
                                    <p className="title-slot-stat">FADE &nbsp;{slot.fadePercent}%</p>
                                    <p className="title-slot-stat">ROOMS &nbsp;{slot.visitedCount} visited</p>
                                </div>
                            ) : (
                                <div className="title-slot-empty">— Empty —</div>
                            )}
                        </div>
                    );
                })}
            </div>
            <div className={`title-credits-btn${focus === 'credits_btn' ? ' title-credits-btn-selected' : ''}`}>
                CREDITS
            </div>
            <div className="title-prompt-area">
                {renderPrompt()}
            </div>
        </div>
    );
}
