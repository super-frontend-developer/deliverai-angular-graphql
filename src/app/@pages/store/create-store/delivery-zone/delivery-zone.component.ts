import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {MatAccordion} from '@angular/material/expansion';
import {Apollo} from 'apollo-angular';
import { CreateDeliveryZoneDocument, UpdateDeliveryZoneDocument } from '@app/@core/graphql/operations/store/mutation.ops.g';
import { DeleteDeliveryZoneDocument } from '@app/@core/graphql/operations/store/mutation.ops.g';
import { CreateCircleDeliveryZoneAreaDocument } from '@app/@core/graphql/operations/store/mutation.ops.g';
import { CreateShapeDeliveryZoneAreaDocument } from '@app/@core/graphql/operations/store/mutation.ops.g';
import { StoreDeliveryZoneConnectionDocument } from '@app/@core/graphql/operations/store/query.ops.g';
import { GetCurrencyListGQL } from '@app/@core/graphql/operations/general/query.ops.g';

declare const google: any;

@Component({
  selector: 'app-delivery-zone',
  templateUrl: './delivery-zone.component.html',
  styleUrls: ['./delivery-zone.component.scss']
})
export class DeliveryZoneComponent implements OnInit, OnDestroy {

  private readonly subscriptions = [];

  deliveryZoneForm: FormGroup;
  deliveryZones: FormArray;

  storeId: any;
  storeDeliveryZonesList = [];
  currencyList: any[];

  deliveryZoneIsActive = false;
  isCircleZone = false;

  lat: number;
  lng: number;

  pointList: any[] = [];

  drawingManager: any;
  selectedShape: any;
  selectedArea = 0;
  selectedZone: any;
  allOverlays = [];

  map: any;
  isDeliveryZoneLoading = false;

  EARTH_RADIUS = 6378;

  @ViewChild(MatAccordion) accordion: MatAccordion;

  // globalColor = ''

  constructor(private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private getCurrencyListGQL: GetCurrencyListGQL,
    private apollo: Apollo) {
    this.activatedRoute.parent.params.subscribe(params => {
      if (params && params.id !== undefined) {
        this.storeId = params.id;
      }
    });
  }

  ngOnInit(): void {
    this.deliveryZoneForm = new FormGroup({
      deliveryZones: this.fb.array([])
    });

    this.getCurrencyList();
    this.setCurrentPosition();
    this.storeDeliveryZones();
  }

