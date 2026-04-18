// server/controllers/resumeController.js
const Analysis = require('../models/Analysis');
const Groq = require('groq-sdk'); // 🌟 NEW: Imported Groq
const axios = require('axios');
const cheerio = require('cheerio');

// Initialize Groq using your environment variable
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Polyfill for Node environments that don't have Promise.withResolvers natively
if (typeof Promise.withResolvers !== 'function') {
    Promise.withResolvers = function () {
        let resolve, reject;
        const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
        return { promise, resolve, reject };
    };
}

// ------------------------------------------------------------------
// 1. ANALYZE RESUME (The AI Engine - Powered by Groq)
// ------------------------------------------------------------------
const analyzeResume = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "Please upload a resume (PDF)." });

        // Grab the optional targeted domain from the frontend
        const desiredDomain = (req.body.desiredDomain || '').trim();
        console.log('[analyzeResume] desiredDomain received:', JSON.stringify(desiredDomain));

        const { readPdfText } = await import('pdf-text-reader');
        const pdfUint8Array = new Uint8Array(req.file.buffer);
        const resumeText = await readPdfText({ data: pdfUint8Array });

        // Strict separated prompt: resume-only fields vs target-role gap fields
        let domainInstruction = "";
        if (desiredDomain) {
            domainInstruction = `
The user wants to move into the TARGET ROLE: "${desiredDomain}".
Keep the two sections COMPLETELY SEPARATE:

SECTION A — Resume-Only (ignore the target role for these):
- suggestedDomains: Based ONLY on skills already in this resume, list 2-3 domains the candidate fits RIGHT NOW. Do NOT include "${desiredDomain}" unless the resume already strongly demonstrates it.
- careerAdvice: 3 insights about the resume AS-IS — one strength, one weakness/formatting issue, one actionable improvement. Do NOT mention "${desiredDomain}" anywhere in this array.

SECTION B — Target Role Gap (only for missingSkills):
- missingSkills: List 4-6 SPECIFIC skills, tools, or certifications that are standard requirements for "${desiredDomain}" but are ABSENT from this resume. Be concrete (e.g. "Kubernetes", "Terraform", "AWS SAA certification") not vague.`;
        } else {
            domainInstruction = `No target role specified. Analyse the resume on its own:
- suggestedDomains: 2-3 domains matching the candidate's current skills.
- careerAdvice: 3 insights — one strength, one weakness/formatting issue, one actionable improvement.
- missingSkills: 3-5 general skills that would strengthen this candidate's profile.`;
        }

const prompt = `You are an expert Career Counselor and ATS (Applicant Tracking System) Analyzer doing a structured resume analysis.

Resume:
"""
${resumeText}
"""
${domainInstruction}

Return ONLY valid JSON. No markdown, no backticks, no text outside the JSON.
{
  "suggestedDomains": ["Domain 1", "Domain 2"],
  "recommendedJobs": [{"title": "Job Title", "description": "One sentence."}],
  "careerAdvice": [
    "Strength found in the current resume.",
    "Weakness or formatting issue in the current resume.",
    "One actionable improvement based on current experience."
  ],
  "missingSkills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4"],
  "atsScore": 85,
  "atsSuggestions": [
    "Ensure standard section headers like 'Experience' and 'Education'.",
    "Remove complex formatting or tables that might confuse parsers.",
    "Add more quantifiable metrics to your recent roles."
  ]
}`;

        // 🌟 GROQ API CALL 🌟
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are an ATS analyzer. You only respond with raw, valid JSON." },
                { role: "user", content: prompt }
            ],
            model: "llama-3.3-70b-versatile", // The incredibly fast and smart LLaMA 3 model
            response_format: { type: "json_object" } // Guarantees JSON output!
        });

        // Extract the text and safely parse the JSON
        let responseText = chatCompletion.choices[0].message.content;
        responseText = responseText.replace(/```json|```/g, "").trim(); // Safety cleanup
        const aiAnalysis = JSON.parse(responseText);

        aiAnalysis.userId = req.user.id; 
        
        const savedData = await Analysis.create(aiAnalysis);
        res.status(200).json({ success: true, data: savedData });

    } catch (error) {
        console.error("Analysis Error:", error);
        res.status(500).json({ error: "Server failed to process the resume logic." });
    }
};

// ------------------------------------------------------------------
// 2. GET HISTORY (The User's Dashboard Feed)
// ------------------------------------------------------------------
const getHistory = async (req, res) => {
    try {
        // Find all past analyses for this specific user, newest first
        const history = await Analysis.find({ userId: req.user.id }).sort({ date: -1 });
        res.status(200).json({ success: true, data: history });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch history." });
    }
};

