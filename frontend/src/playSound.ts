export function playSound(url: string | null) {
    if (!url) return
    const audio = new Audio(url)
    audio.volume = 0.7
    audio.play().catch(() => {})
}
