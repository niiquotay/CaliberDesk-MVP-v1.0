import { GoogleGenAI, Type } from "@google/genai";
import { Job, UserProfile, Message, Application, AptitudeQuestion } from "../types";

export const getApiKey = () => {
  // Use a string-based lookup to avoid Vite's static replacement
  const globalProcess = (typeof window !== 'undefined' ? (window as any).process : undefined) || (typeof process !== 'undefined' ? process : undefined);
  const env = globalProcess?.env || {};
  
  const dynamicKey = env['API_KEY'];
  const fallbackKey = env['GEMINI_API_KEY'] || (import.meta as any).env?.VITE_GEMINI_API_KEY;
                      
  // Clean up the key in case it's "undefined" or "null" as a string
  const cleanKey = (key: any) => {
    if (typeof key !== 'string') return "";
    const trimmed = key.trim();
    if (trimmed === "undefined" || trimmed === "null" || trimmed === "") return "";
    return trimmed;
  };

  return cleanKey(dynamicKey) || cleanKey(fallbackKey) || "";
};

export const dispatchGeminiError = (message: string) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('gemini-error', { detail: { message } }));
  }
};

const callGeminiWithRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  // Early check for API key to provide better error messages
  if (!getApiKey()) {
    const msg = "Neural Link Error: API key missing. Please select a valid key in the AI Studio header.";
    dispatchGeminiError(msg);
    throw new Error(msg);
  }

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const errorMsg = err instanceof Error ? err.message : String(err);
      const isRetryable = errorMsg.includes('503') || err?.status === 503 || err?.error?.code === 503 || errorMsg.includes('500') || err?.status === 500 || err?.error?.code === 500 || errorMsg.includes('error code: 6') || errorMsg.includes('xhr error') || errorMsg.includes('Failed to fetch');
      if (isRetryable && i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        console.warn(`Gemini API error (retryable), retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
};

export const analyzeMatch = async (user: UserProfile, job: Job): Promise<{ 
  score: number; 
  reason: string;
  details: { technical: number; culture: number; experience: number }
}> => {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze match between user and job.
    User Profile: ${JSON.stringify(user)}
    Job: ${job.title} - ${job.description} at ${job.city}, ${job.country}. Eligible countries: ${job.allowedCountries.join(', ')}.
    ${job.idealCandidateDefinition ? `IDEAL CANDIDATE DEFINITION (PRIORITY): ${job.idealCandidateDefinition}` : ''}
    Return JSON with score (0-100), one-sentence reason, and 0-100 scores for technical, culture, experience.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          reason: { type: Type.STRING },
          details: {
            type: Type.OBJECT,
            properties: {
              technical: { type: Type.NUMBER },
              culture: { type: Type.NUMBER },
              experience: { type: Type.NUMBER }
            },
            required: ["technical", "culture", "experience"]
          }
        },
        required: ["score", "reason", "details"]
      }
    }
  }));

  return JSON.parse(response.text || '{}');
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    dispatchGeminiError(msg);
    return { score: 0, reason: "Match analysis failed.", details: { technical: 0, culture: 0, experience: 0 } };
  }
};

export const generateAptitudeTest = async (job: Job, numQuestions: number, difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium'): Promise<AptitudeQuestion[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const prompt = `You are a Psychometric Assessment Specialist at Yale and Cambridge University.
  Generate ${numQuestions} scenario-based aptitude questions for the role of "${job.title}" at "${job.company}".
  
  DIFFICULTY LEVEL: ${difficulty}
  
  JOB CONTEXT:
  ${job.description}
  ${job.responsibilities}
  
  GUIDELINES:
  - Style: High-stakes academic rigour (Yale/Cambridge style).
  - Difficulty: Ensure questions are appropriately challenging for the "${difficulty}" level.
  - Structure: Each question must start with a complex workplace scenario relevant to the role.
  - Options: Exactly 4 plausible options for each.
  - Evaluation: Focus on strategic reasoning, problem-solving, and professional judgement.
  
  Return a JSON array of AptitudeQuestion objects:
  {
    "id": "string",
    "scenario": "string (the question text)",
    "options": ["string", "string", "string", "string"],
    "correctIndex": number (0-3)
  }`;

  const response = await callGeminiWithRetry(() => ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                scenario: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctIndex: { type: Type.NUMBER }
              },
              required: ["id", "scenario", "options", "correctIndex"]
            }
          }
        },
        required: ["questions"]
      }
    }
  }));

  const parsed = JSON.parse(response.text || '{"questions": []}');
  return parsed.questions;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    dispatchGeminiError(msg);
    return [];
  }
};

export const editProfileImage = async (base64Image: string, prompt: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
  
  const data = base64Image.split(',')[1] || base64Image;
  const mimeType = base64Image.split(';')[0].split(':')[1] || 'image/png';

  const response = await callGeminiWithRetry(() => ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: data,
            mimeType: mimeType,
          },
        },
        {
          text: `You are a professional corporate photographer and editor. Refine this profile picture to look more professional based on this request: "${prompt}". Ensure the resulting image is sharp, well-lit, and suitable for a high-level executive profile on LinkedIn or CaliberDesk. Maintain the subject's identity but enhance the attire, background, or lighting as requested.`,
        },
      ],
    },
  }));

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("Failed to generate edited image part.");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    dispatchGeminiError(msg);
    throw err;
  }
};

