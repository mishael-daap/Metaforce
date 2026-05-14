'use client';

import { useState } from 'react';
import { ChevronDown, Edit2, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
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
    <div className="w-full">
      <div className="space-y-2">
        {requirements.map((requirement) => {
          const isExpanded = expandedId === requirement.id;
          const status = statusConfig[requirement.status];

          return (
            <div
              key={requirement.id}
              className="bg-gray-100 rounded-lg overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => toggleExpand(requirement.id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-200 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 text-left">
                  <ChevronDown
                    className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                  <h3 className={`font-medium text-gray-900 ${requirement.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                    {requirement.title}
                  </h3>
                  <Badge
                    className={`${status.bgColor} ${status.color} text-xs font-semibold`}
                  >
                    {status.label}
                  </Badge>
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 py-3 bg-gray-50">
                  {editingId === requirement.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-2 py-1 text-sm rounded bg-white text-gray-900 focus:outline-none"
                      />
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full px-2 py-1 text-sm rounded bg-white text-gray-900 focus:outline-none resize-none"
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
                          onClick={cancelEdit}
                          className="bg-gray-400 hover:bg-gray-500 text-white"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {requirement.description}
                      </p>
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => startEdit(requirement)}
                          className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete?.(requirement.id)}
                          className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
