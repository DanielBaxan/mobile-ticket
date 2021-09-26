import { BrowserModule } from "@angular/platform-browser";
import {
  NgModule,
  APP_INITIALIZER,
  CUSTOM_ELEMENTS_SCHEMA,
} from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
// import {HttpModule, Http} from '@angular/http';
import { Router } from "@angular/router";
import { BranchesComponent } from "./branch/list/branches.component";
import { BranchesContainerComponent } from "./branch/list-container/branches-container.component";
import { BranchComponent } from "./branch/list-item/branch.component";
import { BranchService } from "./branch/branch.service";
import { ServicesComponent } from "./service/list/services.component";
import { ServicesContainerComponent } from "./service/list-container/services-container.component";
import { ServiceComponent } from "./service/list-item/service.component";
import { ServiceService } from "./service/service.service";
import { HttpClient, HttpClientModule } from "@angular/common/http";

import { FrameLayoutComponent } from "./shared/frame-layout/frame-layout.component";
import { NotSupportComponent } from "./shared/not-support/not-support.component";
import { TicketInfoContainerComponent } from "./ticket-info/container/ticket-info-container.component";
import { TicketInfoService } from "./ticket-info/ticket-info.service";

import { RootComponent } from "./shared/root.component";

import { QmRouterModule, RoutingComponents } from "./router-module";
import { TicketComponent } from "./ticket-info/ticket/ticket.component";
import { QueueComponent } from "./ticket-info/queue/queue.component";
import { VisitCancelComponent } from "./ticket-info/visit-cancel/visit-cancel.component";
import { AuthGuard } from "./guard/auth.guard";
import { QueueItemComponent } from "./ticket-info/queue-item/queue-item.component";
import { SortPipe } from "./util/sort.pipe";
import { Config } from "./config/config";
import { Locale } from "./locale/locale";
import { LocationService } from "./util/location";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";

import { ConnectivityMessageComponent } from "./shared/connectivity-message/connectivity-message.component";

import { RetryService } from "./shared/retry.service";
import { BranchNotfoundComponent } from "./branch/branch-notfound/branch-notfound.component";
import { VisitNotfoundComponent } from "./ticket-info/visit-notfound/visit-notfound.component";
import { VisitCancelLeavelineGuard } from "./ticket-info/visit-cancel/visit-cancel.leaveline.guard";
import { ConfirmDialogComponent } from "./shared/confirm-dialog/confirm-dialog.component";
import { ConfirmDialogService } from "./shared/confirm-dialog/confirm-dialog.service";
import { AlertDialogComponent } from "./shared/alert-dialog/alert-dialog.component";
import { AlertDialogService } from "./shared/alert-dialog/alert-dialog.service";

import { BranchOpenHoursComponent } from "./shared/branch-open-hours/branch-open-hours.component";
import { OpenHourItemComponent } from "./shared/branch-open-hours/item/open-hour-item.component";
import { AppointmentComponent } from "./appointment/appointment.component";
import { PrivacyPolicyComponent } from "./privacy-policy/privacy-policy.component";
import { CookieContainerComponent } from "./cookie-container/cookie-container.component";
import { CookieConsentDialogComponent } from "./cookie-container/cookie-consent-dialog/cookie-consent-dialog.component";
import { CustomerDataComponent } from "./customer-data/customer-data.component";
import { CustomerDataGuard } from "./customer-data/customer-data-guard";
import { UnautherizedComponent } from "./ticket-info/unautherized/unautherized.component";
import { OtpPhoneNumberComponent } from "./otp/otp-phone-number/otp-phone-number.component";
import { OtpPinComponent } from "./otp/otp-pin/otp-pin.component";

import { BranchScheduleService } from "./shared/branch-schedule.service";
import { BranchOpenHoursValidator } from "./util/branch-open-hours-validator";
import { LocationValidator } from "./util/location-validator";
import { TicketLoaderComponent } from "./ticket-loader/ticket-loader.component";
import { NgxIntlTelInputModule } from "ngx-intl-tel-input";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { IvyCarouselModule } from "angular-responsive-carousel";

declare var MobileTicketAPI: any;

@NgModule({
  declarations: [
    BranchesComponent,
    BranchComponent,
    ServicesComponent,
    ServiceComponent,
    RootComponent,
    RoutingComponents,
    FrameLayoutComponent,
    TicketComponent,
    NotSupportComponent,
    QueueComponent,
    VisitCancelComponent,
    QueueItemComponent,
    SortPipe,
    ConnectivityMessageComponent,
    VisitNotfoundComponent,
    BranchNotfoundComponent,
    ConfirmDialogComponent,
    AlertDialogComponent,
    BranchOpenHoursComponent,
    OpenHourItemComponent,
    AppointmentComponent,
    PrivacyPolicyComponent,
    CustomerDataComponent,
    CookieContainerComponent,
    CookieConsentDialogComponent,
    UnautherizedComponent,
    OtpPhoneNumberComponent,
    OtpPinComponent,
    TicketLoaderComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    IvyCarouselModule,
    // HttpModule,
    HttpClientModule,
    QmRouterModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: translateStaticLoader,
        deps: [HttpClient],
      },
    }),
    NgxIntlTelInputModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [
    BranchService,
    ServiceService,
    TicketInfoService,
    AuthGuard,
    ConfirmDialogService,
    AlertDialogService,
    VisitCancelLeavelineGuard,
    RetryService,
    Locale,
    LocationService,
    SortPipe,
    CustomerDataGuard,
    Config,
    BranchScheduleService,
    BranchOpenHoursValidator,
    LocationValidator,
    {
      provide: APP_INITIALIZER,
      useFactory: configuration,
      deps: [Config],
      multi: true,
    },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [RootComponent],
})
export class AppModule {
  constructor() {
    this.init();
  }

  init() {
    MobileTicketAPI.init();
    this.setTouchDeviceTag();
  }

  isTouchDevice() {
    return "ontouchstart" in window || navigator.msMaxTouchPoints > 0;
  }

  setTouchDeviceTag() {
    if (this.isTouchDevice()) {
      document.getElementsByTagName("body")[0].className = "touch";
    } else {
      document.getElementsByTagName("body")[0].className = "no-touch";
    }
  }
}

export function translateStaticLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, "./app/locale/", ".json");
}

export function configuration(config: Config) {
  return () => config.load();
}
