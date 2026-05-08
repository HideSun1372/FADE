import  {useEffect, useState} from 'react'
import './App.css'

function App() {
  const [visibleChars, setVisibleChars] = useState(0);
  const text = "You are fading away.";
  const [roomID, setRoomID] = useState(0);
  const [hasKey, setHasKey] = useState(false);

  const rooms = {
      0: {description: "This is a dream. Is it? Why do you see someone coming towards you? Is someone there?"},
      1: {description: "Whoa, what is this new world? Guess the odd figure really meant what he meant!"},
  }

  const handleMove = async (direction: Directions) => {
      const data = {roomID, direction, hasKey};

      const response = await fetch ("http://localhost:8080/api/move", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(data)
      });

      const nextRoom = await response.json();

      setRoomID(nextRoom)
  };


  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleChars(prev => {
        if (prev >= text.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 50);
  }, []);



  useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
          if (event.key.toLowerCase() === "x") {
              setVisibleChars (text.length);
          }
      }
      window.addEventListener("keydown", handleKeyDown);

      return () => {
          window.removeEventListener("keydown", handleKeyDown);
      }
  }, [text.length]);


  return (
      <div>
        <p>{text.substring(0, visibleChars)}</p>
          <button onClick={() => handleMove("NORTH")}>Go North</button>
          <p>{rooms[roomID].description}</p>
      </div>
  )
}

export default App
