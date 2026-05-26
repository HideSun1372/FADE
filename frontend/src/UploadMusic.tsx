import { useEffect, useRef, useState } from 'react';
import { saveAudioBlob, deleteAudioBlob } from './audioStorage';

export const AUDIO_TRACKS = [
    { key: 'mus_title',        label: 'Title / Credits',     category: 'Music',        loop: true  },
    { key: 'mus_intro',        label: 'Introduction',        category: 'Music',        loop: true  },
    { key: 'mus_battle',       label: 'Battle',              category: 'Music',        loop: true  },
    { key: 'mus_volcanicmaster', label: 'Room 4 Boss',       category: 'Music',        loop: true  },
    { key: 'mus_king',         label: 'Room 6 Boss',         category: 'Music',        loop: true  },
    { key: 'mus_figure',       label: 'Room 7 Boss (Final)', category: 'Music',        loop: true  },
    { key: 'mus_death',        label: 'Death / Faded',       category: 'Music',        loop: true  },
    { key: 'mus_win',          label: 'Victory Fanfare',     category: 'Music',        loop: false },
    { key: 'snd_attack',       label: 'Attack',              category: 'Sound Effect', loop: false },
    { key: 'snd_defend',       label: 'Defend',              category: 'Sound Effect', loop: false },
    { key: 'snd_damage',       label: 'Damage',              category: 'Sound Effect', loop: false },
    { key: 'snd_splashwater',  label: 'Splash Water',        category: 'Sound Effect', loop: false },
    { key: 'snd_save',         label: 'Save',                category: 'Sound Effect', loop: false },
    { key: 'snd_youwin',       label: 'You Win',             category: 'Sound Effect', loop: false },
];

interface UploadMusicProps {
    customAudio: Record<string, string>;
    onAudioChange: (key: string, url: string | null) => void;
    onBack: () => void;
}

export default function UploadMusic({ customAudio, onAudioChange, onBack }: UploadMusicProps) {
    const [cursor, setCursor] = useState(0);
    const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            e.preventDefault();
            if (e.key === 'ArrowUp') {
                setCursor(prev => (prev + AUDIO_TRACKS.length - 1) % AUDIO_TRACKS.length);
            } else if (e.key === 'ArrowDown') {
                setCursor(prev => (prev + 1) % AUDIO_TRACKS.length);
            } else if (e.key.toLowerCase() === 'z') {
                fileInputRefs.current[cursor]?.click();
            } else if (e.key.toLowerCase() === 'c') {
                const key = AUDIO_TRACKS[cursor].key;
                if (customAudio[key]) {
                    deleteAudioBlob(key).catch(() => {});
                    onAudioChange(key, null);
                }
            } else if (e.key.toLowerCase() === 'x') {
                onBack();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cursor, customAudio, onAudioChange, onBack]);

    const handleFileChange = async (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await saveAudioBlob(key, file);
        const url = URL.createObjectURL(file);
        onAudioChange(key, url);
        e.target.value = '';
    };

    return (
        <div className="upload-music-screen">
            <h2 className="upload-music-title">Upload Music</h2>
            <p className="upload-music-hint">▲▼: Select  ·  Z: Upload file  ·  C: Clear  ·  X: Back</p>
            <div className="upload-track-list">
                {AUDIO_TRACKS.map((track, i) => (
                    <div key={track.key} className={`upload-track${cursor === i ? ' upload-track-selected' : ''}`}>
                        <span className="upload-track-category">[{track.category}]</span>
                        <span className="upload-track-label">{track.label}</span>
                        <span className={`upload-track-status${customAudio[track.key] ? ' upload-track-loaded' : ''}`}>
                            {customAudio[track.key] ? '✓ Loaded' : '— Empty —'}
                        </span>
                        <input
                            ref={el => { fileInputRefs.current[i] = el; }}
                            type="file"
                            accept="audio/*"
                            style={{ display: 'none' }}
                            onChange={e => handleFileChange(track.key, e)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
