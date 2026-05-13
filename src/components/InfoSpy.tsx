import React, { useState } from 'react';
import { Search, Loader2, FileText, RotateCcw } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import PageLayout from './layout/PageLayout';

const SPY_FIELDS = [
    { key: 'businessName', label: 'Business Name' },
    { key: 'websiteType', label: 'Trade / Service Niche' },
    { key: 'primaryGoal', label: 'Primary Goal' },
    { key: 'targetAudience', label: 'Target Audience' },
    { key: 'coreFeatures', label: 'Core Features' },
    { key: 'brandStyle', label: 'Brand Style' },
    { key: 'colorPreference', label: 'Color Preference' },
    { key: 'usp', label: 'Unique Selling Proposition' },
    { key: 'credibility', label: 'Credibility Markers' },
    { key: 'serviceAreas', label: 'Service Areas' },
    { key: 'contactInfo', label: 'Contact Info' },
    { key: 'socialLinks', label: 'Social Links' },
    { key: 'pagesMentioned', label: 'Pages Mentioned' },
];

export default function InfoSpy({ onNavigate }: { onNavigate: (page: string) => void }) {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [spyData, setSpyData] = useState<Record<string, string> | null>(null);
    const [sourceUrl, setSourceUrl] = useState('');

    const spyBusiness = async () => {
        if (!query.trim()) {
            alert('Enter a business name');
            return;
        }

        setIsLoading(true);
        setStatusText('Searching Google for the business...');
        setSpyData(null);

        try {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) throw new Error('Gemini API key not found in environment.');

            const ai = new GoogleGenAI({ apiKey });
            const extractionPrompt = `You are a data extraction expert. The user searched for: "${query.trim()}". 
Use Google Search to find this business's official website, their Google Business Profile, Yelp, Facebook, or any other relevant online presence.

Extract all the business info you can find and return ONLY valid JSON (no markdown, no backticks). If you cannot find a value, make your best guess based on the niche. Only use "Not found" as a last resort.

Return this exact JSON:
{
  "businessName": "",
  "websiteType": "",
  "primaryGoal": "",
  "targetAudience": "",
  "coreFeatures": "",
  "brandStyle": "",
  "colorPreference": "",
  "usp": "",
  "credibility": "",
  "serviceAreas": "",
  "contactInfo": "",
  "socialLinks": "",
  "pagesMentioned": ""
}

For "websiteType", specify the specific trade or service niche (e.g., HVAC, Auto Detailing, Custom Decks).
For "primaryGoal", suggest the main goal (e.g., Generate leads, get phone calls, book appointments online).
For "targetAudience", infer the target audience from services (e.g., High-end homeowners, commercial properties).
For "coreFeatures", suggest features like Quote request form, online booking, photo gallery, blog.
For "brandStyle", suggest a style like Rugged & bold, clean & modern, premium & luxury.
For "colorPreference", extract or infer brand colors.
For "usp", write a compelling unique selling proposition based on what you find.
For "credibility", extract markers like years in business, licensed & insured, reviews from GBP/Yelp.
For "serviceAreas", list cities/areas separated by commas.
For "contactInfo", extract phone, email, and physical address.
For "socialLinks", extract any social media links found (Facebook, Instagram, Yelp, GBP).
For "pagesMentioned", suggest specific pages needed based on the niche (e.g., Before/After, Financing, Team).`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: extractionPrompt,
                config: {
                    tools: [{ googleSearch: {} }, { googleMaps: {} }]
                }
            });
            
            let text = response.text || '{}';
            text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
            
            const extracted = JSON.parse(text);
            
            const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
            let url = 'Google Search';
            if (chunks && chunks.length > 0) {
                const urls = chunks.map((c: any) => c.web?.uri).filter(Boolean);
                if (urls.length > 0) {
                    url = urls[0];
                }
            }

            setSpyData(extracted);
            setSourceUrl(url);
            setStatusText('');
        } catch (err: any) {
            console.error(err);
            let errorMessage = err.message;
            if (errorMessage.includes('429') || errorMessage.includes('quota')) {
                errorMessage = 'Gemini API quota exceeded. Please check your API key billing details or try again later.';
            }
            setStatusText('Error: ' + errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerate = () => {
        // In a real app, we'd pass this data to NewBuild via context or state manager
        // For now, we'll just alert that it's ready
        alert('Data ready! In a full implementation, this would pre-fill the New Build wizard.');
        onNavigate('new-build');
    };

    const resetSpy = () => {
        setSpyData(null);
        setQuery('');
        setStatusText('');
    };

    return (
        <PageLayout 
            title="Info Spy" 
            subtitle="Enter a business name — we'll search Google, find their site, and extract everything."
        >
            <div className="spy-container">
                <div className="spy-input-wrap">
                    <input 
                        type="text" 
                        className="spy-input" 
                        placeholder="e.g. Acme Roofing Dallas TX"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') spyBusiness(); }}
                        disabled={isLoading}
                    />
                    <button className="btn btn-accent" onClick={spyBusiness} disabled={isLoading}>
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                        Spy
                    </button>
                </div>

                {isLoading && (
                    <div className="spy-status flex">
                        <div className="spy-status-icon">
                            <Loader2 size={24} className="animate-spin text-accent" />
                        </div>
                        <p className="spy-status-text">{statusText}</p>
                    </div>
                )}

                {!isLoading && statusText && !spyData && (
                    <div className="spy-status flex border-danger/20 text-danger">
                        <p className="spy-status-text text-danger">{statusText}</p>
                    </div>
                )}

                {spyData && (
                    <div className="spy-results block animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="spy-results-header">
                            <h3>Extracted Info from {sourceUrl}</h3>
                            <div className="spy-results-actions">
                                <button className="btn btn-accent" onClick={handleGenerate}>
                                    <FileText size={16} /> Generate Prompt
                                </button>
                                <button className="btn btn-ghost btn-sm" onClick={resetSpy}>
                                    <RotateCcw size={16} /> Reset
                                </button>
                            </div>
                        </div>
                        <div className="spy-fields">
                            {SPY_FIELDS.map(f => (
                                <div className="spy-field" key={f.key}>
                                    <label className="spy-field-label">{f.label}</label>
                                    <input 
                                        type="text" 
                                        className="spy-field-input" 
                                        value={spyData[f.key] || 'Not found'}
                                        onChange={(e) => setSpyData({ ...spyData, [f.key]: e.target.value })}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </PageLayout>
    );
}
