import type { SavedWebsitePrint, StarterTemplate, WebsitePrinterAnswers } from "../types";

type LegacyBuild = {
  id?: string | number;
  name?: string;
  niche?: string;
  city?: string;
  date?: string;
  prompt?: string;
  answers?: Partial<WebsitePrinterAnswers>;
};

export function mapLegacyBuildToSavedPrint(build: LegacyBuild, fallbackProjectId: string): SavedWebsitePrint {
  const answers = normalizeAnswers(build.answers ?? {});

  return {
    id: String(build.id ?? crypto.randomUUID()),
    projectId: fallbackProjectId,
    name: build.name || answers.businessName || "Untitled Website Print",
    niche: build.niche || answers.primaryService || "Unknown service",
    location: build.city || answers.cityState || "Unknown location",
    createdAt: build.date ? new Date(build.date).toISOString() : new Date().toISOString(),
    answers,
    templateKeys: [],
    prompt: build.prompt || "",
  };
}

export function normalizeAnswers(input: Partial<WebsitePrinterAnswers>): WebsitePrinterAnswers {
  return {
    businessName: input.businessName ?? "",
    cityState: input.cityState ?? "",
    primaryService: input.primaryService ?? "",
    secondaryServices: input.secondaryServices ?? "",
    yearsInBusiness: input.yearsInBusiness ?? "",
    licensedInsured: input.licensedInsured ?? "",
    usp: input.usp ?? "",
    idealCustomer: input.idealCustomer ?? "",
    avgProjectSize: input.avgProjectSize ?? "",
    financing: input.financing ?? "",
    phone: input.phone ?? "",
    serviceAreas: input.serviceAreas ?? "",
    existingColors: input.existingColors ?? "",
    visualDirection: input.visualDirection ?? "",
  };
}

export function getSelectedTemplates(allTemplates: StarterTemplate[], selectedKeys: string[]) {
  const selected = new Set(selectedKeys);
  return allTemplates.filter((template) => selected.has(template.key));
}
