import { Component, OnInit } from '@angular/core';
import { BranchService } from '../../branch/branch.service';
import { Router } from '@angular/router';
import { TranslateService } from 'ng2-translate';
import { ServiceEntity } from '../../entities/service.entity';
import { ServiceService } from '../service.service';
import { RetryService } from '../../shared/retry.service';
import { Util } from '../../util/util';
import { NavigationExtras } from '@angular/router';
import { AlertDialogService } from "../../shared/alert-dialog/alert-dialog.service";
import { Config} from '../../config/config';
import {BranchOpenHoursValidator} from '../../util/branch-open-hours-validator'
import { BranchScheduleService } from '../../shared/branch-schedule.service';
declare var MobileTicketAPI: any;
declare var ga: Function;

@Component({
    selector: 'app-services-container',
    templateUrl: './services-container-tmpl.html',
    styleUrls: ['./services-container.css']
})

export class ServicesContainerComponent implements OnInit {
    public subHeadingTwo;
    public showListShadow;
    public selectedServiceId: number;
    private _showNetWorkError = false;
    private _isServiceListLoaded: boolean;
    private isTakeTicketClickedOnce: boolean;

    constructor(private branchService: BranchService, private serviceService: ServiceService, public router: Router,
        private translate: TranslateService, private retryService: RetryService, private alertDialogService: AlertDialogService,
        private config: Config, private openHourValidator: BranchOpenHoursValidator, private branchScheduleService: BranchScheduleService) {

        this._isServiceListLoaded = false;
        serviceService.registerCountDownCompleteCallback(() => {
            this.router.navigate(['branches', { redirect: true }]);
            MobileTicketAPI.setServiceSelection(undefined);
        }, branchService.isSingleBranch());

        if (branchService.getSelectedBranch() === null) {
            this.router.navigate(['branches']);
        }
        else {
            this.translate.get('service.defaultTitle').subscribe((res: string) => {
                document.title = res;
            });

            this.translate.get('service.selectService').subscribe((res: string) => {
                this.subHeadingTwo = res + " " + branchService.getSelectedBranch() + ":";
            });
        }
    }

    get showNetWorkError(): boolean { 
        return this._showNetWorkError; 
    }

    get isServiceListLoaded(): boolean { 
        return this._isServiceListLoaded; 
    }

    ngOnInit() {
        MobileTicketAPI.setServiceSelection(undefined);
        this.scrollPageToTop();
    }

    scrollPageToTop() {
        window.scrollTo(0, 0);
    }

    showHideNetworkError(value: boolean) {
        this._showNetWorkError = value;
    }

    onServiceListHeightUpdate(boolShowListShadow: boolean) {
        this.showListShadow = boolShowListShadow;
    }

    saveSelectedService(selectedServiceId: number) {
        this.selectedServiceId = selectedServiceId;
    }

    onTakeTicket() {

        if(!this.selectedServiceId){
            this.translate.get('service.noSelectedServices').subscribe((res: string) => {
                this.alertDialogService.activate(res);
            });
        }
        
        if (this.config.getConfig('branch_schedule') === 'enable') {
            const _thisObj = this;
            const selectedBranch = MobileTicketAPI.getSelectedBranch();
            const branchId = selectedBranch ? selectedBranch.id : undefined;
            this.branchScheduleService.checkAvailability(branchId, this.selectedServiceId, function(status){
                if (status) {
                    _thisObj.takeTicket();
                } else {
                    _thisObj.router.navigate(['open_hours']);
                }
            });
        } else if (!this.openHourValidator.openHoursValid()) {
            this.router.navigate(['open_hours']);
        } else {
            this.takeTicket();
        }
    }

    private takeTicket(): void {
        let customerData = this.config.getConfig('customer_data');   
        let OtpService = this.config.getConfig('otp_service');   
        let isDeviceBounded  =  this.config.getConfig('block_other_browsers');
        if (!this.isTakeTicketClickedOnce) {
            let visitInfo = MobileTicketAPI.getCurrentVisit();
            if (visitInfo && visitInfo !== null && visitInfo.visitStatus !== "DELETE") {
                this.serviceService.stopBranchRedirectionCountDown();
                this.serviceService.stopServiceFetchTimer();
                this.router.navigate(['ticket']);
            }
            else {
                if (this.selectedServiceId) {
                    this.serviceService.stopBranchRedirectionCountDown();
                    this.serviceService.stopServiceFetchTimer();
                    this.isTakeTicketClickedOnce = true;
                    let clientId;
                    ga(function (tracker) {
                        if (tracker.get('clientId')) {
                            clientId = tracker.get('clientId');
                        }
                        else {
                            clientId = '';
                        }
                    });
                    if ( customerData === 'enable') {
                        MobileTicketAPI.setPhoneNumber('');
                        this.router.navigate(['customer_data']);
                    } else if (OtpService === 'enable'){
                        MobileTicketAPI.setOtpPhoneNumber('');
                        this.router.navigate(['otp_number']);
                    } else {
                        if ( isDeviceBounded === 'enable') {
                            System.import('fingerprintjs2').then(Fingerprint2 => {
                                var that = this;
                                Fingerprint2.getPromise({
                                  excludes: {
                                    availableScreenResolution: true,
                                    adBlock: true,
                                    enumerateDevices: true
                                  }
                                }).then(function (components) {
                                  var values = components.map(function (component) { return component.value });
                                  var murmur = Fingerprint2.x64hash128(values.join(''), 31);
                                  MobileTicketAPI.setFingerprint(murmur);
                                  that.createTicket();
                                })
                             });
                           

                        } else {
                            this.createTicket();
                        }
                    }
                }
            }
        }
    }

    public createTicket() {
        MobileTicketAPI.createVisit(
            (visitInfo) => {
                ga('send', {
                    hitType: 'event',
                    eventCategory: 'visit',
                    eventAction: 'create',
                    eventLabel: 'vist-create'
                });

                this.router.navigate(['ticket']);
                this.isTakeTicketClickedOnce = false;
            },
            (xhr, status, errorMessage) => {
                let util = new Util();
                this.isTakeTicketClickedOnce = false;
                if (util.getStatusErrorCode(xhr && xhr.getAllResponseHeaders()) === "8042") {
                    this.translate.get('error_codes.error_8042').subscribe((res: string) => {
                        this.alertDialogService.activate(res);
                    });
                } else if (util.getStatusErrorCode(xhr && xhr.getAllResponseHeaders()) === "11000") {
                    this.translate.get('ticketInfo.visitAppRemoved').subscribe((res: string) => {
                        this.alertDialogService.activate(res);
                    });
                } else {
                    this.showHideNetworkError(true);
                    this.retryService.retry(() => {

                        /**
                        * replace this function once #140741231 is done
                        */
                        MobileTicketAPI.getBranchesNearBy(0, 0, 2147483647,
                            () => {
                                this.retryService.abortRetry();
                                this.showHideNetworkError(false);
                            }, () => {
                                //Do nothing on error
                            });
                    });
                }
            }
        );
    }

    public onServiceListLoaded() {
        this._isServiceListLoaded = true;
    }


}
