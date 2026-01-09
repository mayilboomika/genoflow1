import React, { useRef } from 'react';
import { InheritanceMode, ValidationIssue, Individual } from '../types';
import { ActivityIcon, BarChart2Icon, RotateCcwIcon, CheckCircle2Icon, DownloadIcon, UploadIcon, MicroscopeIcon } from './icons';

interface SidebarProps {
    inheritanceMode: InheritanceMode;
    setInheritanceMode: (mode: InheritanceMode) => void;
    validationIssues: ValidationIssue[];
    onReset: () => void;
    onOpenStats: () => void;
    familyData: Individual[];
    onFileLoad: (data: Individual[]) => void;
    onLoadSample: () => void;
}

const ModeButton: React.FC<{
    mode: InheritanceMode;
    current: InheritanceMode;
    setMode: (mode: InheritanceMode) => void;
    title: string;
    acronym: string;
}> = ({ mode, current, setMode, title, acronym }) => (
    <button
        onClick={() => setMode(mode)}
        className={`p-2 rounded-lg border-2 text-center transition-all focus:outline-none focus:ring-2 focus:ring-purple-400 ${
            current === mode 
                ? 'bg-purple-500/20 border-purple-500 shadow-sm' 
                : 'bg-slate-700/50 border-slate-600 hover:border-slate-500 hover:bg-slate-700'
        }`}
    >
        <span className={`block font-bold text-sm ${current === mode ? 'text-purple-300' : 'text-slate-300'}`}>{acronym}</span>
        <span className={`block text-[10px] font-medium ${current === mode ? 'text-purple-400' : 'text-slate-400'}`}>{title}</span>
    </button>
);


const Sidebar: React.FC<SidebarProps> = ({ inheritanceMode, setInheritanceMode, validationIssues, onReset, onOpenStats, familyData, onFileLoad, onLoadSample }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        if (familyData.length === 0) {
            alert("There is no data to save.");
            return;
        }
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(familyData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "pedigree.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target?.result as string);
                    onFileLoad(data);
                } catch (error) {
                    alert("Error parsing JSON file. Please check the file format.");
                }
            };
            reader.readAsText(file);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const hasErrors = validationIssues.some(issue => issue.type === 'error');

    return (
        <aside className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex-shrink-0">
            {/* Inheritance Settings */}
            <div className="p-5 border-b border-slate-700">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <ActivityIcon className="w-4 h-4" />
                    Inheritance Model
                </h2>
                <div className="grid grid-cols-2 gap-2">
                    <ModeButton mode={InheritanceMode.AR} current={inheritanceMode} setMode={setInheritanceMode} title="Autosomal Recessive" acronym="AR" />
                    <ModeButton mode={InheritanceMode.AD} current={inheritanceMode} setMode={setInheritanceMode} title="Autosomal Dominant" acronym="AD" />
                    <ModeButton mode={InheritanceMode.XL} current={inheritanceMode} setMode={setInheritanceMode} title="X-Linked" acronym="XL" />
                    <ModeButton mode={InheritanceMode.YL} current={inheritanceMode} setMode={setInheritanceMode} title="Y-Linked" acronym="YL" />
                </div>
            </div>

            {/* Analysis Tools */}
            <div className="p-5 border-b border-slate-700">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Tools & Data</h2>
                <div className="grid grid-cols-2 gap-2 mb-3">
                    <button onClick={onOpenStats} className="flex flex-col items-center justify-center p-3 bg-slate-700/50 border border-slate-600 rounded-lg hover:bg-purple-500/20 hover:border-purple-500 hover:text-purple-300 transition-all group">
                        <BarChart2Icon className="w-5 h-5 mb-1 text-slate-400 group-hover:text-purple-300" />
                        <span className="text-xs font-medium">Statistics</span>
                    </button>
                    <button onClick={onReset} className="flex flex-col items-center justify-center p-3 bg-slate-700/50 border border-slate-600 rounded-lg hover:bg-red-500/20 hover:border-red-500 hover:text-red-300 transition-all group">
                        <RotateCcwIcon className="w-5 h-5 mb-1 text-slate-400 group-hover:text-red-300" />
                        <span className="text-xs font-medium">Reset</span>
                    </button>
                </div>
                 <button onClick={onLoadSample} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg hover:bg-slate-700 text-slate-300 text-sm font-medium transition-all group">
                    <MicroscopeIcon className="w-5 h-5 text-slate-400 group-hover:text-purple-300" />
                    <span>Load Sample</span>
                </button>
            </div>

            {/* Validation Console */}
            <div className="flex-1 overflow-y-auto p-5 bg-slate-900/50">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Validation Console</h2>
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold ${
                        hasErrors 
                            ? 'bg-red-500/20 text-red-300' 
                            : 'bg-green-500/20 text-green-300'
                    }`}>
                        <div className={`w-2 h-2 rounded-full ${hasErrors ? 'bg-red-500' : 'bg-green-500'}`}></div>
                        <span>Validated: {hasErrors ? 'NO' : 'YES'}</span>
                    </div>
                </div>

                {validationIssues.length === 0 ? (
                    <div className="text-center py-8">
                        <CheckCircle2Icon className="w-8 h-8 text-green-400 mx-auto mb-2 opacity-50" />
                        <p className="text-sm text-slate-400">System Nominal. No genetic inconsistencies detected.</p>
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {validationIssues.map((issue, index) => (
                            <li
                                key={index}
                                className={`text-xs p-2 rounded-lg border ${
                                    issue.type === 'error'
                                        ? 'bg-red-900/50 border-red-700/50 text-red-200'
                                        : 'bg-amber-900/50 border-amber-700/50 text-amber-200'
                                }`}
                            >
                                <span className={`font-bold ${issue.type === 'error' ? 'text-red-100' : 'text-amber-100'}`}>{issue.type.toUpperCase()}:</span> {issue.message}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Data Actions */}
            <div className="p-4 border-t border-slate-700 bg-slate-800">
                <div className="flex gap-2">
                    <button onClick={handleExport} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors">
                        <DownloadIcon className="w-4 h-4" /> Save
                    </button>
                    <button onClick={handleImportClick} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-700 border border-slate-600 hover:bg-slate-600 text-slate-200 text-sm font-medium rounded-lg transition-colors">
                        <UploadIcon className="w-4 h-4" /> Load
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileChange} />
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;