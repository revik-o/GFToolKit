import { baseApi } from "./baseApi";

export type BackendTask = {
  id: string;
  title: string;
  description: { String: string; Valid: boolean };
  status: { String: string; Valid: boolean };
  priority: { String: string; Valid: boolean };
  assignee_id: { String: string; Valid: boolean };
  author_id: string;
  created_at: string;
  updated_at: string;
};

export const tasksApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.query<BackendTask[], void>({
      query: () => "/api/v1/task/readAll",
      providesTags: ["Task"],
    }),
    createTask: builder.mutation<
      BackendTask,
      {
        title: string;
        description?: string;
        status: string;
        priority: string;
        assignee_id: string;
      }
    >({
      query: (body) => ({
        url: "/api/v1/task/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Task"],
    }),
    updateTask: builder.mutation<
      void,
      {
        id: string;
        status?: string;
        title?: string;
        description?: string;
        priority?: string;
        assignee_id?: string;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/api/v1/task/update?id=${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Task"],
    }),
    deleteTask: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/task/delete?id=${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Task"],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = tasksApi;
