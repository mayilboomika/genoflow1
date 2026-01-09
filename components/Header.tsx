import React from 'react';
import { DnaIcon, UserPlusIcon } from './icons';

interface HeaderProps {
    onAddUnrelatedIndividual: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAddUnrelatedIndividual }) => {
    return (
        <header className="bg-slate-800 border-b border-slate-700 h-16 flex items-center justify-between px-6 shadow-sm z-20 flex-shrink-0">
            <div className="flex items-center gap-3">
                <div className="bg-purple-600 text-white p-2 rounded-lg">
                    <DnaIcon className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="font-bold text-xl tracking-tight text-slate-100">GenoFlow</h1>
                    <p className="text-xs text-slate-400 font-medium">Clinical Pedigree Studio</p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={onAddUnrelatedIndividual}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-slate-700 text-slate-200 rounded-md shadow-sm hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-purple-500 transition-colors"
                    title="Add New Unrelated Individual"
                >
                    <UserPlusIcon className="w-4 h-4" />
                    <span>Add Person</span>
                </button>
                <div className="hidden md:flex items-center gap-2 bg-slate-900 p-1 rounded-lg">
                    <button className="px-3 py-1.5 text-sm font-medium bg-purple-600 text-white shadow-sm rounded-md transition-all">Edit Mode</button>
                    <button className="px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-white transition-all">View Only</button>
                </div>
            </div>
        </header>
    );
};

export default Header;