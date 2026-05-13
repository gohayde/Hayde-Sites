import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Copy, RotateCcw, Zap, Sparkles, Check } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { MASTER_PROMPT } from '../prompt';
import PageLayout from './layout/PageLayout';

const QUESTIONS = [
    { key: 'businessName', question: 'Business Name', hint: 'Exact name as it appears on the website.', skip: false },
    { key: 'businessNiche', question: 'Business Niche', hint: 'e.g., HVAC, Auto Detailing, Custom Decks, Plumbing.', skip: false },
    { key: 'primaryGoal', question: 'Primary Goal', hint: 'Phone Calls / Estimate Requests', skip: false },
    { key: 'targetAudience', question: 'Target Audience', hint: 'e.g., High-end homeowners, commercial properties.', skip: false },
    { key: 'financingRequired', question: 'Financing Required?', hint: 'Yes / No', skip: false },
    { key: 'brandStyle', question: 'Brand Style Direction', hint: 'Industrial Professional + Niche Immersion', skip: false },
    { key: 'primaryColor', question: 'Primary Color', hint: 'Color Name - HEX (Must NOT be white/light)', skip: false },
    { key: 'secondaryColor', question: 'Secondary Color', hint: 'Color Name - HEX (Must contrast clearly with Main)', skip: false },
    { key: 'gbpLink', question: 'Google Business Profile (GBP) Link', hint: 'Link to GBP', skip: true },
    { key: 'otherProfiles', question: 'Other Business Profiles', hint: 'Yelp, Facebook, Instagram, etc.', skip: true },
];

