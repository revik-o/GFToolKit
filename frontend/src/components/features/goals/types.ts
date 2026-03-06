export type GoalItem = {
    id: string;
    title: string;
    description: string;
    priority: "Low" | "Medium" | "High";
    target_audience: "Him" | "Her" | "General";
    created_at: string;
};

export type BackendGoal = {
    id: string;
    title: string;
    description: string;
    priority: "Low" | "Medium" | "High";
    target_audience: "Him" | "Her" | "General";
    created_at: string;
    updated_at: string;
};
