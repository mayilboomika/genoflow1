import React, { useState } from 'react';
import { Individual, Gender, Status, ValidationIssue, InheritanceMode } from '../types';
import { NODE_WIDTH, NODE_HEIGHT } from '../constants';

interface PedigreeNodeProps {
    person: Individual;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onMove: (id: string, x: number, y: number) => void;
    validationIssues: ValidationIssue[];
    viewBox: { x: number, y: number, w: number, h: number };
    inheritanceMode: InheritanceMode;
}

const PedigreeNode: React.FC<PedigreeNodeProps> = ({ person, isSelected, onSelect, onMove, validationIssues, viewBox, inheritanceMode }) => {
    const [isDragging, setIsDragging] = useState(false);
    
    const issue = validationIssues.find(iss => iss.id === person.id);
    const isCarrier = person.status === Status.Carrier;
    const isAutosomal = inheritanceMode === InheritanceMode.AR || inheritanceMode === InheritanceMode.AD;

    const getStatusClass = (status: Status) => {
        switch (status) {
            case Status.Affected:
                return 'status-affected';
            case Status.Unknown:
                return 'status-unknown';
            case Status.Carrier:
            case Status.Unaffected:
            default:
                return 'status-unaffected';
        }
    };

    const nodeClass = [
        'ped-node',
        getStatusClass(person.status),
        'stroke-slate-800',
        'stroke-2',
        isSelected ? 'selected' : '',
        issue ? `validation-${issue.type}` : ''
    ].join(' ');

    const handleMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect(person.id);
        setIsDragging(true);

        let startPos = { x: e.clientX, y: e.clientY };
        let startPersonPos = { x: person.x, y: person.y };

        const scaleX = viewBox.w / window.innerWidth;
        const scaleY = viewBox.h / window.innerHeight;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const dx = (moveEvent.clientX - startPos.x) * scaleX;
            const dy = (moveEvent.clientY - startPos.y) * scaleY;
            onMove(person.id, startPersonPos.x + dx, startPersonPos.y + dy);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
        
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const halfW = NODE_WIDTH / 2;
    const halfH = NODE_HEIGHT / 2;
    const cornerRadius = 4;

    const renderShape = () => {
        const shapeProps = {
            className: nodeClass,
            style: person.status === Status.Unknown ? { strokeDasharray: '4 4' } : {}
        };
        
        const carrierFillClass = 'carrier-fill pointer-events-none';

        switch (person.gender) {
            case Gender.Male:
                return (
                    <>
                        <rect x={-halfW} y={-halfH} width={NODE_WIDTH} height={NODE_HEIGHT} rx={cornerRadius} {...shapeProps} />
                        {isCarrier && isAutosomal && (
                            <path d={`M 0,${-halfH} L ${halfW - cornerRadius},${-halfH} A ${cornerRadius},${cornerRadius} 0 0 1 ${halfW},${-halfH + cornerRadius} L ${halfW},${halfH - cornerRadius} A ${cornerRadius},${cornerRadius} 0 0 1 ${halfW - cornerRadius},${halfH} L 0,${halfH} Z`} className={carrierFillClass} />
                        )}
                    </>
                );
            case Gender.Female:
                return (
                    <>
                        <circle cx="0" cy="0" r={halfW} {...shapeProps} />
                        {isCarrier && inheritanceMode === InheritanceMode.XL && <circle cx="0" cy="0" r="5" fill="#1e293b" pointerEvents="none" />}
                        {isCarrier && isAutosomal && (
                            <path d={`M 0,${-halfH} A ${halfW},${halfH} 0 0 1 0,${halfH} Z`} className={carrierFillClass} />
                        )}
                    </>
                );
            case Gender.Unknown:
                return (
                     <>
                        <polygon points={`0,-${halfH} ${halfW},0 0,${halfH} -${halfW},0`} {...shapeProps} />
                        {isCarrier && isAutosomal && (
                            <path d={`M 0,-${halfH} L ${halfW},0 L 0,${halfH} Z`} className={carrierFillClass} />
                        )}
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <g transform={`translate(${person.x}, ${person.y})`} onMouseDown={handleMouseDown} style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
            {renderShape()}
            {person.status === Status.Unknown && (
                <text textAnchor="middle" dominantBaseline="central" fontSize="24" fontWeight="bold" className="fill-slate-200 pointer-events-none select-none">?</text>
            )}
            {person.isDeceased && (
                <line x1={-halfW} y1={halfH} x2={halfW} y2={-halfH} className="status-deceased-slash" pointerEvents="none" />
            )}
             {person.isProband && (
                <path d={`M ${-halfW - 12},${-halfH - 12} L ${-halfW + 4}, ${-halfH + 4}`} stroke="#1e293b" strokeWidth="2" fill="none" />
            )}
            <text y={NODE_HEIGHT / 2 + 18} textAnchor="middle" className="text-sm font-mono fill-slate-400 pointer-events-none select-none">
                {person.name}
            </text>
        </g>
    );
};

export default PedigreeNode;