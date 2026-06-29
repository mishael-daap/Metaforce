"use client";

import { MessageSquare, MoreHorizontal, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSession } from "next-auth/react";

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface ProjectCardProps {
  project: Project;
  onProjectClick: (projectId: string) => void;
  onChatClick: (e: React.MouseEvent, projectId: string) => void;
  onEditClick: (e: React.MouseEvent, project: Project) => void;
  onDeleteClick: (e: React.MouseEvent, project: Project) => void;
}

export function ProjectCard({
  project,
  onProjectClick,
  onChatClick,
  onEditClick,
  onDeleteClick,
}: ProjectCardProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow flex flex-col justify-between border-red-300"
      onClick={() => onProjectClick(project.id)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{project.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => onEditClick(e, project)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => onDeleteClick(e, project)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription className="line-clamp-2">
          {project.description || "No description"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={(e) => onChatClick(e, project.id)}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Open Chat
        </Button>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Avatar>
          <AvatarImage
            src={ user?.image ?? undefined}
            alt={user?.name ?? "User avatar"}
          />
          <AvatarFallback>
            {user?.name?.charAt(0).toUpperCase() ??
              user?.email?.charAt(0).toUpperCase() ??
              "U"}
          </AvatarFallback>
        </Avatar>
        <div className="text-sm text-muted-foreground">
          Created {formatDate(project.created_at)}
        </div>
      </CardFooter>
    </Card>
  );
}
