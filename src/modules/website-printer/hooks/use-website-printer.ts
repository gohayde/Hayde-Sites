import { useCallback, useEffect, useMemo, useState } from "react";
import { buildWebsitePrinterPrompt } from "../services/prompt-builder";
import { getSelectedTemplates, normalizeAnswers } from "../services/legacy-mappers";
import { LocalWebsitePrinterRepository } from "../services/repository";
import { starterTemplates } from "../services/starter-templates";
import type {
  SavedWebsitePrint,
  WebsitePrinterAnswers,
  WebsitePrinterProject,
  WebsitePrinterRepository,
} from "../types";

const repository = new LocalWebsitePrinterRepository();

export function useWebsitePrinter(repo: WebsitePrinterRepository = repository) {
  const [projects, setProjects] = useState<WebsitePrinterProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState("default");
  const [answers, setAnswers] = useState<WebsitePrinterAnswers>(() => normalizeAnswers({}));
  const [selectedTemplateKeys, setSelectedTemplateKeys] = useState<string[]>(
    starterTemplates.map((template) => template.key),
  );
  const [savedPrints, setSavedPrints] = useState<SavedWebsitePrint[]>([]);
  const [activePrompt, setActivePrompt] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const selectedTemplates = useMemo(
    () => getSelectedTemplates(starterTemplates, selectedTemplateKeys),
    [selectedTemplateKeys],
  );

  const refreshSavedPrints = useCallback(async () => {
    setSavedPrints(await repo.listPrints(activeProjectId));
  }, [activeProjectId, repo]);

  useEffect(() => {
    repo.listProjects().then((items) => {
      setProjects(items);
      if (items[0]?.id) setActiveProjectId(items[0].id);
    });
  }, [repo]);

  useEffect(() => {
    refreshSavedPrints();
  }, [refreshSavedPrints]);

  const updateAnswer = useCallback((key: keyof WebsitePrinterAnswers, value: string) => {
    setAnswers((current) => ({ ...current, [key]: value }));
  }, []);

  const toggleTemplate = useCallback((templateKey: string) => {
    setSelectedTemplateKeys((current) =>
      current.includes(templateKey)
        ? current.filter((key) => key !== templateKey)
        : [...current, templateKey],
    );
  }, []);

  const generatePrompt = useCallback(() => {
    const prompt = buildWebsitePrinterPrompt({ answers, templates: selectedTemplates });
    setActivePrompt(prompt);
    return prompt;
  }, [answers, selectedTemplates]);

  const saveCurrentPrint = useCallback(async () => {
    const prompt = activePrompt || generatePrompt();
    setIsSaving(true);
    try {
      const saved = await repo.savePrint({
        projectId: activeProjectId,
        name: answers.businessName || "Untitled Website Print",
        niche: answers.primaryService || "Unknown service",
        location: answers.cityState || "Unknown location",
        answers,
        templateKeys: selectedTemplateKeys,
        prompt,
      });
      setSavedPrints((current) => [saved, ...current]);
      return saved;
    } finally {
      setIsSaving(false);
    }
  }, [activeProjectId, activePrompt, answers, generatePrompt, repo, selectedTemplateKeys]);

  const loadSavedPrint = useCallback((print: SavedWebsitePrint) => {
    setAnswers(print.answers);
    setSelectedTemplateKeys(print.templateKeys.length ? print.templateKeys : starterTemplates.map((t) => t.key));
    setActivePrompt(print.prompt);
  }, []);

  const reset = useCallback(() => {
    setAnswers(normalizeAnswers({}));
    setSelectedTemplateKeys(starterTemplates.map((template) => template.key));
    setActivePrompt("");
  }, []);

  return {
    projects,
    activeProjectId,
    setActiveProjectId,
    answers,
    updateAnswer,
    starterTemplates,
    selectedTemplateKeys,
    selectedTemplates,
    toggleTemplate,
    activePrompt,
    generatePrompt,
    saveCurrentPrint,
    savedPrints,
    loadSavedPrint,
    isSaving,
    reset,
  };
}
