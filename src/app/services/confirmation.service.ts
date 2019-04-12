import { Component, Injectable } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

const confirm_value = 'ok';
const close_value = 'cancel';

@Component({
    selector: 'app-confirm-content',
    template: `
    <div class="modal-header">
        <h4 class="modal-title">Confirmation</h4>
    </div>
    <div class="modal-body">
  
    </div>
    <div class="modal-footer">
        <button type="button" class="btn btn-danger" (click)="modal.close(${confirm_value})">Confirm</button>
        <button type="button" class="btn btn-outline-secondary" (click)="modal.close(${close_value})">Cancel</button>
    </div>`
})
export class ConfirmContentComponent {
    constructor(public modal: NgbActiveModal) { }
}

@Injectable({
    providedIn: 'root'
})
export class ConfirmService {

    constructor(private modalService: NgbModal) {
    }

    // Popup a modal to display confirmation.
    public confirm(): Promise<boolean> {
        if (!this.modalService.hasOpenModals()) {

            const modalRef = this.modalService.open(ConfirmContentComponent);
            return modalRef.result.then((result) => new Promise<boolean>((resolve, reject) => {
                if (result === confirm_value) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }));
        }
    }
}
