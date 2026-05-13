import type { StarterTemplate, WebsitePrinterAnswers } from "../types";

export interface BuildWebsitePrinterPromptInput {
  answers: WebsitePrinterAnswers;
  templates: StarterTemplate[];
  outputMode?: "prompt" | "implementation-plan";
}

export function buildWebsitePrinterPrompt({
  answers,
  templates,
  outputMode = "prompt",
}: BuildWebsitePrinterPromptInput): string {
  const selectedTemplateInstructions = templates
    .map((template) => `- ${template.name} (${template.section_type}): ${template.prompt_instructions}`)
    .join("\n");

  return `ROLE & MINDSET

You are a Senior Product Designer, Full-Stack Architect, Conversion Copywriter, and Systems Expert combined.

Your task is to build a complete, production-ready website. Use the best practical technology choices for this business, and add missing best-practice features where they support conversion, maintainability, or trust.

BUSINESS DETAILS
- Business Name: ${answers.businessName}
- Niche: ${answers.primaryService} (${answers.secondaryServices})
- Goal: Lead generation, sales, and high-conversion bookings
- Target Audience: ${answers.idealCustomer}
- Brand Tone & Style: Derive from the industry niche "${answers.primaryService}" and visual direction "${answers.visualDirection}"
- Core USP: ${answers.usp}
- Location: ${answers.cityState}
- Service Areas: ${answers.serviceAreas}
- Credibility: ${answers.yearsInBusiness} years in business, licensed/insured: ${answers.licensedInsured}, financing: ${answers.financing}
- Contact: ${answers.phone}
- Average Project Size: ${answers.avgProjectSize || "Not specified"}
- Existing Brand Assets: ${answers.existingColors}

SELECTED SECTION STRATEGY
${selectedTemplateInstructions || "- Use a complete local-service website section set."}

WHAT TO BUILD
1. Frontend
Build a professional, conversion-optimized website appropriate for this niche. Include home, about, services, contact/booking, and legal pages.

2. Backend & Admin
Include a practical admin dashboard concept for content, media, SEO controls, navigation, form submissions, and design settings. Keep the admin usable by non-technical business owners.

3. Forms & Bookings
Include quote/contact forms, booking request flow, customer details, and email notification readiness.

4. Design & UX
Make it responsive, fast, mobile-friendly, touch-friendly, and visually specific to ${answers.primaryService}.

5. SEO & Integrations
Use local SEO fundamentals, Local Business schema, analytics-ready structure, and social sharing basics.

FINAL INSTRUCTION
Return ${outputMode === "implementation-plan" ? "a structured implementation plan and production checklist" : "the complete build prompt for the website generator"}. Do not invent real reviews, awards, or credentials. Use placeholders where real proof is needed.`;
}
