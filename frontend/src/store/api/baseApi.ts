import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = Cookies.get("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    "Task",
    "Calendar",
    "User",
    "Goal",
    "Promise",
    "Note",
    "Finances",
    "Battery",
  ],
  endpoints: () => ({}),
});
