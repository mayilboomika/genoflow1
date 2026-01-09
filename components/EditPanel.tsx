import React, { useState, useEffect } from 'react';
import { Individual, Gender, Status } from '../types';
import { Edit3Icon, XIcon, ArrowUpCircleIcon, HeartHandshakeIcon, UsersIcon, BabyIcon, Trash2Icon } from './icons';

interface EditPanelProps {
    node: Individual;
    onClose: () => void;
    onUpdate: (updatedIndividual: Partial<Individual>) => void;
    onDelete: () => void;
    onAddParents: () => void;
    onAddPartner: () => void;
    onAddSibling: () => void;
    onAddChild: () => void;
}

const EditPanel: React.FC<EditPanelProps> = ({ node, onClose, onUpdate, onDelete, onAddParents, onAddPartner, onAddSibling, onAddChild }) => {
    // Use local state only for text input to allow for a smooth typing experience.
    const [name, setName] = useState(node.name);

    // Sync local name state if the node prop changes from outside.
    useEffect(() => {
        setName(node.name);
    }, [node.name]);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    };

    // Update the parent's state on blur to avoid excessive re-renders.
    const handleNameBlur = () => {
        if (node.name !== name) {
            onUpdate({ name });
        }
    };

    const GenderButton: React.FC<{ value: Gender, children: React.ReactNode }> = ({ value, children }) => (
        <button
            onClick={() => onUpdate({ gender: value })}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                node.gender === value ? 'bg-purple-600 shadow-sm text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
        >
            {children}
        </button>
    );

    return (
        <div className="absolute top-6 right-6 w-72 glass-panel rounded-xl shadow-2xl p-5 animate-slide-in-right">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700">
                <h3 className="font-semibold text-slate-100 flex items-center gap-2">
                    <Edit3Icon className="w-4 h-4 text-purple-400" /> Edit Individual
                </h3>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
                    <XIcon className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Identifier</label>
                    <input 
                        type="text" 
                        value={name} 
                        onChange={handleNameChange}
                        onBlur={handleNameBlur}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-200 font-mono focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Clinical Status</label>
                    <select 
                        value={node.status} 
                        onChange={(e) => onUpdate({ status: e.target.value as Status })} 
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    >
                        <option value={Status.Unaffected}>Unaffected</option>
                        <option value={Status.Affected}>Affected</option>
                        <option value={Status.Carrier}>Carrier</option>
                        <option value={Status.Unknown}>Unknown</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Biological Sex</label>
                    <div className="flex p-1 bg-slate-900 rounded-lg">
                        <GenderButton value={Gender.Male}>Male</GenderButton>
                        <GenderButton value={Gender.Female}>Female</GenderButton>
                        <GenderButton value={Gender.Unknown}>Unknown</GenderButton>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                    <label htmlFor="isProband" className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                        <input 
                            type="checkbox" 
                            id="isProband" 
                            checked={node.isProband} 
                            onChange={(e) => onUpdate({ isProband: e.target.checked })} 
                            className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-purple-500 focus:ring-purple-500" 
                        />
                        Proband
                    </label>
                     <label htmlFor="isDeceased" className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                        <input 
                            type="checkbox" 
                            id="isDeceased" 
                            checked={node.isDeceased} 
                            onChange={(e) => onUpdate({ isDeceased: e.target.checked })} 
                            className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-purple-500 focus:ring-purple-500" 
                        />
                        Deceased
                    </label>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Build Relations</p>
                <div className="grid grid-cols-2 gap-2 mb-2">
                    <button onClick={onAddParents} className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-700 border border-slate-600 hover:bg-slate-600 text-slate-300 text-xs font-medium rounded-lg transition-all"><ArrowUpCircleIcon className="w-3.5 h-3.5 rotate-90" /> Parents</button>
                    <button onClick={onAddPartner} className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-700 border border-slate-600 hover:bg-slate-600 text-slate-300 text-xs font-medium rounded-lg transition-all"><HeartHandshakeIcon className="w-3.5 h-3.5" /> Partner</button>
                    <button onClick={onAddSibling} className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-700 border border-slate-600 hover:bg-slate-600 text-slate-300 text-xs font-medium rounded-lg transition-all"><UsersIcon className="w-3.5 h-3.5" /> Sibling</button>
                    <button onClick={onAddChild} className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500/20 border border-emerald-500/50 hover:bg-emerald-500/30 text-emerald-300 text-xs font-medium rounded-lg transition-all"><BabyIcon className="w-3.5 h-3.5" /> Child</button>
                </div>
                <button onClick={onDelete} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500/20 border border-red-500/50 hover:bg-red-500/30 text-red-400 text-xs font-medium rounded-lg transition-all mt-2"><Trash2Icon className="w-3.5 h-3.5" /> Remove Individual</button>
            </div>
        </div>
    );
};

export default EditPanel;