// ------------------------------------------------------------------
// 3. GET RECOMMENDED JOBS (The Live Web Scraper)
// ------------------------------------------------------------------
const getRecommendedJobs = async (req, res) => {
    try {
        // 1. Find the user's latest AI analysis
        const latestAnalysis = await Analysis.findOne({ userId: req.user.id }).sort({ date: -1 });
        
        if (!latestAnalysis || !latestAnalysis.suggestedDomains.length) {
            return res.status(404).json({ error: "Please run a Career Discovery analysis first to see job matches." });
        }

        // 2. Grab their top suggested domain
        const topDomain = latestAnalysis.suggestedDomains[0];
        
        // 3. Fetch LIVE jobs using a public, free Developer API (No scraping blocks!)
        const url = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(topDomain)}&limit=10`;
        const { data } = await axios.get(url);
        
        const jobs = [];

        // Distribute map pins across major Indian tech hubs
        const techHubs = [
            { lat: 22.5726, lng: 88.3639, name: "Kolkata, WB" },
            { lat: 12.9716, lng: 77.5946, name: "Bangalore, KA" },
            { lat: 28.7041, lng: 77.1025, name: "New Delhi, DL" },
            { lat: 19.0760, lng: 72.8777, name: "Mumbai, MH" },
            { lat: 18.5204, lng: 73.8567, name: "Pune, MH" }
        ];

        // 4. Map the API response to our app's format
        if (data && data.jobs && data.jobs.length > 0) {
            // Take the top 8 recent jobs
            const fetchedJobs = data.jobs.slice(0, 8);
            
            fetchedJobs.forEach((job, i) => {
                const hub = techHubs[i % techHubs.length];
                
                jobs.push({
                    id: job.id,
                    title: job.title,
                    company: job.company_name,
                    location: hub.name + " (Remote)",
                    lat: hub.lat,
                    lng: hub.lng,
                    type: job.job_type ? job.job_type.replace('_', ' ') : "Full-Time",
                    salary: job.salary || "Competitive / DOE",
                    url: job.url // The real link to apply!
                });
            });
        } else {
            // Fallback if the API is empty for that specific keyword
            jobs.push({
                id: 99,
                title: `${topDomain} Professional`,
                company: "Global Tech Network",
                location: "Kolkata, WB (Remote)",
                lat: 22.5726,
                lng: 88.3639,
                type: "Full-Time",
                salary: "Competitive",
                url: "https://linkedin.com/jobs/search?keywords=" + encodeURIComponent(topDomain)
            });
        }

        res.status(200).json({ success: true, data: jobs });

    } catch (error) {
        console.error("Job API Error:", error.message);
        
        // Even if the API completely fails, send a fallback job so the Map doesn't crash!
        res.status(200).json({ 
            success: true, 
            data: [{
                id: 100,
                title: `Software Developer`,
                company: "TechNova",
                location: "Kolkata, WB",
                lat: 22.5726,
                lng: 88.3639,
                type: "Full-Time",
                salary: "Competitive",
                url: "https://linkedin.com/jobs"
            }] 
        });
    }
};

// ------------------------------------------------------------------
// 4. AI CHATBOT ASSISTANT (Powered by Groq)
// ------------------------------------------------------------------
const chatWithAssistant = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ error: "Message is required." });

        // Grab the user's latest analysis so the AI knows their background!
        const latestAnalysis = await Analysis.findOne({ userId: req.user.id }).sort({ date: -1 });

        let contextStr = "You are an expert career counselor named ResuBot. You are helpful, concise, and friendly. Do not use Markdown formatting, reply in plain text.";
        if (latestAnalysis && latestAnalysis.suggestedDomains) {
            contextStr += ` The user is highly interested in: ${latestAnalysis.suggestedDomains.join(', ')}. Keep your answers concise, encouraging, and format them as plain text.`;
        } else {
            contextStr += " The user hasn't uploaded a resume yet. Politely encourage them to upload one in the Career Discovery tab so you can give better advice.";
        }

        // 🌟 GROQ API CALL FOR CHAT 🌟
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: contextStr },
                { role: "user", content: message }
            ],
            model: "llama-3.3-70b-versatile", // Lightning fast for standard chat responses
        });

        const reply = chatCompletion.choices[0].message.content.trim();

        res.status(200).json({ success: true, reply });
    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ error: "Failed to communicate with the AI assistant." });
    }
};
// ------------------------------------------------------------------
// 5. GENERATE INTERVIEW QUESTIONS (Powered by Groq)
// ------------------------------------------------------------------
const generateInterviewQuestions = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "Please upload a resume (PDF)." });

        const { readPdfText } = await import('pdf-text-reader');
        const pdfUint8Array = new Uint8Array(req.file.buffer);
        const resumeText = await readPdfText({ data: pdfUint8Array });

        const prompt = `You are an expert technical recruiter and hiring manager. Review this resume and generate all possible and highly tailored, challenging interview questions based ONLY on the candidate's specific experience, projects, and skills.
        
Resume:
"""
${resumeText}
"""

Return ONLY valid JSON. No markdown, no text outside the JSON. Format exactly like this:
{
  "questions": [
    {
      "question": "The interview question here...",
      "rationale": "Briefly explain why you are asking this based on their resume."
    }
  ]
}`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are an expert interviewer. You only respond with raw, valid JSON." },
                { role: "user", content: prompt }
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        });

        let responseText = chatCompletion.choices[0].message.content.replace(/```json|```/g, "").trim();
        const aiAnalysis = JSON.parse(responseText);

        res.status(200).json({ success: true, data: aiAnalysis.questions });
    } catch (error) {
        console.error("Interview Gen Error:", error);
        res.status(500).json({ error: "Failed to generate interview questions." });
    }
};

// DON'T FORGET TO UPDATE YOUR EXPORTS AT THE VERY BOTTOM:
module.exports = { analyzeResume, getHistory, getRecommendedJobs, chatWithAssistant, generateInterviewQuestions };

//module.exports = { analyzeResume, getHistory, getRecommendedJobs, chatWithAssistant };