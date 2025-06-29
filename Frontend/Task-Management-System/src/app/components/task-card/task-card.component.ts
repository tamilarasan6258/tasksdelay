import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { EventEmitter, Output } from '@angular/core';

// 
@Component({
  selector: 'app-task-card',
  imports: [CommonModule, MatCardModule],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.css'
})
export class TaskCardComponent {
  @Input() task: any;

  @Output() taskClick = new EventEmitter<any>();

  handleClick() {
    this.taskClick.emit(this.task);
  }

  get isOverdue(): boolean {
  if (!this.task?.dueDate) return false;

  const due = new Date(this.task.dueDate).setHours(23, 59, 59, 999);
  const now = new Date().getTime();
  return now > due && (this.task.status === 'to-do' || this.task.status === 'in-progress');
}

}