import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, Platform, PopoverController } from '@ionic/angular';
import { LABELS } from 'src/app/COMMON/LABELS';
import { SettingsPopoverComponent } from 'src/app/COMPONENTS/settingspopover/settings-popover/settings-popover.component';
import { IStatus } from 'src/app/MODELS/INTERFACES/IStatus';
import { AdvertisementService } from 'src/app/SERVICE/Advertisement/advertisement.service';
import { AlertService } from 'src/app/SERVICE/Alert/alert.service';
import { TimerService } from 'src/app/SERVICE/Timer/timer.service';
import { TimeList } from 'src/app/MODELS/CLASSES/TimeList';
import { AlarmService } from 'src/app/SERVICE/Alarm/alarm.service';
import { StorageService } from 'src/app/SERVICE/Storage/storage.service';
import { Alarm } from 'src/app/MODELS/CLASSES/Alarm';
import { IReturnMsg } from 'src/app/MODELS/INTERFACES/IReturnMsg';
import { NotificationService } from 'src/app/SERVICE/Notification/notification.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {


  private _status: IStatus;
  // private _alarms: Alarm[] = [];
  private _clickCounter: number = 0;

  private _startStopTxt: string = LABELS.START;
  private time: string;
  private stopped: Date[] = [];
  private started: Date[] = [];
  // private timeList: TimeList = new TimeList();


  // private offset;  // time offset between current time and alarm time

  // private clickCounter: number = 0; // count the number of click on Start/Stop timer button

  /**
   * CONSTRUCTOR
   */
  constructor(
    private route: ActivatedRoute,
    public platform: Platform,
    private timerService: TimerService,
    public storageService: StorageService,
    private popoverController: PopoverController,
    public alertController: AlertController,
    public alertService: AlertService,
    public advertisementService: AdvertisementService,
    private alarmService: AlarmService,
    private notificationService: NotificationService
  ) { 

    this._status = this.route.snapshot.data.status;
    console.log('Status: ', this._status);

    // this._alarms = this.alarmService.Alarms;
    // console.log('Alarms: ', this._alarms);
  
    // Retrieving timeList from storage status
    if (this._status?.timeList) {
      this.timerService.timeList = this._status.timeList;
    }
    console.log('timeList: ', this.timerService.timeList);

    // subscribe to on pause event
    this.onPause();

    // this.advertisementService.initialize();
    // this.advertisementService.banner();

    this.UpdateGUI();
  }


  UpdateGUI() {
    this._startStopTxt = this.timerService.Running ? LABELS.STOP : LABELS.START;
  }




  /**
   * Start/Stop timer function
   */
  async OnFabTimerClick() {
    
    // console.log("Alarms: ", this._alarms);
    
    // check for alarm
    this.alarmService.checkAlarm(this._clickCounter)
    .then( res => {

      console.log(res);
      this.StartStopTimer();

    }, err => {
      this.alertService.presentConfirmAlert(err.msg)
      .then( res => {
        if (res) {
          console.log('Confirmed');
          this.StartStopTimer();
        } else {
          console.log('Canceled')
        }
      })

    })


    /*
    

    else if (this.timerService.clickCounter == this.storageService.getAlarmCount()) {
      this.StartStopTimer();
    }
    
    else {
      // this.StartStopTimer();
      let subheader = "You are done for today!";
      let msg = "Do you want to reset timer?"
      await this.alert.presentConfirmAlert(msg, subheader)
      .then( res => {
        if (res) {
          console.log('Confirmed');
          this.Reset();
        } else {
          console.log('Canceled')
        }
      })
    }


    */
  }




  /**
   * Sart or Stop timer,
   * and increment click counter
   */
  StartStopTimer() {
    if (this.timerService.Running) 
    {
      this.timerService.stop();
    } 
    else 
    {
      this.timerService.start();
    }
    this._clickCounter++;
    this.UpdateGUI();
  }



  /**
   * Reset timer and click counter
   */
  Reset() {
    console.log("Resetting...");
    this.timerService.reset();
    this._clickCounter = 0;
  }



  /**
   * Save the current status to local storage on platform.pause event
   */
  onPause() {
    console.log("Subscribing on pause event...");
    this.platform.pause.subscribe(async () => {
      this.SaveStatus();
    })
  }


  /**
   * Save current timer status on storage
   */
  SaveStatus() {
    console.log("Saving status...");
    // this.timerService.timeList.total = this.timerService.time;
    var status: IStatus = {
      isRunning : this.timerService.Running, 
      timeList: this.timerService.timeList,
      clickCounter: this._clickCounter
    };   
    this.storageService.SaveStatus(status)
    .then(res => {
      // add notification
      if (res.succeded) {
        // ToDo
        // da controllare sia il caso is running
        // sia nel caso non sia in running se cmq è avviato e ci sono altri alarm schedulati
        if (this.timerService.Running) {
          console.log("Adding local notification...");
          let msg: string = "Your working hour is still tracked";
          // ToDo
          // mange the next alarm notification
          // When exit from the application, if running, the next alarm notification is schduled
          // this.alarmService.
          this.notificationService.addLocalNotification(msg);
        } else {
          if (this._clickCounter > 0) {
            
          }
          let p = this.notificationService.getPending();
          console.log(p);
        }
      }
    }, err => {
      
    })
  }




  /**
   * Open Setings pop-up
   */
  async showSettings() {
    const popover = await this.popoverController.create({
      component: SettingsPopoverComponent,
      translucent: true,
    });
    await popover.present();
    const { role } = await popover.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }


  

}
