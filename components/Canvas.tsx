import React, { useState, useRef, useMemo } from 'react';
import { Individual, InheritanceMode, ValidationIssue } from '../types';
import PedigreeNode from './PedigreeNode';
// FIX: Import NODE_HEIGHT from constants to resolve reference error.
import { NODE_WIDTH, NODE_HEIGHT } from '../constants';

interface CanvasProps {
    familyData: Individual[];
    selectedNodeId: string | null;
    onSelectNode: (id: string | null) => void;
    onNodeMove: (id: string, x: number, y: number) => void;
    validationIssues: ValidationIssue[];
    viewBox: { x: number; y: number; w: number; h: number };
    onViewBoxChange: (viewBox: { x: number; y: number; w: number; h: number }) => void;
    inheritanceMode: InheritanceMode;
}

const Canvas: React.FC<CanvasProps> = ({ familyData, selectedNodeId, onSelectNode, onNodeMove, validationIssues, viewBox, onViewBoxChange, inheritanceMode }) => {
    const [isPanning, setIsPanning] = useState(false);
    const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
    const svgRef = useRef<SVGSVGElement>(null);

    const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
        if (e.target !== svgRef.current) return;
        onSelectNode(null);
        setIsPanning(true);
        setStartPoint({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if (!isPanning) return;
        const dx = (e.clientX - startPoint.x) * (viewBox.w / window.innerWidth);
        const dy = (e.clientY - startPoint.y) * (viewBox.h / window.innerHeight);
        onViewBoxChange({ ...viewBox, x: viewBox.x - dx, y: viewBox.y - dy });
        setStartPoint({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
        setIsPanning(false);
    };

    const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
        e.preventDefault();
        const zoomFactor = 1.1;
        const newW = e.deltaY > 0 ? viewBox.w * zoomFactor : viewBox.w / zoomFactor;
        const newH = e.deltaY > 0 ? viewBox.h * zoomFactor : viewBox.h / zoomFactor;
        
        const svg = svgRef.current;
        if (!svg) return;
        
        const svgRect = svg.getBoundingClientRect();
        const mouseX = e.clientX - svgRect.left;
        const mouseY = e.clientY - svgRect.top;
        
        const svgX = viewBox.x + (mouseX / svgRect.width) * viewBox.w;
        const svgY = viewBox.y + (mouseY / svgRect.height) * viewBox.h;
        
        const newX = svgX - (mouseX / svgRect.width) * newW;
        const newY = svgY - (mouseY / svgRect.height) * newH;
        
        onViewBoxChange({ x: newX, y: newY, w: newW, h: newH });
    };

    const links = useMemo(() => {
        const renderedLinks: React.ReactElement[] = [];
        const personMap = new Map(familyData.map(p => [p.id, p]));
        const processedCouples = new Set<string>();
        const couplesWithChildren = new Map<string, { p1: Individual; p2: Individual; children: Individual[] }>();
    
        // Draw partnership lines for everyone
        familyData.forEach(person => {
            person.partners.forEach(partnerId => {
                const partner = personMap.get(partnerId);
                if (!partner) return;
    
                const [p1Id, p2Id] = [person.id, partner.id].sort();
                const coupleKey = `${p1Id}-${p2Id}`;
    
                if (!processedCouples.has(coupleKey)) {
                    const p1 = person.x < partner.x ? person : partner;
                    const p2 = person.x < partner.x ? partner : person;
                    
                    const marriageY = (p1.y + p2.y) / 2;
                    const marriageX1 = p1.x + NODE_WIDTH / 2;
                    const marriageX2 = p2.x - NODE_WIDTH / 2;
    
                    renderedLinks.push(
                        <line key={`mar-${coupleKey}`} x1={marriageX1} y1={marriageY} x2={marriageX2} y2={marriageY} className="ped-link" />
                    );
                    processedCouples.add(coupleKey);
                }
            });
        });
    
        // Group children by parents
        familyData.forEach(person => {
            if (person.parents.length === 2) {
                const [p1Id, p2Id] = [...person.parents].sort();
                const coupleKey = `${p1Id}-${p2Id}`;
                
                if (!couplesWithChildren.has(coupleKey)) {
                    const p1 = personMap.get(p1Id);
                    const p2 = personMap.get(p2Id);
                    if (p1 && p2) {
                        couplesWithChildren.set(coupleKey, { p1, p2, children: [] });
                    }
                }
                couplesWithChildren.get(coupleKey)?.children.push(person);
            }
        });
    
        // Draw descent and sibship lines for families
        couplesWithChildren.forEach(({ p1, p2, children }, coupleKey) => {
            const marriageY = (p1.y + p2.y) / 2;
            const marriageX1 = (p1.x < p2.x ? p1.x : p2.x) + NODE_WIDTH / 2;
            const marriageX2 = (p1.x > p2.x ? p1.x : p2.x) - NODE_WIDTH / 2;
            const midX = (marriageX1 + marriageX2) / 2;
            
            if (children.length === 1) {
                // For a single child, draw a clean L-shaped connector.
                const child = children[0];
                const childTopY = child.y - NODE_HEIGHT / 2;
                
                // Vertical line from parents' marriage line to the child's y-level
                renderedLinks.push(
                    <line key={`des-${coupleKey}`} x1={midX} y1={marriageY} x2={midX} y2={childTopY} className="ped-link" />
                );
        
                // Horizontal line from the descent line to the child's x-position
                renderedLinks.push(
                    <line key={`h-con-${child.id}`} x1={midX} y1={childTopY} x2={child.x} y2={childTopY} className="ped-link" />
                );

            } else if (children.length > 1) {
                // For multiple children, use the standard sibship line method.
                const sibshipY = marriageY + 90;
        
                // 1. Vertical descent line from parents' marriage line midpoint
                renderedLinks.push(
                    <line key={`des-${coupleKey}`} x1={midX} y1={marriageY} x2={midX} y2={sibshipY} className="ped-link" />
                );
        
                const sortedChildren = [...children].sort((a, b) => a.x - b.x);
                
                // The horizontal line must connect the central descent line and all children
                const allXPoints = [midX, ...sortedChildren.map(c => c.x)];
                const sibshipLineX1 = Math.min(...allXPoints);
                const sibshipLineX2 = Math.max(...allXPoints);
        
                // 2. Horizontal sibship line
                renderedLinks.push(
                    <line key={`sib-${coupleKey}`} x1={sibshipLineX1} y1={sibshipY} x2={sibshipLineX2} y2={sibshipY} className="ped-link" />
                );
        
                // 3. Vertical lines from sibship line to each child
                sortedChildren.forEach(child => {
                    renderedLinks.push(
                        <line key={`child-${child.id}`} x1={child.x} y1={sibshipY} x2={child.x} y2={child.y - NODE_HEIGHT / 2} className="ped-link" />
                    );
                });
            }
        });
        
        return renderedLinks;
    }, [familyData]);
    

    return (
        <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            className={`block cursor-grab ${isPanning ? 'active:cursor-grabbing' : ''}`}
        >
            <g id="linksLayer">{links}</g>
            <g id="nodesLayer">
                {familyData.map(person => (
                    <PedigreeNode
                        key={person.id}
                        person={person}
                        isSelected={selectedNodeId === person.id}
                        onSelect={onSelectNode}
                        onMove={onNodeMove}
                        validationIssues={validationIssues}
                        viewBox={viewBox}
                        inheritanceMode={inheritanceMode}
                    />
                ))}
            </g>
        </svg>
    );
};

export default Canvas;