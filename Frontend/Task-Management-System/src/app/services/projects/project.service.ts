import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

type CreateProjectResponse = {
  msg: string;
  project: {
    projectName: string;
    projectDesc: string;
    dueDate: string;
    user: string;
    _id: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
};

type GetProjectByUserResponse = {
  _id: string;
  projectName: string;
  projectDesc: string;
  dueDate: string;
  user: string;
  createdAt: string;
  updatedAt?: string;
  __v: number;
};

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
  __v: number;
};

type UpdateProjectResponse = {
  msg: string;
  project: {
    _id: string;
    projectName: string;
    projectDesc: string;
    dueDate: string;
    user: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
};

type DeleteProjectResponse = {
  msg: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private baseUrl = 'http://localhost:5000/api/projects';

  constructor(private http: HttpClient) { }

  // 🔹 Create a new project
  createProject(data: {
    projectName: string;
    projectDesc: string;
    dueDate: Date;
    userId: string;
  }): Observable<CreateProjectResponse> {
    return this.http.post<CreateProjectResponse>(`${this.baseUrl}`, data);
  }

  // 🔹 Get all projects by user
  getProjectsByUser(userId: string): Observable<GetProjectByUserResponse[]> {
    console.log(`Fetching projects for user ID: ${userId}`);
    return this.http.get<GetProjectByUserResponse[]>(`${this.baseUrl}/user/${userId}`);
  }

  // 🔹 Get single project by ID (used for view/edit)
  getProjectById(projectId: string): Observable<GetProjectByIdResponse> {
    return this.http.get<GetProjectByIdResponse>(`${this.baseUrl}/${projectId}`);
  }

  // 🔹 Update a project
  updateProject(projectId: string, data: {
    projectName: string;
    projectDesc: string;
    dueDate: Date;
  }): Observable<any> {
    return this.http.put(`${this.baseUrl}/${projectId}`, data);
  }

  // 🔹 Delete a project
  deleteProject(projectId: string): Observable<DeleteProjectResponse> {
    return this.http.delete<DeleteProjectResponse>(`${this.baseUrl}/${projectId}`);
  }
}
