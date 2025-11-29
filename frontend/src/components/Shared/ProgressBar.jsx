import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ value = -1, label = 'Progresso' }) => {
    const isUnknown = value === -1 || value === '?' || value == null;
    const raw = isUnknown ? 0 : (typeof value === 'string' ? parseInt(value, 10) || 0 : Math.round(value || 0));
    const pctClamped = Math.min(100, Math.max(0, raw));

    return (
        <div className="progress">
            <div className="progress-label">
                <span>{label}:</span>
                <span>{isUnknown ? '?%' : `${pctClamped}%`}</span>
            </div>
            <div
                className="progress-bar"
                role="progressbar"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={isUnknown ? 0 : pctClamped}
            >
                <div className="progress-fill" style={{ width: `${pctClamped}%` }} />
            </div>
        </div>
    );
};

export default ProgressBar;
