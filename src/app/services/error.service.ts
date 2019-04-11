import { Component, Injectable, Input } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

// define the template of modal showing error here
@Component({
  selector: 'app-error-content',
  template: `
    <div class="modal-header">
      <h4 class="modal-title">{{heading}}</h4>
    </div>
    <div class="modal-body">
      <p>{{errMsg}}</p>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-outline-dark" (click)="activeModal.close('Close click')">Close</button>
    </div>
  `
})
export class ErrorContentComponent {
  @Input() errMsg;
  @Input() heading;

  constructor(public activeModal: NgbActiveModal) {}
}

const defaultHeading = "Error!";

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  constructor(private modalService: NgbModal) { }

  // Popup a modal to display a error message.
  displayError(error: any, heading?: string) {
    const modalRef = this.modalService.open(ErrorContentComponent);
    modalRef.componentInstance.errMsg = error;
    modalRef.componentInstance.heading = heading ? heading : defaultHeading;
  }

}
