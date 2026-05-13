import React, { useState, useEffect, useRef } from 'react';
import { LayoutTemplate, PlusCircle, X, ExternalLink, Upload, Code, Link as LinkIcon, Sparkles, FileCode2, Trash2, Image as ImageIcon } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import PageLayout from './layout/PageLayout';

export default function Templates() {
    const [templates, setTemplates] = useState<Record<string, any[]>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
    const [isAddingTemplate, setIsAddingTemplate] = useState(false);
    
    // Add Template Form State
    const [addMode, setAddMode] = useState<'ai' | 'manual'>('ai');
    const [addName, setAddName] = useState('');
    const [addCategory, setAddCategory] = useState('hero');
    const [addUrl, setAddUrl] = useState('');
    const [addSourceCode, setAddSourceCode] = useState('');
    const [addImages, setAddImages] = useState<string[]>([]);
    
    // Manual Insert State
    const [manualHtml, setManualHtml] = useState('');
    const [manualPrompt, setManualPrompt] = useState('');

    const [isCloning, setIsCloning] = useState(false);
    const [cloneError, setCloneError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const massUploadInputRef = useRef<HTMLInputElement>(null);
    const [isMassUploading, setIsMassUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<{message: string, isError: boolean} | null>(null);
    const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

    const loadTemplates = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/templates');
            const data = await res.json();
            setTemplates(data);
        } catch (e) {
            console.error('Failed to load templates', e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadTemplates();
    }, []);

    const resetForm = () => {
        setAddName('');
        setAddCategory('hero');
        setAddUrl('');
        setAddSourceCode('');
        setAddImages([]);
        setManualHtml('');
        setManualPrompt('');
        setCloneError('');
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        
        const file = files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setAddImages([reader.result as string]);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = (index: number) => {
        setAddImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleMassUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        
        setIsMassUploading(true);
        const file = files[0];
        try {
            const text = await file.text();
            // Handle potentially malformed JSON by trying to extract the JSON object
            let jsonText = text;
            const jsonStart = text.indexOf('{');
            const jsonEnd = text.lastIndexOf('}');
            if (jsonStart !== -1 && jsonEnd !== -1) {
                jsonText = text.substring(jsonStart, jsonEnd + 1);
            }
            
            const data = JSON.parse(jsonText);
            
            const finalHtml = data.html;
            const finalPrompt = data.ai_prompt_instruction || data.prompt;
            const finalName = data.template_name || data.name || 'Untitled Template';
            const finalCategory = data.category || 'Uncategorized';
            
            if (!finalHtml || !finalPrompt) {
                throw new Error('Missing HTML or prompt');
            }

            const saveRes = await fetch('/api/save-template', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: finalName,
                    category: finalCategory,
                    html: finalHtml,
                    prompt: finalPrompt,
                    image: data.image || null
                })
            });

            if (saveRes.ok) {
                setUploadResult({
                    message: `Successfully uploaded ${file.name}`,
                    isError: false
                });
            } else {
                const errData = await saveRes.json();
                throw new Error(errData.error || 'Failed to save template to server');
            }
        } catch (err: any) {
            console.error('Failed to parse or save JSON file', file.name, err);
            setUploadResult({
                message: `Failed to upload ${file.name}: ${err.message || 'Invalid JSON format'}`,
                isError: true
            });
        }

        setIsMassUploading(false);
        setTimeout(() => setUploadResult(null), 5000);
        loadTemplates();
        if (massUploadInputRef.current) massUploadInputRef.current.value = '';
    };

    const confirmDelete = async () => {
        if (!templateToDelete) return;
        
        try {
            const res = await fetch(`/api/templates/${templateToDelete}`, { method: 'DELETE' });
            if (res.ok) {
                loadTemplates();
            } else {
                setUploadResult({ message: 'Failed to delete template', isError: true });
                setTimeout(() => setUploadResult(null), 3000);
            }
        } catch (err) {
            console.error('Failed to delete template', err);
            setUploadResult({ message: 'Failed to delete template', isError: true });
            setTimeout(() => setUploadResult(null), 3000);
        } finally {
            setTemplateToDelete(null);
        }
    };

    const handleDeleteTemplate = (templateId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setTemplateToDelete(templateId);
    };

    const handleDropImage = async (e: React.DragEvent, templateId: string) => {
        e.preventDefault();
        e.stopPropagation();
        
        const file = e.dataTransfer.files[0];
        if (!file || !file.type.startsWith('image/')) return;
        
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64Image = reader.result as string;
            try {
                const res = await fetch(`/api/templates/${templateId}/image`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: base64Image })
                });
                if (res.ok) {
                    loadTemplates();
                    setUploadResult({ message: 'Image updated successfully', isError: false });
                    setTimeout(() => setUploadResult(null), 3000);
                } else {
                    setUploadResult({ message: 'Failed to update template image', isError: true });
                    setTimeout(() => setUploadResult(null), 3000);
                }
            } catch (err) {
                console.error('Failed to update template image', err);
                setUploadResult({ message: 'Failed to update template image', isError: true });
                setTimeout(() => setUploadResult(null), 3000);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleManualInsert = async () => {
        if (!addName || !addCategory || !manualHtml || !manualPrompt) {
            setCloneError('Name, Category, HTML, and Prompt are required for manual insert.');
            return;
        }

        setIsCloning(true);
        setCloneError('');

        try {
            const saveRes = await fetch('/api/save-template', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: addName,
                    category: addCategory,
                    html: manualHtml,
                    prompt: manualPrompt,
                    image: addImages.length > 0 ? addImages[0] : null
                })
            });

            if (!saveRes.ok) {
                const errData = await saveRes.json();
                throw new Error(errData.error || 'Failed to save template to server');
            }

            // Success
            setIsAddingTemplate(false);
            resetForm();
            loadTemplates();
        } catch (err: any) {
            console.error(err);
            setCloneError(err.message);
        } finally {
            setIsCloning(false);
        }
    };

    const handleCloneTemplate = async () => {
        if (addMode === 'manual') {
            return handleManualInsert();
        }

        if (!addName || !addCategory) {
            setCloneError('Name and Category are required.');
            return;
        }
        if (addImages.length === 0 && !addSourceCode && !addUrl) {
            setCloneError('Please provide either images, source code, or a URL to clone.');
            return;
        }

        setIsCloning(true);
        setCloneError('');

        try {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) throw new Error('Gemini API key not found in environment.');

            const ai = new GoogleGenAI({ apiKey });
            
            const parts: any[] = [];
            let promptText = `You are an expert UI/UX developer and Tailwind CSS master. 
I want to clone a website section and turn it into a reusable Tailwind CSS component.
`;

            if (addUrl) {
                promptText += `\nThe original website URL is: ${addUrl}. Use the googleSearch tool to find more context if needed.`;
            }

            if (addSourceCode) {
                promptText += `\nHere is the original source code:\n\`\`\`html\n${addSourceCode}\n\`\`\`\n`;
            }

            if (addImages.length > 0) {
                promptText += `\nI have attached ${addImages.length} screenshot(s) of the section.`;
                addImages.forEach(img => {
                    const mimeTypeMatch = img.match(/^data:(image\/\w+);base64,/);
                    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';
                    const base64Data = img.replace(/^data:image\/\w+;base64,/, '');
                    parts.push({
                        inlineData: {
                            data: base64Data,
                            mimeType: mimeType
                        }
                    });
                });
            }

            promptText += `
You are a Senior Frontend Architect and Design System Engineer.

Your job is to reverse-engineer the provided website section (via screenshot, source code, and/or URL) and reconstruct it as a clean, reusable, production-ready template component.

GOAL:
Recreate the section as accurately as possible in structure and layout while cleaning the implementation. Do NOT approximate loosely. Extract structural logic precisely.

INPUTS MAY INCLUDE:
- Screenshot(s)
- HTML/CSS source code
- URL for browsing
- Multiple references

INSTRUCTIONS:

1. VISUAL ANALYSIS
Extract and document:
- Layout structure (columns, grid, alignment)
- Section padding and spacing rhythm
- Typography scale (approximate px values)
- Font weight hierarchy
- Button style (radius, padding, border, shadow)
- Background treatment (image, overlay, gradient)
- Card structure (if applicable)
- Responsive behavior assumptions

2. STRUCTURAL EXTRACTION
Reconstruct:
- Clean semantic HTML5 structure
- Clear class naming system
- Preserve hierarchy depth
- Preserve container logic
- Preserve grid ratios
- Preserve alignment rules

3. RESPONSIVE LOGIC
Define:
- Mobile layout behavior
- Tablet adjustments
- Desktop layout
- Breakpoint assumptions (Tailwind defaults)

4. ANIMATION EXTRACTION (if visible or implied)
Define:
- Entry animation direction
- Duration assumptions
- Hover effects
- Micro-interactions

5. CLEAN REBUILD RULES
- Use Tailwind CSS via CDN
- Do NOT copy messy inline styles
- Do NOT include external JS libraries
- Keep code readable and modular
- Make it production-ready

6. OUTPUT FORMAT (STRICT JSON)

Return ONLY valid JSON in this format:

{
  "template_name": "Hero_Centered_V1",
  "category": "Hero",
  "layout_blueprint": {
    "grid_structure": "...",
    "content_alignment": "...",
    "spacing_scale": "...",
    "responsive_behavior": "..."
  },
  "design_tokens": {
    "font_scale": "...",
    "button_style": "...",
    "border_radius": "...",
    "shadow_style": "..."
  },
  "motion_blueprint": {
    "entry_animation": "...",
    "hover_effects": "...",
    "duration": "..."
  },
  "html": "<!DOCTYPE html><html><head><script src=\"https://cdn.tailwindcss.com\"></script></head><body class=\"antialiased\">...clean Tailwind HTML...</body></html>",
  "ai_prompt_instruction": "Build a centered hero section with..."
}

CRITICAL:
- Preserve structural accuracy over visual styling.
- Keep DOM hierarchy consistent.
- Make this component reusable.
- Do not add commentary outside JSON.
- IMPORTANT JSON FORMATTING: You MUST escape all double quotes inside the "html" string value. For example, use class=\"bg-gray-50\" instead of class="bg-gray-50". Failure to escape quotes will break the JSON parser.`;

            parts.push({ text: promptText });

            let response;
            try {
                response = await ai.models.generateContent({
                    model: 'gemini-3.1-pro-preview',
                    contents: { parts },
                    config: {
                        tools: addUrl ? [{ googleSearch: {} }] : undefined,
                        responseMimeType: "application/json"
                    }
                });
            } catch (err: any) {
                if (err.message?.includes('429') || err.message?.includes('quota') || err.status === 429) {
                    console.warn('Quota exceeded for pro model, falling back to flash model...');
                    response = await ai.models.generateContent({
                        model: 'gemini-3-flash-preview',
                        contents: { parts },
                        config: {
                            tools: addUrl ? [{ googleSearch: {} }] : undefined,
                            responseMimeType: "application/json"
                        }
                    });
                } else {
                    throw err;
                }
            }

            let text = response.text || '{}';
            text = text.replace(/```json/gi, '').replace(/```html/gi, '').replace(/```/g, '').trim();
            
            const extracted = JSON.parse(text);
            const finalHtml = extracted.html;
            const finalPrompt = extracted.ai_prompt_instruction || extracted.prompt;
            const finalName = addName || extracted.template_name || 'Untitled Template';
            const finalCategory = addCategory || extracted.category || 'Uncategorized';
            
            if (!finalHtml || !finalPrompt) {
                throw new Error('Failed to extract HTML or prompt from Gemini response.');
            }

            // Save to backend
            const saveRes = await fetch('/api/save-template', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: finalName,
                    category: finalCategory,
                    html: finalHtml,
                    prompt: finalPrompt,
                    image: addImages.length > 0 ? addImages[0] : null
                })
            });

            if (!saveRes.ok) {
                const errData = await saveRes.json();
                throw new Error(errData.error || 'Failed to save template to server');
            }

            // Success
            setIsAddingTemplate(false);
            resetForm();
            loadTemplates(); // Refresh list
        } catch (err: any) {
            console.error(err);
            let errorMessage = err.message;
            if (errorMessage.includes('429') || errorMessage.includes('quota')) {
                errorMessage = 'Gemini API quota exceeded. Please check your API key billing details or try again later.';
            }
            setCloneError(errorMessage);
        } finally {
            setIsCloning(false);
        }
    };

    return (
        <PageLayout 
            title="Templates" 
            subtitle="Manage HTML/CSS blocks for your page sections."
            headerActions={
                <div className="flex gap-2">
                    <input 
                        type="file" 
                        accept=".json" 
                        className="hidden" 
                        ref={massUploadInputRef}
                        onChange={handleMassUpload}
                        disabled={isMassUploading}
                    />
                    <button className="btn btn-ghost" onClick={() => massUploadInputRef.current?.click()} disabled={isMassUploading}>
                        {isMassUploading ? (
                            <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></div> Uploading...</>
                        ) : (
                            <><Upload size={16} /> Upload JSON</>
                        )}
                    </button>
                    <button className="btn btn-accent" onClick={() => { resetForm(); setIsAddingTemplate(true); }}>
                        <PlusCircle size={16} /> Add Template
                    </button>
                </div>
            }
        >
            {uploadResult && (
                <div className={`mb-4 p-4 rounded-lg flex items-center justify-between ${uploadResult.isError ? 'bg-danger/10 text-danger border border-danger/20' : 'bg-accent/10 text-accent border border-accent/20'}`}>
                    <span>{uploadResult.message}</span>
                    <button onClick={() => setUploadResult(null)}><X size={16} /></button>
                </div>
            )}

            <div className="templates-categories">
                {isLoading ? (
                    <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                    </div>
                ) : Object.values(templates).every(t => t.length === 0) ? (
                    <div className="empty-state">
                        <LayoutTemplate size={40} className="mx-auto mb-4 opacity-20" />
                        <h3>No Templates Installed</h3>
                        <p>Click "Add Template" to clone a section using Gemini.</p>
                    </div>
                ) : (
                    Object.entries(templates)
                        .filter(([_, tmpls]) => tmpls.length > 0)
                        .map(([cat, tmpls]: [string, any[]]) => (
                        <div key={cat} className="template-category animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="template-category-header">
                                <h3 className="template-category-title capitalize">{cat}</h3>
                            </div>
                            <div className="templates-grid">
                                {tmpls.map(t => (
                                    <div 
                                        key={t.id} 
                                        className="template-card cursor-pointer hover:ring-2 hover:ring-accent transition-all group relative"
                                        onClick={() => setSelectedTemplate(t)}
                                    >
                                        <div 
                                            className="template-card-preview relative"
                                            onDrop={(e) => handleDropImage(e, t.id)}
                                            onDragOver={handleDragOver}
                                        >
                                            {t.preview ? <img src={t.preview} alt={t.name} /> : <div className="flex flex-col items-center gap-2"><ImageIcon size={24} className="opacity-50" /><span>Drop Image Here</span></div>}
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                <span className="text-white text-sm font-medium flex items-center gap-2"><Upload size={16} /> Drop to update image</span>
                                            </div>
                                        </div>
                                        <div className="template-card-info">
                                            <div>
                                                <span className="template-card-title block">{t.name}</span>
                                                <span className="text-xs text-text-3 font-mono">{t.id}</span>
                                            </div>
                                            <button 
                                                className="btn btn-ghost btn-sm text-danger hover:bg-danger/10 hover:text-danger hover:border-danger/30 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={(e) => handleDeleteTemplate(t.id, e)}
                                                title="Delete Template"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Template Modal */}
            {isAddingTemplate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-bg-2 rounded-xl border border-border-1 shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-4 border-b border-border-1 bg-bg-1">
                            <h3 className="font-semibold text-lg text-text-1 flex items-center gap-2">
                                {addMode === 'ai' ? <Sparkles size={18} className="text-accent" /> : <FileCode2 size={18} className="text-accent" />}
                                {addMode === 'ai' ? 'Clone Template with AI' : 'Manual Template Insert'}
                            </h3>
                            <button className="btn btn-ghost btn-sm" onClick={() => setIsAddingTemplate(false)} disabled={isCloning}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[70vh] flex flex-col gap-4">
                            
                            <div className="flex gap-4 mb-2 border-b border-border-1 pb-2">
                                <button 
                                    className={`pb-2 px-2 font-medium text-sm transition-colors ${addMode === 'ai' ? 'text-accent border-b-2 border-accent' : 'text-text-3 hover:text-text-1'}`}
                                    onClick={() => setAddMode('ai')}
                                    disabled={isCloning}
                                >
                                    AI Clone
                                </button>
                                <button 
                                    className={`pb-2 px-2 font-medium text-sm transition-colors ${addMode === 'manual' ? 'text-accent border-b-2 border-accent' : 'text-text-3 hover:text-text-1'}`}
                                    onClick={() => setAddMode('manual')}
                                    disabled={isCloning}
                                >
                                    Manual Insert
                                </button>
                            </div>

                            {cloneError && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
                                    {cloneError}
                                </div>
                            )}
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-2 mb-1">Template Name</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-bg-1 border border-border-1 rounded-lg px-3 py-2 text-text-1 focus:outline-none focus:border-accent"
                                        placeholder="e.g., Split Screen Hero"
                                        value={addName}
                                        onChange={e => setAddName(e.target.value)}
                                        disabled={isCloning}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-2 mb-1">Category</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-bg-1 border border-border-1 rounded-lg px-3 py-2 text-text-1 focus:outline-none focus:border-accent"
                                        placeholder="e.g., hero, footer, services"
                                        value={addCategory}
                                        onChange={e => setAddCategory(e.target.value)}
                                        disabled={isCloning}
                                    />
                                </div>
                            </div>

                            <div className="border-t border-border-1 pt-4 mt-2">
                                {addMode === 'ai' ? (
                                    <>
                                        <p className="text-sm text-text-3 mb-4">Provide at least one of the following to clone the section:</p>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-medium text-text-2 mb-1">
                                                    <Upload size={14} /> Screenshots (Recommended)
                                                </label>
                                                <input 
                                                    type="file" 
                                                    accept="image/*" 
                                                    className="hidden" 
                                                    ref={fileInputRef}
                                                    onChange={handleImageUpload}
                                                    disabled={isCloning}
                                                />
                                                <div className="flex flex-col gap-3">
                                                    <div className="flex items-center gap-3">
                                                        <button 
                                                            className="btn btn-ghost border border-border-1 text-sm"
                                                            onClick={() => fileInputRef.current?.click()}
                                                            disabled={isCloning}
                                                        >
                                                            Choose Image
                                                        </button>
                                                        {addImages.length > 0 && <span className="text-xs text-accent">{addImages.length} image selected</span>}
                                                    </div>
                                                    {addImages.length > 0 && (
                                                        <div className="flex gap-2 flex-wrap">
                                                            {addImages.map((img, idx) => (
                                                                <div key={idx} className="relative w-16 h-16 rounded border border-border-1 overflow-hidden group">
                                                                    <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                                                                    <button 
                                                                        className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        onClick={() => removeImage(idx)}
                                                                        disabled={isCloning}
                                                                    >
                                                                        <X size={16} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-medium text-text-2 mb-1">
                                                    <LinkIcon size={14} /> Website URL
                                                </label>
                                                <input 
                                                    type="url" 
                                                    className="w-full bg-bg-1 border border-border-1 rounded-lg px-3 py-2 text-text-1 focus:outline-none focus:border-accent"
                                                    placeholder="https://example.com"
                                                    value={addUrl}
                                                    onChange={e => setAddUrl(e.target.value)}
                                                    disabled={isCloning}
                                                />
                                            </div>

                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-medium text-text-2 mb-1">
                                                    <Code size={14} /> Original Source Code
                                                </label>
                                                <textarea 
                                                    className="w-full bg-bg-1 border border-border-1 rounded-lg px-3 py-2 text-text-1 focus:outline-none focus:border-accent h-32 font-mono text-xs"
                                                    placeholder="Paste HTML/CSS here..."
                                                    value={addSourceCode}
                                                    onChange={e => setAddSourceCode(e.target.value)}
                                                    disabled={isCloning}
                                                />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-medium text-text-2 mb-1">
                                                    <Upload size={14} /> Preview Image (Screenshot)
                                                </label>
                                                <input 
                                                    type="file" 
                                                    accept="image/*" 
                                                    className="hidden" 
                                                    ref={fileInputRef}
                                                    onChange={handleImageUpload}
                                                    disabled={isCloning}
                                                />
                                                <div className="flex items-center gap-3">
                                                    <button 
                                                        className="btn btn-ghost border border-border-1 text-sm"
                                                        onClick={() => fileInputRef.current?.click()}
                                                        disabled={isCloning}
                                                    >
                                                        Choose Image
                                                    </button>
                                                    {addImages.length > 0 && <span className="text-xs text-accent">Image selected ✓</span>}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-medium text-text-2 mb-1">
                                                    <Code size={14} /> Final HTML Source Code
                                                </label>
                                                <textarea 
                                                    className="w-full bg-bg-1 border border-border-1 rounded-lg px-3 py-2 text-text-1 focus:outline-none focus:border-accent h-48 font-mono text-xs"
                                                    placeholder="<!DOCTYPE html><html>..."
                                                    value={manualHtml}
                                                    onChange={e => setManualHtml(e.target.value)}
                                                    disabled={isCloning}
                                                />
                                            </div>

                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-medium text-text-2 mb-1">
                                                    <Sparkles size={14} /> Prompt Instruction (for AI)
                                                </label>
                                                <textarea 
                                                    className="w-full bg-bg-1 border border-border-1 rounded-lg px-3 py-2 text-text-1 focus:outline-none focus:border-accent h-24 text-sm"
                                                    placeholder="e.g., Build a hero section with a split layout, dark background, and a large call-to-action button..."
                                                    value={manualPrompt}
                                                    onChange={e => setManualPrompt(e.target.value)}
                                                    disabled={isCloning}
                                                />
                                                <p className="text-xs text-text-3 mt-1">This tells the AI how to use this template in the future.</p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="p-4 border-t border-border-1 bg-bg-1 flex justify-end gap-3">
                            <button className="btn btn-ghost" onClick={() => setIsAddingTemplate(false)} disabled={isCloning}>
                                Cancel
                            </button>
                            <button className="btn btn-accent" onClick={handleCloneTemplate} disabled={isCloning}>
                                {isCloning ? (
                                    <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> {addMode === 'ai' ? 'Cloning...' : 'Saving...'}</>
                                ) : (
                                    <>{addMode === 'ai' ? <><Sparkles size={16} /> Clone Template</> : <><FileCode2 size={16} /> Save Template</>}</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {templateToDelete && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-bg-2 rounded-xl border border-border-1 shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <h3 className="font-semibold text-lg text-text-1 mb-2">Delete Template</h3>
                            <p className="text-text-3 text-sm">Are you sure you want to delete this template? This action cannot be undone.</p>
                        </div>
                        <div className="p-4 border-t border-border-1 bg-bg-1 flex justify-end gap-3">
                            <button className="btn btn-ghost" onClick={() => setTemplateToDelete(null)}>
                                Cancel
                            </button>
                            <button className="btn btn-danger" onClick={confirmDelete}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {selectedTemplate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-bg-2 rounded-xl border border-border-1 shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-4 border-b border-border-1 bg-bg-1">
                            <div>
                                <h3 className="font-semibold text-lg text-text-1">{selectedTemplate.name}</h3>
                                <p className="text-sm text-text-3 font-mono">{selectedTemplate.id}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <a 
                                    href={`/templates/${selectedTemplate.id}/index.html`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="btn btn-ghost btn-sm"
                                    title="Open in new tab"
                                >
                                    <ExternalLink size={18} />
                                </a>
                                <button 
                                    className="btn btn-ghost btn-sm" 
                                    onClick={() => setSelectedTemplate(null)}
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 bg-white relative">
                            <iframe 
                                src={`/templates/${selectedTemplate.id}/index.html`}
                                className="w-full h-full border-0"
                                title={`Preview of ${selectedTemplate.name}`}
                            />
                        </div>
                    </div>
                </div>
            )}
        </PageLayout>
    );
}
