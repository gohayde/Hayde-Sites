interface LayoutSelectorProps {
  value: "prompt" | "implementation-plan";
  onChange: (value: "prompt" | "implementation-plan") => void;
}

export function LayoutSelector({ value, onChange }: LayoutSelectorProps) {
  return (
    <section className="wp-panel">
      <div className="wp-section-heading">
        <p>Output Mode</p>
        <span>Agency OS compatible</span>
      </div>
      <div className="wp-segmented">
        <button className={value === "prompt" ? "active" : ""} onClick={() => onChange("prompt")} type="button">
          Prompt
        </button>
        <button
          className={value === "implementation-plan" ? "active" : ""}
          onClick={() => onChange("implementation-plan")}
          type="button"
        >
          Plan
        </button>
      </div>
    </section>
  );
}
