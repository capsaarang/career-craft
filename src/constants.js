export const COLORS = {
  bg: "#080C18", bg2: "#0C1221", card: "#101828", card2: "#162035",
  border: "#1C2A45", accent: "#5B8FF9", teal: "#00C9A7",
  text: "#EEF2FF", muted: "#7C8DB5", dim: "#3D4F6E",
};
export const MOTIVATIONAL_QUOTES = [
  { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { quote: "Every application is a step closer to the offer.", author: "CareerCraft" },
  { quote: "Your next opportunity is one tailored resume away.", author: "CareerCraft" },
  { quote: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { quote: "The best time to apply was yesterday. The second best time is now.", author: "CareerCraft" },
  { quote: "Don't wait for opportunity. Create it.", author: "George Bernard Shaw" },
  { quote: "Opportunities don't happen. You create them.", author: "Chris Grosser" },
  { quote: "Your resume is your story. Make it compelling.", author: "CareerCraft" },
  { quote: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
  { quote: "Dream big. Start small. Act now.", author: "Robin Sharma" },
  { quote: "One rejection is just redirection.", author: "CareerCraft" },
  { quote: "A tailored resume is 10x more powerful than a generic one.", author: "CareerCraft" },
];

export const DEFAULT_PROMPT = `You are an expert resume writer and ATS optimization specialist.

You will receive three inputs:
1. ORIGINAL RESUME - the candidate's full resume in plain text (content source)
2. LATEX TEMPLATE - the LaTeX formatting shell to use as structure
3. JOB DESCRIPTION - the role being applied to

Your task:
- Use the LATEX TEMPLATE as the exact formatting structure
- Pull content from the ORIGINAL RESUME
- Rewrite and tailor the content to match the JOB DESCRIPTION
- Prioritize experiences and skills most relevant to the role
- Weave in keywords and exact phrases from the JD naturally
- Every bullet: action verb → context/solution → measurable result
- Mirror exact terminology from the JD — ATS systems match exact phrases
- No filler. No AI-sounding language. No corporate fluff
- Do not add experiences or qualifications that don't exist
- Only reframe and reorder what's already there

Return ONLY the complete LaTeX source code. No explanation, no markdown fences, no preamble.`;
