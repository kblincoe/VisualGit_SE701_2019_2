import { Component, Injectable, Input } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
// define the template of modal showing error here
@Component({
    selector: 'app-twofactor-content',
    template: `
    <div class="modal-header">
    <h4 class="modal-title">Two Factor Authentication</h4>
  </div>
  <div class="modal-body">
  <form [formGroup]="myForm" (ngSubmit)="submitForm()">
    <label for="title">Input confirmation code:</label>
    <div class="input-group">
    <input type='text' class="form-control"  formControlName="code"/>
    <div class="input-group-append">
    </div>
    </div>
    </form>
</div>
  <div class="modal-footer">
  <button class="btn btn-success" (click)="submitForm()">
  Submit Form
</button>
  </div>
  `
})
export class TwoFactorContentComponent {
    myForm: FormGroup;
    constructor(public activeModal: NgbActiveModal, private formBuilder: FormBuilder) { this.createForm(); }
    private createForm() {
        this.myForm = this.formBuilder.group({
            code: ''
        });

    }
    private submitForm() {
        this.activeModal.close(this.myForm.value);
    }
}

@Injectable({
    providedIn: 'root'
})
export class TwoFactorConfirmService {

    constructor(private modalService: NgbModal) {
    }

    output: string;
    // popup a modal to display error message.
    displayModal() {
        if (!this.modalService.hasOpenModals()) {
            const modalRef = this.modalService.open(TwoFactorContentComponent);
            return modalRef.result;
        }
    }
}
