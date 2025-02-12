import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Status } from 'src/app/MODELS/Interfaces';
import { Settings } from 'src/app/MODELS/Settings';
import { Storage } from '@capacitor/storage';
import { KEYS } from 'src/app/COMMON/KEYS';


@Injectable({
  providedIn: 'root'
})
export class StorageService {
  
  private settings: Settings;
  private status: Status;
  
  constructor(private platform: Platform) {
    this.initializeSettings();
    this.initializeStatus();
  }
  
  
  /**
  * Read Setting from local storage or initialize the defailt setting
  */
  async initializeSettings() {
    console.log("Initialising settings...");
    this.loadDefaultSettings();
    await this.platform.ready();
    // Fetch ALARMS
    console.log("Retrieving settings from storage...");
    const alarms = await Storage.get({key: KEYS.ALARMS});
    if (alarms?.value != null) {
      // ToDo
      // sostituire con l'alarm service
      // this.settings.alarms = JSON.parse(alarms.value);
    } else {
      // this.SaveSettings(this.settings);
    }
    console.log("Settings: ", this.settings);
  }
  
  
  /**
  * Read status from local storage
  */
  async initializeStatus() {
    this.status = await this.getStoredStatus();
  }
  
  /**
  * Instantiate a new Settings class with the default values
  */
  loadDefaultSettings() {
    this.settings = new Settings();
  }
  
  
  //#region ------------ Saving on local storage methods --------------------------
  
  /**
  * Save settings on the local storage
  * @param {Settings} settings
  */
  SaveData(data: any, key: string) {
    console.log("Saving data to storage...");
    let JSONdata = JSON.stringify(data);
    console.log('Data: ', JSONdata);
    Storage.set({
      key: key,
      value: JSONdata
    });
  }
  
  /**
  * Save settings on the local storage
  * @param {Settings} settings
  */
  SaveSettings(settings: Settings) {
    console.log("Saving settings to storage...");
    let alarmsJSON = JSON.stringify(this.settings.alarms);
    console.log(alarmsJSON);
    Storage.set({
      key: KEYS.ALARMS,
      value: alarmsJSON
    });
  }
  
  /**
  * Save status on the local storage
  * @param {Status} status
  */
  SaveStatus(status: Status) {
    let statusJSON: string = JSON.stringify(status);
    console.log("Saving status to storage...");
    Storage.set({
      key: KEYS.STATUS,
      value: statusJSON
    });
  }
  
  //#endregion 
  
  
  
  //#region ------------ GET METHODS -------------------
  
  
  /**
  * Return the stored settings from the device local storage
  */
  async getStoredData(key: string) {
    console.log("Retrieving data from storage...");
    // Fetch ALARMS
    let data = null;
    const res = await Storage.get({key: key});
    if (res.value != null) {
      data = JSON.parse(res.value);
    }
    console.log("Retrieved Data: ", data)
    return data;
  }
  
  
  /**
  * Return the stored settings from the device local storage
  */
  async getStoredSettings() {
    console.log("Retrieving settings from storage...");
    // Fetch ALARMS
    const res = await Storage.get({key: KEYS.ALARMS});
    if (res.value != null) {
      this.settings.alarms = JSON.parse(res.value);
      console.log("Settings: ", this.settings)
      return this.settings
    }
    return null;
  }
  
  /**
  * Return the stored status from the device local storage or null
  * @returns 
  */
  async getStoredStatus() {
    console.log("Retrieving status from storage...");
    const res = await Storage.get({key: KEYS.STATUS});
    if (res.value != null) {
      this.status = JSON.parse(res.value);
      
      // converto tutte le date in oggetti di tipo Date
      console.log("Converting date time");
      this.status.timeList.start = this.convertStr2Date(this.status.timeList.start);
      this.status.timeList.stop = this.convertStr2Date(this.status.timeList.stop);
      
      console.log("Status: ", this.status);
      return this.status
    }
    return null;
  }
  
  
  
  
  
  
  /**
  * @returns {Settings} current settings
  */
  getSettings() {
    return this.settings;
  }
  
  /**
  * @returns {Status} current status
  */
  getStatus() {
    return this.status;
  }
  
  /**
  * @returns Alarms array
  */
  getAlarms() {
    return this.settings.alarms;
  }
  
  /**
  * Get alarm by index
  * @param idx index of the alarm in the alarms array
  * @returns alarm at index posistion
  */
  getAlarmByIndex(idx: number) {
    return this.settings.alarms[idx];
  }
  
  /**
  * @returns the last alarm in the alarms array
  */
  getLastAlarm() {
    let end = this.settings.alarms.length - 1;
    return this.settings.alarms[end];
  }
  
  /**
  * 
  * @returns alarms number
  */
  getAlarmCount() {
    console.log(this.settings.alarms.length);
    return this.settings.alarms.length;
  }
  
  
  //#endregion
  
  
  //#region ------------ UTILITY ----------------------
  
  convertStr2Date(dateStr: Array<any>) {
    console.log("Converting date time");
    let ln = dateStr.length;
    var convrtedDate: Date[] = [];
    for(let idx = 0; idx < ln; idx++) {
      convrtedDate[idx] = new Date(dateStr[idx]);
    }
    return convrtedDate;
  }
  
  //#endregion
}
