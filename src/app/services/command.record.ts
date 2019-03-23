import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({providedIn: 'root'})
export class CommandRecordService {

  public addCommand(command: string) {
    const commands = this.commandSubject.getValue();
    commands.push(command); // Hopefully BehaviorSubject accepts the same object (non-copied).

    // Cap to 100 commands to prevent potential memory run-away.
    if(commands.length > 100) {
      commands.splice(0, commands.length - 100);
    }

    this.commandSubject.next(commands);
  }

  public getCommands() {
    return this.commandSubject.getValue();
  }
  public observeCommands() {
    return this.commandSubject.asObservable();
  }

  private commandSubject = new BehaviorSubject([] as string[]);
}
