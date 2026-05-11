# Technical Plan

## Components
- SidebarLayout: Shared layout with sidebar navigation
- ProjectsPage: Main container for projects listing
- ProjectCard: Individual project display with actions
- ProjectDetailPage: Project detail view with metadata components
- CreateProjectDialog: Modal form for creating projects
- EditProjectDialog: Modal form for editing projects
- DeleteProjectDialog: Confirmation dialog for deletion
- SearchInput: Real-time search input
- SortDropdown: Sort options dropdown
- MetadataComponentCard: Display individual metadata component

## API
- GET /api/projects - Fetch user's projects
- POST /api/projects - Create new project
- GET /api/projects/[id] - Fetch project details
- PUT /api/projects/[id] - Update project
- DELETE /api/projects/[id] - Delete project
- GET /api/projects/[id]/metadata - Fetch metadata components for project

## Data Model
Project {
  id: UUID
  name: string
  description: string
  created_by: UUID
  created_at: timestamp
  updated_at: timestamp
}

MetadataComponent {
  id: UUID
  type: string
  name: string
  api_name: string
  definition: string
  project_id: UUID
  created_by: UUID
  created_at: timestamp
  updated_at: timestamp
}

## Flow
**Projects Page:**
Page loads → Fetch projects → Display in grid → User searches → Filter projects → User sorts → Reorder projects → User creates project → POST to API → Save to Supabase → Refresh list → User deletes project → Show confirmation → DELETE to API → Remove from list

**Project Detail Page:**
Page loads → Fetch project details → Fetch metadata components → Display project info → Display metadata components → User edits project → Show edit dialog → PUT to API → Update display → User deletes project → Show confirmation → DELETE to API → Redirect to projects list → User clicks chat button → Navigate to chat page

## Notes
- Use shadcn/ui components (Card, Dialog, Input, Button, Select, Badge)
- Use React state for search and sort
- Use Next.js App Router for navigation
- Use Supabase client for database operations
- Real-time search filters client-side for simplicity
- Project detail page uses same sidebar layout
