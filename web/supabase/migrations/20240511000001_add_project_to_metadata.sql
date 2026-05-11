-- Add project_id to metadata_components table
ALTER TABLE metadata_components
ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX idx_metadata_components_project_id ON metadata_components(project_id);