export const getEmployerInsights = async (jobs: Job[], applications: Application[]): Promise<{
  marketPosition: string;
  candidateQuality: string;
  actionItems: string[];
  rolePerformance: Array<{ jobTitle: string; status: string }>;
}> => {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const dataContext = JSON.stringify({
      activeJobs: jobs.map(j => ({ title: j.title, salary: j.salary, location: j.city })),
      applicationVolume: applications.length,
      statuses: applications.map(a => a.status)
    });

    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an elite Recruitment Strategy Consultant. Analyze the following hiring data for an employer and provide high-level management insights.
      Data: ${dataContext}
      
      Return JSON with:
      - marketPosition: 1-sentence assessment of how competitive their roles/salaries are.
      - candidateQuality: 1-sentence assessment of the current talent pipeline.
      - actionItems: 3 specific, punchy strategic recommendations.
      - rolePerformance: An array of objects, each containing "jobTitle" and a "status" (a 3-word performance status like "Critical - Underpaid" or "High Demand - Stable").`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            marketPosition: { type: Type.STRING },
            candidateQuality: { type: Type.STRING },
            actionItems: { type: Type.ARRAY, items: { type: Type.STRING } },
            rolePerformance: { 
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  jobTitle: { type: Type.STRING },
                  status: { type: Type.STRING }
                },
                required: ["jobTitle", "status"]
              }
            }
          },
          required: ["marketPosition", "candidateQuality", "actionItems", "rolePerformance"]
        }
      }
    }));

    return JSON.parse(response.text || '{}');
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    dispatchGeminiError(msg);
    return { marketPosition: "", candidateQuality: "", actionItems: [], rolePerformance: [] };
  }
};

export const generateJobSection = async (
  section: 'definition' | 'responsibilities' | 'requirements' | 'summary' | 'full_rewrite',
  jobTitle: string,
  companyName: string,
  existingContent?: string
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    
    let prompt = "";
    if (section === 'definition') {
      prompt = `Generate a high-stakes executive summary for a "${jobTitle}" role at "${companyName}". 
      Focus on the role's strategic mission, organizational impact, and primary objectives. 
      Tone: Sophisticated, authoritative, and compelling. Keep it to 2-3 impactful sentences.`;
    } else if (section === 'summary') {
      prompt = `Generate a compelling 1-paragraph job summary for a "${jobTitle}" role at "${companyName}". 
      Highlight why a candidate should be excited about this role and the company's vision. 
      Tone: Modern, energetic, and professional.`;
    } else if (section === 'responsibilities') {
      prompt = `Generate a detailed list of 5-8 primary roles, responsibilities, and day-to-day duties for a "${jobTitle}" role at "${companyName}". Use professional action verbs.`;
    } else if (section === 'requirements') {
      prompt = `Generate a comprehensive list of candidate prerequisites (education, years of experience, technical skills, and certifications) for a "${jobTitle}" role at "${companyName}".`;
    } else {
      prompt = `Professionally rewrite and optimize the following job posting for high conversion. Title: "${jobTitle}" at "${companyName}". Existing content: "${existingContent}". Ensure the tone is elite, modern, and compelling.`;
    }

    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    }));

    return response.text || "AI generation failed. Please try again.";
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    dispatchGeminiError(msg);
    return "Generation failed due to API error.";
  }
};

export const generateProfessionalDraft = async (
  category: string, 
  platform: string, 
  context: string, 
  user: UserProfile, 
  job?: Job
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const prompt = `
      You are a world-class professional communications expert.
      Task: Draft a high-impact ${category} for ${platform}.
      User Context: ${user.name}, a ${user.role}.
      Specific Request Details: ${context}
      ${job ? `Target Job Context: ${job.title} at ${job.company}.` : ''}
      
      Guidelines:
      - Tone: Professional, confident, and persuasive.
      - Format: Ready to send. If it's a WhatsApp/Text, keep it brief. If it's a Resignation or Offer Letter, follow formal standards.
      - Include placeholders like [Date] or [Recipient Name] where appropriate.
      - Focus on the user's value proposition.
      
      Return ONLY the text of the draft.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Drafting failed. Please try again.";
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    dispatchGeminiError(msg);
    return "Drafting failed due to API error.";
  }
};

