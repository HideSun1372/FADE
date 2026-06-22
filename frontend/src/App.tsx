import { useEffect, useState, useRef } from 'react'
import './App.css'
import { useMusic } from './useMusic'
import { playSound } from './playSound'
import type { Directions } from './types';
import Battle from './Battle'
import GameScene from './GameScene'
import TitleScreen from './TitleScreen'
import Credits from './Credits'
import Intro from './Intro'
import UploadMusic from './UploadMusic'
import { loadAllAudioBlobs } from './audioStorage'
import { API_BASE, isDesktop } from './config'
import LoadingScreen from './LoadingScreen'

const SPEED = 0.45;
const ENEMY_SPEED = 0.3;
const AGGRO_RADIUS = 22;
const BATTLE_TRIGGER_DIST = 4;

const battleRooms = new Set([4, 6, 22, 32, 33, 41, 63, 7, 73]);
const requirementRooms = new Set([22, 41, 62, 63]);

const roomDoors: Record<number, Set<Directions>> = {
    0:  new Set(['EAST', 'NORTH']),
    1:  new Set(['SOUTH', 'NORTH', 'EAST']),
    2:  new Set(['WEST', 'NORTH', 'SOUTH']),
    3:  new Set(['NORTH', 'SOUTH', 'WEST']),
    4:  new Set(['NORTH', 'EAST']),
    5:  new Set(['SOUTH', 'EAST', 'WEST']),
    6:  new Set(['SOUTH', 'WEST']),
    7:  new Set(['EAST', 'NORTH']),
    11: new Set(['WEST']),
    21: new Set(['SOUTH', 'WEST']),
    22: new Set(['EAST']),
    31: new Set(['SOUTH', 'EAST', 'WEST']),
    32: new Set(['WEST']),
    33: new Set(['EAST']),
    41: new Set(['NORTH']),
    61: new Set(['WEST', 'SOUTH']),
    62: new Set(['EAST', 'NORTH']),
    63: new Set(['WEST']),
    71: new Set(['EAST', 'NORTH']),
    72: new Set(['SOUTH', 'WEST', 'NORTH', 'EAST']),
    73: new Set(['EAST']),
    74: new Set(['SOUTH', 'NORTH']),
    75: new Set(['WEST', 'SOUTH', 'NORTH']),
};


const enemySpawnPositions: Record<number, { x: number; y: number }> = {
    4:  { x: 50, y: 25 },
    6:  { x: 50, y: 25 },
    7:  { x: 50, y: 25 },
    22: { x: 50, y: 50 },
    32: { x: 50, y: 50 },
    33: { x: 50, y: 50 },
    41: { x: 50, y: 75 },
    63: { x: 50, y: 25 },
    73: { x: 50, y: 50 },
};