  private setCurrentPosition() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
      });
    }
  }

  getCurrencyList() {
    this.subscriptions.push(
      this.getCurrencyListGQL.watch()
      .valueChanges.subscribe(result => {
        this.currencyList = result.data.currencies;
      })
    )
  }

  storeDeliveryZones() {
    this.subscriptions.push(
      this.apollo.watchQuery({
        query: StoreDeliveryZoneConnectionDocument,
        variables: {
          id: this.storeId
        },
        fetchPolicy: 'no-cache'
      }).valueChanges.subscribe((result: any) => {
        this.storeDeliveryZonesList = result.data.store.deliveryZoneConnection.edges;
        this.storeDeliveryZonesList.map((item) => {
            item.id = item.node.id;
            item.name = item.node.name;
            item.miniAmount = item.node.minimalAmount;
            item.generalDeliveryFees = item.node.fee;
            item.deliveryZoneArea = item.node.areaConnection.edges.length ? item.node.areaConnection.edges[0].node : {};
            item.zoneId = item.node.id;
        });
        if (this.storeDeliveryZonesList.length > 0) {
          this.deliveryZoneIsActive = true;
          this.isCircleZone = true;
        }
        if (this.storeDeliveryZonesList.length > this.deliveryZoneForm.controls.deliveryZones['controls'].length) {
          for(const storeDeliveryZone of this.storeDeliveryZonesList) {
            this.addZoneShapes(storeDeliveryZone);// Add delivery zone shapes
            this.addZone();
          }
        }
        this.deliveryZoneForm.controls.deliveryZones.patchValue(this.storeDeliveryZonesList);
      })
    )
  }

  addZoneShapes(dZone: any) {
    if ( dZone['deliveryZoneArea'] ) {
      if ( dZone['deliveryZoneArea'].points && dZone['deliveryZoneArea'].points.length ) {
        let shape = [];
        dZone['deliveryZoneArea'].points.forEach(e => {
          shape.push({
            'lat': e['latitude'],
            'lng': e['longitude']
          });
        });
        if ( shape.length ) {
          let shapeZone = new google.maps.Polygon({
            paths: shape,
            draggable: true,
            editable: true,
            strokeColor: '#706bd6',
            strokeOpacity: 1.0,
            fillColor: '#706bd6',
            fillOpacity: 0.3
          });
          shapeZone.setMap(this.map);
          shapeZone['zoneId'] = dZone['zoneId'];
          this.allOverlays.push(shapeZone);
        }
      }
      else if ( dZone['deliveryZoneArea'].center && dZone['deliveryZoneArea'].corner ) {
        let center = {
          'lat': dZone['deliveryZoneArea'].center['latitude'],
          'lng': dZone['deliveryZoneArea'].center['longitude']
        };
        let corner = {
          'lat': dZone['deliveryZoneArea'].corner['latitude'],
          'lng': dZone['deliveryZoneArea'].corner['longitude']
        }

        let shapeZone = new google.maps.Circle({
          strokeOpacity: 0.8,
          strokeWeight: 2,
          strokeColor: '#706bd6',
          fillColor: '#706bd6',
          fillOpacity: 0.35,
          map: this.map,
          center: center,
          radius: this.calculateDistance(center.lat, corner.lat)
        });
        shapeZone['zoneId'] = dZone['zoneId'];
        this.allOverlays.push(shapeZone);
      }
    }
  }

  addZone() {
    // this.isCircleZone = false;
    // this.drawingManager.setMap(null);
    // this.deleteAllShape();
    // this.globalColor = '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
    this.deliveryZones = this.deliveryZoneForm.get('deliveryZones') as FormArray;
    const createdZone = this.createZone();
    this.selectedZone = createdZone.get('zoneId').value;
    this.deliveryZones.push(createdZone);
  }

  createZone(): FormGroup {
		return this.fb.group({
      id: new FormControl(''),
      zoneType: new FormControl('', [Validators.required]),
      name: new FormControl('Zone1', [Validators.required]),
      miniAmount: new FormControl('', [Validators.required]),
      generalDeliveryFees: new FormControl('', [Validators.required]),
      // specDeliveryFees: new FormControl('', [Validators.required]),
      currency: new FormControl('AED'),
      deliveryZoneArea: this.createZoneArea(),
      zoneId: this.makeId(5)
		});
  }

  createZoneArea() {
    const zoneArea = {
      center: {
        latitude: '',
        longitude: ''
      },
      corner: {
        latitude: '',
        longitude: ''
      },
      radius: '',
      points: []
    }

    return zoneArea;
  }

  changeZoneType(type: string, index: any) {
    if (type === 'circle') {
      this.drawingManager.setMap(null);
      this.deliveryZones.controls[index].patchValue({
        deliveryZoneArea: {
          center: {
            latitude: this.lat,
            longitude: this.lng,
          },
          corner: {
            latitude: this.lat + this.calculateNewLat(1000),
            longitude: this.lng
          },
          radius: 1000,
          points: []
        }
      });
      this.isCircleZone = true;
      // this.deleteAllShape();
    } else if(type === 'polygon') {
      this.drawingManager.setMap(this.map);
      this.drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
      this.deliveryZones.controls[index].patchValue({
        deliveryZoneArea: {
          center: {
            latitude: '',
            longitude: ''
          },
          corner: {
            latitude: '',
            longitude: ''
          },
          radius: '',
          points: this.pointList
        }
      });
      this.isCircleZone = false;
    }
  }

  getDeliveryZonesLength() {
    const deliveryZones = this.deliveryZoneForm.get('deliveryZones') as FormArray;
    return deliveryZones.length;
  }

  deleteAllShape(zoneId: string = null) {
    if ( !zoneId ) {
      for (const selectedOverlay of this.allOverlays) {
        if ( selectedOverlay.overlay ) selectedOverlay.overlay.setMap(null);
        else selectedOverlay.setMap(null);
      }
      this.allOverlays = [];
    }
    else {
      var selectedZoneOverlays = this.allOverlays.filter(function(item) {
        return item['zoneId'] === zoneId;
      });
      selectedZoneOverlays.forEach(e => {
        if ( e.overlay ) e.overlay.setMap(null);
        else e.setMap(null);
      })
    }
  }

  onMapReady(map) {
    this.map = map;
    this.initDrawingManager();
  }

  initDrawingManager() {
    const self = this;
    const options = {
      // drawingControl: true,
      drawingControl: false,
      drawingControlOptions: {
        drawingModes: ['polygon'],
      },
      polygonOptions: {
        draggable: true,
        editable: true,
        strokeColor: '#706bd6',
        strokeOpacity: 1.0,
        fillColor: '#706bd6',
        fillOpacity: 0.3
      },
      drawingMode: google.maps.drawing.OverlayType.POLYGON,
    };
    this.drawingManager = new google.maps.drawing.DrawingManager(options);
    // this.drawingManager.setMap(map);
    this.drawingManager.setMap(null);
    google.maps.event.addListener(
      this.drawingManager,
      'overlaycomplete',
      (event) => {
        event['zoneId'] = this.selectedZone ? this.selectedZone : this.makeId(5);
        this.allOverlays.push(event);
        if (event.type === google.maps.drawing.OverlayType.POLYGON) {
          const paths = event.overlay.getPaths();
          for (let p = 0; p < paths.getLength(); p++) {
            google.maps.event.addListener(
              paths.getAt(p),
              'set_at',
              () => {
                if (!event.overlay.drag) {
                  self.updatePointList(event.overlay.getPath());
                }
              }
            );
            google.maps.event.addListener(
              paths.getAt(p),
              'insert_at',
              () => {
                self.updatePointList(event.overlay.getPath());
              }
            );
            google.maps.event.addListener(
              paths.getAt(p),
              'remove_at',
              () => {
                self.updatePointList(event.overlay.getPath());
              }
            );
          }
          self.updatePointList(event.overlay.getPath());
        }
        if (event.type !== google.maps.drawing.OverlayType.MARKER) {
          // Switch back to non-drawing mode after drawing a shape.
          self.drawingManager.setDrawingMode(null);
          // To hide:
          self.drawingManager.setOptions({
            drawingControl: false,
          });
        }
      }
    );
  }

  updatePointList(path) {
    this.pointList = [];
    const len = path.getLength();
    for (let i = 0; i < len; i++) {
      this.pointList.push(
        path.getAt(i).toJSON()
      );
    }
    this.selectedArea = google.maps.geometry.spherical.computeArea(
      path
    );
  }

  deleteSelectedShape() {
    if (this.selectedShape) {
      this.selectedShape.setMap(null);
      this.selectedArea = 0;
      this.pointList = [];
      // To show the controls:
      this.drawingManager.setOptions({
        drawingControl: true,
      });
    }
  }

  radiusChange(event, zoneArea, index) {
    this.deliveryZones.controls[index].patchValue({
      deliveryZoneArea: {
        center: {
          latitude: zoneArea.center.latitude,
          longitude: zoneArea.center.longitude,
        },
        corner: {
          latitude: zoneArea.center.latitude + this.calculateNewLat(event),
          longitude: zoneArea.center.longitude,
        },
        radius: event,
        points: []
      }
    });
  }

  centerChange(event, zoneArea, index) {
    this.deliveryZones.controls[index].patchValue({
      deliveryZoneArea: {
        center: {
          latitude: event.coords.lat,
          longitude: event.coords.lng,
        },
        radius: zoneArea.radius,
        points: []
      }
    });
  }

  save(i: number) {
    this.isDeliveryZoneLoading = true;
    const deliveryZones = this.deliveryZoneForm.get('deliveryZones') as FormArray;
    // console.log("zone form:: ", this.deliveryZoneForm.controls.deliveryZones[i].controls.expanded.setValue(false))
    // this.deliveryZoneForm.controls.deliveryZones[i].controls.expanded.setValue(false);
    // this.deliveryZoneForm.controls.deliveryZones['controls'][i].controls.expanded.setValue(false)
    const formValue = deliveryZones.controls[i].value;

    let variables = {
        name: formValue.name,
        minimalAmount: +formValue.miniAmount,
        fee: +formValue.generalDeliveryFees,
    };

    if ( this.storeDeliveryZonesList[i] ) {
      variables['id'] = this.storeDeliveryZonesList[i].id;
    }
    else {
      variables['store'] = this.storeId;
    }
    this.subscriptions.push(
      this.apollo.mutate({
        mutation: this.storeDeliveryZonesList[i] ? UpdateDeliveryZoneDocument :CreateDeliveryZoneDocument,
        variables: variables
      }).subscribe((response: any) => {
        const storeDeliveryZoneId = this.storeDeliveryZonesList[i] ? response.data.updateDeliveryZone.id : response.data.createDeliveryZone.id;

        if ( !this.storeDeliveryZonesList[i] ) {
          this.storeDeliveryZonesList.push({
            id: storeDeliveryZoneId,
            name : response.data.createDeliveryZone.name,
            miniAmount : response.data.createDeliveryZone.minimalAmount,
            generalDeliveryFees : response.data.createDeliveryZone.fee,
            deliveryZoneArea : {},
            zoneId : storeDeliveryZoneId
          });
        }

        let selectedFrom = this.deliveryZoneForm.controls.deliveryZones['controls'][i] as FormGroup;
        this.allOverlays.map(item => {
          if ( item['zoneId'] === selectedFrom.get('zoneId').value ) {
            item.zoneId = storeDeliveryZoneId;
          }
        })
        selectedFrom.patchValue({zoneId: storeDeliveryZoneId, id: storeDeliveryZoneId});

        if(formValue.zoneType === 'circle') {
          this.saveCircleStoreDeliveryZoneArea(storeDeliveryZoneId, formValue.deliveryZoneArea);
        } else if(formValue.zoneType === 'shape') {
          this.saveShapeStoreDeliveryZoneArea(storeDeliveryZoneId);
        }
      })
    )
  }

  saveCircleStoreDeliveryZoneArea(storeDeliveryZoneId: any, zoneArea: any) {
    this.subscriptions.push(
      this.apollo.mutate({
        mutation: CreateCircleDeliveryZoneAreaDocument,
        variables: {
          deliveryZone: storeDeliveryZoneId,
          latitude: zoneArea.center.latitude,
          longitude: zoneArea.center.longitude,
          cornerLat: zoneArea.corner.latitude,
          cornerLng: zoneArea.corner.longitude,
        }
      }).subscribe((response) => {
        this.isDeliveryZoneLoading = false;
        this.collapseAll();
      })
    )
  }

  saveShapeStoreDeliveryZoneArea(storeDeliveryZoneId: any) {
    this.pointList = this.pointList.map((point)=> (
      {
        latitude: point.lat,
        longitude: point.lng
      }
    ));
    this.subscriptions.push(
      this.apollo.mutate({
        mutation: CreateShapeDeliveryZoneAreaDocument,
        variables: {
          deliveryZone: storeDeliveryZoneId,
          points: this.pointList
        }
      }).subscribe((response) => {
        this.isDeliveryZoneLoading = false;
        this.collapseAll();
      })
    )
  }

  delete(i: number) {

    const deliveryZones = this.deliveryZoneForm.get('deliveryZones') as FormArray;
    const formValue = deliveryZones.controls[i].value;
    this.deliveryZones.removeAt(i);
    this.storeDeliveryZonesList.splice(i, 1);
    this.deleteAllShape(formValue.zoneId);
    this.selectedZone = formValue.zoneId;
    this.subscriptions.push(
      this.apollo.mutate({
        mutation: DeleteDeliveryZoneDocument,
        variables: {
          id: formValue.id
        }
      }).subscribe()
    )
    // this.circleZone = false;
  }

  collapseAll() {
    this.accordion.closeAll();
  }

  makeId(length) {
    var result = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

 calculateNewLat(distance) {

  return (distance / this.EARTH_RADIUS) * (180 / Math.PI);
 }

 calculateDistance(oldLatlng, newLatlng) {
   return Math.abs(oldLatlng - newLatlng) * this.EARTH_RADIUS * Math.PI / 180;
 }

  ngOnDestroy(): void {
    for (const sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  }

}
