import React, { useState, useEffect, useCallback } from 'react';
import { Individual, InheritanceMode, ValidationIssue, Gender, Status } from './types';
import { INITIAL_DATA, NODE_WIDTH } from './constants';
import { validatePedigree } from './services/validationService';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import EditPanel from './components/EditPanel';
import AnalysisModal from './components/AnalysisModal';
import Login from './components/Login';
import Legend from './components/Legend';
import { UserPlusIcon } from './components/icons';

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [familyData, setFamilyData] = useState<Individual[]>([]);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [nextId, setNextId] = useState<number>(1);
    const [inheritanceMode, setInheritanceMode] = useState<InheritanceMode>(InheritanceMode.AD);
    const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState<boolean>(false);
    const [viewBox, setViewBox] = useState({ x: -600, y: -450, w: 1200, h: 900 });
    
    useEffect(() => {
        const issues = validatePedigree(familyData, inheritanceMode);
        setValidationIssues(issues);
    }, [familyData, inheritanceMode]);

    const handleSelectNode = (id: string | null) => {
        setSelectedNodeId(id);
    };

    const handleNodeMove = (id: string, x: number, y: number) => {
        setFamilyData(prevData =>
            prevData.map(p => (p.id === id ? { ...p, x, y } : p))
        );
    };
    
    const handleUpdateIndividual = useCallback((updatedIndividual: Partial<Individual>) => {
        if (!selectedNodeId) return;
        setFamilyData(prev => prev.map(p => 
            p.id === selectedNodeId ? { ...p, ...updatedIndividual } : p
        ));
    }, [selectedNodeId]);

    const addNode = (newNode: Individual) => {
        setFamilyData(prev => [...prev, newNode]);
    };

    const addUnrelatedIndividual = useCallback(() => {
        const newId = `p${nextId}`;
        setNextId(prev => prev + 1);
        
        const centerX = viewBox.x + viewBox.w / 2;
        const centerY = viewBox.y + viewBox.h / 2;

        const newNode: Individual = {
            id: newId,
            name: `Person ${newId.replace('p','')}`,
            gender: Gender.Unknown,
            status: Status.Unaffected,
            isDeceased: false,
            isProband: false,
            x: centerX,
            y: centerY,
            parents: [],
            partners: []
        };

        addNode(newNode);
        setSelectedNodeId(newId);
    }, [nextId, viewBox]);

    const deleteNode = useCallback(() => {
        if (!selectedNodeId) return;
        if (!window.confirm(`Are you sure you want to remove this individual? This will also remove them as a parent from any children.`)) return;
        
        setFamilyData(prev => {
            const newData = prev.filter(p => p.id !== selectedNodeId);
            // Remove the deleted person from any parent arrays and partner arrays
            return newData.map(p => ({
                ...p,
                parents: p.parents.filter(parentId => parentId !== selectedNodeId),
                partners: p.partners.filter(partnerId => partnerId !== selectedNodeId)
            }));
        });
        setSelectedNodeId(null);
    }, [selectedNodeId]);

    const addChild = useCallback(() => {
        if (!selectedNodeId) return;
    
        const p1 = familyData.find(p => p.id === selectedNodeId);
        if (!p1) return;
    
        let partner = p1.partners.length > 0 ? familyData.find(p => p.id === p1.partners[0]) : familyData.find(p => p.partners.includes(p1.id));
        const needsNewPartner = !partner;
    
        const childId = `p${nextId}`;
        const partnerId = needsNewPartner ? `p${nextId + 1}` : '';
        setNextId(prev => prev + (needsNewPartner ? 2 : 1));
    
        setFamilyData(prevFamilyData => {
            let currentP1 = prevFamilyData.find(p => p.id === selectedNodeId);
            if (!currentP1) return prevFamilyData;
    
            let partnerInUpdater: Individual | undefined;
            const newNodes: Individual[] = [];
            
            if (currentP1.gender === Gender.Unknown) {
                currentP1 = { ...currentP1, gender: Gender.Female };
            }
    
            if (currentP1.partners.length > 0) {
                partnerInUpdater = prevFamilyData.find(p => p.id === currentP1.partners[0]);
            } else {
                partnerInUpdater = prevFamilyData.find(p => p.partners.includes(currentP1.id));
            }
    
            let p1WithNewPartner = currentP1;
            if (!partnerInUpdater) {
                const newPartner: Individual = {
                    id: partnerId,
                    name: `Partner ${partnerId.replace('p', '')}`,
                    gender: currentP1.gender === Gender.Male ? Gender.Female : Gender.Male,
                    status: Status.Unaffected, isDeceased: false, isProband: false,
                    x: currentP1.x + NODE_WIDTH + 60, y: currentP1.y,
                    parents: [], partners: [currentP1.id]
                };
                newNodes.push(newPartner);
                partnerInUpdater = newPartner;
                p1WithNewPartner = { ...currentP1, partners: [...currentP1.partners, partnerId] };
            }
    
            if (!partnerInUpdater) return prevFamilyData;
    
            const midX = (currentP1.x + partnerInUpdater.x) / 2;
            const childY = currentP1.y + 180;
            const siblings = prevFamilyData.filter(p =>
                p.parents.includes(currentP1.id) && p.parents.includes(partnerInUpdater!.id)
            );
            const finalX = siblings.length > 0 ? Math.max(...siblings.map(s => s.x)) + NODE_WIDTH + 20 : midX;
    
            const newChild: Individual = {
                id: childId,
                name: `Child ${childId.replace('p', '')}`,
                gender: Gender.Unknown, status: Status.Unaffected, isDeceased: false, isProband: false,
                x: finalX, y: childY,
                parents: [currentP1.id, partnerInUpdater.id], partners: []
            };
            newNodes.push(newChild);
    
            setSelectedNodeId(newChild.id);
    
            let updatedFamilyData = prevFamilyData.map(p => p.id === currentP1.id ? p1WithNewPartner : p);
            updatedFamilyData = [...updatedFamilyData, ...newNodes];
    
            return updatedFamilyData;
        });
    }, [selectedNodeId, familyData, nextId]);
    
    const addParents = useCallback(() => {
        if (!selectedNodeId) return;

        const child = familyData.find(p => p.id === selectedNodeId);
        if (!child) return;
        if (child.parents.length > 0) {
            alert("This individual already has parents.");
            return;
        }

        const fatherId = `p${nextId}`;
        const motherId = `p${nextId + 1}`;
        setNextId(prev => prev + 2);

        setFamilyData(prevFamilyData => {
            const currentChild = prevFamilyData.find(p => p.id === selectedNodeId);
            if (!currentChild) return prevFamilyData;
    
            const newFather: Individual = {
                id: fatherId,
                name: `Father ${fatherId.replace('p','')}`,
                gender: Gender.Male,
                status: Status.Unaffected,
                isDeceased: false, isProband: false,
                x: currentChild.x - (NODE_WIDTH / 2) - 30, y: currentChild.y - 180,
                parents: [], partners: [motherId]
            };
            const newMother: Individual = {
                id: motherId,
                name: `Mother ${motherId.replace('p','')}`,
                gender: Gender.Female,
                status: Status.Unaffected,
                isDeceased: false, isProband: false,
                x: currentChild.x + (NODE_WIDTH / 2) + 30, y: currentChild.y - 180,
                parents: [], partners: [fatherId]
            };
    
            const childWithParents = { ...currentChild, parents: [fatherId, motherId] };
            
            const updatedData = prevFamilyData.map(p => p.id === selectedNodeId ? childWithParents : p);
            return [...updatedData, newFather, newMother];
        });
    }, [selectedNodeId, familyData, nextId]);

    const addPartner = useCallback(() => {
        if (!selectedNodeId) return;
    
        const partnerId = `p${nextId}`;
        setNextId(prev => prev + 1);

        setFamilyData(prevFamilyData => {
            const p1 = prevFamilyData.find(p => p.id === selectedNodeId);
            if (!p1) return prevFamilyData;
    
            const existingPartners = prevFamilyData.filter(p => p1.partners.includes(p.id));
            const newX = existingPartners.length > 0
                ? Math.max(...existingPartners.map(p => p.x)) + NODE_WIDTH + 60
                : p1.x + NODE_WIDTH + 60;
    
            const newPartner: Individual = {
                id: partnerId,
                name: `Partner ${partnerId.replace('p', '')}`,
                gender: p1.gender === Gender.Male ? Gender.Female : Gender.Male,
                status: Status.Unaffected, isDeceased: false, isProband: false,
                x: newX, y: p1.y,
                parents: [], partners: [p1.id]
            };
    
            const p1WithNewPartner = { ...p1, partners: [...p1.partners, partnerId] };
    
            setSelectedNodeId(newPartner.id);
    
            const updatedData = prevFamilyData.map(p => p.id === p1.id ? p1WithNewPartner : p);
            return [...updatedData, newPartner];
        });
    }, [selectedNodeId, nextId]);

    const addSibling = useCallback(() => {
        if (!selectedNodeId) return;
        const node = familyData.find(p => p.id === selectedNodeId);
        if (!node || node.parents.length < 2) {
            alert("This individual needs two parents to add a sibling.");
            return;
        }

        const siblingId = `p${nextId}`;
        setNextId(prev => prev + 1);

        const siblings = familyData.filter(p => p.parents.join() === node.parents.join() && p.id !== node.id);
        const lastSiblingX = siblings.length > 0 
            ? Math.max(...siblings.map(s => s.x)) 
            : node.x;

        const newSibling: Individual = {
            id: siblingId,
            name: `Sibling ${siblingId.replace('p','')}`,
            gender: Gender.Unknown,
            status: Status.Unaffected,
            isDeceased: false, isProband: false,
            x: Math.max(lastSiblingX, node.x) + NODE_WIDTH + 20, y: node.y,
            parents: [...node.parents], partners: []
        };
        addNode(newSibling);
        setSelectedNodeId(newSibling.id);

    }, [selectedNodeId, familyData, nextId]);

    const handleReset = () => {
        if (window.confirm("Are you sure you want to clear the pedigree? All data will be lost.")) {
            setFamilyData([]);
            setNextId(1);
            setSelectedNodeId(null);
            setViewBox({ x: -600, y: -450, w: 1200, h: 900 });
            setInheritanceMode(InheritanceMode.AR);
        }
    };
    
    const handleFileLoad = (data: Individual[]) => {
        setFamilyData(data);
        const maxId = data.length > 0 ? Math.max(...data.map(n => parseInt(n.id.replace('p','')) || 0)) : 0;
        setNextId(maxId + 1);
        setSelectedNodeId(null);
    };

    const handleLoadSample = () => {
        if (familyData.length > 0 && !window.confirm("This will replace your current pedigree with the sample data. Are you sure?")) {
            return;
        }
        handleFileLoad(INITIAL_DATA);
        setViewBox({ x: 150, y: 0, w: 500, h: 400 });
    };

    const selectedNode = familyData.find(p => p.id === selectedNodeId);

    if (!isAuthenticated) {
        return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
    }

    return (
        <div className="h-full flex flex-col font-sans">
            <Header onAddUnrelatedIndividual={addUnrelatedIndividual} />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar
                    inheritanceMode={inheritanceMode}
                    setInheritanceMode={setInheritanceMode}
                    validationIssues={validationIssues}
                    onReset={handleReset}
                    onOpenStats={() => setIsAnalysisModalOpen(true)}
                    familyData={familyData}
                    onFileLoad={handleFileLoad}
                    onLoadSample={handleLoadSample}
                />
                <main className="flex-1 relative bg-slate-900 bg-grid-pattern overflow-auto">
                    <Canvas
                        familyData={familyData}
                        selectedNodeId={selectedNodeId}
                        onSelectNode={handleSelectNode}
                        onNodeMove={handleNodeMove}
                        validationIssues={validationIssues}
                        viewBox={viewBox}
                        onViewBoxChange={setViewBox}
                        inheritanceMode={inheritanceMode}
                    />
                    <Legend />
                     {selectedNode && (
                        <EditPanel
                            key={selectedNode.id}
                            node={selectedNode}
                            onClose={() => setSelectedNodeId(null)}
                            onUpdate={handleUpdateIndividual}
                            onDelete={deleteNode}
                            onAddChild={addChild}
                            onAddParents={addParents}
                            onAddPartner={addPartner}
                            onAddSibling={addSibling}
                        />
                    )}
                </main>
            </div>
            {isAnalysisModalOpen && (
                <AnalysisModal
                    familyData={familyData}
                    inheritanceMode={inheritanceMode}
                    onClose={() => setIsAnalysisModalOpen(false)}
                />
            )}
        </div>
    );
};

export default App;