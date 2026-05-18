import { useEffect, useState, useRef } from 'react'
import './App.css'
import type { Directions } from './types';
import Battle from './Battle'
import GameScene from './GameScene'

const SPEED = 0.45;

function App() {
    const [visibleChars, setVisibleChars] = useState(0);
    const [roomID, setRoomID] = useState(0);
    const [clearedRooms, setClearedRooms] = useState(new Set<number>());
    const [currentLine, setCurrentLine] = useState(0);
    const requirementRooms = new Set([22, 41, 62, 63]); // 11 removed: key is picked up manually now
    const [isBattling, setIsBattling] = useState(false);
    const [visited, setVisited] = useState(new Set<number>([0]));
    const battleRooms = new Set([4, 6, 22, 32, 33, 41, 63, 7, 73]);
    const [battlesWon, setBattlesWon] = useState(new Set<number>());
    const [fadePercent, setFadePercent] = useState(100);
    const [waterAmount, setWaterAmount] = useState(0);
    const [playerDirection, setPlayerDirection] = useState('south');
    const [playerX, setPlayerX] = useState(50);
    const [playerY, setPlayerY] = useState(50);
    const [xHeld, setXHeld] = useState(false);
    const [cHeld, setCHeld] = useState(false);
    const [dialogueDismissed, setDialogueDismissed] = useState(false);
    const [hasKey, setHasKey] = useState(false);
    const [northDoorUnlocked, setNorthDoorUnlocked] = useState(false);
    // Temporary messages (locked door, key pickup) that overlay normal dialogue
    const [tempDialogue, setTempDialogue] = useState<string[] | null>(null);

    // Room 0 north door uses northDoorUnlocked; all other rooms use clearedRooms
    const requirementsMet = roomID === 0 ? northDoorUnlocked : clearedRooms.has(roomID);

    // Refs for the game loop (avoid stale closures in rAF callback)
    const keysHeldRef = useRef(new Set<string>());
    const playerXRef = useRef(50);
    const playerYRef = useRef(50);
    const isRoomTransitioningRef = useRef(false);
    const triggerRoomTransitionRef = useRef<(dir: Directions) => Promise<void>>(async () => {});
    const isDialogueCompleteRef = useRef(false);
    const hasKeyRef = useRef(false);
    const northDoorUnlockedRef = useRef(false);
    const roomIDRef = useRef(0);

    // Keep refs in sync with state on every render
    hasKeyRef.current = hasKey;
    northDoorUnlockedRef.current = northDoorUnlocked;
    roomIDRef.current = roomID;

    const roomNames: Record<number, string> = {
        0: 'The Void',
        1: 'The New World',
        2: 'The Haunted Fields',
        3: 'The Volcanic Wastelands',
        4: 'The Volcanic Pass',
        5: 'The Misplaced Tree',
        6: "The King's Dungeon",
        7: 'The Final Confrontation',
        11: 'The Hidden Chamber',
        21: 'The Empty Path',
        22: 'The Goblin Den',
        31: 'The Crossroads',
        32: 'The East Path',
        33: 'The West Path',
        41: 'The Dark Chamber',
        61: 'The Long Corridor',
        62: 'The Locked Room',
        63: 'The Void Chamber',
        71: 'The Water Room',
        72: 'The Three-Way Split',
        73: 'The Dead End',
        74: 'The Last Water',
        75: "The King's Approach",
    };

    const allDialogue: Record<number, string[]> = {
        0: ["Hello there, fellow player.", "You are fading away.", "I know it sounds crazy, but you have to trust me.", "I will be your guide on your new adventure.", "I will reveal more information as you continue on your journey.", "But first, to exit this room, you need a key! Walk into the east door to find it.", "Try to find which one."],
        1: ["Welcome to the new world!", "In this world, don't trust anyone! Or else they will come back and betray you!", "Now you might be wondering, why trust me? I am your only trusted tour guide on this adventure.", "Here, it is kill or be killed. No one cares about your feelings.", "So you have to gain the upper hand in this world! Don't seem weak!", "Be careful to watch your fading progress bar on the top right, it will tell you how long you have before you will fully fade away."],
        2: ['This place is called "The Haunted Fields". Be careful! As beautiful as the grass may seem, they are dangerous.', "Make sure you are not excessively coming into contact with them. They get aggressive once in a while.", "If you get tired, do not loiter out in the open! Sometimes, the clouds above gets angry if you are just staying in one spot.", "If you do wish to rest, you can do so under a tree where the clouds does not have a vision of you.", "That's basically all you have to know about The Haunted Fields. Stay safe, I'm on your side."],
        3: ["Woo! Finally got out of there! But here is where your adventures become harder.", "Welcome to the Volcanic Wastelands!", "In contrast to the cool Grasslands, the Volcano will incinerate you if you aren't careful!", "Ready? Let's explore!"],
        4: ["What? You feel like someone is watching us?", "To be honest? Me too! We really need to investigate this!", "But we need to continue walking.", "I feel like we are really close to the treasure that we are going to find!", "Let's go! Final stretch!", "Wait, who's that? Battle?", "Oh no! That's the boss! Prepare for combat!!!"],
        5: ["Woo! The boss was tough!", "But we need not loiter! This is what you've been trying to achieve all along, right?", "To find the ultimate treasure of this universe?", "Heh, are you saying you don't want to continue anymore?", "Hey! Let's stop joking! Here's the dungeon! The King of this realm should be in there!"],
        6: ["Wow, he sure looks menacing! Suitable for the king!", "Anyways, I know his true weakness! He hates water.", "That means if you countlessly attack him with water, he'll have no escape!", "Conveniently, you just have some water from those previous subrooms.", "Let's defeat him!"],
        7: ["You shall not escape my journey to rule over this land.", "Stop trying, it's futile.", "Did you hear me? I am now the strongest being here! Fighting me is pointless! You'll always lose, over and over again.", "Once I defeat you, I shall now be the one pulling the strings!", "So if you give up now, I'll still let you be my right-hand man for helping me achieve this position!"],
        11: ["Woah, a key! I wonder what that could be for!"],
        21: ["Nothing impressive here, move on."],
        22: ["A goblin? Welp, it's time to meet your first battle, my friend!", "Prepare for combat!!!"],
        31: ["Hmm, an intersection... You decide the way, this is not what I remembered."],
        32: ["Another goblin? Come on, you know how to beat it already!"],
        33: ["Another goblin? Come on, you know how to beat it already!"],
        41: ["Alright, new enemy. Prepare for combat!!!"],
        61: ["Nothing impressive here, move on."],
        62: ["Wow, a key!", "Uh oh, did I hear a door shut?", "We can't get out!", "Just progress."],
        63: ["Alright, another enemy. You understand this already!", "Prepare for combat!!!"],
        71: ["Woah, water!", "I suspect there's more where that came from. Let's go!"],
        72: ["A three way intersection?!", "Even I have no idea where to go!", "Go anywhere and find out where it leads to!"],
        73: ["Welp, nothing here except a stupid VoidBringer.", "Prepare for combat!!!"],
        74: ["Alright, one route. let's go!"],
        75: ["I have a feeling that we are close to the end. Do not let your guard down! Anyone could still be here!", "I can already hear the king."]
    };

    const rooms: Record<number, { description: string; parentRoom: number | null }> = {
        0: { description: "This is a dream. Is it? Why do you see someone coming towards you? Is someone there?", parentRoom: null },
        1: { description: "Whoa, what is this new world? Guess the odd figure really meant what he meant!", parentRoom: null },
        2: { description: "The grassy plains seems to emit a sense of black and white, even though they are supposed to be green.", parentRoom: null },
        3: { description: "After exiting out of the grassy plains, you arrive at a volcanic mountain. You fade some more.", parentRoom: null },
        4: { description: "As you continue walking through the volcanic wastelands, you begin to feel a sense that someone is watching you.", parentRoom: null },
        5: { description: "After defeating the great boss of the volcanic wastelands, you take a break under the shade of a seemingly misplaced tree.", parentRoom: null },
        6: { description: "You enter a dungeon to face off against the ruler of this realm and find the final treasure of this mysterious land.", parentRoom: null },
        7: { description: "What a plot twist. This is it. The final battle of this realm. Are you going to fail or are you going to come out on top after all the efforts you took to get here?", parentRoom: null },
        11: { description: "Woah! There's a key here!", parentRoom: 0 },
        21: { description: "Nothing here, progress some more.", parentRoom: null },
        22: { description: "Woah! A goblin! Where did this guy come from?", parentRoom: 1 },
        31: { description: "An intersection of east and west. Where shall you go?", parentRoom: null },
        32: { description: "Another goblin! You're unlucky today, my friend!", parentRoom: 2 },
        33: { description: "Another goblin! You're unlucky today, my friend!", parentRoom: 2 },
        41: { description: "A new enemy for once.", parentRoom: 3 },
        61: { description: "Nothing here, progress some more.", parentRoom: null },
        62: { description: "There's a key on the counter. The door locks behind you.", parentRoom: 5 },
        63: { description: "An enemy approaches you. Prepare for battle!", parentRoom: 62 },
        71: { description: "You feel a strange feeling. You're not sure what that's about, but you're close to the end. A bucket of water lies on the table.", parentRoom: null },
        72: { description: "You walk into a three-way intersection with 2 buckets of water on the counter.", parentRoom: null },
        73: { description: "Congratulations: You ran into the only room that wastes your time with an enemy!!", parentRoom: null },
        74: { description: "Nothing special here except for the water on the table.", parentRoom: null },
        75: { description: "The big room seemingly feels colder than ever, the king's throne lies just ahead.", parentRoom: null },
    };

    const entryPositions: Record<Directions, { x: number; y: number }> = {
        EAST:  { x: 12, y: 50 },
        WEST:  { x: 88, y: 50 },
        NORTH: { x: 50, y: 88 },
        SOUTH: { x: 50, y: 12 },
    };

    // tempDialogue takes over from the room's normal dialogue when active
    const activeDialogue = tempDialogue ?? allDialogue[roomID];

    // Dialogue is only "complete" when the player explicitly dismisses it with Z
    const isDialogueComplete = dialogueDismissed;
    isDialogueCompleteRef.current = dialogueDismissed;

    // Rebuild transition function when room state changes so it always closes over fresh values
    useEffect(() => {
        triggerRoomTransitionRef.current = async (direction: Directions) => {
            if (isRoomTransitioningRef.current) return;
            if (!isDialogueCompleteRef.current) return;

            isRoomTransitioningRef.current = true;

            // Handle room 0's locked north door locally, without a backend call
            if (roomID === 0 && direction === 'NORTH' && !northDoorUnlockedRef.current) {
                if (!hasKeyRef.current) {
                    setTempDialogue(["You need a key to unlock this door."]);
                } else {
                    setTempDialogue(["You need a key to unlock this door.", "You use the key to unlock the door."]);
                    setNorthDoorUnlocked(true);
                    northDoorUnlockedRef.current = true;
                }
                setCurrentLine(0);
                setVisibleChars(0);
                setDialogueDismissed(false);
                playerYRef.current = 15;
                setPlayerY(15);
                isDialogueCompleteRef.current = false;
                isRoomTransitioningRef.current = false;
                return;
            }

            const response = await fetch("http://localhost:8080/api/move", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roomID, direction, requirementsMet })
            });
            const nextRoom = await response.json();

            if (nextRoom === roomID) {
                if (direction === 'EAST')  { playerXRef.current = 85; setPlayerX(85); }
                if (direction === 'WEST')  { playerXRef.current = 15; setPlayerX(15); }
                if (direction === 'NORTH') { playerYRef.current = 15; setPlayerY(15); }
                if (direction === 'SOUTH') { playerYRef.current = 85; setPlayerY(85); }
                isRoomTransitioningRef.current = false;
                return;
            }

            if (requirementRooms.has(nextRoom) && rooms[nextRoom].parentRoom !== null) {
                setClearedRooms(prev => new Set([...prev, rooms[nextRoom].parentRoom!]));
            }

            setRoomID(nextRoom);
            setFadePercent(prev => Math.max(0, prev - 2));
            setTempDialogue(null);

            const alreadyVisited = visited.has(nextRoom);

            if (alreadyVisited) {
                const lastLine = allDialogue[nextRoom].length - 1;
                setCurrentLine(lastLine);
                setVisibleChars(allDialogue[nextRoom][lastLine].length);
                setDialogueDismissed(true);
            } else {
                setCurrentLine(0);
                setVisibleChars(0);
                setDialogueDismissed(false);
                setWaterAmount(prevWater => {
                    switch (nextRoom) {
                        case 71: return prevWater + 1;
                        case 72: return prevWater + 2;
                        case 74: return prevWater + 1;
                        default: return prevWater;
                    }
                });
            }

            setVisited(prev => {
                const newVisited = new Set([...prev, nextRoom]);
                if (newVisited.has(32) && newVisited.has(33)) {
                    setClearedRooms(prevCleared => new Set([...prevCleared, 2]));
                }
                return newVisited;
            });

            const entry = entryPositions[direction];
            playerXRef.current = entry.x;
            playerYRef.current = entry.y;
            setPlayerX(entry.x);
            setPlayerY(entry.y);

            isDialogueCompleteRef.current = alreadyVisited;
            isRoomTransitioningRef.current = false;
        };
    }, [roomID, requirementsMet, visited]);

    // requestAnimationFrame game loop — empty deps so it never restarts
    useEffect(() => {
        let animFrameId: number;

        const loop = () => {
            const keys = keysHeldRef.current;
            let dx = 0, dy = 0;
            let dir: string | null = null;

            if (keys.has('ArrowUp'))    { dy -= SPEED; dir = 'north'; }
            if (keys.has('ArrowDown'))  { dy += SPEED; dir = 'south'; }
            if (keys.has('ArrowLeft'))  { dx -= SPEED; dir = 'west'; }
            if (keys.has('ArrowRight')) { dx += SPEED; dir = 'east'; }

            if (dir) setPlayerDirection(dir);

            if (!isRoomTransitioningRef.current && isDialogueCompleteRef.current && (dx !== 0 || dy !== 0)) {
                const nx = playerXRef.current + dx;
                const ny = playerYRef.current + dy;

                if (nx >= 97) {
                    triggerRoomTransitionRef.current('EAST');
                } else if (nx <= 3) {
                    triggerRoomTransitionRef.current('WEST');
                } else if (ny <= 10) {
                    triggerRoomTransitionRef.current('NORTH');
                } else if (ny >= 97) {
                    triggerRoomTransitionRef.current('SOUTH');
                } else {
                    playerXRef.current = nx;
                    playerYRef.current = ny;
                    setPlayerX(nx);
                    setPlayerY(ny);
                }
            }

            animFrameId = requestAnimationFrame(loop);
        };

        animFrameId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animFrameId);
    }, []);

    // Start battle once dialogue finishes in a battle room
    useEffect(() => {
        if (isDialogueComplete && battleRooms.has(roomID) && !battlesWon.has(roomID)) {
            setIsBattling(true);
        }
    }, [isDialogueComplete, roomID, battlesWon]);

    // C held — auto-advance through dialogue
    useEffect(() => {
        if (cHeld) {
            const interval = setInterval(() => {
                setCurrentLine(prev => {
                    if (prev < activeDialogue.length - 1) {
                        setVisibleChars(activeDialogue[prev + 1].length);
                        return prev + 1;
                    } else {
                        setVisibleChars(activeDialogue[prev].length);
                        return prev;
                    }
                });
            }, 20);
            return () => clearInterval(interval);
        }
    }, [cHeld, roomID, tempDialogue]);

    // Typewriter — restarts when line or dialogue source changes
    useEffect(() => {
        const interval = setInterval(() => {
            setVisibleChars(prev => {
                if (prev >= activeDialogue[currentLine].length) {
                    clearInterval(interval);
                    return prev;
                }
                return prev + 1;
            });
        }, 50);
        return () => clearInterval(interval);
    }, [currentLine, roomID, tempDialogue]);

    // Keyboard input
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
                event.preventDefault();
                keysHeldRef.current.add(event.key);
                return;
            }

            const key = event.key.toLowerCase();
            if (key === 'x') {
                setVisibleChars(activeDialogue[currentLine].length);
                setXHeld(true);
            } else if (key === 'z') {
                if (dialogueDismissed) {
                    // No dialogue showing — Z is the interaction key
                    if (roomID === 11 && !hasKeyRef.current) {
                        const kdx = playerXRef.current - 50;
                        const kdy = playerYRef.current - 50;
                        if (Math.sqrt(kdx * kdx + kdy * kdy) < 5) {
                            hasKeyRef.current = true;
                            setHasKey(true);
                            setTempDialogue(["You picked up the key!"]);
                            setCurrentLine(0);
                            setVisibleChars(0);
                            setDialogueDismissed(false);
                        }
                    }
                    return;
                }
                // Dialogue is showing — Z advances it (no text skip)
                if (visibleChars < activeDialogue[currentLine].length) {
                    return; // Text still typing, Z does nothing
                }
                if (currentLine < activeDialogue.length - 1) {
                    if (xHeld) {
                        setCurrentLine(currentLine + 1);
                        setVisibleChars(activeDialogue[currentLine + 1].length);
                    } else {
                        setCurrentLine(currentLine + 1);
                        setVisibleChars(0);
                    }
                } else if (tempDialogue !== null) {
                    setTempDialogue(null);
                    const lastLine = allDialogue[roomID].length - 1;
                    setCurrentLine(lastLine);
                    setVisibleChars(allDialogue[roomID][lastLine].length);
                    setDialogueDismissed(true);
                } else {
                    setDialogueDismissed(true);
                }
            } else if (key === 'c') {
                setCHeld(true);
            }
        };

        const handleKeyUp = (event: KeyboardEvent) => {
            keysHeldRef.current.delete(event.key);
            if (event.key.toLowerCase() === 'x') setXHeld(false);
            else if (event.key.toLowerCase() === 'c') setCHeld(false);
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [currentLine, visibleChars, roomID, xHeld, tempDialogue, dialogueDismissed]);

    if (isBattling) {
        return <Battle
            roomID={roomID}
            setIsBattling={setIsBattling}
            setBattlesWon={setBattlesWon}
            waterAmount={waterAmount}
            setWaterAmount={setWaterAmount} />;
    }

    return (
        <div className="game-container">
            <div className="top-bar">
                <span className="room-name">{roomNames[roomID] ?? 'Unknown'}</span>
                <div className="fade-bar-container">
                    <span className="fade-label">FADE</span>
                    <div className="fade-bar">
                        <div className="fade-progress" style={{ width: `${fadePercent}%` }}></div>
                    </div>
                </div>
            </div>

            <GameScene
                roomID={roomID}
                playerDirection={playerDirection}
                description={rooms[roomID].description}
                playerX={playerX}
                playerY={playerY}
                hasKey={hasKey}
                northDoorUnlocked={northDoorUnlocked} />

            {!isDialogueComplete && (
                <div className="dialogue-area">
                    <p className="dialogue-text">{activeDialogue[currentLine].substring(0, visibleChars)}</p>
                </div>
            )}
            <div className="controls-bar">
                <p className="controls-hint">Z: Next &nbsp;·&nbsp; X: Skip text &nbsp;·&nbsp; C: Auto-advance</p>
            </div>
        </div>
    );
}

export default App
