import type { SavedWebsitePrint, WebsitePrinterProject, WebsitePrinterRepository } from "../types";

const STORAGE_KEY = "agency-os.website-printer.prints";

const defaultProjects: WebsitePrinterProject[] = [
  { id: "default", name: "Website Printer Drafts", clientName: "Internal" },
];

export class LocalWebsitePrinterRepository implements WebsitePrinterRepository {
  async listProjects(): Promise<WebsitePrinterProject[]> {
    return defaultProjects;
  }

  async listPrints(projectId?: string): Promise<SavedWebsitePrint[]> {
    const prints = readPrints();
    return projectId ? prints.filter((print) => print.projectId === projectId) : prints;
  }

  async savePrint(print: Omit<SavedWebsitePrint, "id" | "createdAt">): Promise<SavedWebsitePrint> {
    const saved: SavedWebsitePrint = {
      ...print,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    const prints = [saved, ...readPrints()];
    writePrints(prints);
    return saved;
  }

  async deletePrint(id: string): Promise<void> {
    writePrints(readPrints().filter((print) => print.id !== id));
  }
}

// TODO: Replace this with an Agency OS Supabase repository after the module is merged.
// The public module contract should stay WebsitePrinterRepository so UI and hooks do not change.

function readPrints(): SavedWebsitePrint[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]") as SavedWebsitePrint[];
  } catch {
    return [];
  }
}

function writePrints(prints: SavedWebsitePrint[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prints));
}
