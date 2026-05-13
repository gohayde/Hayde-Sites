import React, { useState } from 'react';
import { Search, MapPin, Globe, ExternalLink, Loader2, Users } from 'lucide-react';
import Markdown from 'react-markdown';
import { GoogleGenAI } from '@google/genai';

export default function LeadGenerator() {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState('');
    const [sourceLinks, setSourceLinks] = useState<{ title: string, uri: string }[]>([]);
    const [error, setError] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setError('');
        setResults('');
        setSourceLinks([]);

        try {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) throw new Error('Gemini API key not found in environment.');

            const ai = new GoogleGenAI({ apiKey });
            const systemInstruction = `You are an expert lead generator. The user will provide a search query for local businesses (e.g., 'Plumbers in Austin').
Your task is to:
1. Use Google Maps to find businesses matching the query.
2. For each business, extract their name, rating, phone number, and website.
3. If a business does not have a website listed on their Maps profile, you MUST use Google Search to verify if they have a website or not.
4. Return a clean, formatted list of these businesses. Include Name, Rating, Phone, and Website Status (with URL if found, or 'No website found' if verified they don't have one).`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: query.trim(),
                config: {
                    systemInstruction,
                    tools: [{ googleSearch: {} }, { googleMaps: {} }]
                }
            });

            const text = response.text || 'No results found.';
            setResults(text);

            const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
            const links: { title: string, uri: string }[] = [];
            
            if (chunks) {
                chunks.forEach((chunk: any) => {
                    if (chunk.web?.uri && chunk.web?.title) {
                        links.push({ title: chunk.web.title, uri: chunk.web.uri });
                    }
                    if (chunk.maps?.uri && chunk.maps?.title) {
                        links.push({ title: chunk.maps.title, uri: chunk.maps.uri });
                    }
                });
            }

            // Deduplicate links
            const uniqueLinks = Array.from(new Map(links.map(item => [item.uri, item])).values());
            setSourceLinks(uniqueLinks);

        } catch (err: any) {
            console.error(err);
            let errorMessage = err.message;
            if (errorMessage.includes('429') || errorMessage.includes('quota')) {
                errorMessage = 'Gemini API quota exceeded. Please check your API key billing details or try again later.';
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page active">
            <div className="page-header">
                <div>
                    <h1 className="page-title flex items-center gap-2">
                        <Users className="text-accent" /> Lead Generator
                    </h1>
                    <p className="page-subtitle">Find local businesses using Google Maps and Search grounding.</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto mt-8">
                <form onSubmit={handleSearch} className="mb-8">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-3" size={20} />
                            <input
                                type="text"
                                className="w-full bg-bg-1 border border-border-1 rounded-xl py-4 pl-12 pr-4 text-text-1 focus:outline-none focus:border-accent text-lg"
                                placeholder="e.g., Plumbers in Austin, TX"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="btn btn-accent px-8 text-lg"
                            disabled={isLoading || !query.trim()}
                        >
                            {isLoading ? (
                                <><Loader2 className="animate-spin" size={20} /> Searching...</>
                            ) : (
                                'Find Leads'
                            )}
                        </button>
                    </div>
                </form>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-8">
                        {error}
                    </div>
                )}

                {results && (
                    <div className="bg-bg-1 border border-border-1 rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="p-6 border-b border-border-1">
                            <h2 className="text-xl font-semibold text-text-1 mb-4 flex items-center gap-2">
                                <MapPin size={20} className="text-accent" /> Generated Leads
                            </h2>
                            <div className="markdown-body prose prose-invert max-w-none">
                                <Markdown>{results}</Markdown>
                            </div>
                        </div>
                        
                        {sourceLinks.length > 0 && (
                            <div className="p-6 bg-bg-2">
                                <h3 className="text-sm font-semibold text-text-2 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Globe size={16} /> Source Links
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {sourceLinks.map((link, idx) => (
                                        <a 
                                            key={idx} 
                                            href={link.uri} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="flex items-center gap-2 p-3 rounded-lg border border-border-1 bg-bg-1 hover:border-accent hover:text-accent transition-colors text-sm text-text-2"
                                        >
                                            <ExternalLink size={14} className="shrink-0" />
                                            <span className="truncate">{link.title || link.uri}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
