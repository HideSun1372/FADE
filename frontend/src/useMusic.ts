import { useEffect } from 'react'

export function useMusic(url: string | null, loop: boolean = true) {
    useEffect(() => {
        if (!url) return

        const audio = new Audio(url)
        audio.loop = loop
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
    }, [url, loop])
}
