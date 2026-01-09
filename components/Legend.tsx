import React from 'react';

const LegendItem: React.FC<{ symbol: React.ReactNode; label: string }> = ({ symbol, label }) => (
    <div className="flex items-center gap-2">
        <div className="w-6 h-6 flex items-center justify-center">{symbol}</div>
        <span className="text-xs font-medium text-slate-300">{label}</span>
    </div>
);

const SvgContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg width="20" height="20" viewBox="-13 -13 26 26">{children}</svg>
);

const MaleShape = (props: any) => <rect x="-10" y="-10" width="20" height="20" rx="2" {...props} />;
const FemaleShape = (props: any) => <circle cx="0" cy="0" r="10" {...props} />;
const DeceasedLine = () => <line x1="-7" y1="7" x2="7" y2="-7" className="status-deceased-slash" />;
const CarrierFillFemale = () => <path d="M 0,-10 A 10,10 0 0 1 0,10 Z" className="carrier-fill" />;

const Legend = () => (
    <div className="absolute bottom-4 left-4 glass-panel rounded-lg shadow-lg p-3 w-auto animate-fade-in pointer-events-none">
        <h3 className="font-bold text-slate-100 text-xs mb-2 pb-1 border-b border-slate-700 uppercase tracking-wider">Legend</h3>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            <LegendItem 
                label="Male"
                symbol={<SvgContainer><MaleShape className="status-unaffected stroke-slate-400 stroke-2" /></SvgContainer>} 
            />
            <LegendItem 
                label="Female"
                symbol={<SvgContainer><FemaleShape className="status-unaffected stroke-slate-400 stroke-2" /></SvgContainer>} 
            />
            <LegendItem 
                label="Unaffected"
                symbol={<SvgContainer><MaleShape className="status-unaffected stroke-slate-400 stroke-2" /></SvgContainer>} 
            />
            <LegendItem 
                label="Affected"
                symbol={<SvgContainer><FemaleShape className="status-affected stroke-slate-800 stroke-2" /></SvgContainer>} 
            />
            <LegendItem 
                label="Carrier"
                symbol={
                    <SvgContainer>
                        <FemaleShape className="status-unaffected stroke-slate-800 stroke-2" />
                        <CarrierFillFemale />
                    </SvgContainer>
                } 
            />
             <LegendItem 
                label="Deceased"
                symbol={
                    <SvgContainer>
                        <MaleShape className="status-unaffected stroke-slate-400 stroke-2" />
                        <DeceasedLine />
                    </SvgContainer>
                } 
            />
        </div>
    </div>
);

export default Legend;