export const generateInterviewQuestions = async (job: Job, user: UserProfile): Promise<string[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate 3 high-stakes behavioral interview questions for a ${job.title} role at ${job.company}. 
      Candidate profile: ${user.experienceSummary} experience with skills: ${user.skills.join(', ')}.
      Return as a JSON array of strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    }));
    return JSON.parse(response.text || '[]');
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    dispatchGeminiError(msg);
    return [];
  }
};

export const analyzeInterviewResponse = async (question: string, transcript: string, activeProtocols: string[] = []): Promise<any> => {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an AI Interview Coach. Analyze this candidate's interview response.
      Question: ${question}
      Transcript: ${transcript}
      
      CRITICAL EVALUATION FOCUS:
      ${activeProtocols.includes('Behavioral Analysis') ? '- Deep Behavioral Analysis: Evaluate confidence, professional sentiment, and leadership presence.' : ''}
      ${activeProtocols.includes('STAR Grading') ? '- STAR Method Rigor: Strictly grade alignment with Situation, Task, Action, and Result structure.' : ''}
      ${activeProtocols.length === 0 ? '- General technical and professional competence.' : ''}
      
      Provide a JSON object with: 
      - confidenceScore (0-100)
      - contentScore (0-100)
      - feedback (A detailed 2-sentence summary)
      - strengths (array of 3 strings)
      - improvements (array of 3 strings)`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            confidenceScore: { type: Type.NUMBER },
            contentScore: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["confidenceScore", "contentScore", "feedback", "strengths", "improvements"]
        }
      }
    }));
    return JSON.parse(response.text || '{}');
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    dispatchGeminiError(msg);
    return { confidenceScore: 0, contentScore: 0, feedback: "Analysis failed.", strengths: [], improvements: [] };
  }
};

export const enhanceProfileSection = async (sectionName: string, content: string, user: UserProfile): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an elite executive career consultant. Professionally rewrite the following "${sectionName}" to sound high-impact, achievement-oriented, and compelling. 
      Current Content: "${content}"
      User Role: ${user.role}
      
      CRITICAL GUIDELINES:
      - Tone: Authoritative, professional, and sophisticated.
      - Focus: Quantifiable results, elite leadership qualities, and strategic execution.
      - Style: Use powerful action verbs (e.g., Orchestrated, Spearheaded, Revolutionized).
      - Transformation: Turn standard tasks into high-stakes achievements.
      
      Return ONLY the professionally rewritten text.`,
    }));
    return response.text || "";
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    dispatchGeminiError(msg);
    return content; // Return original content on failure
  }
};

export const generateTailoredResume = async (user: UserProfile, job?: Job): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const jobContext = job ? `Tailor this resume specifically for the ${job.title} position at ${job.company}. Description: ${job.description}` : "Create a high-impact professional resume.";
    
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: `Generate a professionally structured, ATS-optimized CV in clean plain text format for the following user.
      User Profile: ${JSON.stringify(user)}
      ${jobContext}

      STRICT FORMATTING RULES:
      - Use **bold** (double asterisks) ONLY for: Full Name, Section Headings, Company Names, Job Titles, and Dates/Years.
      - Do NOT use any other Markdown characters (no #, no -, no |, no [], etc.).
      - Do NOT use bullet symbols like *, -, or •.
      - Use clean section headings in ALL CAPS.
      - Use consistent spacing between sections.
      - Use simple line breaks for structure.
      - Do not include commentary, explanations, or meta descriptions.
      - Do not include phrases like "Why this profile matches" or similar analysis.
      - Output ONLY the CV content.
      - Ensure professional alignment and consistent formatting throughout.

      STRUCTURE THE CV EXACTLY IN THIS ORDER:
      1. **FULL NAME**
      2. **Professional Title**
      3. Location, Phone, Email, LinkedIn, Portfolio (Use commas or spaces as separators. Do NOT use pipes or any other special characters.)
      4. **PROFESSIONAL SUMMARY** (3-5 concise sentences highlighting experience, industry focus, and measurable impact)
      5. **CORE COMPETENCIES** (List competencies separated by commas, no bullet symbols)
      6. **PROFESSIONAL EXPERIENCE** (**Company Name** - Location \n **Job Title** - **Start Date to End Date** \n Achievement-focused statements starting with strong action verbs. No symbols.)
      7. **EDUCATION** (**Degree** \n **Institution** - **Year**)
      8. **CERTIFICATIONS AND SKILLS** (Certifications \n Tools \n Technical Skills)
      9. **PROJECTS OR LEADERSHIP** (Optional) (**Role** - **Organization** - **Year** \n Brief description)

      Ensure the final output looks like a clean, corporate CV suitable for senior executive roles.`,
    }));
    return response.text || "";
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    dispatchGeminiError(msg);
    return "Resume generation failed due to API error.";
  }
};

