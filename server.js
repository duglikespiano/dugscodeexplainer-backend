import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = process.env.PORT || 3001;

//Security Middleware
app.use(helmet());
app.use(
	cors({
		origin: process.env.FRONTEND_URL || 'http://localhost:3000',
		credentials: true,
	})
);

app.set('trust proxy', true);

app.use(express.json());

const main = async (code, language, res) => {
	const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);
	try {
		const response = await ai.models.generateContent({
			model: 'gemini-2.5-flash-lite', // Use the latest flash model
			systemInstruction: '',
			contents: `Analyze this ${language} code: ${code}
			You are a concise code reviewer. please review the code as easily as possible. I hope your answer does not exceed 300 words but the document should be fully formatted. do not just stop while describing.
			`,
			config: {
				// maxOutputTokens: 250,
				temperature: 0.2,
			},
		});

		res.json({ explanation: response.text, language: language || 'unknown' });
	} catch (error) {
		console.error('AI Error:', error);
		res.status(500).json({ error: 'Analysis failed' });
	}
};

// Update your route to pass 'res'
app.post('/api/explain-code', async (req, res) => {
	const { code, language } = req.body;
	if (!code || !language) return res.status(400).json({ error: 'Missing fields' });

	await main(code, language, res);
});

app.listen(PORT, () => {
	console.log(`API server is listening on port ${PORT}`);
});
