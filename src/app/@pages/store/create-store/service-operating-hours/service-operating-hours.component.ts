import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { SetStoreWorkingHoursDocument } from '@app/@core/graphql/operations/store/mutation.ops.g';
import { SetDeliveryHoursDocument } from '@app/@core/graphql/operations/store/mutation.ops.g';
import { SetPickupHoursDocument } from '@app/@core/graphql/operations/store/mutation.ops.g';
import { DeleteStoreWorkingHoursDocument } from '@app/@core/graphql/operations/store/mutation.ops.g';
import { DeleteDeliveryHoursDocument } from '@app/@core/graphql/operations/store/mutation.ops.g';
import { DeletePickupHoursDocument } from '@app/@core/graphql/operations/store/mutation.ops.g';
import { StoreLookupByIdDocument } from '@app/@core/graphql/operations/store/query.ops.g';
import { Router, ActivatedRoute } from '@angular/router';
import { UpdateStoreDocument } from '@app/@core/graphql/operations/store/mutation.ops.g';
import {Apollo} from 'apollo-angular';
import { TIMES_DATA } from '@app/@shared/data/time-data';
import { WorkingHoursData } from '@app/@shared/data/workingHours';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-service-operating-hours',
  templateUrl: './service-operating-hours.component.html',
  styleUrls: ['./service-operating-hours.component.scss']
})
export class ServiceOperatingHoursComponent implements OnInit, OnDestroy {

  private readonly subscriptions = [];

  operatingHoursForm: FormGroup;
  etaForm: FormGroup;

  workingHours: FormArray;

  deliveryEnable = true;
  pickupEnable = false;
  type = 'operating';
  isAddMode = false;
  storeId: any;
  store: any;

  timesData: any[] = [];

  enableWorkingHours = [];

