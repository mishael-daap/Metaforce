-- Remove actions table and add requirement_id to metadata_components

-- Drop indexes related to actions table
DROP INDEX IF EXISTS idx_actions_requirement_id;
DROP INDEX IF EXISTS idx_actions_status;

-- Drop trigger for actions table
DROP TRIGGER IF EXISTS update_actions_updated_at ON actions;

-- Drop actions table
DROP TABLE IF EXISTS actions;

-- Add requirement_id and org_id to metadata_components table
ALTER TABLE metadata_components
ADD COLUMN IF NOT EXISTS requirement_id UUID REFERENCES requirements(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES orgs(id);

-- Add indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_metadata_components_requirement_id ON metadata_components(requirement_id);
CREATE INDEX IF NOT EXISTS idx_metadata_components_org_id ON metadata_components(org_id);