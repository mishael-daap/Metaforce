# Feature: Projects Management

## Purpose
Allow users to view, search, sort, create, and manage their Salesforce development projects, including viewing project details and metadata components.

## User Flow
1. User navigates to `/dashboard/projects`
2. User sees a responsive grid of project cards
3. User can search projects by name (real-time filtering)
4. User can sort projects by: newest, oldest, name
5. User clicks "Create New Project" button → dialog opens
6. User enters project name and description → clicks Create
7. Project is created and appears in the grid
8. User clicks project card → navigates to `/dashboard/project/[projectId]`
9. User clicks external chat link on card → navigates to `/dashboard/project/[projectId]/chat`
10. On project detail page, user sees: name, description, created date, metadata components
11. User can click "Go to Chat" button to navigate to chat interface
12. User can edit or delete project from detail page

## Rules
- Search filters by project name (case-insensitive)
- Sort options: newest (created_at DESC), oldest (created_at ASC), name (name ASC)
- Empty state shows "No projects found" with create button
- Project cards show: name, description (truncated), created date, chat link
- Projects are scoped to authenticated user
- Delete requires confirmation dialog
- Project detail page shows all metadata components for that project
- All pages use shared sidebar layout

## Acceptance Criteria
- [ ] Projects display in responsive grid
- [ ] Search filters projects in real-time
- [ ] Sort dropdown works correctly
- [ ] Create project dialog opens and closes
- [ ] Project can be created successfully
- [ ] Project card navigates to detail page on click
- [ ] External chat link navigates to chat page
- [ ] Empty state displays when no projects
- [ ] Delete functionality works with confirmation
- [ ] Sidebar layout is present and functional
- [ ] Project detail page displays correctly
- [ ] Project detail page shows name, description, created date
- [ ] Project detail page shows metadata components
- [ ] Project detail page has "Go to Chat" button
- [ ] Project can be edited from detail page
- [ ] Project can be deleted from detail page
