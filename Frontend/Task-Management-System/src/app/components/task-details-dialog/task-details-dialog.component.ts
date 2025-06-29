import { Component, inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
// import { TaskService } from '../../services/task.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { TaskService } from '../../services/tasks/task.service';

@Component({
  selector: 'app-task-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './task-details-dialog.component.html',
  styleUrl: './task-details-dialog.component.css'
})
export class TaskDetailsDialogComponent implements OnInit {
  dialogRef = inject(MatDialogRef<TaskDetailsDialogComponent>);
  data = inject(MAT_DIALOG_DATA) as any;
  taskService = inject(TaskService);
  dialog = inject(MatDialog);

  editable = false;
  task = { ...this.data.task };

  existingTaskNames: string[] = [];
  originalTask: any;
  duplicateNameError = false;

  minDate: Date = new Date();
  maxDate: Date | null = null;

  ngOnInit() {
    const projectId = this.task.project?._id || this.task.project;
    this.originalTask = JSON.parse(JSON.stringify(this.task));

    // ✅ Safely initialize maxDate
    const rawDueDate = this.task.project?.dueDate || this.data.projectDueDate;
    this.maxDate = rawDueDate ? new Date(rawDueDate) : null;

    this.taskService.getTasksByProject(projectId).subscribe(tasks => {
      this.existingTaskNames = tasks
        .filter(t => t._id !== this.task._id)
        .map(t => t.taskName.trim().toLowerCase());
    });
  }

  validateTaskName() {
    const enteredName = this.task.taskName.trim().toLowerCase();
    this.duplicateNameError = this.existingTaskNames.includes(enteredName);
  }

  hasChanges(): boolean {
    return JSON.stringify(this.task) !== JSON.stringify(this.originalTask);
  }

  enableEdit() {
    console.log(this.maxDate, "kkkk")
    this.editable = true;
  }

  updateTask() {
    if (!this.hasChanges()) {
      alert('Changes are not made.');
      return;
    }

    const newTaskName = this.task.taskName.trim().toLowerCase();
    if (this.existingTaskNames.includes(newTaskName)) {
      this.duplicateNameError = true;
      return;
    }

    this.taskService.updateTask(this.task._id, this.task).subscribe({
      next: res => {
        this.dialogRef.close({ updated: true, task: res });
      },
      error: err => {
        console.error('Update failed:', err);
      }
    });
  }

  deleteTask() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: {
        message: 'Are you sure you want to delete this task?'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.taskService.deleteTask(this.task._id).subscribe({
          next: () => this.dialogRef.close({ deleted: true }),
          error: err => console.error('Delete failed:', err)
        });
      }
    });
  }

  close() {
    this.dialogRef.close();
  }

  dateFilter = (d: Date | null): boolean => {
    const date = d || new Date();
    return date >= this.minDate && (!this.maxDate || date <= this.maxDate);
  };
}