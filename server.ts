import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const CONFIG_FILE = path.join(__dirname, 'config.json');
const TEMPLATES_DIR = path.join(__dirname, 'templates');
const OUTPUT_DIR = path.join(__dirname, 'output');

[OUTPUT_DIR, TEMPLATES_DIR].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

function loadConfig() {
    try { return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')); }
    catch { return {}; }
}
function saveConfig(data: any) {
    const current = loadConfig();
    const merged = { ...current, ...data };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2));
    return merged;
}

// API Routes
app.get('/api/config', (req, res) => {
    const cfg = loadConfig();
    const masked = { ...cfg };
    if (process.env.GEMINI_API_KEY) {
        masked.geminiApiKey = 'Provided by AI Studio Environment';
    } else if (masked.geminiApiKey) {
        masked.geminiApiKey = masked.geminiApiKey.slice(0, 6) + '...' + masked.geminiApiKey.slice(-4);
    }
    if (masked.imgbbApiKey) masked.imgbbApiKey = masked.imgbbApiKey.slice(0, 6) + '...' + masked.imgbbApiKey.slice(-4);
    res.json(masked);
});

app.post('/api/config', (req, res) => {
    const newData = { ...req.body };
    // Prevent saving masked keys
    if (newData.geminiApiKey === 'Provided by AI Studio Environment' || (newData.geminiApiKey && newData.geminiApiKey.includes('...'))) {
        delete newData.geminiApiKey;
    }
    if (newData.imgbbApiKey && newData.imgbbApiKey.includes('...')) {
        delete newData.imgbbApiKey;
    }
    saveConfig(newData);
    res.json({ success: true });
});

function getValidApiKey(config: any) {
    return process.env.GEMINI_API_KEY;
}

// Helper for Info Spy
function fetchUrl(targetUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(targetUrl);
        const client = urlObj.protocol === 'https:' ? https : http;
        client.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        }, (fetchRes) => {
            if (fetchRes.statusCode && fetchRes.statusCode >= 300 && fetchRes.statusCode < 400 && fetchRes.headers.location) {
                let redirectUrl = fetchRes.headers.location;
                if (redirectUrl.startsWith('/')) redirectUrl = urlObj.origin + redirectUrl;
                fetchUrl(redirectUrl).then(resolve).catch(reject);
                return;
            }
            let d = '';
            fetchRes.on('data', c => d += c);
            fetchRes.on('end', () => resolve(d));
        }).on('error', reject);
    });
}

function postUrl(targetUrl: string, postData: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(targetUrl);
        const client = urlObj.protocol === 'https:' ? https : http;
        const req = client.request(targetUrl, {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        }, (res) => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => resolve(d));
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

app.get('/api/templates', (req, res) => {
    try {
        const categories: Record<string, any[]> = {};
        if (fs.existsSync(TEMPLATES_DIR)) {
            const dirs = fs.readdirSync(TEMPLATES_DIR, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name);

            for (const cat of dirs) {
                categories[cat] = [];
                const catPath = path.join(TEMPLATES_DIR, cat);
                const templates = fs.readdirSync(catPath, { withFileTypes: true })
                    .filter(dirent => dirent.isDirectory())
                    .map(dirent => dirent.name);

                for (const tName of templates) {
                    const tPath = path.join(catPath, tName);
                    const hasHtml = fs.existsSync(path.join(tPath, 'index.html'));
                    const metaPath = path.join(tPath, 'meta.json');
                    let meta: any = { name: tName, preview: '', prompt: '' };
                    if (fs.existsSync(metaPath)) {
                        try { meta = { ...meta, ...JSON.parse(fs.readFileSync(metaPath, 'utf8')) }; } catch (e) { }
                    }
                    if (hasHtml) {
                        categories[cat].push({ id: `${cat}/${tName}`, name: meta.name, preview: meta.preview, prompt: meta.prompt });
                    }
                }
            }
        }
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: 'Failed to load templates' });
    }
});

app.post('/api/save-template', (req, res) => {
    const { name, category, html, prompt, image } = req.body;
    if (!name || !category || !html || !prompt) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }

    try {
        const safeCategory = category.replace(/[^a-z0-9\s-]/gi, '-').toLowerCase();
        const safeName = name.replace(/[^a-z0-9\s-]/gi, '-').toLowerCase();
        const catPath = path.join(TEMPLATES_DIR, safeCategory);
        const tPath = path.join(catPath, safeName);

        if (!fs.existsSync(catPath)) fs.mkdirSync(catPath, { recursive: true });
        if (!fs.existsSync(tPath)) fs.mkdirSync(tPath, { recursive: true });

        fs.writeFileSync(path.join(tPath, 'index.html'), html);
        
        const meta = {
            name: name,
            prompt: prompt,
            preview: image || ''
        };
        fs.writeFileSync(path.join(tPath, 'meta.json'), JSON.stringify(meta, null, 2));

        res.json({ success: true, templateId: `${safeCategory}/${safeName}` });
    } catch (err: any) {
        console.error('[SAVE TEMPLATE ERROR]', err);
        res.status(500).json({ error: 'Failed to save template.' });
    }
});

app.delete('/api/templates/:category/:name', (req, res) => {
    const { category, name } = req.params;
    try {
        const safeCategory = category.replace(/[^a-z0-9\s-]/gi, '-').toLowerCase();
        const safeName = name.replace(/[^a-z0-9\s-]/gi, '-').toLowerCase();
        const tPath = path.join(TEMPLATES_DIR, safeCategory, safeName);
        if (fs.existsSync(tPath)) {
            fs.rmSync(tPath, { recursive: true, force: true });
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Template not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete template' });
    }
});

app.post('/api/templates/:category/:name/image', (req, res) => {
    const { category, name } = req.params;
    const { image } = req.body;
    try {
        const safeCategory = category.replace(/[^a-z0-9\s-]/gi, '-').toLowerCase();
        const safeName = name.replace(/[^a-z0-9\s-]/gi, '-').toLowerCase();
        const tPath = path.join(TEMPLATES_DIR, safeCategory, safeName);
        if (fs.existsSync(tPath)) {
            const metaPath = path.join(tPath, 'meta.json');
            let meta: any = {};
            if (fs.existsSync(metaPath)) {
                meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
            }
            meta.preview = image;
            fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Template not found' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to update template image' });
    }
});

app.use('/templates', express.static(TEMPLATES_DIR));

async function startServer() {
    if (process.env.NODE_ENV !== 'production') {
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'spa',
        });
        app.use(vite.middlewares);
    } else {
        app.use(express.static('dist'));
    }

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

startServer();
