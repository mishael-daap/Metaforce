import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Requirement } from '@/lib/schemas/plan-schemas';
import { PlanAction } from './PlanAction';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface PlanRequirementProps {
  requirement: Requirement;
  completedActions: string[];
}

export function PlanRequirement({ requirement, completedActions }: PlanRequirementProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const completedCount = requirement.actions.filter(
    a => completedActions.includes(a.id)
  ).length;

  const isComplete = completedCount === requirement.actions.length;

  return (
    <Card className="mb-4">
      <CardHeader
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <CardTitle className="text-base">{requirement.name}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {completedCount}/{requirement.actions.length} actions
            </span>
            {isComplete && (
              <span className="text-xs text-green-500 font-medium">Complete</span>
            )}
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            {requirement.description}
          </p>
          <div className="space-y-1">
            {requirement.actions.map(action => (
              <PlanAction
                key={action.id}
                action={action}
                isCompleted={completedActions.includes(action.id)}
              />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
