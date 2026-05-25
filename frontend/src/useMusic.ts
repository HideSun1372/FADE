import { useEffect } from 'react'

export function useMusic(track: string | null) {
    useEffect(() => {
        if (!track) return

        const audio = new Audio(`/audio/${track}.mp3`)
        audio.loop = track !== 'mus_win'
        audio.volume = 0.7

        const onInteract = () => {
            audio.play().catch(() => {})
        }

        audio.play().catch(() => {
            document.addEventListener('keydown', onInteract, { once: true })
            document.addEventListener('click', onInteract, { once: true })
        })

        return () => {
            audio.pause()
            audio.currentTime = 0
            document.removeEventListener('keydown', onInteract)
            document.removeEventListener('click', onInteract)
        }
    }, [track])
}
