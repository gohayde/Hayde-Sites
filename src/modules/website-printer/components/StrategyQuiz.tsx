import type { WebsitePrinterAnswers } from "../types";

const questions: Array<{
  key: keyof WebsitePrinterAnswers;
  label: string;
  hint: string;
  optional?: boolean;
}> = [
  { key: "businessName", label: "Business name", hint: "Exact name as it should appear on the site." },
  { key: "cityState", label: "City and state", hint: "Primary market or headquarters location." },
  { key: "primaryService", label: "Primary service", hint: "Example: roofing, custom decks, epoxy flooring." },
  { key: "secondaryServices", label: "Secondary services", hint: "Comma-separated service list." },
  { key: "yearsInBusiness", label: "Years in business", hint: "Use only real credibility." },
  { key: "licensedInsured", label: "Licensed and insured", hint: "Yes, no, or exact wording." },
  { key: "usp", label: "Core advantage", hint: "What makes this company better than competitors." },
  { key: "idealCustomer", label: "Ideal customer", hint: "Who the website should persuade." },
  { key: "avgProjectSize", label: "Average project size", hint: "Optional pricing or project range.", optional: true },
  { key: "financing", label: "Financing", hint: "Yes, no, or details." },
  { key: "phone", label: "Phone", hint: "Primary call-to-action number." },
  { key: "serviceAreas", label: "Service areas", hint: "Cities or neighborhoods served." },
  { key: "existingColors", label: "Brand assets", hint: "Logo notes, colors, or type None." },
  { key: "visualDirection", label: "Visual direction", hint: "Example: premium dark, bold industrial, clean editorial." },
];

interface StrategyQuizProps {
  answers: WebsitePrinterAnswers;
  onAnswerChange: (key: keyof WebsitePrinterAnswers, value: string) => void;
}

export function StrategyQuiz({ answers, onAnswerChange }: StrategyQuizProps) {
  return (
    <section className="wp-panel">
      <div className="wp-section-heading">
        <p>Strategy Quiz</p>
        <span>{questions.length} inputs</span>
      </div>
      <div className="wp-form-grid">
        {questions.map((question) => (
          <label className="wp-field" key={question.key}>
            <span>
              {question.label}
              {question.optional ? <em>Optional</em> : null}
            </span>
            <input
              value={answers[question.key] ?? ""}
              onChange={(event) => onAnswerChange(question.key, event.target.value)}
              placeholder={question.hint}
            />
          </label>
        ))}
      </div>
    </section>
  );
}
