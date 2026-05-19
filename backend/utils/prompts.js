const generateQuestionsPrompt = (role, experience, topicsToFocus, description) => `
You are an expert technical interviewer. Generate 10 high-quality interview questions and detailed answers for the following candidate profile:

Role: ${role}
Experience Level: ${experience}
Topics to Focus: ${topicsToFocus}
Additional Description: ${description || "N/A"}

Guidelines:
- Questions should be relevant to the role and experience level
- Mix conceptual, practical, and problem-solving questions
- Answers should be detailed, clear and interview-ready
- Cover all the topics mentioned above
- Make questions progressively challenging

Return ONLY a valid JSON array with no extra text, no markdown, no explanation:
[
  {
    "question": "Write the question here",
    "answer": "Write a detailed answer here"
  }
]`;

const conceptExplainPrompt = (concept) => `
You are an expert technical mentor helping a candidate prepare for interviews.

Explain the following concept in a clear, structured and interview-ready way:
Concept: ${concept}

Your explanation must include:
1. Simple Definition — explain it like the candidate is hearing it for the first time
2. Key Points — bullet points of the most important things to remember
3. Real-World Example — a practical example to make it easy to understand
4. Common Interview Question — one common interview question related to this concept with a short answer

Keep the explanation concise, easy to understand and directly useful for interviews.
Return plain text, no JSON.`;

module.exports = { generateQuestionsPrompt, conceptExplainPrompt };