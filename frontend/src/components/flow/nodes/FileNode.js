import React from 'react';
import { Handle, Position } from 'reactflow';
import { NODE_W, NODE_H } from '../../../constants/flowConstants';
import { getFileColor, getFileIcon } from '../../../utils/iconHelpers';

const CURSOR_COLORS = [
    '#a855f7', // Nuclear Purple
    '#3b82f6', // Bright Blue
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#ec4899'  // Pink
];

const FileNode = ({ data, selected }) => {
    const ext = data.label.split('.').pop()?.toLowerCase();
    const accentColor = getFileColor(data.label);
    const viewers = data.activeViewers || [];

    const renderSurroundingCursors = () => {
        if (viewers.length === 0) return null;

        const displayCount = Math.min(viewers.length, 6); 
        const displayUsers = viewers.slice(0, displayCount);

        return displayUsers.map((user, i) => {
            const name = user.name || user.dev_id;
            const color = CURSOR_COLORS[i % CURSOR_COLORS.length];

            const angle = (i / displayCount) * 2 * Math.PI + (Math.PI / 4);
            const rx = (NODE_W / 2) + 12; 
            const ry = (NODE_H / 2) + 16; 
            const x = (NODE_W / 2) + rx * Math.cos(angle);
            const y = (NODE_H / 2) + ry * Math.sin(angle);

            return (
                <div 
                    key={user.dev_id} 
                    className="group pointer-events-auto" // Added group and re-enabled pointer events
                    style={{
                        position: 'absolute',
                        left: x,
                        top: y,
                        transform: 'translate(-2px, -2px)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.6))',
                        zIndex: 20 + i,
                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' 
                    }}
                >
                    {/* The Cursor Pointer SVG */}
                    <svg width="14" height="18" viewBox="0 0 14 18" fill="none" style={{ position: 'relative', zIndex: 2 }}>
                        <path 
                            d="M1 1L12.5 10L8 11.5L5.5 16.5L1 1Z" 
                            fill={color} 
                            stroke="#ffffff" 
                            strokeWidth="1.5" 
                            strokeLinejoin="round" 
                        />
                    </svg>
                    
                    {/* The Name Tag Pill - Hidden by default, visible on hover */}
                    <div 
                        className="opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none"
                        style={{
                            background: color,
                            color: '#ffffff',
                            fontSize: '9px',
                            fontWeight: 'bold',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            marginTop: '8px',
                            marginLeft: '-3px',
                            zIndex: 1,
                            whiteSpace: 'nowrap',
                            border: '1px solid rgba(255,255,255,0.3)',
                        }}
                    >
                        {name}
                    </div>
                </div>
            );
        });
    };

    return (
        <div style={{
            width: NODE_W, height: NODE_H,
            background: selected ? '#0e0e0e' : '#070707',
            border: `1px solid ${selected ? '#333333' : '#1a1a1a'}`,
            borderLeft: `2px solid ${accentColor}44`,
            borderRadius: 7,
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '0 10px', cursor: 'pointer',
            boxShadow: 'none',
            transition: 'all 0.15s ease',
            fontFamily: '"Geist Mono", "JetBrains Mono", monospace',
            position: 'relative', 
        }}>
            <Handle type="target" position={Position.Top}    style={{ opacity: 0, pointerEvents: 'none' }} />
            <Handle type="target" position={Position.Bottom} style={{ opacity: 0, pointerEvents: 'none' }} />
            <Handle type="target" position={Position.Left}   style={{ opacity: 0, pointerEvents: 'none' }} />
            <Handle type="target" position={Position.Right}  style={{ opacity: 0, pointerEvents: 'none' }} />
            
            <div style={{ flexShrink: 0 }}>{getFileIcon(data.label)}</div>
            
            <span style={{
                fontSize: 11, color: '#ededed', fontWeight: 500,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                flex: 1, letterSpacing: '0.01em',
            }}>
                {data.label}
            </span>

            {ext && (
                <span style={{
                    fontSize: 9, color: accentColor + '99',
                    background: accentColor + '11',
                    border: `1px solid ${accentColor}22`,
                    borderRadius: 3, padding: '1px 4px',
                    flexShrink: 0, letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                }}>
                    {ext}
                </span>
            )}

            {renderSurroundingCursors()}
            
        </div>
    );
};

export default FileNode;