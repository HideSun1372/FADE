export function playSound(name: string) {
    const audio = new Audio(`/audio/${name}.mp3`)
    audio.volume = 0.7
    audio.play().catch(() => {})
}
