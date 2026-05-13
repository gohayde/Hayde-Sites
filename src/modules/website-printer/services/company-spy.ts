import type { CompanySpyProvider, CompanySpyResult } from "../types";

export class DisabledCompanySpyProvider implements CompanySpyProvider {
  async lookupCompany(): Promise<CompanySpyResult> {
    throw new Error("Company Spy is disabled until Agency OS provides a secure server-side provider.");
  }
}
