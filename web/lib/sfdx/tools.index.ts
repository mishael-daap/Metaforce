import { SfdxClient } from './client';
import { createObjectTools } from './objects';
import { createFieldTools } from './fields';

export function createSfdxToolset(client: SfdxClient) {
  return {
    ...createObjectTools(client),
    ...createFieldTools(client),
  };
}

export type SfdxToolset = ReturnType<typeof createSfdxToolset>;