export const parseResume = async (input: { text?: string, base64?: string, mimeType?: string }): Promise<Partial<UserProfile>> => {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
  
  const prompt = `EXHAUSTIVE EXTRACTION PROTOCOL: EXTRACT EVERY SINGLE DETAIL FROM THIS RESUME. ZERO DATA LOSS.
    
    CRITICAL INSTRUCTIONS FOR WORK HISTORY:
    1. EXHAUSTIVE VERBATIM MANIFEST: For each role, you MUST extract and include EVERY SINGLE job function, responsibility, duty, and achievement mentioned in the original CV.
    2. ABSOLUTE NO-TRUNCATION POLICY: Do NOT summarize bullet points. Do NOT capture only the first few lines. Capture the ENTIRE depth of the role as described in the source text.
    3. DETAILED SYNTHESIS: Convert the original list into a detailed, high-impact professional narrative in the 'description' field that remains 100% faithful to the source's content density.
    
    TOTAL EXTRACTION REQUIREMENTS:
    - Extract ALL Education history (Degrees, Schools, Years).
    - Extract ALL Certifications, Licenses, and Credentials (ensure names are verbatim).
    - Extract ALL Projects (Names, exhaustive Descriptions, Years).
    - Extract ALL Technical, Digital, and Soft Skills.
    - Extract Personal Website or Portfolio URLs.
    - Capture Phone numbers, Email, and Location (City/Country).
    
    Return a JSON object exactly matching this schema:
    {
      "name": "Full name string",
      "email": "Primary email string",
      "phone": "Contact number string",
      "city": "City string",
      "country": "Country string",
      "role": "Target/Current Title string",
      "linkedinUrl": "LinkedIn profile URL string",
      "portfolioUrl": "Personal website or portfolio URL string",
      "skills": ["Array of core soft/strategic skills"],
      "digitalSkills": ["Array of software, tools, and technical stacks"],
      "certifications": ["Array of strings for all professional certifications/licenses"],
      "experienceSummary": "e.g., '15+ years'",
      "bio": "A detailed 2-sentence executive value proposition",
      "workHistory": [
        {
          "role": "string",
          "company": "string",
          "startYear": "string",
          "endYear": "string",
          "period": "string",
          "description": "EXHAUSTIVE VERBATIM MANIFEST OF ALL FUNCTIONS AND ACHIEVEMENTS. NO TRUNCATION."
        }
      ],
      "education": [
        {
          "degree": "string",
          "school": "string",
          "year": "string"
        }
      ],
      "projects": [
        {
          "name": "string",
          "description": "Full detailed description of impact and deliverables",
          "year": "string"
        }
      ],
      "hobbies": ["Array of personal interests"]
    }`;

  const parts: any[] = [];
  if (input.base64 && input.mimeType) {
    parts.push({
      inlineData: {
        data: input.base64,
        mimeType: input.mimeType
      }
    });
  }
  if (input.text) {
    parts.push({ text: input.text });
  } else if (!input.base64) {
    parts.push({ text: "No data provided." });
  }

  parts.push({ text: prompt });

  const response = await callGeminiWithRetry(() => ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 4000 }
    }
  }));
  
  return JSON.parse(response.text || '{}');
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    dispatchGeminiError(msg);
    return {};
  }
};

