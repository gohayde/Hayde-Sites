interface PromptPreviewProps {
  prompt: string;
  onGenerate: () => void;
  onSave: () => void;
  isSaving: boolean;
}

export function PromptPreview({ prompt, onGenerate, onSave, isSaving }: PromptPreviewProps) {
  return (
    <section className="wp-panel wp-preview">
      <div className="wp-section-heading">
        <p>Prompt Preview</p>
        <span>Pure generated output</span>
      </div>
      <div className="wp-actions">
        <button onClick={onGenerate} type="button">
          Generate Prompt
        </button>
        <button disabled={!prompt || isSaving} onClick={onSave} type="button">
          {isSaving ? "Saving" : "Save Print"}
        </button>
      </div>
      <pre>{prompt || "Complete the quiz and generate a prompt."}</pre>
    </section>
  );
}
