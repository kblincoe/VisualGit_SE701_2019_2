import { Component, Injectable, Input } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

// define the template of modal showing error here
@Component({
  selector: 'app-error-content',
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Error!</h4>
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

  constructor(public activeModal: NgbActiveModal) {}
}


@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor(private modalService: NgbModal) { }

  // popup a modal to display error message.
  displayError(error: any)
  {
    const modalRef = this.modalService.open(ErrorContentComponent);
    modalRef.componentInstance.errMsg = error;
  }

}
