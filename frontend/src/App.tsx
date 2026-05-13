import  {useEffect, useState} from 'react'
import './App.css'
import type { Directions } from './types';
import Battle from './Battle'


function App() {
    const [visibleChars, setVisibleChars] = useState(0);
    const [roomID, setRoomID] = useState(0);
    const [clearedRooms, setClearedRooms] = useState(new Set());
    const requirementsMet = clearedRooms.has(roomID);
    const [currentLine, setCurrentLine] = useState(0);
    const [xHeld, setXHeld] = useState(false);
    const [cHeld, setCHeld] = useState(false);
    const requirementRooms = new Set ([11]);
    const [isBattling, setIsBattling] = useState(false);

    const allDialogue: Record<number, string[]> = {
        0: ["Hello there, fellow player.", "You are fading away.", "I know it sounds crazy, but you have to trust me.", "I will be your guide on your new adventure.", "I will reveal more information as you continue on your journey."],
        1: ["Welcome to the new world!", "In this world, don't trust anyone! Or else they will come back and betray you!", "Now you might be wondering, why trust me? I am your only trusted tour guide on this adventure.", "Here, it is kill or be killed. No one cares about your feelings.", "So you have to gain the upper hand in this world! Don't seem weak!", "Be careful to watch your fading progress bar on the top right, it will tell you how long you have before you will fully fade away."],
        2: ['This place is called "The Haunted Fields". Be careful! As beautiful as the grass may seem, they are dangerous.', "Make sure you are not excessively coming into contact with them. They get aggressive once in a while.", "If you get tired, do not loiter out in the open! Sometimes, the clouds above gets angry if you are just staying in one spot.", "If you do wish to rest, you can do so under a tree where the clouds does not have a vision of you.", "That's basically all you have to know about The Haunted Fields. Stay safe, I'm on your side."],
        3: ["Woo! Finally got out of there! But here is where your adventures become harder.", "Welcome to the Volcanic Wastelands!", "In contrast to the cool Grasslands, the Volcano will incinerate you if you aren't careful!", "Ready? Let's explore!"],
        4: ["What? You feel like someone is watching us?", "To be honest? Me too! We really need to investigate this!", "But we need to continue walking.", "I feel like we are really close to the treasure that we are going to find!", "Let's go! Final stretch!"],
        5: ["Woo! The boss was tough!", "But we need not loiter! This is what you've been trying to achieve all along, right?", "To find the ultimate treasure of this universe?", "Heh, are you saying you don't want to continue anymore?", "Hey! Let's stop joking! Here's the dungeon! The King of this realm should be in there!"],
        6: ["Wow, he sure looks menacing! Suitable for the king!", "Anyways, I know his true weakness! He hates water.", "That means if you countlessly attack him with water, he'll have no escape!", "Did you hear the tip? I gave you a new option to get water and splash water.", "Let's defeat him!"],
        7: ["You shall not escape my journey to rule over this land.", "Stop trying, it's futile.", "Did you hear me? I am now the strongest being here! Fighting me is pointless! You'll always lose, over and over again.", "Once I defeat you, I shall now be the one pulling the strings!", "So if you give up now, I'll still let you be my right-hand man for helping me achieve this position!"],
        11: ["Congratulations! You're starting to get it!", "Although, puzzles later on will get harder, so prepare for those!"]
    }

    const rooms: Record<number, { description: string; progressDirection: string; parentRoom: number|null } >= {
        0: {description: "This is a dream. Is it? Why do you see someone coming towards you? Is someone there?",
            progressDirection: "NORTH",
            parentRoom: null},
        1: {description: "Whoa, what is this new world? Guess the odd figure really meant what he meant!",
            progressDirection: "EAST",
            parentRoom: null},
        2: {description: "The grassy plains seems to emit a sense of black and white, even though they are supposed to be green.",
            progressDirection: "SOUTH",
            parentRoom: null},
        3: {description: "After exiting out of the grassy plains, you arrive at a volcanic mountain. You fade some more.",
            progressDirection: "WEST",
            parentRoom: null},
        4: {description: "As you continue walking through the volcanic wastelands, you begin to feel a sense that someone is watching you.",
            progressDirection: "NORTH",
            parentRoom: null},
        5: {description: "After defeating the great boss of the volcanic wastelands, you take a break under the shade of a seemingly misplaced tree.",
            progressDirection: "WEST",
            parentRoom: null},
        6: {description: "You enter a dungeon to face off against the ruler of this realm and find the final treasure of this mysterious land.",
            progressDirection: "SOUTH",
            parentRoom: null},
        7: {description: "What a plot twist. This is it. The final battle of this realm. Are you going to fail or are you going to come out on top after all the efforts you took to get here?",
            progressDirection: "EAST",
            parentRoom: null},
        11: {description: "Woah! There's a key here!",
            progressDirection: "WEST",
            parentRoom: 0}
    }


    const handleMove = async (direction: Directions) => {
        console.log("Current clearedRooms: ", clearedRooms)
        const data = {roomID, direction, requirementsMet};
        const response = await fetch ("http://10.145.65.9:8080/api/move", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        });
        const nextRoom = await response.json();

        if (nextRoom === roomID) {
            return;
        }
        else {
            if (requirementRooms.has(nextRoom)) {
                setClearedRooms(prev => new Set([...prev, rooms[nextRoom].parentRoom]));
            }
            setRoomID(nextRoom)
            setCurrentLine(0);
            setVisibleChars(0);

        }
    };

    useEffect(() => {
        if (cHeld) {
            const interval = setInterval(() => {
                setCurrentLine(prev => {
                    if (currentLine < allDialogue[roomID].length - 1) {
                        setVisibleChars(allDialogue[roomID][prev + 1].length)
                        return prev + 1;
                    } else {
                        setVisibleChars(allDialogue[roomID][prev].length)
                        return prev;
                    }
                });
            }, 20);

            return () => clearInterval(interval);
        }
    }, [cHeld, roomID, allDialogue])


    useEffect(() => {
        const interval = setInterval(() => {
            setVisibleChars(prev => {
                if (prev >= allDialogue[roomID][currentLine].length) {
                    clearInterval(interval);
                    return prev;
                }
                return prev + 1;
            });
        }, 50);
        return() => clearInterval(interval);
    }, [currentLine, roomID]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key.toLowerCase() === "x") {
                setVisibleChars (allDialogue[roomID][currentLine].length);
                setXHeld(true);
            }
            else if (event.key.toLowerCase() === "z") {
                if(roomID === 6 && currentLine === allDialogue[6].length - 1 && visibleChars >= allDialogue[6][currentLine].length) {
                    setIsBattling(true)
                }
                if (currentLine < allDialogue[roomID].length - 1) {
                    if (xHeld && visibleChars >= allDialogue[roomID][currentLine].length) {
                        setCurrentLine(currentLine + 1)
                        setVisibleChars(allDialogue[roomID][currentLine + 1].length);
                    }
                    else if (visibleChars >= allDialogue[roomID][currentLine].length) {
                        setCurrentLine(currentLine + 1)
                        setVisibleChars(0);
                    }
                }
            }
            else if (event.key.toLowerCase() === "c") {
                setCHeld(true);
            }
        }

        const handleKeyUp = (event: KeyboardEvent) => {
            if (event.key.toLowerCase() === "x") {
                setXHeld(false);
            }
            else if (event.key.toLowerCase() === "c") {
                setCHeld(false);
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        }
    }, [currentLine, visibleChars, allDialogue[roomID]]);


    if(isBattling) {
        return <Battle />
    } else {
        return (
            <div>
                <p>{allDialogue[roomID][currentLine].substring(0, visibleChars)}</p>
                <button onClick={() => handleMove("NORTH")}>Go North</button>
                <button onClick={() => handleMove("SOUTH")}>Go South</button>
                <button onClick={() => handleMove("EAST")}>Go East</button>
                <button onClick={() => handleMove("WEST")}>Go West</button>
                <p>{rooms[roomID].description}</p>
            </div>
        )
    }
}
export default App