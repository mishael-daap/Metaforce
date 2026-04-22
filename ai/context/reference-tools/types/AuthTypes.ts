export interface AuthenticateOrgInput {
  accessToken: string;
  instanceUrl: string;
  alias?: string;
}

export interface AuthenticateOrgResult {
  success: boolean;
  alias?: string;
  error?: string;
}
