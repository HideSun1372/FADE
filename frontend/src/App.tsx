import {useEffect, useState} from 'react'
import './App.css'

function App() {
  const [visibleChars, setVisibleChars] = useState(0);
  const text = "You are fading away.";

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleChars(prev => {
        console.log("Running, prev:", prev);
        if (prev >= text.length) {
          clearInterval(interval);
          return prev; // Don't increase anymore
        }
        return prev + 1;
      });
    }, 50);
  }, []);

  return (
      <div>
        <p>{text.substring(0, visibleChars)}</p>
      </div>
  )
}

export default App
