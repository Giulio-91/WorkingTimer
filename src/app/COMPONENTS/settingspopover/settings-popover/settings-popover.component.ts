import { Component, OnInit } from '@angular/core';
import { AlertController, PickerController, PopoverController } from '@ionic/angular';
import { Alarm } from 'src/app/MODELS/Alarm';
import { StorageService } from 'src/app/SERVICE/Storage/storage.service';
import { PickerOptions } from "@ionic/core";
import { Settings } from 'src/app/MODELS/Settings';
import { AlertService } from 'src/app/SERVICE/Alert/alert.service';

@Component({
  selector: 'app-settings-popover',
  templateUrl: './settings-popover.component.html',
  styleUrls: ['./settings-popover.component.scss'],
})
export class SettingsPopoverComponent implements OnInit {

  private customPickerOptions; 
  private settings: Settings;


  hours: string[] = 
    [
      "00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", 
      "12", "13", "14", "16", "17", "18", "19", "20", "21", "22", "23"
    ];

  minutes: string[] = 
    [
      "00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", 
      "12", "13", "14", "16", "17", "18", "19", "20", "21", "22", "23", "24",
      "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36",
      "37", "38", "39", "40"
    ];


  constructor(
    private popoverController: PopoverController,
    private storageService: StorageService,
    private pickerController: PickerController,
    public alertController: AlertController,
    public alert: AlertService
  ) {}

  ngOnInit() {
    console.log("Loading settings...")
    this.loadSettings();
    console.log(this.settings)
  }

  /**
   * Save new settings on the local storage
   */
  Save() {
    console.log("Saving settings...")
    this.storageService.SaveSettings(this.settings);
    this.DismissClick();
  }
  
  /**
   * Calcel the current temporary user settings and reload stored settings
   */
  async Cancel() {
    console.log("Cancel")
    this.settings = await this.storageService.getStoredSettings();
    this.DismissClick();
  }


  /**
   * Add a pause to the time array
   */
  AddPause(alarm: Alarm = null) {
    console.log("Selected alarm: ", alarm);
    this.showAlarmPicker(alarm);
  }

  /**
   * Delete pause
   * @param alarm 
   */
  DeletePause(alarm) {
    console.log(alarm);
    this.settings.deleteAlarm(alarm);
  }

  /**
   * Load User Settings
   */
  async loadSettings() {
    this.settings = this.storageService.getSettings();
  }

  /**
   * Update time values
   * @param val : string (HH:mm)
   * @param idx : index of the Alarms array to update
   */
   onTimeChange(val, idx) {
    // let copy = Object.assign({}, original );
    // this.tmpSettings.alarms = Object.assign([], this.settings.alarms); //{...this.settings};
    let time = val.detail.value;
    this.settings.updateAlaram(time, idx);
    console.log(this.settings.alarms);
  }


  /**
   * Dismiss settings pop-over
   */
  async DismissClick() {
    await this.popoverController.dismiss();
  }





  async showAlarmPicker(alarm: Alarm = null) {
    let options: PickerOptions = {
      buttons: [
        {
          text: "Cancel",
          role: 'cancel'
        },
        {
          text:'Ok',
          handler:(value:any) => {
            // console.log(value);
            var str: string = value.hours.value + ':' + value.minutes.value;
            let res = this.settings.addAlarm(str);

            if (res.succeded == false) {

            }
            this.alert.presentWarningAlert(res.msg);
            
          }
        }
      ],
      columns:[{
        name:'hours',
        prefix:'H',
        options:this.getHoursOptions(alarm)
      }, {
        name:'minutes',
        prefix:'m',
        options:this.getMinutesOptions()
      }, {
        name:'duration',
        prefix:'duration',
        options: this.getMinutesOptions()
      }],
      // ToDo - non funziona
      // cssClass : 'pickerClassName'
    };
    let picker = await this.pickerController.create(options);
    picker.present()
  }


  getHoursOptions(alarm: Alarm = null){
    console.log('Getting hours...');
    let options = [];
    this.hours.forEach(x => {
      let obj = {text:x,value:x};
      if (alarm != null) {
        let h = alarm.getHour();
      }
      options.push(obj);
    });
    return options;
  }

  getMinutesOptions(){
    let options = [];
    this.minutes.forEach(x => {
      options.push({text:x,value:x});
    });
    return options;
  }

}