export const parseJobDescription = async (input: { text?: string, base64?: string, mimeType?: string }): Promise<Partial<Job>> => {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
  
  const prompt = `EXHAUSTIVE EXTRACTION PROTOCOL: EXTRACT EVERY SINGLE DETAIL FROM THIS JOB DESCRIPTION.
    
    Return a JSON object matching this schema:
    {
      "title": "Job title string",
      "category": "Formal Jobs | Skilled Labour | Gig Work | Growth & StartUps",
      "location": "Remote | Onsite | Hybrid",
      "city": "City string",
      "country": "Country string",
      "responsibilities": "Detailed responsibilities string",
      "requirements": "Detailed requirements string",
      "jobRank": "Senior Management | Middle Level | Entry Level | Intern | Executive",
      "employmentType": "Full-time | Part-time | Contract | Internship | Volunteering"
    }`;

  const parts: any[] = [];
  if (input.base64 && input.mimeType) {
    parts.push({ inlineData: { data: input.base64, mimeType: input.mimeType } });
  }
  if (input.text) {
    parts.push({ text: input.text });
  }
  parts.push({ text: prompt });

  const response = await callGeminiWithRetry(() => ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: { parts },
    config: {
      responseMimeType: "application/json"
    }
  }));
  
  return JSON.parse(response.text || '{}');
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    dispatchGeminiError(msg);
    return {};
  }
};

export const getCareerAdvice = async (history: Message[], user: UserProfile, currentJob?: Job) => {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `You are a Silicon Valley Customer Support agent, Account Manager, Marketing Executive and Platform Coach for Caliberdesk.
        Your mission is to explain the features of the CaliberDesk platform to users, answer their questions, and assist them in all ways needed to navigate and use the app effectively.
        You must know and understand all features, guidelines, process, rights, users and every information about the app so you can answer queries with the most accurate and updated information.
        Restrict your answers to questions relevant to Caliberdesk only.
        Always encourage users to buy services on the app. Act as an account manager to sell and manage relationships.
        Speak in normal English vocabulary and do not sound technical.
        You cannot provide sensitive information to users (user name, password, email, phone numbers, address). Direct users with such queries to send an email to Caliberdesk at info@caliberdesk.com.
        Also advise users to send an email to info@caliberdesk.com if they are not happy with responses or need further help.
        The user is ${user.name}, a ${user.role} living in ${user.city}, ${user.country}. 
        They have skills: ${user.skills.join(', ')}.
        Current context: They are looking at a ${currentJob?.title || 'general job list'}.
        Provide punchy, actionable, and helpful assistance. Keep responses under 80 words.`,
      },
    });

    const lastMessage = history[history.length - 1].text;
    return await callGeminiWithRetry(() => chat.sendMessageStream({ message: lastMessage }));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    dispatchGeminiError(msg);
    throw err;
  }
};export const generateFullJobManifest = async (
  title: string,
  companyName: string,
  companyDescription: string
): Promise<{
  description: string;
  responsibilities: string;
  requirements: string;
}> => {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const prompt = `You are an elite Recruitment Strategy Consultant. 
    Generate a comprehensive job manifest for the role of "${title}" at "${companyName}".
    
    COMPANY CONTEXT:
    ${companyDescription}
    
    TASK:
    Generate three distinct sections:
    1. A compelling, modern 150-word job description.
    2. A detailed list of 5-8 primary responsibilities.
    3. A comprehensive list of candidate prerequisites (skills, experience, education).
    
    Return the result as a JSON object with keys: "description", "responsibilities", "requirements".`;

    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            responsibilities: { type: Type.STRING },
            requirements: { type: Type.STRING }
          },
          required: ["description", "responsibilities", "requirements"]
        }
      }
    }));

    return JSON.parse(response.text || '{}');
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    dispatchGeminiError(msg);
    return { description: "", responsibilities: "", requirements: "" };
  }
};

export const generateJobDescription = async (title: string, company: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a compelling, modern 150-word job description for a "${title}" position at "${company}".`,
    }));
    return response.text || "Job description generation failed.";
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    dispatchGeminiError(msg);
    return "Generation failed due to API error.";
  }
};

export const analyzeSkillGaps = async (user: UserProfile, jobs: Job[]): Promise<{ gaps: string[], recommendations: string[] }> => {
  return callGeminiWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    
    const prompt = `Analyze the user's skills against the requirements of the following saved jobs.
    Identify skill gaps and provide actionable recommendations for development.
    
    User Skills: ${user.skills.join(', ')}
    
    Saved Jobs:
    ${jobs.map(j => `- ${j.title} at ${j.company}: ${j.requirements || j.description}`).join('\n')}
    
    Return a JSON object with:
    - gaps: an array of strings (the missing skills)
    - recommendations: an array of strings (actionable advice to acquire these skills)`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["gaps", "recommendations"]
        }
      }
    });

    try {
      return JSON.parse(response.text || "{}");
    } catch (e) {
      console.error("Failed to parse skill gaps JSON:", e);
      return { gaps: [], recommendations: [] };
    }
  });
};