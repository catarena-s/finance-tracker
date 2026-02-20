import { apiClient } from "./client";
import type { TaskStatusResponse } from "@/types/api";

export const tasksApi = {
  async getStatus(taskId: string): Promise<TaskStatusResponse> {
    const res = await apiClient.get<TaskStatusResponse>(`/tasks/${taskId}/status`);
    return res.data;
  },
};
