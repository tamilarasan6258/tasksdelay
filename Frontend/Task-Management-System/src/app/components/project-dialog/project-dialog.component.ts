import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-project-dialog',
  standalone: true,
  imports: [
    MatInputModule, MatDatepickerModule, MatNativeDateModule,
    ReactiveFormsModule, MatFormFieldModule, MatButtonModule, CommonModule
  ],
  templateUrl: './project-dialog.component.html',
  styleUrl: './project-dialog.component.css'
})
export class ProjectDialogComponent {
  projectForm: FormGroup;
  isChanged: boolean = false;
  nameExists: boolean = false;
  minDate: Date = new Date();

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ProjectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.projectForm = this.fb.group({
      projectName: [data?.project?.projectName || '', Validators.required],
      projectDesc: [data?.project?.projectDesc || '', Validators.required],
      dueDate: [data?.project?.dueDate ? new Date(data.project.dueDate) : '', Validators.required], // ✅ Ensures Date format
    });

    this.projectForm.valueChanges.subscribe(() => {
      this.detectChanges();
    });

    this.projectForm.get('projectName')?.valueChanges.subscribe((name) => {
      if (name) {
        this.checkDuplicateName(name);
      }
    });
  }

  detectChanges(): void {
    this.isChanged = JSON.stringify(this.projectForm.value) !== JSON.stringify({
      projectName: this.data?.project?.projectName || '',
      projectDesc: this.data?.project?.projectDesc || '',
      dueDate: this.data?.project?.dueDate ? new Date(this.data.project.dueDate) : '' // ✅ Ensures comparison with Date
    });
  }

  checkDuplicateName(name: string): void {
    const projectNameControl = this.projectForm.get('projectName');
    this.nameExists = this.data?.allProjects?.some(
      (proj: any) => proj._id !== this.data?.project?._id && proj.projectName.toLowerCase() === name.toLowerCase()
    );

    if (this.nameExists) {
      projectNameControl?.setErrors({ duplicate: true });
      projectNameControl?.markAsTouched(); // ✅ UI updates instantly
    } else {
      projectNameControl?.setErrors(null);
    }
  }

  onSubmit(): void {
    if (this.projectForm.valid && !this.nameExists) {
      this.dialogRef.close(this.projectForm.value);
    }
  }

  onCancel(): void {
    console.log("Cancel clicked, resetting form and closing with null");
    this.projectForm.reset(this.data?.project);
    this.dialogRef.close(null);
  }
}