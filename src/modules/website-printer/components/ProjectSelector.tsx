import type { WebsitePrinterProject } from "../types";

interface ProjectSelectorProps {
  projects: WebsitePrinterProject[];
  activeProjectId: string;
  onChange: (projectId: string) => void;
}

export function ProjectSelector({ projects, activeProjectId, onChange }: ProjectSelectorProps) {
  return (
    <label className="wp-field">
      <span>Project</span>
      <select value={activeProjectId} onChange={(event) => onChange(event.target.value)}>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>
    </label>
  );
}
