export type RequirementStatus =
  | "pending"
  | "planned"
  | "completed"
  | "cancelled";

export type Requirement = {
  id: string;
  title: string;
  description: string;
  status: RequirementStatus;
};
