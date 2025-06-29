import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

type GetTaskByProjectResponse = {
  _id: string;
  taskName: string;
  taskDesc: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  status: 'to-do' | 'in-progress' | 'done' | 'backlog';
  project: null | {
    _id: string;
    projectName: string;
  };
  createdAt: string;
  __v: number;
};

type AddTaskResponse = {
  msg: string;
  task: {
    taskName: string;
    taskDesc: string;
    priority: 'low' | 'medium' | 'high';
    dueDate: string;
    status: 'to-do' | 'in-progress' | 'done' | 'backlog';
    project: string;
    _id: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
};

type UpdateTaskResponse = {
  msg: string;
  task: {
    _id: string;
    taskName: string;
    taskDesc: string;
    priority: 'low' | 'medium' | 'high';
    dueDate: string;
    status: 'to-do' | 'in-progress' | 'done' | 'backlog';
    project: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
};

type DeleteTaskResponse = {
  msg: string;
}

type GetProjectByIdResponse = {
  _id: string;
  projectName: string;
  projectDesc: string;
  dueDate: string;
  user: {
    _id: string;
    uname: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}


@Injectable({ providedIn: 'root' })
export class TaskService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5000/api/api/tasks';
  private projectUrl = 'http://localhost:5000/api/projects';



  // ✅ Get all tasks for a specific project
  getTasksByProject(projectId: string): Observable<GetTaskByProjectResponse[]> {
    return this.http.get<GetTaskByProjectResponse[]>(`${this.baseUrl}?projectId=${projectId}`);
  }



  // ✅ Update a task
  updateTask(
    id: string,
    data: {
      taskName?: string;
      priority?: 'low' | 'medium' | 'high';
      status?: 'to-do' | 'in-progress' | 'done' | 'backlog';
    }): Observable<UpdateTaskResponse> {
    return this.http.put<UpdateTaskResponse>(`${this.baseUrl}/${id}`, data);
  }

  // ✅ Delete a task
  deleteTask(id: string): Observable<DeleteTaskResponse> {
    return this.http.delete<DeleteTaskResponse>(`${this.baseUrl}/${id}`);
  }
  createTask(taskData: {
    taskName: string;
    taskDesc: string;
    priority: 'low' | 'medium' | 'high';
    dueDate: string;
    status: 'to-do' | 'in-progress' | 'done' | 'backlog';
    project: string;
  }): Observable<AddTaskResponse> {
    return this.http.post<AddTaskResponse>(this.baseUrl, taskData);
  }

  getProjectById(projectId: string): Observable<GetProjectByIdResponse> {
    return this.http.get<GetProjectByIdResponse>(`${this.projectUrl}/${projectId}`);
  }
}
