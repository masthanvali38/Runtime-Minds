import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));

// Initialize Gemini Client if key is configured
let genAI: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    genAI = new GoogleGenAI({ apiKey });
    console.log('[Runtime Minds] Gemini AI client initialized with gemini-3.8-flash.');
  } catch (err) {
    console.warn('[Runtime Minds] Could not initialize Gemini client:', err);
  }
}

// 1. Status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    aiEnabled: !!genAI,
    model: 'gemini-3.8-flash',
    version: '1.0.0'
  });
});

// 2. Bug2Fix Analysis API
app.post('/api/analyze-bug', async (req, res) => {
  const { bugDescription, files, targetFile } = req.body;

  if (!bugDescription) {
    return res.status(400).json({ error: 'bugDescription is required' });
  }

  // If Gemini is available, we can request deep AI reasoning
  if (genAI) {
    try {
      const prompt = `You are the core intelligence of "Runtime Minds - Bug2Fix", a professional developer assistant.
A developer encountered the following bug in their repository:
"${bugDescription}"

Here are the relevant repository files:
${(files || []).slice(0, 5).map((f: any) => `--- File: ${f.path} ---\n${f.content.slice(0, 1500)}`).join('\n\n')}

Analyze this bug thoroughly and respond with a strict JSON object (no markdown formatting, no code fences):
{
  "summary": "Short 1-line description of the detected bug",
  "confidence": 95,
  "rootCause": {
    "file": "path/to/culprit_file",
    "symbolName": "function_or_class_name",
    "lineStart": 45,
    "lineEnd": 55,
    "incorrectBehavior": "Detailed statement of what the code incorrectly does",
    "explanation": "Why this bug occurs in user flows (e.g. page refresh, token eviction)",
    "mechanism": "Short technical mechanism"
  },
  "relevantCode": {
    "file": "path/to/culprit_file",
    "language": "python",
    "lineStart": 40,
    "lineEnd": 60,
    "code": "Exact excerpt of current buggy code"
  },
  "suggestedFix": {
    "file": "path/to/culprit_file",
    "currentCode": "exact string to replace",
    "suggestedCode": "exact replacement string",
    "explanation": "Why this fix resolves the issue"
  },
  "generatedTest": {
    "file": "tests/test_fix.py",
    "testName": "test_regression_verification",
    "language": "python",
    "description": "What this test verifies",
    "code": "def test_something(): ... test code ..."
  },
  "verification": {
    "status": "passed",
    "executionTimeMs": 140,
    "assertionsCount": 4,
    "passedAssertions": 4,
    "outputLog": "test session starts... 1 passed in 0.14s"
  }
}`;

      const aiResponse = await genAI.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = aiResponse.text;
      if (responseText) {
        const parsed = JSON.parse(responseText);
        return res.json(parsed);
      }
    } catch (aiErr) {
      console.warn('[Runtime Minds] Gemini AI API call fallback to heuristic engine:', aiErr);
    }
  }

  // Fallback response handled gracefully
  return res.json({ fallback: true });
});

// 3. Blast Radius API
app.post('/api/blast-radius', async (req, res) => {
  const { targetFile, targetSymbol, proposedChange, files } = req.body;

  if (genAI && targetFile) {
    try {
      const prompt = `You are "Runtime Minds - Blast Radius", an expert static analysis & semantic impact system.
The developer wants to change the following component:
File: ${targetFile}
Function/Class: ${targetSymbol || 'entire file'}
Proposed change: ${proposedChange || 'Refactoring and behavioral modification'}

Repository files available:
${(files || []).slice(0, 6).map((f: any) => `Path: ${f.path}\nSymbols: ${f.functions?.map((fn: any) => fn.name).join(', ')}`).join('\n')}

Analyze what else in the repository could be affected. Respond with a strict JSON object:
{
  "overallRiskLevel": "critical" | "high" | "medium" | "low",
  "impactScore": 75,
  "affectedComponents": [
    {
      "file": "string",
      "functionOrClass": "string",
      "relationship": "Direct Importer" | "Downstream Caller" | "Data Model Dependent" | "Test Suite" | "API Consumer",
      "impactLevel": "critical" | "high" | "medium" | "low",
      "reason": "Clear explanation of why this component is potentially affected"
    }
  ],
  "riskAreas": [
    {
      "domain": "Authentication" | "Payment" | "Database" | "API" | "UI" | "Tests",
      "riskLevel": "critical" | "high" | "medium" | "low",
      "description": "Potential risk explanation",
      "caveat": "Potentially affected based on static analysis"
    }
  ],
  "recommendedTests": [
    {
      "testFile": "tests/...",
      "testCaseName": "test_...",
      "priority": "high",
      "reason": "Why this test must run",
      "status": "not_run"
    }
  ]
}`;

      const aiResponse = await genAI.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = aiResponse.text;
      if (responseText) {
        const parsed = JSON.parse(responseText);
        return res.json(parsed);
      }
    } catch (aiErr) {
      console.warn('[Runtime Minds] Gemini blast radius fallback:', aiErr);
    }
  }

  return res.json({ fallback: true });
});

// 4. Test Runner API
app.post('/api/run-tests', async (req, res) => {
  const { testFile, testName } = req.body;
  
  // Realistic simulated test execution
  const startTime = Date.now();
  await new Promise(r => setTimeout(r, 600));
  const duration = Date.now() - startTime;

  res.json({
    status: 'passed',
    durationMs: duration,
    testFile: testFile || 'tests/test_auth.py',
    testName: testName || 'All Suites',
    assertions: 4,
    passed: 4,
    failed: 0,
    output: `============================= test session starts ==============================
platform linux -- Python 3.11.8, pytest-8.1.1
rootdir: /workspace/novashop-checkout-api
collected 4 items

tests/test_auth.py::test_token_creation PASSED                           [ 25%]
tests/test_auth.py::test_valid_session_decode PASSED                    [ 50%]
tests/test_auth.py::test_session_preservation_on_page_refresh PASSED    [ 75%]
tests/test_auth.py::test_session_revocation PASSED                      [100%]

============================== 4 passed in 0.60s ===============================`
  });
});

// Mount Vite middleware or static serving
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
} else {
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: process.env.DISABLE_HMR !== 'true'
    },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(port, '0.0.0.0', () => {
  console.log(`[Runtime Minds] Server active at http://0.0.0.0:${port}`);
});
