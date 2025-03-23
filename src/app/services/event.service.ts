import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * MenuItemsService → เรียก eventService.openUserDialog() → ส่ง event
 * app.component → subscribe เพื่อตั้งรับ event → เมื่อ event มาถึง → เรียก userDialog()
 *
 * - ไม่มีการเรียก component จาก service โดยตรง ซึ่งเร็วต่อ Angular หลักการ SOLID principle และดีไซน์ที่สะอาด
 * - รองรับการ scale และ maintain ในอนาคตสะดวกชัดเจนมาก
 * - ยืดหยุ่นต่อการใช้งานอีกด้วย (สามารถเพิ่ม event อื่นๆ ได้ง่ายมาก)
 * - ควรใช้ event หรือ observable ในการจัดการจุดนี้เสมอ เพื่อให้โครงสร้างแอปพลิเคชัน Angular ของคุณแข็งแรง ชัดเจน
 *   และบำรุงรักษาง่ายยิ่งขึ้น 😊✨
 * */

@Injectable({
  providedIn: 'root'
})
export class EventService {
  userDialogTrigger = new Subject<void>();

  openUserDialog() {
    this.userDialogTrigger.next();
  }

  userDialogListener() {
    return this.userDialogTrigger.asObservable();
  }
}
