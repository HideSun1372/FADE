import { useEffect, useRef } from 'react';

type Bullet = {
    id: number;
    x: number; y: number;
    vx: number; vy: number;
    w: number; h: number;
};

type PatternConfig = {
    spawnInterval: number;
    bulletsPerSpawn: number;
    bulletSpeed: number;
    spawnType: 'horizontal' | 'rain' | 'aimed';
    damagePerHit: number;
};

const patterns: Record<number, PatternConfig> = {
    22: { spawnInterval: 1100, bulletsPerSpawn: 2, bulletSpeed: 1.7, spawnType: 'horizontal', damagePerHit: 5  },
    32: { spawnInterval: 800,  bulletsPerSpawn: 3, bulletSpeed: 2.3, spawnType: 'horizontal', damagePerHit: 7  },
    33: { spawnInterval: 800,  bulletsPerSpawn: 3, bulletSpeed: 2.3, spawnType: 'horizontal', damagePerHit: 7  },
    41: { spawnInterval: 600,  bulletsPerSpawn: 4, bulletSpeed: 2.8, spawnType: 'rain',       damagePerHit: 8  },
    4:  { spawnInterval: 450,  bulletsPerSpawn: 5, bulletSpeed: 3.4, spawnType: 'rain',       damagePerHit: 10 },
    63: { spawnInterval: 420,  bulletsPerSpawn: 4, bulletSpeed: 3.0, spawnType: 'aimed',      damagePerHit: 11 },
    73: { spawnInterval: 550,  bulletsPerSpawn: 4, bulletSpeed: 2.6, spawnType: 'rain',       damagePerHit: 8  },
    6:  { spawnInterval: 350,  bulletsPerSpawn: 6, bulletSpeed: 3.8, spawnType: 'aimed',      damagePerHit: 12 },
    7:  { spawnInterval: 240,  bulletsPerSpawn: 7, bulletSpeed: 4.5, spawnType: 'rain',       damagePerHit: 14 },
};

const PHASE_DURATION = 5000;
const SOUL_DRAW_SIZE = 14;
const SOUL_HITBOX = 6;
const SOUL_SPEED = 3.2;
const INV_FRAMES = 30;

type Props = {
    roomID: number;
    onPhaseEnd: (damageTaken: number) => void;
    onDamage?: (dmg: number) => void;
    frozen?: boolean;
};