export default function NewBuild({ onNavigate }: { onNavigate: (page: string) => void }) {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [inputValue, setInputValue] = useState('');
    const [isFinished, setIsFinished] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [selectedTemplates, setSelectedTemplates] = useState<Record<string, string>>({});
    const [generationMethod, setGenerationMethod] = useState<'none' | 'local' | 'ai'>('none');
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [availableTemplates, setAvailableTemplates] = useState<Record<string, any[]>>({});
    const inputRef = useRef<HTMLInputElement>(null);
    const outputRef = useRef<HTMLPreElement>(null);

    useEffect(() => {
        // Fetch dynamic templates
        const fetchTemplates = async () => {
            try {
                const res = await fetch('/api/templates');
                const data = await res.json();
                setAvailableTemplates(data);
            } catch (e) {
                console.error('Failed to fetch templates:', e);
            }
        };
        fetchTemplates();
    }, []);

    useEffect(() => {
        if (inputRef.current && !showTemplates && !isFinished) {
            inputRef.current.focus();
        }
    }, [step, showTemplates, isFinished]);

    const submitAnswer = (value: string) => {
        const q = QUESTIONS[step];
        if (!value && !q.skip) return;
        
        let finalValue = value;
        if (q.key === 'secondaryColor' && !value) {
            finalValue = 'Auto-generate a strong contrasting secondary color';
        }

        const newAnswers = { ...answers, [q.key]: finalValue || 'Not specified' };
        setAnswers(newAnswers);
        
        if (step + 1 < QUESTIONS.length) {
            setStep(step + 1);
            setInputValue('');
        } else {
            setShowTemplates(true);
        }
    };

    const handleTemplateSelect = (section: string, templateId: string) => {
        setSelectedTemplates(prev => ({ ...prev, [section]: templateId }));
    };

    const finishTemplates = () => {
        setShowTemplates(false);
        setIsFinished(true);
    };

    const generatePromptText = (method: 'local' | 'ai') => {
        const finalAnswers = answers;
        
        // Build template instructions
        let templateInstructions = '';
        if (Object.keys(selectedTemplates).length > 0) {
            templateInstructions = '\n\nSPECIFIC SECTION TEMPLATES TO USE:\n';
            Object.entries(selectedTemplates).forEach(([section, templateId]) => {
                const template = availableTemplates[section]?.find(t => t.id === templateId);
                if (template) {
                    templateInstructions += `- **${section.toUpperCase()}**: ${template.prompt}\n`;
                }
            });
        }

        if (method === 'local') {
            return `1. SYSTEM INSTRUCTION (FOR AI STUDIO)

Instruct the AI to act as:
• Full-stack homepage builder  
• UI/UX designer (niche-specific visual DNA)  
• Conversion copywriter  
• SEO specialist  
• Motion designer using GSAP animations  

It must generate:
• Complete homepage frontend  
• Conversion-optimized structure  
• Responsive UI  
• Animations  
• Prepared structure for backend & CMS expansion (but NOT fully built yet)  


2. WEBSITE OVERVIEW

Include:
• Business Name: ${finalAnswers.businessName}
• Business Niche: ${finalAnswers.businessNiche}
• Primary Goal: ${finalAnswers.primaryGoal}
• Target Audience: ${finalAnswers.targetAudience}
• Financing Required: ${finalAnswers.financingRequired}
• Brand tone & style (industry-aligned): ${finalAnswers.brandStyle}

Include distinctive visual DNA:
• Subtle industry-inspired backgrounds  
• Custom hover animations inspired by the trade  
• Industry-aligned font pairing (no generic fonts)  

Include color system EXACTLY in this format:

Colors – Main:
${finalAnswers.primaryColor}

Colors – Secondary:
${finalAnswers.secondaryColor}


3. HOMEPAGE STRUCTURE (CONVERSION-OPTIMIZED)

Build in this order:

Header  
Hero  
Badges  
Services  
Why Choose Us  
Process  
Reviews  
Projects / Gallery (if relevant)  
Service Areas (if relevant)  
FAQ  
Final CTA  
Footer  

Include:
• Value-driven Hero  
• Strong primary CTA  
• Trust indicators  
• Benefits over features  
• Social proof  
• Local SEO structure (if applicable)  
• External review links integration (GBP: ${finalAnswers.gbpLink}, Others: ${finalAnswers.otherProfiles})  
${templateInstructions}

4. UI/UX REQUIREMENTS

• Fully responsive (mobile-first)  
• Modern niche-aligned UI  
• Smooth GSAP animations  
• Hover animations  
• Scroll-triggered animations  
• Accessible typography  
• Clean navigation  
• Professional footer  
• Fast performance  


5. FUTURE-READY STRUCTURE

Prepare structure so that after approval, it can expand into:
• Full CMS  
• Admin dashboard  
• Forms & booking system
• SEO tools  
• Media manager  


6. ENDING INSTRUCTION

End with:

"Homepage generation complete. Awaiting approval to continue full website build including backend, CMS, and admin dashboard."`;
        }

        // For AI method, we output the MASTER_PROMPT with the user's answers pre-filled
        // so they can copy/paste it directly into AI Studio
        return `${MASTER_PROMPT}

────────────────────────────────────────
USER INPUTS (PRE-FILLED)
────────────────────────────────────────

1. Business Name: ${finalAnswers.businessName}
2. Business Niche: ${finalAnswers.businessNiche}
3. Primary Goal: ${finalAnswers.primaryGoal}
4. Target Audience: ${finalAnswers.targetAudience}
5. Financing Required?: ${finalAnswers.financingRequired}
6. Brand Style Direction: ${finalAnswers.brandStyle}
7. Primary Color: ${finalAnswers.primaryColor}
8. Secondary Color: ${finalAnswers.secondaryColor}
9. Google Business Profile (GBP) Link: ${finalAnswers.gbpLink}
10. Other Business Profiles: ${finalAnswers.otherProfiles}
${templateInstructions}

Please proceed to PHASE 1 based on these inputs.`;
    };

    const generatePrompt = async (method: 'local' | 'ai') => {
        setGenerationMethod(method);
        const promptText = generatePromptText(method);

        // Both methods now just output the text directly without calling the Gemini API
        // since the user wants the prompt itself to paste into AI Studio
        setGeneratedPrompt(promptText);
        saveBuild(answers, promptText);
    };

    const saveBuild = (ans: Record<string, string>, prompt: string) => {
        try {
            const builds = JSON.parse(localStorage.getItem('haydeSiteBuilds') || '[]');
            builds.unshift({ 
                id: Date.now(), 
                name: ans.businessName || 'Unnamed Build', 
                niche: ans.businessNiche || 'Unknown Service', 
                city: ans.targetAudience || 'Unknown Location', 
                date: new Date().toLocaleDateString(), 
                prompt, 
                answers: ans,
                templates: selectedTemplates
            });
            localStorage.setItem('haydeSiteBuilds', JSON.stringify(builds));
        } catch (e) {
            console.error('Failed to save build', e);
        }
    };

    const resetWizard = () => {
        setStep(0);
        setAnswers({});
        setInputValue('');
        setIsFinished(false);
        setShowTemplates(false);
        setSelectedTemplates({});
        setGenerationMethod('none');
        setGeneratedPrompt('');
    };

    const copyPrompt = () => {
        navigator.clipboard.writeText(generatedPrompt);
        alert('Prompt copied to clipboard!');
    };

    if (showTemplates) {
        return (
            <PageLayout>
                <div className="quiz-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
                    <div className="quiz-header" style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--text-primary)' }}>Select Section Templates</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Choose specific layouts for your website sections (Optional).</p>
                    </div>
                    
                    <div className="flex flex-col gap-8 mb-8">
                        {Object.entries(availableTemplates)
                            .filter(([_, templates]) => templates.length > 0)
                            .map(([section, templates]: [string, any[]]) => (
                            <div key={section} className="bg-bg-1 p-6 rounded-xl border border-border">
                                <h3 className="text-lg font-semibold text-text-1 capitalize mb-4">{section} Section</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {templates.map(template => {
                                        const isSelected = selectedTemplates[section] === template.id;
                                        return (
                                            <div 
                                                key={template.id}
                                                onClick={() => handleTemplateSelect(section, template.id)}
                                                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 flex flex-col gap-3 ${
                                                    isSelected 
                                                        ? 'border-accent bg-accent/10' 
                                                        : 'border-border hover:border-text-3'
                                                }`}
                                            >
                                                {template.preview && (
                                                    <div className="w-full h-32 rounded-md overflow-hidden bg-bg-2 border border-border">
                                                        <img src={template.preview} alt={template.name} className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h4 className="font-medium text-text-1">{template.name}</h4>
                                                        {isSelected && <Check size={16} className="text-accent" />}
                                                    </div>
                                                    <p className="text-sm text-text-3">{template.description}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center">
                        <button className="btn btn-ghost" onClick={() => setShowTemplates(false)}>Back</button>
                        <button className="btn btn-accent" onClick={finishTemplates}>
                            Generate Prompt <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </PageLayout>
        );
    }

    if (isFinished && generationMethod === 'none') {
        return (
            <PageLayout>
                <div className="quiz-container" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '4rem 2rem' }}>
                    <div className="quiz-header" style={{ justifyContent: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: '600', color: 'var(--text-primary)' }}>Quiz Complete!</h2>
                    </div>
                    <div className="quiz-body">
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1.1rem' }}>How would you like to generate your master prompt?</p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <button 
                                className="btn btn-primary" 
                                style={{ padding: '1.5rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}
                                onClick={() => generatePrompt('local')}
                            >
                                <Zap size={24} />
                                Generate Local Prompt (Instant)
                            </button>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '-0.5rem', marginBottom: '1rem' }}>Fills your answers directly into the structured template.</p>
                            
                            <button 
                                className="btn btn-accent" 
                                style={{ padding: '1.5rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}
                                onClick={() => generatePrompt('ai')}
                            >
                                <Sparkles size={24} />
                                Generate Enhanced Prompt with AI
                            </button>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '-0.5rem' }}>Uses Gemini to expand and refine your answers into a highly detailed prompt.</p>
                        </div>
                        
                        <button className="btn btn-ghost" onClick={resetWizard} style={{ marginTop: '3rem' }}>
                            <RotateCcw size={16} /> Start Over
                        </button>
                    </div>
                </div>
            </PageLayout>
        );
    }

    if (isFinished && generationMethod !== 'none') {
        return (
            <PageLayout>
                <div className="output-area block">
                    <div className="output-header">
                        <h2>Master System Prompt</h2>
                        <div className="output-actions">
                            <button className="btn btn-accent" onClick={copyPrompt} disabled={isGenerating}>
                                <Copy size={16} /> Copy Prompt
                            </button>
                            <button className="btn btn-ghost" onClick={resetWizard}>
                                <RotateCcw size={16} /> New Build
                            </button>
                        </div>
                    </div>
                    <pre className="output-block" ref={outputRef}>
                        <code>{generatedPrompt}</code>
                    </pre>
                </div>
            </PageLayout>
        );
    }

    const q = QUESTIONS[step];
    const progress = ((step) / QUESTIONS.length) * 100;

    return (
        <PageLayout>
            <div className="quiz-container">
                <div className="quiz-header">
                    <div className="quiz-step-indicator">
                        <span id="quizStepNum">{(step + 1).toString().padStart(2, '0')}</span>
                        <span className="quiz-step-divider">/</span>
                        <span id="quizStepTotal">{QUESTIONS.length.toString().padStart(2, '0')}</span>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={resetWizard}>Reset</button>
                </div>
                <div className="quiz-progress">
                    <div className="quiz-progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="quiz-body animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="quiz-question">{q.question}</h2>
                    <p className="quiz-hint">{q.hint}</p>
                    <div className="quiz-input-wrap">
                        <input 
                            ref={inputRef}
                            type="text" 
                            className="quiz-input" 
                            placeholder="Type your answer..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') submitAnswer(inputValue.trim()); }}
                        />
                    </div>
                    <div className="quiz-actions">
                        <button className="btn btn-accent" onClick={() => submitAnswer(inputValue.trim())}>
                            Continue <ArrowRight size={16} />
                        </button>
                        {q.skip && (
                            <button className="btn btn-ghost btn-sm" onClick={() => submitAnswer('')}>Skip</button>
                        )}
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}
