'use client';

import { useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Requirement, RequirementStatus } from '@/src/types/requirements';

const statusConfig: Record<
  RequirementStatus,
  { color: string; bgColor: string; label: string }
> = {
  pending: {
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    label: 'Pending',
  },
  planned: {
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    label: 'Planned',
  },
  completed: {
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    label: 'Completed',
  },
  cancelled: {
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    label: 'Cancelled',
  },
};

interface RequirementsListProps {
  requirements: Requirement[];
  onUpdate?: (id: string, title: string, description: string) => void;
  onDelete?: (id: string) => void;
}

export function RequirementsList({ requirements, onUpdate, onDelete }: RequirementsListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const handleValueChange = (value: string) => {
    setExpandedId(value || null);
  };

  const startEdit = (requirement: Requirement) => {
    setEditingId(requirement.id);
    setEditTitle(requirement.title);
    setEditDescription(requirement.description);
  };

  const saveEdit = (id: string) => {
    if (editTitle.trim() && editDescription.trim()) {
      onUpdate?.(id, editTitle, editDescription);
      setEditingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  return (
    <Card className="w-full p-1">
      <CardContent className="px-1">
        <Accordion
          type="single"
          collapsible
          value={expandedId ?? ''}
          onValueChange={handleValueChange}
        >
          {requirements.map((requirement) => {
            const status = statusConfig[requirement.status];

            return (
              <AccordionItem
                key={requirement.id}
                value={requirement.id}
                className="border-none"
              >
                <AccordionTrigger>
                  <div className="flex items-center justify-between gap-3 w-full pr-4">
                    <h3
                      className={`font-medium text-sm text-left leading-snug ${
                        requirement.status === 'completed'
                          ? 'line-through text-muted-foreground'
                          : 'text-foreground'
                      }`}
                    >
                      {requirement.title}
                    </h3>
                    <Badge
                      className={`${status.bgColor} ${status.color} text-xs font-semibold shrink-0`}
                    >
                      {status.label}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {editingId === requirement.id ? (
                    <div className="space-y-3 px-4 py-3">
                      <Input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="text-sm"
                      />
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full min-h-[80px] rounded-lg border border-input bg-background px-2.5 py-1.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 resize-none"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => saveEdit(requirement.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 py-3">
                      <div className="text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {requirement.description}
                        </ReactMarkdown>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => startEdit(requirement)}
                        >
                          <Edit2 className="size-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => onDelete?.(requirement.id)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="size-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