export default function DodgePhase({ roomID, onPhaseEnd, onDamage, frozen }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const onPhaseEndRef = useRef(onPhaseEnd);
    onPhaseEndRef.current = onPhaseEnd;
    const onDamageRef = useRef(onDamage);
    onDamageRef.current = onDamage;
    const frozenRef = useRef(frozen ?? false);
    frozenRef.current = frozen ?? false;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!;
        const pattern = patterns[roomID] ?? patterns[22];

        const boxW = Math.min(Math.floor(window.innerWidth * 0.55), 480);
        const boxH = Math.min(Math.floor(window.innerHeight * 0.40), 300);
        canvas.width = boxW;
        canvas.height = boxH;

        let soulX = boxW / 2;
        let soulY = boxH / 2;
        let bulletId = 0;
        let bullets: Bullet[] = [];
        let damageTaken = 0;
        let invFrames = 0;
        let lastSpawn = performance.now();
        const startTime = performance.now();
        let animId = 0;
        let ended = false;
        const keys = new Set<string>();

        function drawHeart(cx: number, cy: number, sz: number) {
            const scale = sz / 30;
            const flash = invFrames > 0 && Math.floor(invFrames / 5) % 2 === 0;
            ctx.save();
            ctx.translate(cx - 15 * scale, cy - 12 * scale);
            ctx.scale(scale, scale);
            ctx.beginPath();
            ctx.moveTo(15, 5);
            ctx.bezierCurveTo(15, 0, 7, 0, 7, 7.5);
            ctx.bezierCurveTo(7, 12, 15, 15, 15, 25);
            ctx.bezierCurveTo(15, 15, 23, 12, 23, 7.5);
            ctx.bezierCurveTo(23, 0, 15, 0, 15, 5);
            ctx.closePath();
            ctx.fillStyle = flash ? '#aaaaaa' : '#ff2255';
            ctx.fill();
            ctx.restore();
        }

        function spawnBullets(now: number) {
            if (now - lastSpawn < pattern.spawnInterval) return;
            lastSpawn = now;
            for (let i = 0; i < pattern.bulletsPerSpawn; i++) {
                let bx = 0, by = 0, bvx = 0, bvy = 0;
                if (pattern.spawnType === 'horizontal') {
                    const fromLeft = Math.random() < 0.5;
                    bx = fromLeft ? -10 : boxW + 10;
                    by = boxH * 0.15 + Math.random() * boxH * 0.7;
                    bvx = fromLeft ? pattern.bulletSpeed : -pattern.bulletSpeed;
                    bvy = (Math.random() - 0.5) * 0.6;
                } else if (pattern.spawnType === 'rain') {
                    bx = (boxW / pattern.bulletsPerSpawn) * i + Math.random() * (boxW / pattern.bulletsPerSpawn);
                    by = -10;
                    bvx = (Math.random() - 0.5) * 0.8;
                    bvy = pattern.bulletSpeed;
                } else {
                    const angle = Math.random() * Math.PI * 2;
                    bx = boxW / 2 + Math.cos(angle) * (boxW * 0.7);
                    by = boxH / 2 + Math.sin(angle) * (boxH * 0.7);
                    const dx = soulX - bx;
                    const dy = soulY - by;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    const spread = (Math.random() - 0.5) * 0.8;
                    bvx = (dx / dist) * pattern.bulletSpeed + spread;
                    bvy = (dy / dist) * pattern.bulletSpeed + spread;
                }
                bullets.push({ id: bulletId++, x: bx, y: by, vx: bvx, vy: bvy, w: 9, h: 9 });
            }
        }

        function checkCollision() {
            if (invFrames > 0) return;
            const hx = soulX - SOUL_HITBOX / 2;
            const hy = soulY - SOUL_HITBOX / 2;
            for (const b of bullets) {
                if (hx < b.x + b.w && hx + SOUL_HITBOX > b.x && hy < b.y + b.h && hy + SOUL_HITBOX > b.y) {
                    damageTaken += pattern.damagePerHit;
                    invFrames = INV_FRAMES;
                    onDamageRef.current?.(pattern.damagePerHit);
                    break;
                }
            }
        }

        function loop(now: number) {
            if (frozenRef.current) return;
            const elapsed = now - startTime;
            if (elapsed >= PHASE_DURATION && !ended) {
                ended = true;
                onPhaseEndRef.current(damageTaken);
                return;
            }

            if (keys.has('ArrowUp'))    soulY = Math.max(SOUL_DRAW_SIZE / 2, soulY - SOUL_SPEED);
            if (keys.has('ArrowDown'))  soulY = Math.min(boxH - SOUL_DRAW_SIZE / 2, soulY + SOUL_SPEED);
            if (keys.has('ArrowLeft'))  soulX = Math.max(SOUL_DRAW_SIZE / 2, soulX - SOUL_SPEED);
            if (keys.has('ArrowRight')) soulX = Math.min(boxW - SOUL_DRAW_SIZE / 2, soulX + SOUL_SPEED);

            spawnBullets(now);
            bullets = bullets
                .map(b => ({ ...b, x: b.x + b.vx, y: b.y + b.vy }))
                .filter(b => b.x > -20 && b.x < boxW + 20 && b.y > -20 && b.y < boxH + 20);

            checkCollision();
            if (invFrames > 0) invFrames--;

            ctx.fillStyle = '#0a0a1a';
            ctx.fillRect(0, 0, boxW, boxH);
            ctx.strokeStyle = '#7c3aed';
            ctx.lineWidth = 2;
            ctx.strokeRect(1, 1, boxW - 2, boxH - 2);

            const timerFrac = Math.max(0, 1 - elapsed / PHASE_DURATION);
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(4, boxH - 10, (boxW - 8) * timerFrac, 6);

            ctx.fillStyle = '#ffffff';
            for (const b of bullets) ctx.fillRect(b.x, b.y, b.w, b.h);

            drawHeart(soulX, soulY, SOUL_DRAW_SIZE);
            animId = requestAnimationFrame(loop);
        }

        animId = requestAnimationFrame(loop);

        const onKeyDown = (e: KeyboardEvent) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
                keys.add(e.key);
            }
        };
        const onKeyUp = (e: KeyboardEvent) => keys.delete(e.key);
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
        };
    }, [roomID]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
            <canvas ref={canvasRef} />
        </div>
    );
}
