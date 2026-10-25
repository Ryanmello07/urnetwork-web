import React from 'react';

const UR = '#ED8FFF', OK = '#87FB67', UI = '#D6E6F4', BG = '#101010';

/**
 * The marker of an entry's kind. The shape carries the kind and the colour
 * only reinforces it, so the six read apart without colour: a filled circle
 * (gain), a diamond (recovery), a triangle (observation), a half circle
 * (mixed), a ring (rejected or neutral) and a square (groundwork).
 */
export default function Glyph({ kind, size = 12, className = 'rr-glyph', x, y }) {
    return (
        <svg className={className} viewBox="0 0 12 12" width={size} height={size} x={x} y={y} aria-hidden="true" focusable="false">
            {kind === 'gain' && <circle cx="6" cy="6" r="5.4" fill={UR} />}
            {kind === 'recovery' && <path d="M6 0.5 L11.5 6 L6 11.5 L0.5 6 Z" fill={OK} />}
            {kind === 'observation' && <path d="M6 1 L11.3 10.6 L0.7 10.6 Z" fill={UI} />}
            {kind === 'mixed' && (
                <>
                    <circle cx="6" cy="6" r="4.9" stroke={UR} strokeWidth="1.3" fill={BG} />
                    <path d="M6 1.1 A4.9 4.9 0 0 0 6 10.9 Z" fill={UR} />
                </>
            )}
            {kind === 'rejected' && <circle cx="6" cy="6" r="4.9" stroke={UI} strokeWidth="1.3" strokeOpacity="0.8" fill={BG} />}
            {kind === 'groundwork' && <rect x="1.6" y="1.6" width="8.8" height="8.8" stroke={UI} strokeWidth="1.3" strokeOpacity="0.8" fill={BG} />}
        </svg>
    );
}
