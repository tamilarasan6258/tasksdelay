import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';



@Component({
  selector: 'app-add-task-dialog',
  imports: [CommonModule, FormsModule, MatButtonModule, MatInputModule, MatDialogModule, MatSelectModule, MatDatepickerModule,
    MatNativeDateModule],
  templateUrl: './add-task-dialog.component.html',
  styleUrl: './add-task-dialog.component.css'
})
export class AddTaskDialogComponent {
  dialogRef = inject(MatDialogRef<AddTaskDialogComponent>);
  data = inject(MAT_DIALOG_DATA) as {
    status: string,
    projectId: string,
    existingTaskNames: string[],
    projectDueDate: string // incoming due date string

  };


  minDate: Date = new Date();

  maxDate: Date;
  taskNameExists = false;
  
  task = {
    taskName: '',
    taskDesc: '',
    dueDate: '',
    status: this.data.status,
    projectId: this.data.projectId,
    priority: 'medium'
  };




  constructor() {

    this.maxDate = new Date(this.data.projectDueDate);

  }

  // Filters out invalid dates outside the range

  dateFilter = (date: Date | null): boolean => {

    if (!date) return false;

    return date >= this.minDate && date <= this.maxDate;

  };

  addTask() {
    const taskNameLower = this.task.taskName.trim().toLowerCase();

    if (this.data.existingTaskNames.includes(taskNameLower)) {
      this.taskNameExists = true;
      return;
    }

    this.taskNameExists = false;
    this.dialogRef.close(this.task);
  }


  cancel() {
    this.dialogRef.close();
  }


}