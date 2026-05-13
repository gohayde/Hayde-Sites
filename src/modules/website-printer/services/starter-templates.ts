import type { StarterTemplate } from "../types";

export const starterTemplates: StarterTemplate[] = [
  {
    key: "header-local-service",
    name: "Local Service Header",
    section_type: "header",
    description: "Compact header with phone-forward navigation and booking CTA.",
    best_for: "Home service companies that depend on calls and quote requests.",
    prompt_instructions: "Create a sticky responsive header with logo, core nav, click-to-call, and quote CTA.",
  },
  {
    key: "hero-conversion",
    name: "Conversion Hero",
    section_type: "hero",
    description: "Direct value proposition, trust proof, service area, and primary action.",
    best_for: "Lead-generation landing pages and service websites.",
    prompt_instructions: "Write a niche-specific hero with clear promise, location signal, proof points, and two CTAs.",
  },
  {
    key: "services-grid",
    name: "Services Grid",
    section_type: "services",
    description: "Scannable cards for primary and secondary services.",
    best_for: "Contractors and agencies with multiple service lines.",
    prompt_instructions: "Turn the primary and secondary services into benefit-led cards with concise copy.",
  },
  {
    key: "reviews-proof",
    name: "Review Proof Band",
    section_type: "reviews",
    description: "Social proof area using review themes rather than fake testimonials.",
    best_for: "Businesses that need credibility without inventing reviews.",
    prompt_instructions: "Add a review/proof section with placeholders clearly marked for real customer quotes.",
  },
  {
    key: "faq-objection",
    name: "Objection FAQ",
    section_type: "faq",
    description: "Answers common buyer concerns around pricing, timing, licensing, and service area.",
    best_for: "High-consideration service purchases.",
    prompt_instructions: "Generate FAQ items from buyer objections and local-service trust requirements.",
  },
  {
    key: "cta-estimate",
    name: "Estimate CTA",
    section_type: "cta",
    description: "Strong final conversion block with phone and quote request options.",
    best_for: "Pages optimized for calls, bookings, and quote forms.",
    prompt_instructions: "Create a closing CTA that repeats the main value, location, phone, and booking action.",
  },
  {
    key: "footer-local-business",
    name: "Local Business Footer",
    section_type: "footer",
    description: "Footer with NAP details, services, legal links, and service areas.",
    best_for: "Local SEO-ready business websites.",
    prompt_instructions: "Build a professional footer with contact info, service areas, services, and legal links.",
  },
];

export const getTemplatesBySection = () =>
  starterTemplates.reduce<Record<string, StarterTemplate[]>>((groups, template) => {
    groups[template.section_type] = groups[template.section_type] ?? [];
    groups[template.section_type].push(template);
    return groups;
  }, {});
