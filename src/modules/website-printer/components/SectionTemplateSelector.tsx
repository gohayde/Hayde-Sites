import { getTemplatesBySection } from "../services/starter-templates";
import type { StarterTemplate } from "../types";

interface SectionTemplateSelectorProps {
  templates: StarterTemplate[];
  selectedTemplateKeys: string[];
  onToggleTemplate: (templateKey: string) => void;
}

export function SectionTemplateSelector({
  templates,
  selectedTemplateKeys,
  onToggleTemplate,
}: SectionTemplateSelectorProps) {
  const groups = getTemplatesBySection();

  return (
    <section className="wp-panel">
      <div className="wp-section-heading">
        <p>Section Templates</p>
        <span>{templates.length} available</span>
      </div>
      <div className="wp-template-groups">
        {Object.entries(groups).map(([sectionType, items]) => (
          <div className="wp-template-group" key={sectionType}>
            <h3>{sectionType}</h3>
            <div className="wp-template-list">
              {items.map((template) => {
                const checked = selectedTemplateKeys.includes(template.key);
                return (
                  <label className="wp-template-option" key={template.key}>
                    <input
                      checked={checked}
                      onChange={() => onToggleTemplate(template.key)}
                      type="checkbox"
                    />
                    <span>
                      <strong>{template.name}</strong>
                      <small>{template.description}</small>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
