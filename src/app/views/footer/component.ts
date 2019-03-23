import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from 'rxjs';
import { CommandRecordService } from 'services/command.record';

@Component({
  selector: "app-footer",
  templateUrl: "component.html",
  styleUrls: ["component.scss"]
})
export class FooterComponent implements OnInit, OnDestroy {
  public constructor(
    private commandRecordService: CommandRecordService
  ) {}

  public ngOnInit() {
    this.subscription = this.commandRecordService.observeCommands().subscribe(commands => this.commands = commands.reverse());
  }
  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  commands: string[] = [];

  private subscription: Subscription;
}
