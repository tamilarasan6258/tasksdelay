import { Component, HostListener, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { ProjectService } from '../../services/projects/project.service';
import { TaskService } from '../../services/tasks/task.service';
import { AuthService } from '../../services/auth/auth.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ProjectDialogComponent } from '../project-dialog/project-dialog.component';
import { forkJoin, tap } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

interface Task {
  _id: string;
  status: string;
  name?: string; 
}


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatProgressBarModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})

export class DashboardComponent implements OnInit {
  projects: any[] = [];
  searchTerm: string = '';
  userId: string = '';
  username: string = '';
  email: string = '';
  isProfileMenuOpen: boolean = false;
  isExpanded: { [key: string]: boolean } = {};
  currentPage: number = 1;
  projectsPerPage: number = 6; // adjust as needed

  isMobileMenuOpen = false;

  constructor(
    private projectService: ProjectService,
    private taskService: TaskService,
    private router: Router,
    private dialog: MatDialog,
    private authService: AuthService,
    private cdRef: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) { }



  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }


  get paginatedProjects(): any[] {
    const filtered = this.getFilteredProjects();
    const start = (this.currentPage - 1) * this.projectsPerPage;
    return filtered.slice(start, start + this.projectsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.getFilteredProjects().length / this.projectsPerPage);
  }


  changePage(direction: 'prev' | 'next'): void {
    if (direction === 'prev' && this.currentPage > 1) {
      this.currentPage--;
    } else if (direction === 'next' && this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }


  ngOnInit(): void {
    const user = this.authService.getCurrentUser();

    if (user?.id) {
      this.userId = user.id;
      this.username = user.name || 'User';
      this.email = user.email || '';
      this.fetchProjects();
    } else {
      console.warn('No logged-in user.');
      this.router.navigate(['/']); // Redirect to login
    }
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ProjectDialogComponent, {
      width: '400px',
      data: { allProjects: this.projects } //  Pass all projects for duplicate validation
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const newProject = { ...result, userId: this.userId };
        this.projectService.createProject(newProject).subscribe({
          next: () => {
            this.fetchProjects();
            this.showToast('Project created successfully!', 'success');
          },
          error: (err) => {
            console.error('Error creating project:', err);
            this.showToast('Failed to create project. Please try again.', 'error');
          }
        });
      }
    });
  }

  fetchProjects(): void {
    this.projectService.getProjectsByUser(this.userId).subscribe({
      next: (projects) => {
        this.projects = projects.map(project => ({
          ...project,
          tasks: [] // Initialize tasks array
        }));

        // Fetch tasks for each project dynamically
        const taskRequests = this.projects.map(project =>
          this.taskService.getTasksByProject(project._id).pipe(
            tap((tasks: any[]) => project.tasks = tasks) //  Explicitly define type
          )
        );

        // Wait for all task requests to complete before updating UI
        forkJoin(taskRequests).subscribe({
          next: () => {
            console.log('All tasks successfully fetched');
          },
          error: (err: any) => console.error('Error fetching tasks:', err) //  Explicitly define type
        });
      },
      error: (err: any) => console.error('Error fetching projects:', err) //  Explicitly define type
    });
  }


  calculateProgress(project: any): number {
    if (!project.tasks || project.tasks.length === 0) return 0;

    const completedTasks = project.tasks.filter((task: { status: string }) => task.status === 'done').length;
    const totalTasks = project.tasks.length;


    return totalTasks ? (completedTasks / totalTasks) * 100 : 0;
  }

  updateProgress(): void {
    this.projects.forEach(project => {
      project.progress = this.calculateProgress(project);
    });
    this.cdRef.detectChanges();
  }
  editProject(project: any): void {
    const dialogRef = this.dialog.open(ProjectDialogComponent, {
      width: '400px',
      data: { project: { ...project }, allProjects: this.projects } // Ensures form gets a copy of the data
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log("Dialog closed with result:", result); //  Debugging line

      if (!result || result === null) {
        console.log("Dialog canceled, no update performed."); //  Debugging confirmation
        return; //  Prevents updates when canceled
      }

      const isUnchanged = JSON.stringify(project) === JSON.stringify(result);
      if (isUnchanged) {
        console.log("No changes detected, skipping update."); // Debugging confirmation
        return;
      }

      this.projectService.updateProject(project._id, result).subscribe({
        next: () => {
          this.fetchProjects();
          this.showToast('Project updated successfully!', 'success');
        },
        error: (err) => {
          console.error('Error updating project:', err);
          this.showToast('Failed to update project. Please try again.', 'error');
        }
      });
    });
  }



  confirmDelete(project: any): void {
    const hasInProgressTasks = project.tasks.some((task: Task) => task.status === 'in-progress');
    // Show warning only if there are tasks in progress
    const message = hasInProgressTasks
      ? "⚠ Some tasks are in progress! Are you sure you want to delete the project?"
      : "Are you sure you want to delete this project?";

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: { message }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.projectService.deleteProject(project._id).subscribe({
          next: () => {
            this.fetchProjects();
            this.showToast('Project deleted successfully!', 'success');
          },
          error: (err) => {
            console.error('Error deleting project:', err);
            this.showToast('Failed to delete project. Please try again.', 'error');
          }
        });
      }
    });
  }
  getDueDateClass(dueDateStr: string): string {
    const today = new Date();
    const dueDate = new Date(dueDateStr);
    const diffInDays = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays < 0) return 'due-overdue';
    else if (diffInDays <= 3) return 'due-soon';
    else return 'due-later';
  }

  onView(projectId: string): void {
    console.log("this is view ");

    this.router.navigate(['/projects', projectId]);
  }

  toggleProfileMenu(event: Event): void {
    event.stopPropagation();
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  toggleReadMore(projectId: string): void {
    this.isExpanded[projectId] = !this.isExpanded[projectId];
  }

  @HostListener('document:click', ['$event'])
  closeProfileMenu(event: Event): void {
    if (!(event.target as HTMLElement)?.closest('.profile-container')) {
      this.isProfileMenuOpen = false;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']); // Back to login
  }

  getFilteredProjects(): any[] {
    if (!this.searchTerm) return this.projects;
    return this.projects.filter((project) =>
      project.projectName.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  private showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const config = {
      duration: 3000,
      horizontalPosition: 'right' as const,
      verticalPosition: 'top' as const,
      panelClass: ['toast-'+type]
    };

    this.snackBar.open(message, 'Close', config);
  }
}