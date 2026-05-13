export type SectionType = "header" | "hero" | "services" | "reviews" | "faq" | "cta" | "footer";

export interface WebsitePrinterAnswers {
  businessName: string;
  cityState: string;
  primaryService: string;
  secondaryServices: string;
  yearsInBusiness: string;
  licensedInsured: string;
  usp: string;
  idealCustomer: string;
  avgProjectSize?: string;
  financing: string;
  phone: string;
  serviceAreas: string;
  existingColors: string;
  visualDirection: string;
}

export interface StarterTemplate {
  key: string;
  name: string;
  section_type: SectionType;
  description: string;
  best_for: string;
  prompt_instructions: string;
}

export interface WebsitePrinterProject {
  id: string;
  name: string;
  clientName?: string;
}

export interface SavedWebsitePrint {
  id: string;
  projectId: string;
  name: string;
  niche: string;
  location: string;
  createdAt: string;
  answers: WebsitePrinterAnswers;
  templateKeys: string[];
  prompt: string;
}

export interface CompanySpyProvider {
  lookupCompany(input: { companyName: string; websiteUrl?: string }): Promise<CompanySpyResult>;
}

export interface CompanySpyResult {
  summary: string;
  sourceUrl?: string;
  suggestedAnswers: Partial<WebsitePrinterAnswers>;
}

export interface WebsitePrinterRepository {
  listProjects(): Promise<WebsitePrinterProject[]>;
  listPrints(projectId?: string): Promise<SavedWebsitePrint[]>;
  savePrint(print: Omit<SavedWebsitePrint, "id" | "createdAt">): Promise<SavedWebsitePrint>;
  deletePrint(id: string): Promise<void>;
}
