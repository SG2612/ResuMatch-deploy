# 🚀 ResuMatch AI

An intelligent, full-stack recruitment and career progression platform built with the MERN stack. ResuMatch AI bridges the gap between job seekers and recruiters by using advanced LLMs (Large Language Models) to analyze resumes, provide actionable career advice, simulate interviews, and match candidates with real-time job openings.

## ✨ Key Features

### For Job Seekers
* **🧠 Career Discovery:** Upload a resume (PDF) to receive an AI-generated analysis of your current skills, strengths, weaknesses, and top recommended tech domains.
* **🎯 ATS Scanner:** Run a resume against a specific target role to receive a dynamic ATS compatibility score and actionable formatting suggestions.
* **💡 AI Interview Prep:** The system reads your resume's stated experience and generates 5 highly tailored, challenging interview questions (with rationales) to help you practice.
* **🌍 Live Job Board:** Automatically fetches remote job postings (via the Remotive API) that match your highest-rated tech domains and maps them to tech hubs.
* **🤖 ResuBot AI Assistant:** A built-in AI chatbot aware of your latest resume analysis, ready to answer career and interview-related questions.

### For Recruiters
* **📝 Job Posting:** Publish active job listings to the platform.
* **📬 Automated Email Notifications:** Instantly notifies all registered job seekers (via BCC email) the moment a new job is posted.
* **📊 Applicant Tracking:** Receive immediate email notifications when a candidate applies to a role, and review their resume and ATS score from the recruiter dashboard.

## 🛠️ Tech Stack

* **Frontend:** React.js (Vite), CSS/Tailwind, Axios
* **Backend:** Node.js, Express.js
* **Database:** MongoDB Atlas, Mongoose
* **AI Engine:** Groq API (LLaMA-3 70B Versatile model)
* **Authentication:** JSON Web Tokens (JWT)
* **Utilities:** Nodemailer (Emails), `pdf-text-reader` / `pdf-parse` (PDF extraction)
* **Hosting:** Vercel (Frontend), Render (Backend)

## ⚙️ Environment Variables

To run this project locally, you will need to add a `.env` file to the `/server` directory with the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key
GROQ_API_KEY=your_free_groq_api_key
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_16_digit_google_app_password
