import {
  Component,
  inject,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  DragDropModule
} from '@angular/cdk/drag-drop';

import { TaskCardComponent } from '../task-card/task-card.component';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { AddTaskDialogComponent } from '../add-task-dialog/add-task-dialog.component';
import { TaskDetailsDialogComponent } from '../task-details-dialog/task-details-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { TaskService } from '../../services/tasks/task.service';
import { AuthService } from '../../services/auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    TaskCardComponent,
    MatCardModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule
  ],
  templateUrl: './kanban-board.component.html',
  styleUrl: './kanban-board.component.css'
})
export class KanbanBoardComponent implements OnInit {
  private taskService = inject(TaskService);
  private dialog = inject(MatDialog);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private router = inject(Router);
   private snackBar = inject(MatSnackBar);

  projectId!: string;
  projectTitle: string = '';

  username: string = '';
  email: string = '';


  statuses = ['backlog', 'to-do', 'in-progress', 'done'];
  dropListIds = this.statuses;

  tasks: { [key: string]: any[] } = {
    'backlog': [],
    'to-do': [],
    'in-progress': [],
    'done': []
  };

  allTasks: any[] = [];

  selectedPriority: string = '';
  selectedDueDate: Date | null = null;

  startDate: Date | null = null;
  endDate: Date | null = null;


  isProfileMenuOpen = false;
   filtersExpanded = true; 

  searchTerm: string = '';


  // Add below your existing properties
  pageSize = 4; // Number of tasks per page
  currentPage: { [key: string]: number } = {
    'backlog': 0,
    'to-do': 0,
    'in-progress': 0,
    'done': 0
  };

  paginatedTasks: { [key: string]: any[] } = {
    'backlog': [],
    'to-do': [],
    'in-progress': [],
    'done': []
  };



  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.projectId = params.get('id')!;
      console.log(this.selectedDueDate, "dsd");
      this.loadProject();
      this.loadTasks();


      // ✅ Load user info (adjust based on how you store user data)
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      this.username = user.uname || 'Guest';
      this.email = user.email || 'Not Available';
    });
  }

  toggleProfileMenu(event: MouseEvent) {
    event.stopPropagation();
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  onClickOutside(event: MouseEvent) {
    if (!(event.target as HTMLElement).closest('.profile-container')) {
      this.isProfileMenuOpen = false;
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']); // Back to login
  }

  
  toggleFilters(): void {
    this.filtersExpanded = !this.filtersExpanded;
  }

  private showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const config = {
      duration: 3000,
      horizontalPosition: 'right' as const,
      verticalPosition: 'top' as const,
      panelClass: [`toast-${type}`]
    };

    this.snackBar.open(message, 'Close', config);
  }

  loadProject() {
    this.taskService.getProjectById(this.projectId).subscribe(project => {
      this.projectTitle = project.projectName;
      this.selectedDueDate = new Date(project.dueDate); // store due date
      console.log("Project Due Date:", this.selectedDueDate); // ✅ Check in console
    });
  }

  loadTasks() {
    this.taskService.getTasksByProject(this.projectId).subscribe(res => {
      console.log('Loaded tasks:', res);
      this.allTasks = res;
      this.applyFilters(); // apply filters on latest fetch
    });
  }



  // New method to paginate tasks
  paginateTasks() {
    this.statuses.forEach(status => {
      const start = this.currentPage[status] * this.pageSize;
      const end = start + this.pageSize;
      this.paginatedTasks[status] = this.tasks[status].slice(start, end);
    });
  }

  // Update your applyFilters method to call paginateTasks
  applyFilters() {
    if (this.startDate && this.endDate && this.startDate > this.endDate) {
      alert('Start date must be before End date');
      return;
    }

    const start = this.startDate ? new Date(this.startDate).setHours(0, 0, 0, 0) : null;
    const end = this.endDate ? new Date(this.endDate).setHours(23, 59, 59, 999) : null;

    const filtered = this.allTasks.filter(task => {
      const due = new Date(task.dueDate).getTime();
      const matchesPriority = !this.selectedPriority || task.priority === this.selectedPriority;
      const matchesStart = !start || due >= start;
      const matchesEnd = !end || due <= end;
      const matchesSearch = !this.searchTerm || task.taskName.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesPriority && matchesStart && matchesEnd && matchesSearch;
    });

    this.statuses.forEach(status => {
      this.tasks[status] = filtered.filter(task => task.status === status);
      this.currentPage[status] = 0; // Reset to first page on filter
    });

    this.paginateTasks(); // Apply pagination after filtering
  }


  getTotalPages(taskCount: number): number {
    const totalPages = Math.ceil(taskCount / this.pageSize);
    return totalPages > 0 ? totalPages : 1; // Always show at least 1 page
  }

  // Navigation methods
  prevPage(status: string) {
    if (this.currentPage[status] > 0) {
      this.currentPage[status]--;
      this.paginateTasks();
    }
  }

  nextPage(status: string) {
    const totalPages = Math.ceil(this.tasks[status].length / this.pageSize);
    if (this.currentPage[status] < totalPages - 1) {
      this.currentPage[status]++;
      this.paginateTasks();
    }
  }



  clearFilters() {
    this.selectedPriority = '';
    // this.selectedDueDate = null;
    this.startDate = null;
    this.endDate = null;
    this.searchTerm = '';
    this.applyFilters();
  }


  onDrop(event: CdkDragDrop<any[]>, newStatus: string) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const task = event.previousContainer.data[event.previousIndex];
      const oldStatus = task.status;

      task.status = newStatus;

      this.taskService.updateTask(task._id, task).subscribe({
        next: updatedTask => {
          transferArrayItem(
            event.previousContainer.data,
            event.container.data,
            event.previousIndex,
            event.currentIndex
          );
          this.loadTasks();
        },
        error: err => {
          console.error('Task status update failed:', err);
          task.status = oldStatus;
        }
      });
    }
  }



  openAddTaskDialog(status: string) {
    const existingTaskNames = this.allTasks.map(task => task.taskName.toLowerCase());
    console.log(this.selectedDueDate, "dsd");
    const dialogRef = this.dialog.open(AddTaskDialogComponent, {
      data: {
        status,
        projectId: this.projectId,
        projectDueDate: this.selectedDueDate,
        existingTaskNames
      }



    });


    dialogRef.afterClosed().subscribe(taskData => {
      if (taskData) {
        const formattedData = {
          ...taskData,
          project: taskData.projectId
        };
        delete formattedData.projectId;

        this.taskService.createTask(formattedData).subscribe({
          next: () => {
            this.loadTasks();
            this.showToast('Task created successfully!', 'success');
          },
          error: err => {
            console.error('Failed to create task', err);
            this.showToast('Failed to create task. Please try again.', 'error');
          }
        });
      }
    });
  }

  openTaskDetails(task: any) {
    const dialogRef = this.dialog.open(TaskDetailsDialogComponent, {
      data: {
        task,
        projectDueDate: this.selectedDueDate
      }
    });
dialogRef.afterClosed().subscribe(result => {
      if (result?.updated) {
        this.loadTasks();
        this.showToast('Task updated successfully!', 'success');
      } else if (result?.deleted) {
        this.loadTasks();
        this.showToast('Task deleted successfully!', 'success');
      }
    });
  }
}


