import React, { useMemo } from 'react';
import { Individual, Status, InheritanceMode, Gender } from '../types';
import { AuditIcon, XIcon, MicroscopeIcon, DownloadPdfIcon } from './icons';

interface AnalysisModalProps {
    familyData: Individual[];
    inheritanceMode: InheritanceMode;
    onClose: () => void;
}

const findAncestors = (personId: string, familyMap: Map<string, Individual>, ancestors = new Set<string>()): Individual[] => {
    const person = familyMap.get(personId);
    if (!person || !person.parents) return [];

    person.parents.forEach(parentId => {
        if (!ancestors.has(parentId)) {
            ancestors.add(parentId);
            findAncestors(parentId, familyMap, ancestors);
        }
    });

    return Array.from(ancestors).map(id => familyMap.get(id)!);
};


const AnalysisModal: React.FC<AnalysisModalProps> = ({ familyData, inheritanceMode, onClose }) => {
    
    const {
        proband,
        riskPercentage,
        totalMembers,
        affectedCount,
        obligateCarriers,
        phenotypeInventory,
        sessionDate,
        sessionId,
    } = useMemo(() => {
        const familyMap = new Map(familyData.map(p => [p.id, p]));
        const currentProband = familyData.find(p => p.isProband);

        // --- Risk Assessment ---
        let calculatedRisk = 0;
        if (currentProband) {
            const ancestors = findAncestors(currentProband.id, familyMap);
            if (ancestors.length > 0) {
                const affectedAncestors = ancestors.filter(p => p.status === Status.Affected).length;
                calculatedRisk = (affectedAncestors / ancestors.length) * 100;
            }
        }
        
        // --- Mapping Stats ---
        let calculatedObligateCarriers = 0;
        familyData.forEach(person => {
            const children = familyData.filter(child => child.parents.includes(person.id));
            if (inheritanceMode === InheritanceMode.AR && person.status === Status.Unaffected) {
                if (children.some(child => child.status === Status.Affected)) {
                    calculatedObligateCarriers++;
                }
            } else if (inheritanceMode === InheritanceMode.XL && person.gender === Gender.Female && person.status === Status.Unaffected) {
                const sons = children.filter(child => child.gender === Gender.Male);
                if (sons.some(son => son.status === Status.Affected)) {
                    calculatedObligateCarriers++;
                }
            }
        });
        
        // --- Phenotype Inventory ---
        const inventory = familyData
            .sort((a, b) => (a.isProband ? -1 : b.isProband ? 1 : 0))
            .map(p => ({
                id: p.id,
                name: p.name,
                label: p.isProband ? `${p.name} (Patient) (proband)` : p.name,
                status: p.status.toUpperCase(),
            }));

        const sId = `GX-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        const sDate = new Date().toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).replace(',', ' @');


        return {
            proband: currentProband,
            riskPercentage: Math.round(calculatedRisk),
            totalMembers: familyData.length,
            affectedCount: familyData.filter(p => p.status === Status.Affected).length,
            obligateCarriers: calculatedObligateCarriers,
            phenotypeInventory: inventory,
            sessionDate: sDate,
            sessionId: sId,
        };
    }, [familyData, inheritanceMode]);

    const getStatusChipColor = (status: string) => {
        switch (status) {
            case 'AFFECTED': return 'bg-purple-200 text-purple-800';
            case 'CARRIER': return 'bg-yellow-200 text-yellow-800';
            case 'UNKNOWN': return 'bg-slate-200 text-slate-600';
            case 'UNAFFECTED':
            default: return 'bg-green-200 text-green-800';
        }
    };
    
    const handleDownloadPdf = () => {
        alert("PDF export functionality is not yet implemented.");
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col h-[90vh] animate-zoom-in">
                {/* Header */}
                <header className="bg-purple-800 text-white flex items-center justify-between p-4 rounded-t-2xl flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <AuditIcon className="w-6 h-6 opacity-80" />
                        <h2 className="text-lg font-bold tracking-wider">CLINICAL GENETIC AUDIT</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-colors">
                        <XIcon className="w-5 h-5" />
                    </button>
                </header>

                {/* Body */}
                <main className="flex-1 overflow-y-auto p-8 bg-purple-50/50 text-slate-800">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">GenoFlow Analysis</h1>
                            <p className="text-slate-500 font-medium">{sessionDate}</p>
                        </div>
                        <div className="text-right">
                             <div className="p-3 bg-purple-100 text-purple-600 rounded-xl inline-block mb-1">
                                <MicroscopeIcon className="w-8 h-8"/>
                            </div>
                            <p className="text-xs font-bold text-purple-400">SESSION ID: {sessionId}</p>
                        </div>
                    </div>

                    <hr className="border-t-2 border-purple-200 mb-6" />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Patient Risk */}
                        <div>
                            <h3 className="text-sm font-bold uppercase text-purple-500 tracking-wider mb-2">Patient Risk Assessment</h3>
                            <div className="bg-white/80 border border-purple-100 rounded-2xl p-6 flex items-center gap-6 shadow-sm">
                                <div className="relative font-black text-6xl text-slate-800">
                                    {riskPercentage}<span className="text-3xl text-purple-400">%</span>
                                    <div className="absolute -left-4 top-0 bottom-0 w-1.5 bg-purple-500 rounded-full"></div>
                                </div>
                                <p className="text-slate-500 text-sm">
                                    { !proband ? "No proband selected." : familyData.length <= 1 ? "Add ancestors to begin genetic mapping." : `Based on the current pedigree, the patient has a ${riskPercentage}% risk factor.`}
                                </p>
                            </div>
                        </div>
                        {/* Mapping Stats */}
                        <div>
                            <h3 className="text-sm font-bold uppercase text-purple-500 tracking-wider mb-2">Mapping Stats</h3>
                            <div className="bg-white/80 border border-purple-100 rounded-2xl p-6 shadow-sm text-sm">
                                <div className="flex justify-between items-center py-2 border-b border-purple-100">
                                    <span className="font-medium text-slate-600">Total Members Mapped:</span>
                                    <span className="font-bold text-lg text-slate-800">{totalMembers}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-purple-100">
                                    <span className="font-medium text-slate-600">Affected Found:</span>
                                    <span className="font-bold text-lg text-purple-700">{affectedCount}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="font-medium text-slate-600">Obligate Carriers:</span>
                                    <span className="font-bold text-lg text-slate-800">{obligateCarriers}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Phenotype Inventory */}
                    <div>
                        <h3 className="text-sm font-bold uppercase text-purple-500 tracking-wider mb-2">Phenotype Inventory</h3>
                        <div className="bg-white/80 border border-purple-100 rounded-2xl shadow-sm">
                            <ul className="divide-y divide-purple-100">
                                {phenotypeInventory.map(person => (
                                    <li key={person.id} className="flex justify-between items-center p-3">
                                        <span className="font-medium text-slate-700 text-sm">{person.label}</span>
                                        <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${getStatusChipColor(person.status)}`}>
                                            {person.status === 'UNAFFECTED' ? 'HEALTHY' : person.status}
                                        </span>
                                    </li>
                                ))}
                                {phenotypeInventory.length === 0 && (
                                     <li className="text-center p-6 text-slate-500">No individuals in pedigree.</li>
                                )}
                            </ul>
                        </div>
                    </div>

                </main>
                
                {/* Footer */}
                <footer className="flex justify-end items-center p-4 bg-white/50 border-t border-purple-100 rounded-b-2xl flex-shrink-0 space-x-3">
                    <button 
                        onClick={handleDownloadPdf}
                        className="px-5 py-2.5 border border-purple-200 text-purple-700 font-bold text-sm rounded-xl hover:bg-purple-100 transition-colors flex items-center gap-2"
                    >
                       <DownloadPdfIcon className="w-4 h-4"/> Download PDF
                    </button>
                    <button 
                        onClick={onClose}
                        className="px-6 py-2.5 bg-purple-700 text-white font-bold text-sm rounded-xl hover:bg-purple-800 transition-colors"
                    >
                        Close Portal
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default AnalysisModal;