  isWorkingHoursLoading = false;
  isETASaving = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private apollo: Apollo,
    private fb: FormBuilder) {

      this.activatedRoute.parent.params.subscribe(params => {
        if (params && params.id !== undefined) {
          this.storeId = params.id;
          this.isAddMode = false;
        }
      });
    }

  ngOnInit(): void {
    this.timesData = TIMES_DATA;

    this.operatingHoursForm = new FormGroup({
      workingHours: this.fb.array([])
    });

    this.etaForm = new FormGroup({
      preparation: new FormControl('', [Validators.required]),
      preparationAndDelivery: new FormControl('', [Validators.required])
    })

    this.initialWorkingHours();

    if (!this.isAddMode) {
      this.storeDetail();
    }
  }

  initialWorkingHours() {
    if (WorkingHoursData.length > this.operatingHoursForm.controls.workingHours['controls'].length) {
      for(const workingHour of WorkingHoursData) {
        this.addWorkingHours();
      }
    }
    this.operatingHoursForm.controls.workingHours.patchValue(WorkingHoursData);
  }

  addWorkingHours() {
    this.workingHours = this.operatingHoursForm.get('workingHours') as FormArray;
    this.workingHours.push(this.createWorkingHours());
  }

  createWorkingHours(): FormGroup {
		return this.fb.group({
      dayOfWeek: new FormControl('', [Validators.required]),
      startHour: new FormControl('', [Validators.required]),
      endHour: new FormControl('', [Validators.required]),
      dayOfWeekEnable: new FormControl(false, [Validators.required]),
		});
  }

  storeDetail() {
    this.subscriptions.push(
      this.apollo.watchQuery({
        query: StoreLookupByIdDocument,
        variables: {
          id: this.storeId
        }
      }).valueChanges.subscribe((result: any) => {
        this.store = result.data.store;
        this.deliveryEnable = this.store.deliveryEnabled;
        this.etaForm.controls.preparation.setValue(this.store.pickupEta);
        this.etaForm.controls.preparationAndDelivery.setValue(this.store.deliveryEta);
        this.pickupEnable = this.store.pickupEnabled;
        if (this.type === 'operating') {
          this.enableWorkingHours = this.store.workingHours;
        } else if(this.type === 'delivery') {
          this.enableWorkingHours = this.store.deliveryHours;
        } else if(this.type === 'pickup') {
          this.enableWorkingHours = this.store.pickupHours;
        }

        this.setWorkingHoursForm();
      })
    )
  }

  setWorkingHoursForm() {
    const workingHoursform = this.operatingHoursForm.get('workingHours')['controls'];
    const enabledDays = this.enableWorkingHours.map(e => e.dayOfWeek.toLowerCase());
    const availableTimezone = this.timesData.map(e => e.time);
    workingHoursform.forEach(e => {

      if ( enabledDays.indexOf(e.get('dayOfWeek').value.toLowerCase()) > -1 ) {
        let index = -1;
        this.enableWorkingHours.forEach( (ew,i) => {
          if ( ew.dayOfWeek.toLowerCase() === e.get('dayOfWeek').value.toLowerCase()) {
            index = i;
          }
        })
        let patchData = {
          dayOfWeekEnable: true
        };
        if ( index > -1) {
          patchData['startHour'] = `${this.closestTime(availableTimezone, this.enableWorkingHours[index].timePeriods[0].from)}Z`;
          patchData['endHour'] = `${this.closestTime(availableTimezone, this.enableWorkingHours[index].timePeriods[0].to)}Z`;
        }
        e.patchValue(patchData);
      }
    })
  }

  switchOperatingHours() {
    if (this.type === 'operating') {
      this.enableWorkingHours = this.store.workingHours;
    } else if(this.type === 'delivery') {
      this.enableWorkingHours = this.store.deliveryHours;
    } else if(this.type === 'pickup') {
      this.enableWorkingHours = this.store.pickupHours;
    }
    this.initialWorkingHours();
    this.setWorkingHoursForm();
  }

  save() {
    this.isWorkingHoursLoading = true;

    let workingHoursMutation: any;
    const formValue = this.operatingHoursForm.value;

    let count = 0;
    formValue.workingHours.forEach(e => {
      if ( e.dayOfWeekEnable ) {

        if ( !this.enableWorkingHours.filter(enable => enable['dayOfWeek'].toLowerCase() === e.dayOfWeek.toLowerCase()).length) {
          if(this.type === 'operating') {
            workingHoursMutation = SetStoreWorkingHoursDocument;
          } else if(this.type === 'delivery') {
            workingHoursMutation = SetDeliveryHoursDocument;
          } else if(this.type === 'pickup') {
            workingHoursMutation = SetPickupHoursDocument;
          }

          count ++;
          this.subscriptions.push(
            this.apollo.mutate({
              mutation: workingHoursMutation,
              variables: {
                store: this.storeId,
                daysOfWeek:e.dayOfWeek.toUpperCase(),
                // periods: timePeriods.filter(e => e !== undefined )
                from: e.startHour,
                to: e.endHour,
              },
              refetchQueries: [{
                query: StoreLookupByIdDocument,
                variables: {id: this.storeId}
              }]
            }).subscribe((response) => {
              count --;
              if ( count == 0 ) {
                this.isWorkingHoursLoading = false;
              }
            })
          );
        }
      }
      else {
        const c = 'a';
        if ( this.enableWorkingHours.filter(enable => enable['dayOfWeek'].toLowerCase() === e.dayOfWeek.toLowerCase()).length) {

          if(this.type === 'operating') {
            workingHoursMutation = DeleteStoreWorkingHoursDocument;
          } else if(this.type === 'delivery') {
            workingHoursMutation = DeleteDeliveryHoursDocument;
          } else if(this.type === 'pickup') {
            workingHoursMutation = DeletePickupHoursDocument;
          }

          count ++;
          this.subscriptions.push(
            this.apollo.mutate({
              mutation: workingHoursMutation,
              variables: {
                store: this.storeId,
                daysOfWeek:e.dayOfWeek.toUpperCase(),
              },
              refetchQueries: [{
                query: StoreLookupByIdDocument,
                variables: {id: this.storeId}
              }]
            }).subscribe((response) => {
              count --;
              if ( count == 0 ) {
                this.isWorkingHoursLoading = false;
              }
            })
          );
        }
      }
    });
    if ( count == 0 ) this.isWorkingHoursLoading = false;
  }

  saveETA() {
    this.isETASaving = true;
    const formValue = this.etaForm.value;
    this.subscriptions.push(
      this.apollo.mutate({
        mutation: UpdateStoreDocument,
        variables: {
          id: this.storeId,
          deliveryEta: +formValue.preparationAndDelivery,
          pickupEta: +formValue.preparation
        },
        refetchQueries: [{
          query: StoreLookupByIdDocument,
          variables: {id: this.storeId}
        }]
      }).subscribe(() => {
        this.isETASaving = false;
      })
    )
  }

  onChange(value: boolean, serviceType: string) {
    if (serviceType === 'delivery') {
      this.deliveryEnable = value;
    } else if(serviceType === 'pickup') {
      this.pickupEnable = value;
    }
    this.subscriptions.push(
      this.apollo.mutate({
        mutation: UpdateStoreDocument,
        variables: {
          id: this.storeId,
          deliveryEnabled: this.deliveryEnable,
          pickupEnabled: this.pickupEnable
        },
        update: (store, {data}) => {
          let existingStoreData: any;
          existingStoreData = store.readQuery({ query: StoreLookupByIdDocument, variables: {id: this.storeId} });
          existingStoreData.store.pickupEnabled = this.pickupEnable;
          existingStoreData.store.deliveryEnabled = this.deliveryEnable;
          store.writeQuery({ query: StoreLookupByIdDocument, variables: {id: this.storeId}, data: existingStoreData});
        },
      }).subscribe(() => {
      })
    )
  }

  edit(workingHour: any) {
    this.operatingHoursForm.setValue({
      startDay: workingHour.dayOfWeek,
      startHour: workingHour.timePeriods[0].from,
      endHour: workingHour.timePeriods[0].to
    });
  }

  delete(workingHour: any) {
    let workingHoursRemoveMutation: any;
    if(this.type === 'operating') {
      workingHoursRemoveMutation = DeleteStoreWorkingHoursDocument;
    } else if(this.type === 'delivery') {
      workingHoursRemoveMutation = DeleteDeliveryHoursDocument;
    } else if(this.type === 'pickup') {
      workingHoursRemoveMutation = DeletePickupHoursDocument;
    }
    this.subscriptions.push(
      this.apollo.mutate({
        mutation: workingHoursRemoveMutation,
        variables: {
          store: this.storeId,
          daysOfWeek: [workingHour.dayOfWeek],
        },
        refetchQueries: [{
          query: StoreLookupByIdDocument,
          variables: {id: this.storeId}
        }]
      }).subscribe()
    )
  }

  checkDateEnabledHours(dateStr) {
    const filteredArray = this.enableWorkingHours.filter((e) => {
      return e['dayOfWeek'].toLowerCase() === dateStr.toLowerCase();
    });
    if ( filteredArray.length ) {
      return true;
    }
    return false;
  }

  onEnableStateChange($event, i) {
    const workingHourForm = this.operatingHoursForm.get('workingHours')['controls'][i] as FormGroup;
    workingHourForm.patchValue({
      dayOfWeekEnable: $event
    });
  }

  minutesOfDay(m: string){
    var parseStr = m.split(':');
    return parseInt(parseStr[0]) * 60 + parseInt(parseStr[1]);
  }

  closestTime(availableTimes: any[], selectedTime) {
    let close = null;
    availableTimes.forEach(e => {
      const a = this.minutesOfDay(selectedTime);
      const b = this.minutesOfDay(e);
      if ( a - b >= 0 && a - b < 30 ) {
        close = e;
      }
    })
    return close;
  }

  ngOnDestroy(): void {
    for (const sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  }

}
