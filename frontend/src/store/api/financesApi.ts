import { baseApi } from "./baseApi";

export type FinanceRecord = {
  id: string;
  type: "income" | "expense";
  amount: number;
  topic: string;
  target_audience: "Him" | "Her" | "General";
  date?: string;
  month?: number;
  year?: number;
};

export const financesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFinanceHistory: builder.query<FinanceRecord[], { audience: string }>({
      query: ({ audience }) => `/api/v1/finances/history?audience=${audience}`,
      providesTags: ["Finances"],
    }),
    getFinancePlanned: builder.query<
      FinanceRecord[],
      { audience: string; month: number; year: number }
    >({
      query: ({ audience, month, year }) =>
        `/api/v1/finances/read?audience=${audience}&month=${month}&year=${year}`,
      providesTags: ["Finances"],
    }),
    createFinanceRecord: builder.mutation<
      FinanceRecord,
      Partial<FinanceRecord>
    >({
      query: (body) => ({
        url: "/api/v1/finances/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Finances"],
    }),
    deleteFinanceRecord: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/finances/delete?id=${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Finances"],
    }),
  }),
});

export const {
  useGetFinanceHistoryQuery,
  useGetFinancePlannedQuery,
  useCreateFinanceRecordMutation,
  useDeleteFinanceRecordMutation,
} = financesApi;
