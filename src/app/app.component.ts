import { Component, DestroyRef, inject, OnDestroy, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { UserProfileComponent } from './components/user-profile.component';
import { FooterComponent } from './pages/footer.component';
import { AuthService } from './services/auth.service';
import { EventService } from './services/event.service';
import { MenuItemsService } from './services/menu-items.service';
import { ToastService } from './services/toast.service';
import { SharedModule } from './shared/shared.module';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SharedModule, RouterLink, FooterComponent],
  template: `
    <p-toast [style]="{top: '60px', right: '10px'}"></p-toast>
    @if (currentUser()) {
      <div class="card">
        <p-menubar [model]="items">
          <ng-template pTemplate="start">
            <img src="/images/primeng-logo.png" alt="logo"/>
          </ng-template>
          <ng-template pTemplate="item" let-item>
            <ng-container>
              <div class="z-0">
                <a [routerLink]="item.route" class="p-menuitem-link">
                  <span [class]="item.icon"></span>
                  <span class="ml-2">{{ item.label }}</span>
                </a>
              </div>
            </ng-container>
          </ng-template>
          <ng-template pTemplate="end">
            <div class="flex items-center gap-2">
              <p-avatar
                image="{{
                userPhoto
                  // currentUser()?.photoURL ?? '/images/dummy-user.png'
                }}"
                shape="circle"
                class="" crossorigin="anonymous"
              />
              <span
                (click)="menu.toggle($event)"
                class="font-bold text-gray-400 mr-2 cursor-pointer -mt-1"
              >
                {{
                  currentUser()?.displayName
                    ? currentUser()?.displayName
                    : currentUser()?.email
                }}
                <i class="pi pi-angle-down"></i>
              </span>
              <p-menu #menu [model]="subitems" [popup]="true"/>
            </div>
          </ng-template>
        </p-menubar>
      </div>
    }
    <div class="p-2">
      <router-outlet/>
    </div>
    @if (currentUser()) {
      <app-footer/>
    }
  `,
  styles: [],
})
export class AppComponent implements OnInit, OnDestroy {
  authService: AuthService = inject(AuthService);
  dialogService: DialogService = inject(DialogService);
  eventService: EventService = inject(EventService);
  toastService: ToastService = inject(ToastService);
  menuItemsService: MenuItemsService = inject(MenuItemsService);
  router: Router = inject(Router);
  private sanitizer: DomSanitizer = inject(DomSanitizer);


  items: MenuItem[] = [];
  subitems: MenuItem[] = [];
  private destroyRef = inject(DestroyRef);
  userPhoto: string = '';
  safeProfileUrl: SafeUrl | undefined;

  ref: DynamicDialogRef | undefined;
  eventSubscription: Subscription | undefined;

  currentUser = this.authService.currentUser;

  ngOnDestroy(): void {
    if (this.ref) this.ref.close();
    this.eventSubscription?.unsubscribe();
  }

  ngOnInit(): void {
    this.eventSubscription = this.eventService.userDialogListener()
      .subscribe(() => {
        this.userDialog();
      });
    this.menuItemsService
      .getMenuItems()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(menuItems => {
        this.items = menuItems;
      });

    this.subitems = this.menuItemsService.getPopupItems();
    // this.userPhoto = this.currentUser()?.photoURL || '/images/dummy-user.png';
    // console.log(this.userPhoto);

    /** */
    this.authService.isAdmin().subscribe(isAdmin => {
      console.log('🛡️ สถานะ isAdmin ของผู้ใช้:', isAdmin);
    });

    this.authService.getRole().subscribe(role => {
      console.log('🚩 Role ปัจจุบันของผู้ใช้:', role);
    });
    this.authService.currentUser$.subscribe(user => {
      this.userPhoto = user?.photoURL || '/images/dummy-user.png';
      // console.log('👤 ผู้ใช้ปัจจุบัน:', JSON.stringify(user, null, 2));
    });
  }

  private userDialog() {
    this.ref = this.dialogService.open(UserProfileComponent, {
      data: this.currentUser(),
      header: 'User Details',
      width: '500px',
      modal: true,
      contentStyle: {overflow: 'auto'},
      breakpoints: {
        '960px': '500px',
        '640px': '360px',
      },
      closable: true
    });
  }

  setProfileUrl(url: string) {
    this.safeProfileUrl = this.sanitizer.bypassSecurityTrustUrl(url);
  }


}
