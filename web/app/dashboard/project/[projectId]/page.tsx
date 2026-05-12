"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageSquare, Edit, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeleteProjectDialog } from "@/components/projects/delete-project-dialog";
import { EditProjectDialog } from "@/components/projects/edit-project-dialog";

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface MetadataComponent {
  id: string;
  type: string;
  name: string;
  api_name: string;
  created_at: string;
}

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);

  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [metadataComponents, setMetadataComponents] = useState<
    MetadataComponent[]
  >([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch project details
  const fetchProjectDetails = async () => {
    try {
      const [projectRes, metadataRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`), // was params.projectId
        fetch(`/api/projects/${projectId}/metadata`), // was params.projectId
      ]);

      if (projectRes.ok) {
        const projectData = await projectRes.json();
        setProject(projectData);
      }

      if (metadataRes.ok) {
        const metadataData = await metadataRes.json();
        setMetadataComponents(metadataData);
      }
    } catch (error) {
      console.error("Failed to fetch project details:", error);
    } finally {
      setLoading(false);
    }
  };

 useEffect(() => {
  fetchProjectDetails();
}, [projectId]); // was params.projectId

  const handleChatClick = () => {
  router.push(`/dashboard/project/${projectId}/chat`); // was params.projectId
};

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleEditClick = () => {
    setEditDialogOpen(true);
  };

  const handleProjectDeleted = () => {
    router.push("/dashboard/projects");
  };

  const handleProjectUpdated = () => {
    fetchProjectDetails();
    setEditDialogOpen(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getComponentTypeLabel = (type: string) => {
    switch (type) {
      case "custom_object":
        return "Custom Object";
      case "custom_field":
        return "Custom Field";
      default:
        return type;
    }
  };

  const getComponentTypeColor = (type: string) => {
    switch (type) {
      case "custom_object":
        return "default";
      case "custom_field":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading project details...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Project not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
            <p className="text-muted-foreground">
              {project.description || "No description"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleEditClick}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="outline" onClick={handleChatClick}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Go to Chat
            </Button>
          </div>
        </div>
      </div>

      {/* Project Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span>{formatDate(project.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Updated</span>
              <span>{formatDate(project.updated_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Metadata Components
              </span>
              <span>{metadataComponents.length}</span>
            </div>
          </CardContent>
        </Card>

        
      </div>

      {/* Metadata Components */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Metadata Components</h2>
          {metadataComponents.length === 0 && (
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Component
            </Button>
          )}
        </div>

        {metadataComponents.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-muted-foreground mb-4">
                No metadata components yet
              </div>
              <p className="text-sm text-muted-foreground">
                Start a chat to create components for this project
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metadataComponents.map((component) => (
              <Card key={component.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">
                      {component.name}
                    </CardTitle>
                    <Badge
                      variant={getComponentTypeColor(component.type) as any}
                    >
                      {getComponentTypeLabel(component.type)}
                    </Badge>
                  </div>
                  <CardDescription className="font-mono text-xs">
                    {component.api_name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Created {formatDate(component.created_at)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="mt-12 pt-8 border-t">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible and destructive actions
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete this project</p>
              <p className="text-sm text-muted-foreground">
                Once you delete a project, there is no going back. Please be certain.
              </p>
            </div>
            <Button variant="destructive" onClick={handleDeleteClick}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Project
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
    <DeleteProjectDialog
      open={deleteDialogOpen}
      onOpenChange={setDeleteDialogOpen}
      project={project}
      onProjectDeleted={handleProjectDeleted}
    />
    <EditProjectDialog
      open={editDialogOpen}
      onOpenChange={setEditDialogOpen}
      project={project}
      onProjectUpdated={handleProjectUpdated}
    />
    </div>

    
  );
}
