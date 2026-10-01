import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import {
  TaskProvider,
  CreateTaskProviderRequest,
  UpdateTaskProviderRequest,
} from "../model/TaskProvider";

@Injectable({
  providedIn: "root",
})
export class TaskProviderService {
  constructor(private http: HttpClient) {}

  /**
   * Get all active task providers (for course tasks & docents)
   */
  getAllActiveTaskProviders(): Observable<TaskProvider[]> {
    return this.http.get<TaskProvider[]>("/api/v2/providers/tasks");
  }

  /**
   * Get a task provider by its unique identifier
   * @param id The task provider ID
   */
  getTaskProviderById(id: string): Observable<TaskProvider> {
    return this.http.get<TaskProvider>(`/api/v2/providers/tasks/${id}`);
  }

  /**
   * Get all task providers (both active and inactive) for admin overview
   */
  getAllTaskProvidersAdmin(): Observable<TaskProvider[]> {
    return this.http.get<TaskProvider[]>("/api/v2/admin/providers/tasks");
  }

  /**
   * Register a new task provider
   * @param req The creation request payload
   */
  createTaskProvider(req: CreateTaskProviderRequest): Observable<TaskProvider> {
    return this.http.post<TaskProvider>("/api/v2/admin/providers/tasks", req);
  }

  /**
   * Update an existing task provider
   * @param id The task provider ID
   * @param req The update request payload
   */
  updateTaskProvider(
    id: string,
    req: UpdateTaskProviderRequest
  ): Observable<TaskProvider> {
    return this.http.put<TaskProvider>(
      `/api/v2/admin/providers/tasks/${id}`,
      req
    );
  }

  /**
   * Deactivate / delete a task provider
   * @param id The task provider ID
   */
  deleteTaskProvider(id: string): Observable<void> {
    return this.http.delete<void>(`/api/v2/admin/providers/tasks/${id}`);
  }
}