function App() {
    const [visibleChars, setVisibleChars] = useState(0);
    const [roomID, setRoomID] = useState(0);
    const [clearedRooms, setClearedRooms] = useState(new Set<number>());
    const [currentLine, setCurrentLine] = useState(0);
    const [isBattling, setIsBattling] = useState(false);
    const [visited, setVisited] = useState(new Set<number>([0]));
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
    const [hasRoom62Key, setHasRoom62Key] = useState(false);
    const [northDoorUnlocked, setNorthDoorUnlocked] = useState(false);
    const [tempDialogue, setTempDialogue] = useState<string[] | null>(null);
    const [enemyX, setEnemyX] = useState(50);
    const [enemyY, setEnemyY] = useState(50);
    const [enemyAggravated, setEnemyAggravated] = useState(false);
    const [saveMenuOpen, setSaveMenuOpen] = useState(false);
    const [saveConfirm, setSaveConfirm] = useState(false);
    const [hasFaded, setHasFaded] = useState(false);
    const [fadePhase, setFadePhase] = useState<null | 'heading' | 'dialogue' | 'done'>(null);
    const [fadeLine, setFadeLine] = useState(0);
    const [fadeChars, setFadeChars] = useState(0);
    const [fadedAtRoom7, setFadedAtRoom7] = useState(false);
    const [showEnding, setShowEnding] = useState(false);
    const [showEndingButton, setShowEndingButton] = useState(false);
    const [phase, setPhase] = useState<'loading' | 'title' | 'intro' | 'game' | 'credits' | 'upload_music'>('loading');
    const [customAudio, setCustomAudio] = useState<Record<string, string>>({});
    const [activeSlot, setActiveSlot] = useState(1);
    const [saveSlots, setSaveSlots] = useState<any[]>([]);
    const [unsavedChanges, setUnsavedChanges] = useState(false);
    const [returnConfirm, setReturnConfirm] = useState(false);
    const [saveMenuCursor, setSaveMenuCursor] = useState(0);
    const [backendReady, setBackendReady] = useState(!API_BASE && !isDesktop);

    const requirementsMet = roomID === 0 ? northDoorUnlocked : clearedRooms.has(roomID);

    const deviceIdRef = useRef<string>('');
    if (!deviceIdRef.current) {
        let stored = localStorage.getItem('fadeDeviceId');
        if (!stored) {
            stored = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
                const r = Math.random() * 16 | 0;
                return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
            localStorage.setItem('fadeDeviceId', stored);
        }
        deviceIdRef.current = stored;
    }

    const keysHeldRef = useRef(new Set<string>());
    const playerXRef = useRef(50);
    const playerYRef = useRef(50);
    const isRoomTransitioningRef = useRef(false);
    const triggerRoomTransitionRef = useRef<(dir: Directions) => Promise<void>>(async () => {});
    const isDialogueCompleteRef = useRef(false);
    const hasKeyRef = useRef(false);
    const northDoorUnlockedRef = useRef(false);
    const roomIDRef = useRef(0);
    const room22PostBattleShownRef = useRef(false);
    const enemyXRef = useRef(50);
    const enemyYRef = useRef(50);
    const enemyAggravatedRef = useRef(false);
    const battlesWonRef = useRef(new Set<number>());
    const isBattlingRef = useRef(false);
    const clearedRoomsRef = useRef(new Set<number>());
    const room5WestUnlockShownRef = useRef(false);
    const room4PostBattleShownRef = useRef(false);
    const room6PostBattleShownRef = useRef(false);
    const room7PostBattleShownRef = useRef(false);
    const saveMenuOpenRef = useRef(false);
    saveMenuOpenRef.current = saveMenuOpen;
    const hasFadedRef = useRef(false);
    hasFadedRef.current = hasFaded;
    const fadePhaseRef = useRef<null | 'heading' | 'dialogue' | 'done'>(null);
    fadePhaseRef.current = fadePhase;
    const fadeLineRef = useRef(0);
    fadeLineRef.current = fadeLine;
    const fadeCharsRef = useRef(0);
    fadeCharsRef.current = fadeChars;
    const fadeDialogue = fadedAtRoom7
        ? ["Pathetic.", "Faded away at the very last room.", "Try again, mortal."]
        : ["You have faded away.", "It's ok! You can try again!"];
    const showEndingRef = useRef(false);
    showEndingRef.current = showEnding;
    const showEndingButtonRef = useRef(false);
    showEndingButtonRef.current = showEndingButton;
    const saveMenuCursorRef = useRef(0);
    saveMenuCursorRef.current = saveMenuCursor;
    const phaseRef = useRef<'loading' | 'title' | 'intro' | 'game' | 'credits' | 'upload_music'>('loading');
    phaseRef.current = phase;
    const room62NorthUnlockShownRef = useRef(false);
    const hasRoom62KeyRef = useRef(false);

    hasKeyRef.current = hasKey;
    northDoorUnlockedRef.current = northDoorUnlocked;
    roomIDRef.current = roomID;
    battlesWonRef.current = battlesWon;
    isBattlingRef.current = isBattling;
    clearedRoomsRef.current = clearedRooms;
    hasRoom62KeyRef.current = hasRoom62Key;

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
        99: 'You Win?',
    };

    const allDialogue: Record<number, string[]> = {
        0: ["Hello there, fellow player.", "You are fading away.", "I know it sounds crazy, but you have to trust me.", "I will be your guide on your new adventure.", "I will reveal more information as you continue on your journey.", "But first, to exit this room, you need a key!", "Walk into the east door to find it."],
        1: ["Welcome to the new world!", "In this world, don't trust anyone! Or else they will come back and betray you!", "Now you might be wondering, why trust me? I am your only trusted tour guide on this adventure.", "Here, it is kill or be killed. No one cares about your feelings.", "So you have to gain the upper hand in this world! Don't seem weak!", "Be careful to watch your fading progress bar on the top right, it will tell you how long you have before you will fully fade away."],
        2: ['This place is called "The Haunted Fields". Be careful! As beautiful as the grass may seem, they are dangerous.', "Make sure you are not excessively coming into contact with them. They get aggressive once in a while.", "If you get tired, do not loiter out in the open! Sometimes, the clouds above gets angry if you are just staying in one spot.", "If you do wish to rest, you can do so under a tree where the clouds does not have a vision of you.", "That's basically all you have to know about The Haunted Fields. Stay safe, I'm on your side."],
        3: ["Woo! Finally got out of there! But here is where your adventures become harder.", "Welcome to the Volcanic Wastelands!", "In contrast to the cool Grasslands, the Volcano will incinerate you if you aren't careful!", "Ready? Let's explore!"],
        4: ["What? You feel like someone is watching us?", "To be honest? Me too! We really need to investigate this!", "But we need to continue walking.", "I feel like we are really close to the treasure that we are going to find!", "Let's go! Final stretch!", "Wait, who's that? Battle?", "Oh no! That's the boss! Prepare for combat!!!"],
        5: ["Woo! The boss was tough!", "But we need not loiter! This is what you've been trying to achieve all along, right?", "To find the ultimate treasure of this universe?", "Heh, are you saying you don't want to continue anymore?", "Hey! Let's stop joking! Here's the dungeon! The King of this realm should be in there!"],
        6: ["King: Who have came to disturb my sleep?", "Us, old man! Either let us through, or we'll have to do this the hard way...", "King: Let's do it the hard way then. I spent much time on this kingdom, I'll try my best to defend it.", "Alright, let's go! Final fight!"],
        7: ["The air feels heavy with betrayal."],
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

    const introDialogue = [
        "Hello there, fellow player.",
        "You are fading away.",
        "I know it sounds crazy, but you have to trust me.",
        "I will be your guide on your new adventure.",
        "Now, you might be thinking. What journey is this about?",
        "Well, since you're fading away anyways, why not try to find the ultimate treasure of this world?",
        "This shall be a tedious journey, but I'm sure you could handle it!",
        "I will reveal more information as you continue on your journey.",
    ];

    const rooms: Record<number, { description: string; parentRoom: number | null }> = {
        0: { description: "This is a dream. Is it? Why do you see someone coming towards you? Is someone there?", parentRoom: null },
        1: { description: "Whoa, what is this new world? Guess the odd figure really meant what he meant!", parentRoom: null },
        2: { description: "The grassy plains seems to emit a sense of black and white, even though they are supposed to be green.", parentRoom: null },
        3: { description: "After exiting out of the grassy plains, you arrive at a volcanic mountain. You fade some more.", parentRoom: null },
        4: { description: "As you continue walking through the volcanic wastelands, you begin to feel a sense that someone is watching you.", parentRoom: null },
        5: { description: "After defeating the great boss of the volcanic wastelands, you take a break under the shade of a seemingly misplaced tree.", parentRoom: null },
        6: { description: "You enter a dungeon to face off against the ruler of this realm and find the final treasure of this mysterious land.", parentRoom: null },
        7: { description: "What a plot twist. This is it. Are you going to fail or are you going to come out on top after all the efforts you took to get here?", parentRoom: null },
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

    const loadFromSave = async (slot: number, fadeBonus: number = 0) => {
        const res = await fetch(`${API_BASE}/api/save/${slot}?deviceId=${deviceIdRef.current}`);
        let roomId = 0, px = 50, py = 50, dir = 'south';
        let cleared = new Set<number>(), bWon = new Set<number>(), vis = new Set<number>([0]);
        let hk = false, hk62 = false, ndu = false, water = 0, fade = 100;
        let rawData: any = null;

        if (res.ok) {
            const d = await res.json();
            rawData = d;
            roomId = d.roomId;
            px = d.playerX; py = d.playerY; dir = d.playerDirection;
            const parse = (s: string) => new Set<number>(s ? s.split(',').map(Number).filter((n: number) => !isNaN(n) && n !== 0 || n === 0) : []);
            cleared = parse(d.clearedRooms);
            bWon = parse(d.battlesWon);
            vis = parse(d.visited);
            hk = d.hasKey; hk62 = d.hasRoom62Key; ndu = d.northDoorUnlocked;
            water = d.waterAmount; fade = d.fadePercent;
        }

        if (fadeBonus > 0 && rawData) {
            fade = Math.min(100, fade + fadeBonus);
            await fetch(`${API_BASE}/api/save/${slot}?deviceId=${deviceIdRef.current}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...rawData, fadePercent: fade }),
            });
        }

        setRoomID(roomId); roomIDRef.current = roomId;
        playerXRef.current = px; setPlayerX(px);
        playerYRef.current = py; setPlayerY(py);
        setPlayerDirection(dir);
        setClearedRooms(cleared); clearedRoomsRef.current = cleared;
        setBattlesWon(bWon); battlesWonRef.current = bWon;
        room22PostBattleShownRef.current = bWon.has(22);
        room4PostBattleShownRef.current = bWon.has(4);
        room6PostBattleShownRef.current = bWon.has(6);
        room7PostBattleShownRef.current = bWon.has(7);
        room5WestUnlockShownRef.current = cleared.has(5);
        room62NorthUnlockShownRef.current = cleared.has(62);
        setVisited(vis);
        setHasKey(hk); hasKeyRef.current = hk;
        setHasRoom62Key(hk62); hasRoom62KeyRef.current = hk62;
        setNorthDoorUnlocked(ndu); northDoorUnlockedRef.current = ndu;
        setWaterAmount(water);
        setFadePercent(fade);
        setHasFaded(false);
        setFadePhase(null);
        fadePhaseRef.current = null;
        setTempDialogue(null);
        setIsBattling(false); isBattlingRef.current = false;
        isRoomTransitioningRef.current = false;
        setEnemyAggravated(false); enemyAggravatedRef.current = false;
        const lastLine = (allDialogue[roomId]?.length ?? 1) - 1;
        setCurrentLine(lastLine);
        setVisibleChars(allDialogue[roomId]?.[lastLine]?.length ?? 0);
        setDialogueDismissed(true);
        isDialogueCompleteRef.current = true;
        if (battleRooms.has(roomId) && !bWon.has(roomId)) {
            const spawn = enemySpawnPositions[roomId] ?? { x: 50, y: 50 };
            enemyXRef.current = spawn.x; enemyYRef.current = spawn.y;
            setEnemyX(spawn.x); setEnemyY(spawn.y);
        }
    };

    const saveGame = async (silent = false) => {
        await fetch(`${API_BASE}/api/save/${activeSlot}?deviceId=${deviceIdRef.current}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                roomId: roomIDRef.current,
                playerX: playerXRef.current,
                playerY: playerYRef.current,
                playerDirection,
                clearedRooms: [...clearedRoomsRef.current].join(','),
                battlesWon: [...battlesWonRef.current].join(','),
                visited: [...visited].join(','),
                hasKey: hasKeyRef.current,
                hasRoom62Key: hasRoom62KeyRef.current,
                northDoorUnlocked: northDoorUnlockedRef.current,
                waterAmount,
                fadePercent,
            }),
        });
        if (!silent) playSound(customAudio['snd_save'] ?? null);
        setUnsavedChanges(false);
        setSaveConfirm(true);
        setTimeout(() => setSaveConfirm(false), 2000);
    };

    const [battleWinScreen, setBattleWinScreen] = useState(false);
    const [battleLoseScreen, setBattleLoseScreen] = useState(false);
    const [battleGameOver, setBattleGameOver] = useState(false);

    const handleBattleEnd = (won: boolean) => {
        setIsBattling(false);
        isBattlingRef.current = false;
        setBattleWinScreen(false);
        setBattleLoseScreen(false);
        setBattleGameOver(false);
        if (won) setUnsavedChanges(true);
        else loadFromSave(activeSlot);
    };

    const handleAudioChange = (key: string, url: string | null) => {
        setCustomAudio(prev => {
            if (prev[key]) URL.revokeObjectURL(prev[key]);
            if (url === null) {
                const next = { ...prev };
                delete next[key];
                return next;
            }
            return { ...prev, [key]: url };
        });
    };

    const handleNewGame = (slotId: number) => {
        setRoomID(0); roomIDRef.current = 0;
        setShowEnding(false); setShowEndingButton(false);
        setClearedRooms(new Set()); clearedRoomsRef.current = new Set();
        setBattlesWon(new Set()); battlesWonRef.current = new Set();
        setVisited(new Set([0]));
        setHasKey(false); hasKeyRef.current = false;
        setHasRoom62Key(false); hasRoom62KeyRef.current = false;
        setNorthDoorUnlocked(false); northDoorUnlockedRef.current = false;
        setFadePercent(100);
        setWaterAmount(0);
        setHasFaded(false); setFadePhase(null); setFadedAtRoom7(false);
        setPlayerX(50); playerXRef.current = 50;
        setPlayerY(50); playerYRef.current = 50;
        setPlayerDirection('south');
        setEnemyX(50); enemyXRef.current = 50;
        setEnemyY(50); enemyYRef.current = 50;
        setEnemyAggravated(false); enemyAggravatedRef.current = false;
        room22PostBattleShownRef.current = false;
        room4PostBattleShownRef.current = false;
        room5WestUnlockShownRef.current = false;
        room6PostBattleShownRef.current = false;
        room7PostBattleShownRef.current = false;
        room62NorthUnlockShownRef.current = false;
        setSaveMenuOpen(false);
        setActiveSlot(slotId);
        setPhase('intro');
    };

    const handleIntroComplete = () => {
        setCurrentLine(5);
        setVisibleChars(0);
        setDialogueDismissed(false);
        isDialogueCompleteRef.current = false;
        setPhase('game');
    };

    const handleLoadGame = async (slotId: number) => {
        setSaveMenuOpen(false);
        setActiveSlot(slotId);
        await loadFromSave(slotId);
        if (roomIDRef.current === 99) setShowEnding(true);
        setPhase('game');
    };

    const handleDeleteSave = async (slotId: number) => {
        await fetch(`${API_BASE}/api/save/${slotId}?deviceId=${deviceIdRef.current}`, { method: 'DELETE' });
        const res = await fetch(`${API_BASE}/api/save?deviceId=${deviceIdRef.current}`);
        setSaveSlots(res.ok ? await res.json() : []);
    };

    const goToTitle = async () => {
        const res = await fetch(`${API_BASE}/api/save?deviceId=${deviceIdRef.current}`);
        const data = res.ok ? await res.json() : [];
        setSaveSlots(Array.isArray(data) ? data : []);
        setShowEnding(false);
        setShowEndingButton(false);
        setSaveMenuOpen(false);
        setReturnConfirm(false);
        setUnsavedChanges(false);
        setPhase('title');
    };

    const handleReturnToTitle = async () => {
        await saveGame(showEndingRef.current);
        await goToTitle();
    };

    const handleCopySave = async (fromId: number, toId: number) => {
        const res = await fetch(`${API_BASE}/api/save/${fromId}?deviceId=${deviceIdRef.current}`);
        if (res.ok) {
            const data = await res.json();
            data.id = null;
            data.slotId = toId;
            await fetch(`${API_BASE}/api/save/${toId}?deviceId=${deviceIdRef.current}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const listRes = await fetch(`${API_BASE}/api/save?deviceId=${deviceIdRef.current}`);
            setSaveSlots(listRes.ok ? await listRes.json() : []);
        }
    };

    const activeDialogue = tempDialogue ?? allDialogue[roomID] ?? [];
    const activeDialogueRef = useRef<string[]>(activeDialogue);
    activeDialogueRef.current = activeDialogue;

    const isDialogueComplete = dialogueDismissed;
    isDialogueCompleteRef.current = dialogueDismissed;

    useEffect(() => {
        triggerRoomTransitionRef.current = async (direction: Directions) => {
            if (isRoomTransitioningRef.current) return;
            if (!isDialogueCompleteRef.current) return;

            isRoomTransitioningRef.current = true;

            if (roomID === 1 && direction === 'EAST' && !requirementsMet) {
                setTempDialogue(["This door won't budge. There must be something in this area you haven't done yet."]);
                setCurrentLine(0);
                setVisibleChars(0);
                setDialogueDismissed(false);
                playerXRef.current = 85;
                setPlayerX(85);
                isDialogueCompleteRef.current = false;
                isRoomTransitioningRef.current = false;
                return;
            }

            if (roomID === 2 && direction === 'SOUTH' && !requirementsMet) {
                setTempDialogue(["This path is blocked. Explore both forks of the Haunted Fields through the north door first."]);
                setCurrentLine(0);
                setVisibleChars(0);
                setDialogueDismissed(false);
                playerYRef.current = 85;
                setPlayerY(85);
                isDialogueCompleteRef.current = false;
                isRoomTransitioningRef.current = false;
                return;
            }

            if (roomID === 3 && direction === 'WEST' && !requirementsMet) {
                setTempDialogue(["The volcanic pass is sealed. Face the creature lurking in the dark chamber to the south first."]);
                setCurrentLine(0);
                setVisibleChars(0);
                setDialogueDismissed(false);
                playerXRef.current = 15;
                setPlayerX(15);
                isDialogueCompleteRef.current = false;
                isRoomTransitioningRef.current = false;
                return;
            }

            if (roomID === 5 && direction === 'WEST' && !requirementsMet) {
                setTempDialogue(["The west path is sealed. Head east and explore what lies beyond — then come back."]);
                setCurrentLine(0);
                setVisibleChars(0);
                setDialogueDismissed(false);
                playerXRef.current = 15;
                setPlayerX(15);
                isDialogueCompleteRef.current = false;
                isRoomTransitioningRef.current = false;
                return;
            }

            if (battleRooms.has(roomID) && !battlesWonRef.current.has(roomID)) {
                const msg = roomID === 73
                    ? "Ha! Did you really think you could just leave? Defeat the enemy first!"
                    : "You can't leave until you defeat the enemy!";
                setTempDialogue([msg]);
                setCurrentLine(0);
                setVisibleChars(0);
                setDialogueDismissed(false);
                if (direction === 'EAST')  { playerXRef.current = 85; setPlayerX(85); }
                if (direction === 'WEST')  { playerXRef.current = 15; setPlayerX(15); }
                if (direction === 'NORTH') { playerYRef.current = 15; setPlayerY(15); }
                if (direction === 'SOUTH') { playerYRef.current = 85; setPlayerY(85); }
                isDialogueCompleteRef.current = false;
                isRoomTransitioningRef.current = false;
                return;
            }

            if (roomID === 11 && !hasKeyRef.current) {
                setTempDialogue(["Pick up the key before you leave!"]);
                setCurrentLine(0);
                setVisibleChars(0);
                setDialogueDismissed(false);
                playerXRef.current = 15;
                setPlayerX(15);
                isDialogueCompleteRef.current = false;
                isRoomTransitioningRef.current = false;
                return;
            }

            if (roomID === 62 && !hasRoom62KeyRef.current) {
                setTempDialogue(["You should pick up the key before going anywhere."]);
                setCurrentLine(0);
                setVisibleChars(0);
                setDialogueDismissed(false);
                if (direction === 'EAST')  { playerXRef.current = 85; setPlayerX(85); }
                if (direction === 'NORTH') { playerYRef.current = 15; setPlayerY(15); }
                isDialogueCompleteRef.current = false;
                isRoomTransitioningRef.current = false;
                return;
            }

            if (roomID === 62 && direction === 'NORTH' && !requirementsMet) {
                setTempDialogue(["The door is locked tight. Find another way through."]);
                setCurrentLine(0);
                setVisibleChars(0);
                setDialogueDismissed(false);
                playerYRef.current = 15;
                setPlayerY(15);
                isDialogueCompleteRef.current = false;
                isRoomTransitioningRef.current = false;
                return;
            }

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

            if (roomID === 7 && direction === 'NORTH' && battlesWonRef.current.has(7)) {
                isRoomTransitioningRef.current = false;
                setRoomID(99);
                roomIDRef.current = 99;
                setShowEnding(true);
                return;
            }

            const response = await fetch(`${API_BASE}/api/move`, {
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
            setUnsavedChanges(true);
            if (!battlesWonRef.current.has(7)) setFadePercent(prev => Math.max(0, prev - 2));
            setTempDialogue(null);

            if (battleRooms.has(nextRoom) && !battlesWonRef.current.has(nextRoom)) {
                const spawn = enemySpawnPositions[nextRoom] ?? { x: 50, y: 50 };
                enemyXRef.current = spawn.x;
                enemyYRef.current = spawn.y;
                enemyAggravatedRef.current = false;
                setEnemyX(spawn.x);
                setEnemyY(spawn.y);
                setEnemyAggravated(false);
            }

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

            if (nextRoom === 5 && clearedRoomsRef.current.has(5) && !room5WestUnlockShownRef.current) {
                room5WestUnlockShownRef.current = true;
                setTempDialogue(["The west path is now open! The water rooms are accessible."]);
                setCurrentLine(0);
                setVisibleChars(0);
                setDialogueDismissed(false);
                isDialogueCompleteRef.current = false;
            }

            if (nextRoom === 62 && clearedRoomsRef.current.has(62) && !room62NorthUnlockShownRef.current) {
                room62NorthUnlockShownRef.current = true;
                setTempDialogue(["The north door just unlocked. You can escape now!"]);
                setCurrentLine(0);
                setVisibleChars(0);
                setDialogueDismissed(false);
                isDialogueCompleteRef.current = false;
            }

            isRoomTransitioningRef.current = false;
        };
    }, [roomID, requirementsMet, visited]);

    useEffect(() => {
        let animFrameId: number;

        const loop = () => {
            const keys = keysHeldRef.current;
            let dx = 0, dy = 0;
            let dir: string | null = null;

            const up    = keys.has('ArrowUp');
            const down  = keys.has('ArrowDown');
            const left  = keys.has('ArrowLeft');
            const right = keys.has('ArrowRight');

            if (up)    dy -= SPEED;
            if (down)  dy += SPEED;
            if (left)  dx -= SPEED;
            if (right) dx += SPEED;

            if      (up && right) dir = 'northeast';
            else if (up && left)  dir = 'northwest';
            else if (down && right) dir = 'southeast';
            else if (down && left)  dir = 'southwest';
            else if (up)    dir = 'north';
            else if (down)  dir = 'south';
            else if (right) dir = 'east';
            else if (left)  dir = 'west';

            if (dir) setPlayerDirection(dir);

            if (!isRoomTransitioningRef.current && isDialogueCompleteRef.current && !isBattlingRef.current && !saveMenuOpenRef.current && !hasFadedRef.current && !showEndingRef.current && (dx !== 0 || dy !== 0)) {
                const nx = playerXRef.current + dx;
                const ny = playerYRef.current + dy;

                const sceneW = window.innerWidth;
                const sceneH = window.innerHeight - 75;
                const doorHalfW = 25 / sceneW * 100;
                const doorHalfH = 25 / sceneH * 100;
                const inDoorX = nx >= 50 - doorHalfW && nx <= 50 + doorHalfW;
                const inDoorY = ny >= 50 - doorHalfH && ny <= 50 + doorHalfH;
                const doors = roomDoors[roomIDRef.current] ?? new Set<Directions>();

                if (dx > 0 && nx >= 97 && inDoorY && doors.has('EAST')) {
                    triggerRoomTransitionRef.current('EAST');
                } else if (dx < 0 && nx <= 3 && inDoorY && doors.has('WEST')) {
                    triggerRoomTransitionRef.current('WEST');
                } else if (dy < 0 && ny <= 10 && inDoorX && doors.has('NORTH')) {
                    triggerRoomTransitionRef.current('NORTH');
                } else if (dy > 0 && ny >= 97 && inDoorX && doors.has('SOUTH')) {
                    triggerRoomTransitionRef.current('SOUTH');
                } else {
                    playerXRef.current = Math.max(3.1, Math.min(96.9, nx));
                    playerYRef.current = Math.max(10.1, Math.min(96.9, ny));
                    setPlayerX(playerXRef.current);
                    setPlayerY(playerYRef.current);
                }
            }

            if (battleRooms.has(roomIDRef.current) && !battlesWonRef.current.has(roomIDRef.current) && isDialogueCompleteRef.current && !isBattlingRef.current && roomIDRef.current !== 6) {
                const edx = playerXRef.current - enemyXRef.current;
                const edy = playerYRef.current - enemyYRef.current;
                const dist = Math.sqrt(edx * edx + edy * edy);

                if (!enemyAggravatedRef.current && dist < AGGRO_RADIUS) {
                    enemyAggravatedRef.current = true;
                    setEnemyAggravated(true);
                }

                if (enemyAggravatedRef.current) {
                    if (dist < BATTLE_TRIGGER_DIST) {
                        isBattlingRef.current = true;
                        setIsBattling(true);
                    } else {
                        const enx = enemyXRef.current + (edx / dist) * ENEMY_SPEED;
                        const eny = enemyYRef.current + (edy / dist) * ENEMY_SPEED;
                        enemyXRef.current = enx;
                        enemyYRef.current = eny;
                        setEnemyX(enx);
                        setEnemyY(eny);
                    }
                }
            }

            animFrameId = requestAnimationFrame(loop);
        };

        animFrameId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animFrameId);
    }, []);

    useEffect(() => {
        if (!isBattling) {
            const spawn = enemySpawnPositions[roomIDRef.current] ?? { x: 50, y: 50 };
            enemyXRef.current = spawn.x;
            enemyYRef.current = spawn.y;
            enemyAggravatedRef.current = false;
            setEnemyX(spawn.x);
            setEnemyY(spawn.y);
            setEnemyAggravated(false);

            if (battlesWonRef.current.has(22) && !room22PostBattleShownRef.current) {
                room22PostBattleShownRef.current = true;
                setTempDialogue([
                    "The goblin dropped a key.",
                    "Congratulations! You beat your first enemy!",
                    "There's more where that came from, so get ready!",
                ]);
                setCurrentLine(0);
                setVisibleChars(0);
                setDialogueDismissed(false);
                isDialogueCompleteRef.current = false;
            }

            if (battlesWonRef.current.has(4) && roomIDRef.current === 4 && !room4PostBattleShownRef.current) {
                room4PostBattleShownRef.current = true;
                setTempDialogue(["The boss is down. The path north is now open!"]);
                setCurrentLine(0);
                setVisibleChars(0);
                setDialogueDismissed(false);
                isDialogueCompleteRef.current = false;
            }

            if (battlesWonRef.current.has(7) && !room7PostBattleShownRef.current) {
                room7PostBattleShownRef.current = true;
                setTempDialogue([
                    "*Cough* You are stronger than I thought after all...",
                    "I was once just like you, I also had a fading bar.",
                    "However, once I made a deal with a mysterious salesman, he promised me that in exchange for the fade bar to disappear, I'll have to give my freedom to him.",
                    "Obviously, I took the deal, and I regretted it.",
                    "So that's why I used you to help me escape!",
                    "I don't expect forgiveness.",
                    "Bye bye, hope you enjoy your freedom.",
                    "The mysterious figure faded away!",
                ]);
                setCurrentLine(0);
                setVisibleChars(0);
                setDialogueDismissed(false);
                isDialogueCompleteRef.current = false;
            }

            if (battlesWonRef.current.has(6) && !room6PostBattleShownRef.current) {
                room6PostBattleShownRef.current = true;
                setTempDialogue([
                    "King: It seems that you are stronger than I thought...",
                    "King: You deserve this win.",
                    "The king has faded away!",
                    "Now that old man's gone, I can finally focus on what really mattered...",
                    "Controlling the kingdom.",
                    "Hahaha, you think I actually wanted to help you?",
                    "No! I have just used you as a pawn, in this game.",
                    "Uee hee hee! Meet me in the next room! If you can...",
                ]);
                setCurrentLine(0);
                setVisibleChars(0);
                setDialogueDismissed(false);
                isDialogueCompleteRef.current = false;
            }
        }
    }, [isBattling]);

    useEffect(() => {
        if (!API_BASE && !isDesktop) return;
        const poll = () => {
            fetch(`${API_BASE}/api/start`)
                .then(res => { if (res.ok) setBackendReady(true); else setTimeout(poll, 2000); })
                .catch(() => setTimeout(poll, isDesktop ? 1000 : 2000));
        };
        poll();
    }, []);

    useEffect(() => {
        if (!backendReady) return;
        const checkSaves = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/save?deviceId=${deviceIdRef.current}`);
                if (!res.ok) { setPhase('intro'); return; }
                const data = await res.json();
                const saves = Array.isArray(data) ? data : [];
                if (saves.length === 0) {
                    setPhase('intro');
                } else {
                    setSaveSlots(saves);
                    setPhase('title');
                }
            } catch {
                setPhase('intro');
            }
        };
        checkSaves();
    }, [backendReady]);

    useEffect(() => {
        loadAllAudioBlobs().then(setCustomAudio).catch(() => {});
    }, []);

    useEffect(() => {
        if (fadePercent <= 0) setHasFaded(true);
    }, [fadePercent]);

    useEffect(() => {
        if (!hasFaded) return;
        setFadedAtRoom7(roomIDRef.current === 7);
        setFadePhase('heading');
        setFadeLine(0);
        setFadeChars(0);
        const t = setTimeout(() => setFadePhase('dialogue'), 1500);
        return () => clearTimeout(t);
    }, [hasFaded]);

    useEffect(() => {
        if (fadePhase !== 'dialogue') return;
        const interval = setInterval(() => {
            setFadeChars(prev => prev >= fadeDialogue[fadeLine].length ? prev : prev + 1);
        }, 40);
        return () => clearInterval(interval);
    }, [fadePhase, fadeLine]);

    useEffect(() => {
        if (fadePhase !== 'dialogue' && fadePhase !== 'done') return;
        const handler = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() !== 'z') return;
            if (fadePhaseRef.current === 'done') { loadFromSave(activeSlot, 10); return; }
            const line = fadeLineRef.current;
            const chars = fadeCharsRef.current;
            if (chars < fadeDialogue[line].length) return;
            if (line < fadeDialogue.length - 1) {
                setFadeLine(line + 1);
                setFadeChars(0);
            } else {
                setFadePhase('done');
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [fadePhase, fadedAtRoom7]);

    useEffect(() => {
        if (!saveMenuOpen) setReturnConfirm(false);
    }, [saveMenuOpen]);

    useEffect(() => {
        setSaveMenuCursor(0);
    }, [returnConfirm, saveMenuOpen]);

    useEffect(() => {
        if (!saveMenuOpen) return;
        const optionCount = 3;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                e.preventDefault();
                setSaveMenuCursor(prev => (prev - 1 + optionCount) % optionCount);
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                e.preventDefault();
                setSaveMenuCursor(prev => (prev + 1) % optionCount);
            } else if (e.key.toLowerCase() === 'z') {
                const cursor = saveMenuCursorRef.current;
                if (!returnConfirm) {
                    if (cursor === 0) saveGame();
                    else if (cursor === 1) { if (unsavedChanges) setReturnConfirm(true); else goToTitle(); }
                    else setSaveMenuOpen(false);
                } else {
                    if (cursor === 0) handleReturnToTitle();
                    else if (cursor === 1) goToTitle();
                    else setReturnConfirm(false);
                }
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [saveMenuOpen, returnConfirm, unsavedChanges]);

    useEffect(() => {
        if (!showEnding) return;
        saveGame(true);
        playSound(customAudio['snd_youwin'] ?? null);
        const t = setTimeout(() => setShowEndingButton(true), 3500);
        return () => clearTimeout(t);
    }, [showEnding]);

    useEffect(() => {
        if (roomID === 6 && dialogueDismissed && !battlesWon.has(6) && !isBattling) {
            isBattlingRef.current = true;
            setIsBattling(true);
        }
    }, [dialogueDismissed, roomID, battlesWon, isBattling]);

    useEffect(() => {
        if (currentLine >= activeDialogue?.length) {
            const lastLine = Math.max(0, activeDialogue?.length - 1);
            setCurrentLine(lastLine);
            setVisibleChars(activeDialogue[lastLine]?.length ?? 0);
        }
    }, [currentLine, tempDialogue, roomID]);

    useEffect(() => {
        if (cHeld) {
            const interval = setInterval(() => {
                setCurrentLine(prev => {
                    const ad = activeDialogueRef.current;
                    if (prev < ad.length - 1 && ad[prev + 1]) {
                        setVisibleChars(ad[prev + 1].length);
                        return prev + 1;
                    } else {
                        setVisibleChars(ad[prev]?.length);
                        return prev;
                    }
                });
            }, 20);
            return () => clearInterval(interval);
        }
    }, [cHeld, roomID, tempDialogue]);

    useEffect(() => {
        if (!cHeld || dialogueDismissed) return;
        if (currentLine === activeDialogue.length - 1 && visibleChars >= activeDialogue[currentLine].length) {
            if (tempDialogue !== null) {
                setTempDialogue(null);
                const lastLine = allDialogue[roomID].length - 1;
                setCurrentLine(lastLine);
                setVisibleChars(allDialogue[roomID][lastLine].length);
                setDialogueDismissed(true);
            } else {
                setDialogueDismissed(true);
            }
        }
    }, [cHeld, currentLine, visibleChars, dialogueDismissed, tempDialogue, roomID]);

    useEffect(() => {
        if (xHeld) {
            setVisibleChars(activeDialogue[currentLine]?.length);
        }
    }, [xHeld, currentLine, tempDialogue]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (phaseRef.current !== 'game') return;
            setVisibleChars(prev => {
                if (prev >= activeDialogue[currentLine]?.length) {
                    clearInterval(interval);
                    return prev;
                }
                return prev + 1;
            });
        }, 50);
        return () => clearInterval(interval);
    }, [currentLine, roomID, tempDialogue]);


    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (phaseRef.current !== 'game') return;
            if (event.key === 'Escape') {
                if (!isBattlingRef.current && isDialogueCompleteRef.current && !enemyAggravatedRef.current) setSaveMenuOpen(prev => !prev);
                return;
            }

            if (hasFadedRef.current) {
                return;
            }

            if (showEndingRef.current) {
                if (event.key.toLowerCase() === 'z' && showEndingButtonRef.current) handleReturnToTitle();
                return;
            }

            if (saveMenuOpenRef.current) {
                event.preventDefault();
                return;
            }

            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
                event.preventDefault();
                if (!isBattlingRef.current) keysHeldRef.current.add(event.key);
                return;
            }

            if (isBattlingRef.current) return;

            const key = event.key.toLowerCase();
            if (key === 'x') {
                setVisibleChars(activeDialogue[currentLine].length);
                setXHeld(true);
            } else if (key === 'z') {
                if (dialogueDismissed) {
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
                    if (roomID === 62 && !hasRoom62KeyRef.current) {
                        const kdx = playerXRef.current - 50;
                        const kdy = playerYRef.current - 50;
                        if (Math.sqrt(kdx * kdx + kdy * kdy) < 8) {
                            hasRoom62KeyRef.current = true;
                            setHasRoom62Key(true);
                            setTempDialogue(["You picked up the key!"]);
                            setCurrentLine(0);
                            setVisibleChars(0);
                            setDialogueDismissed(false);
                        }
                    }
                    return;
                }
                if (visibleChars < activeDialogue[currentLine].length) {
                    return;
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

    const musicTrackKey =
        (phase === 'title' || phase === 'credits' || phase === 'upload_music') ? 'mus_title' :
        phase === 'intro' ? 'mus_intro' :
        isBattling && battleGameOver ? 'mus_death' :
        isBattling && battleLoseScreen ? null :
        hasFaded ? 'mus_death' :
        isBattling && battleWinScreen ? 'mus_win' :
        isBattling && roomID === 4 ? 'mus_volcanicmaster' :
        isBattling && roomID === 6 ? 'mus_king' :
        isBattling && roomID === 7 ? 'mus_figure' :
        isBattling ? 'mus_battle' :
        null

    const musicUrl = musicTrackKey ? (customAudio[musicTrackKey] ?? null) : null;
    useMusic(musicUrl, musicTrackKey !== 'mus_win')

    const saveSlotsList = Array.isArray(saveSlots) ? saveSlots : [];
    const slotInfos = [1, 2, 3].map(id => {
        const save = saveSlotsList.find((s: any) => s.slotId === id);
        if (!save) return null;
        return {
            id,
            roomName: roomNames[save.roomId as number] ?? 'Unknown',
            fadePercent: save.fadePercent as number,
            visitedCount: save.visited ? (save.visited as string).split(',').filter(Boolean).length : 0,
        };
    });

    if (!backendReady) return <LoadingScreen />;

    if (phase === 'loading') return null;

    if (phase === 'intro') {
        return <Intro dialogue={introDialogue} onDone={handleIntroComplete} />;
    }

    if (phase === 'credits') {
        return <Credits onBack={() => setPhase('title')} />;
    }

    if (phase === 'title') {
        return <TitleScreen
            slots={slotInfos}
            onNewGame={handleNewGame}
            onLoadGame={handleLoadGame}
            onDeleteSave={handleDeleteSave}
            onCopySave={handleCopySave}
            onCredits={() => setPhase('credits')}
            onUploadMusic={() => setPhase('upload_music')} />;
    }

    if (phase === 'upload_music') {
        return <UploadMusic
            customAudio={customAudio}
            onAudioChange={handleAudioChange}
            onBack={() => setPhase('title')} />;
    }

    if (isBattling) {
        return <Battle
            roomID={roomID}
            onBattleEnd={handleBattleEnd}
            onWinScreen={() => setBattleWinScreen(true)}
            onLoseScreen={() => setBattleLoseScreen(true)}
            onGameOverScreen={() => setBattleGameOver(true)}
            setBattlesWon={setBattlesWon}
            waterAmount={waterAmount}
            setWaterAmount={setWaterAmount}
            playerDirection={playerDirection}
            customAudio={customAudio} />;
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
                description={rooms[roomID]?.description ?? ''}
                playerX={playerX}
                playerY={playerY}
                hasKey={hasKey}
                hasRoom62Key={hasRoom62Key}
                northDoorUnlocked={northDoorUnlocked}
                requirementsMet={requirementsMet}
                enemyX={enemyX}
                enemyY={enemyY}
                enemyAggravated={enemyAggravated}
                battleWon={battlesWon.has(roomID)}
                roomVisited={visited.has(roomID)} />

            {!isDialogueComplete && (
                <div className="dialogue-area">
                    <p className="dialogue-text">
                        {activeDialogue[currentLine]?.substring(0, visibleChars)}
                    </p>
                </div>
            )}
            <div className="controls-bar">
                <p className="controls-hint">Z: Next &nbsp;·&nbsp; X: Skip text &nbsp;·&nbsp; C: Auto-advance &nbsp;·&nbsp; ESC: Save</p>
            </div>

            {hasFaded && (
                <div className="gameover-overlay">
                    {fadePhase !== null && (
                        <h1 className="gameover-heading">You have faded.</h1>
                    )}
                    {(fadePhase === 'dialogue' || fadePhase === 'done') && (
                        <div className="gameover-dialogue-box">
                            <p className="gameover-dialogue-text">
                                {fadeDialogue[fadeLine].substring(0, fadeChars)}
                            </p>
                            {fadePhase === 'dialogue' && fadeChars >= fadeDialogue[fadeLine].length && (
                                <p className="gameover-hint">Z: Next</p>
                            )}
                        </div>
                    )}
                    {fadePhase === 'done' && (
                        <>
                            <button onClick={() => loadFromSave(activeSlot, 10)}>Go back</button>
                            <p style={{ fontSize: '11px', color: '#555', marginTop: '-20px' }}>Z: Go back</p>
                        </>
                    )}
                </div>
            )}

            {showEnding && (
                <div className="ending-overlay">
                    <div className="ending-content">
                        <p className="ending-text">You win?</p>
                        {showEndingButton && (
                            <>
                                <button className="ending-button" onClick={handleReturnToTitle}>Return to Title</button>
                                <p style={{ fontSize: '11px', color: '#555', marginTop: '10px', opacity: 0, animation: 'fadeInText 0.6s ease-in 0.1s forwards' }}>Z: Continue</p>
                            </>
                        )}
                    </div>
                </div>
            )}

            {saveMenuOpen && (
                <div className="save-overlay">
                    <div className="save-menu">
                        {!returnConfirm ? (
                            <>
                                <p className="save-menu-title">— SAVE —</p>
                                <p className="save-menu-location">* {roomNames[roomID] ?? 'Unknown'}</p>
                                <p className="save-menu-stat">FADE &nbsp;&nbsp;{fadePercent}%</p>
                                <p className="save-menu-stat">ROOMS &nbsp;{visited.size} visited</p>
                                <div className="save-menu-buttons">
                                    <button onClick={() => saveGame()} className={saveMenuCursor === 0 ? 'menu-selected' : ''}>Save</button>
                                    <button onClick={() => { if (unsavedChanges) setReturnConfirm(true); else goToTitle(); }} className={saveMenuCursor === 1 ? 'menu-selected' : ''}>Return to Title</button>
                                    <button onClick={() => setSaveMenuOpen(false)} className={saveMenuCursor === 2 ? 'menu-selected' : ''}>Close</button>
                                </div>
                                {saveConfirm && <p className="save-confirm">* Game saved.</p>}
                            </>
                        ) : (
                            <>
                                <p className="save-menu-title">— RETURN TO TITLE —</p>
                                <p className="save-menu-stat" style={{ marginBottom: '12px' }}>You have unsaved progress.</p>
                                <div className="save-menu-buttons">
                                    <button onClick={handleReturnToTitle} className={saveMenuCursor === 0 ? 'menu-selected' : ''}>Save & Return</button>
                                    <button onClick={goToTitle} className={saveMenuCursor === 1 ? 'menu-selected' : ''}>Return Anyway</button>
                                    <button onClick={() => setReturnConfirm(false)} className={saveMenuCursor === 2 ? 'menu-selected' : ''}>Cancel</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
}

export default App