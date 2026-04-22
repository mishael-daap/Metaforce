import { exec } from 'child_process';
import { promisify } from 'util';
import { AuthenticateOrgInput, AuthenticateOrgResult } from '../types/AuthTypes.js';

const execAsync = promisify(exec);

export async function authenticateOrg(input: AuthenticateOrgInput): Promise<AuthenticateOrgResult> {
  try {
    // Validate inputs
    const validationResult = validateInputs(input);
    if (!validationResult.valid) {
      return {
        success: false,
        error: validationResult.error
      };
    }

    const { accessToken, instanceUrl, alias = 'metaforce-org' } = input;

    // Set environment variable and execute CLI command
    const command = `sf org login access-token --instance-url ${instanceUrl} --alias ${alias} --no-prompt --json`;

    const { stdout, stderr } = await execAsync(command, {
      env: { ...process.env, SF_ACCESS_TOKEN: accessToken },
      cwd: process.cwd()
    });

    // Parse JSON output
    const result = JSON.parse(stdout);

    if (result.status === 0) {
      return {
        success: true,
        alias: alias
      };
    } else {
      return {
        success: false,
        error: result.message || 'Authentication failed'
      };
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    return {
      success: false,
      error: errorMessage
    };
  }
}

interface ValidationResult {
  valid: boolean;
  error?: string;
}

function validateInputs(input: AuthenticateOrgInput): ValidationResult {
  if (!input.accessToken) {
    return { valid: false, error: 'accessToken is required' };
  }

  if (!input.instanceUrl) {
    return { valid: false, error: 'instanceUrl is required' };
  }

  // Basic URL validation
  try {
    new URL(input.instanceUrl);
  } catch {
    return { valid: false, error: 'instanceUrl must be a valid URL' };
  }

  // Validate Salesforce URL
  if (!input.instanceUrl.includes('.salesforce.com') && !input.instanceUrl.includes('.my.salesforce.com')) {
    return { valid: false, error: 'instanceUrl must be a valid Salesforce URL' };
  }

  return { valid: true };
}
