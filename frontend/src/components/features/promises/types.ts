export type PromiseItem = {
    id: string;
    title: string;
    description: string;
    priority: "Low" | "Medium" | "High";
    target_audience: "Him" | "Her" | "General";
    created_at: string;
};

export type BackendPromise = {
    id: string;
    title: string;
    description: string;
    priority: "Low" | "Medium" | "High";
    target_audience: "Him" | "Her" | "General";
    created_at: string;
    updated_at: string;
};
