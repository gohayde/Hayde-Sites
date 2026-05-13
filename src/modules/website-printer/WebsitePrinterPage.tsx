import { useMemo, useState } from "react";
import { CompanySpyPanel } from "./components/CompanySpyPanel";
import { LayoutSelector } from "./components/LayoutSelector";
import { ProjectSelector } from "./components/ProjectSelector";
import { PromptPreview } from "./components/PromptPreview";
import { SavedPrints } from "./components/SavedPrints";
import { SectionTemplateSelector } from "./components/SectionTemplateSelector";
import { StrategyQuiz } from "./components/StrategyQuiz";
import { useWebsitePrinter } from "./hooks/use-website-printer";
import { buildWebsitePrinterPrompt } from "./services/prompt-builder";

export function WebsitePrinterPage() {
  const printer = useWebsitePrinter();
  const [outputMode, setOutputMode] = useState<"prompt" | "implementation-plan">("prompt");

  const promptForMode = useMemo(() => {
    if (!printer.activePrompt) return "";
    return buildWebsitePrinterPrompt({
      answers: printer.answers,
      templates: printer.selectedTemplates,
      outputMode,
    });
  }, [outputMode, printer.activePrompt, printer.answers, printer.selectedTemplates]);

  return (
    <main className="wp-module">
      <header className="wp-header">
        <div>
          <p>Agency OS Module</p>
          <h1>Website Printer</h1>
        </div>
        <button onClick={printer.reset} type="button">
          Reset
        </button>
      </header>

      <div className="wp-grid">
        <div className="wp-left">
          <ProjectSelector
            activeProjectId={printer.activeProjectId}
            onChange={printer.setActiveProjectId}
            projects={printer.projects}
          />
          <StrategyQuiz answers={printer.answers} onAnswerChange={printer.updateAnswer} />
          <SectionTemplateSelector
            onToggleTemplate={printer.toggleTemplate}
            selectedTemplateKeys={printer.selectedTemplateKeys}
            templates={printer.starterTemplates}
          />
        </div>
        <aside className="wp-right">
          <LayoutSelector value={outputMode} onChange={setOutputMode} />
          <CompanySpyPanel />
          <PromptPreview
            isSaving={printer.isSaving}
            onGenerate={printer.generatePrompt}
            onSave={printer.saveCurrentPrint}
            prompt={promptForMode || printer.activePrompt}
          />
          <SavedPrints onLoadPrint={printer.loadSavedPrint} prints={printer.savedPrints} />
        </aside>
      </div>
    </main>
  );
}
