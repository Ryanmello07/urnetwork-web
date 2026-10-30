import React from 'react';
import './OperatorLogos.css';
import { EXTERNAL } from '../lib/links';

// The network operators, as logos. An operator appears here once it is
// admitted; its row in the live directory below needs a public stats feed.
// Logos are the operators' own published marks, drawn white on the page.
export const OPERATOR_LOGOS = [
    { name: 'ur.io', href: 'https://ur.io', logo: '/operators/urnetwork.svg', width: 980, height: 139 },
    { name: 'Persistent AI', href: 'https://persistentai.org', logo: '/operators/persistent-ai.svg', width: 230, height: 28 },
];

/** The operator logo strip on /operators. */
export default function OperatorLogos({ title }) {
    return (
        <div className="operator-logos">
            <span className="operator-logos-title">{title}</span>
            <ul className="operator-logos-list">
                {OPERATOR_LOGOS.map((op) => (
                    <li key={op.name}>
                        <a href={op.href} {...EXTERNAL} aria-label={op.name} title={op.name}>
                            <img src={op.logo} alt={op.name} width={op.width} height={op.height} loading="lazy" decoding="async" />
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
