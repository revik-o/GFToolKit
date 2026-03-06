export type NoteItem = {
    id: string;
    title: string;
    description: string;
    target_audience: "Him" | "Her" | "General";
    created_at: string;
};

export type BackendNote = {
    id: string;
    title: string;
    description: string;
    target_audience: "Him" | "Her" | "General";
    created_at: string;
    updated_at: string;
};
