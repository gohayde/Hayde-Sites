import React from 'react';
import { Download, Trash2 } from 'lucide-react';
import PageLayout from './layout/PageLayout';

export default function SettingsPage() {
    const exportBuilds = () => {
        try {
            const builds = localStorage.getItem('haydeSiteBuilds');
            if (!builds || builds === '[]') {
                alert('No builds to export');
                return;
            }
            const blob = new Blob([builds], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'haydesite-builds.json';
            a.click();
        } catch (e) {
            console.error('Export failed', e);
        }
    };

    const clearData = () => {
        if (confirm('Are you sure you want to delete all generated website configurations? This action cannot be undone.')) {
            localStorage.removeItem('haydeSiteBuilds');
            alert('All builds cleared successfully');
        }
    };

    return (
        <PageLayout 
            title="Settings" 
            subtitle="Preferences and Data Management."
        >
            <div className="settings-grid">
                <div className="settings-card animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3>Gemini AI</h3>
                    <p>Fast, reliable cloud-based generation. The API key is securely provided by the AI Studio environment automatically.</p>
                    <div className="key-status text-success flex items-center gap-1 mt-4 text-sm font-medium">
                        <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span> Connected to AI Studio
                    </div>
                </div>

                <div className="settings-card animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                    <h3>Data Management</h3>
                    <p>Export or clear your saved builds.</p>
                    <div className="flex gap-3 mt-4">
                        <button className="btn btn-ghost" onClick={exportBuilds}>
                            <Download size={16} /> Export Builds
                        </button>
                        <button className="btn btn-danger" onClick={clearData}>
                            <Trash2 size={16} /> Clear All Data
                        </button>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}
