import React, { useState, useEffect } from 'react';
import { FolderOpen, X, Copy } from 'lucide-react';
import PageLayout from './layout/PageLayout';

export default function ManageBuilds({ onNavigate }: { onNavigate: (page: string) => void }) {
    const [builds, setBuilds] = useState<any[]>([]);
    const [selectedBuild, setSelectedBuild] = useState<any | null>(null);

    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('haydeSiteBuilds') || '[]');
            setBuilds(saved);
        } catch (e) {
            console.error('Failed to load builds', e);
        }
    }, []);

    const handleBuildClick = (build: any) => {
        setSelectedBuild(build);
    };

    const copyPrompt = () => {
        if (selectedBuild?.prompt) {
            navigator.clipboard.writeText(selectedBuild.prompt);
            alert('Prompt copied to clipboard!');
        }
    };

    return (
        <PageLayout 
            title="Manage Builds" 
            subtitle="All generated website builds."
        >
            <div className="builds-grid">
                {builds.length === 0 ? (
                    <div className="empty-state">
                        <FolderOpen size={40} className="mx-auto mb-4 opacity-20" />
                        <h3>No builds yet</h3>
                        <p>Generate your first website to see it here.</p>
                    </div>
                ) : (
                    builds.map(b => (
                        <div key={b.id} className="build-card animate-in fade-in slide-in-from-bottom-4 duration-500" onClick={() => handleBuildClick(b)}>
                            <h4>{b.name}</h4>
                            <p>{b.niche} &mdash; {b.city}</p>
                            <div className="build-card-meta">
                                <span className="build-tag">{b.date}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {selectedBuild && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-bg-2 rounded-xl border border-border-1 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-4 border-b border-border-1 bg-bg-1">
                            <div>
                                <h3 className="font-semibold text-lg text-text-1">{selectedBuild.name}</h3>
                                <p className="text-sm text-text-3">{selectedBuild.niche} - {selectedBuild.date}</p>
                            </div>
                            <button 
                                className="btn btn-ghost btn-sm" 
                                onClick={() => setSelectedBuild(null)}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                            <div>
                                <h4 className="text-sm font-semibold text-text-2 uppercase tracking-wider mb-3">Filled Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.entries(selectedBuild.answers || {}).map(([key, value]) => (
                                        <div key={key} className="bg-bg-1 p-3 rounded-lg border border-border">
                                            <span className="block text-xs text-text-3 font-mono mb-1">{key}</span>
                                            <span className="block text-sm text-text-1 font-medium">{String(value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {selectedBuild.templates && Object.keys(selectedBuild.templates).length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold text-text-2 uppercase tracking-wider mb-3">Selected Templates</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.entries(selectedBuild.templates).map(([section, templateId]) => (
                                            <div key={section} className="bg-bg-1 p-3 rounded-lg border border-border">
                                                <span className="block text-xs text-text-3 font-mono mb-1">{section}</span>
                                                <span className="block text-sm text-text-1 font-medium">{String(templateId)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-semibold text-text-2 uppercase tracking-wider">Generated Prompt</h4>
                                    <button className="btn btn-ghost btn-sm" onClick={copyPrompt}>
                                        <Copy size={14} /> Copy
                                    </button>
                                </div>
                                <pre className="bg-bg-0 p-4 rounded-lg border border-border text-xs text-text-2 overflow-x-auto whitespace-pre-wrap font-mono">
                                    <code>{selectedBuild.prompt}</code>
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </PageLayout>
    );
}
