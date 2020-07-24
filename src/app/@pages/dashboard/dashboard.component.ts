import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as chartsData from '@app/@shared/data/chartjs';
import { MetricTotalCustomersDocument, MetricRevenueDocument, MetricAvgOrderAmountDocument, MetricTotalOrdersDocument } from '@app/@core/graphql/operations/dashboard/query.ops.g'; 
import { Apollo } from 'apollo-angular';
import * as moment from 'moment';
import { Moment } from 'moment';
import { DaterangepickerComponent } from 'ng2-daterangepicker';
import { DateRange } from '@app/@core/models/daterange';
declare var $: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  @ViewChild('generalCanvas', {static: true}) canvas: ElementRef<HTMLCanvasElement>;
  @ViewChild(DaterangepickerComponent, { static: false })
  drp: DaterangepickerComponent;

  drpickerOptions = {
    'alwaysShowCalendars': true,
    opens: 'right',
    ranges: {
      'Today': [ moment().startOf('day'), moment().endOf('day') ],
      'Yesterday': [ moment().subtract(1, 'days').startOf('day'), moment().subtract(1, 'days').endOf('day') ],
      'Last 7 Days': [ moment().subtract(6, 'days').startOf('day'), moment().endOf('day') ],
      'Last 30 Days': [ moment().subtract(29, 'days').startOf('day'), moment().endOf('day') ],
      'This Month': [ moment().startOf('month'), moment().endOf('month') ],
      'Last Month': [ moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month') ]
    },
    applyButtonClasses: 'btn btn-success',
  };

  range: DateRange = new DateRange(moment().startOf('day'), moment().endOf('day'));

  private readonly subscriptions = [];
  storeId: any;
  businessId: any;

  // areaChart
  public ordersChartData = [{
    data: []
  }];
  public salesChartData = [{
    data: []
  }];
  public customersChartData = [{
    data: []
  }];
  public basketChartData = [{
    data: []
  }];
  public ordersChartOptions = chartsData.ordersChartOptions;
  public salesChartOptions = chartsData.salesChartOptions;
  public customersChartOptions = chartsData.customersChartOptions;
  public basketChartOptions = chartsData.basketChartOptions;

  public orderChartLabels = [];
  public customerChartLabels = [];
  public basketChartLabels = [];
  public salesChartLabels = [];

  public totalCustomers = 0;
  public totalOrders = 0;
  public totalSales = 0;
  public totalBasketAmount = 0.0;

  public currency = '';
  public chartDataLabelFormat = 'MMM D HH:mm';

  public areaChartLabels = chartsData.areaChartLabels;
  public areaChartLegend = chartsData.areaChartLegend;
  public areaChartType = chartsData.areaChartType;

  public areaChartColors: Array<any> = [

    {
      borderColor: 'transparent',
      pointBackgroundColor: '#FFF',
      pointBorderColor: 'rgba(255, 141, 96,1)',
      pointHoverBackgroundColor: 'rgba(255, 141, 96,1)',
      pointRadius: '5',
      pointHoverBorderColor: '#FFF',
      pointHoverRadius: '5',
      pointBorderWidth: '2'
    }
  ];

  constructor(
    public apollo: Apollo
  ) { 
    this.storeId = localStorage.getItem('storeId');
    this.businessId = localStorage.getItem('businessId');
  }

  ngOnInit(): void {
    $.getScript('./assets/js/customizer.js');

    const gradient = this.canvas.nativeElement.getContext('2d')
    .createLinearGradient(this.canvas.nativeElement.width/2, 0, this.canvas.nativeElement.width/2, this.canvas.nativeElement.height);
      gradient.addColorStop(0, 'rgba(250,189,110,1)');
      gradient.addColorStop(.7, 'rgba(247,227,203,1)');
      gradient.addColorStop(1, 'rgba(255,255,255,1)');
      this.areaChartColors = [
          {
              backgroundColor: gradient
          }
      ];
      
      var duration = moment.duration(this.range.end.diff(this.range.start));
      this.chartDataLabelFormat = duration.asHours() < 24 ? 'HH:mm':'MMM D HH:mm';

      this.reload();
  }

  public OrderChartData() {
    this.subscriptions.push(
      this.apollo.watchQuery({
        query: MetricTotalOrdersDocument,
        variables: {
          business: this.businessId,
          from: this.range.start.toISOString(),
          to: this.range.end.toISOString()
        }
      }).valueChanges.subscribe((response: any) => {
        if ( response.data && response.data.metricTotalOrders) {
          this.orderChartLabels = response.data.metricTotalOrders.map(e => moment(e.dateTime, "YYYY-MM-DDTHH:mm:ssZ").format(this.chartDataLabelFormat));
          this.ordersChartData[0].data = response.data.metricTotalOrders.map(e => e.value);
          this.totalOrders = this.ordersChartData[0].data.reduce(function(a, b){
            return a + b;
          }, 0);
        }
      })
    )
  }

  public CustomersChartData() {
    this.subscriptions.push(
      this.apollo.watchQuery({
        query: MetricTotalCustomersDocument,
        variables: {
          business: this.businessId,
          store: this.storeId,
          from: this.range.start.toISOString(),
          to: this.range.end.toISOString()
        }
      }).valueChanges.subscribe((response: any) => {
        if ( response.data && response.data.metricTotalCustomers) {
          this.customerChartLabels = response.data.metricTotalCustomers.map(e => moment(e.dateTime, "YYYY-MM-DDTHH:mm:ssZ").format(this.chartDataLabelFormat));
          this.customersChartData[0].data = response.data.metricTotalCustomers.map(e => e.value);
          this.totalCustomers = this.customersChartData[0].data.reduce(function(a, b){
            return a + b;
          }, 0);
        }
      })
    )
  }

  public RevenueChartData() {
    this.subscriptions.push(
      this.apollo.watchQuery({
        query: MetricRevenueDocument,
        variables: {
          business: this.businessId,
          store: this.storeId,
          from: this.range.start.toISOString(),
          to: this.range.end.toISOString()
        }
      }).valueChanges.subscribe((response: any) => {
        if ( response.data && response.data.metricRevenue) {
          this.salesChartLabels = response.data.metricRevenue.map(e => moment(e.dateTime, "YYYY-MM-DDTHH:mm:ssZ").format(this.chartDataLabelFormat));
          this.salesChartData[0].data = response.data.metricRevenue.map(e => e.value);
          this.totalSales = this.salesChartData[0].data.reduce(function(a, b){
            return a + b;
          }, 0.0);
        }
      })
    )
  }

  public AvgOrderAmountChartData() {
    this.subscriptions.push(
      this.apollo.watchQuery({
        query: MetricAvgOrderAmountDocument,
        variables: {
          business: this.businessId,
          store: this.storeId,
          from: this.range.start.toISOString(),
          to: this.range.end.toISOString()
        }
      }).valueChanges.subscribe((response: any) => {
        if ( response.data && response.data.metricAvgOrderAmount ) {
          this.basketChartLabels = response.data.metricAvgOrderAmount.map(e => moment(e.dateTime, "YYYY-MM-DDTHH:mm:ssZ").format(this.chartDataLabelFormat));
          this.basketChartData[0].data = response.data.metricAvgOrderAmount.map(e => e.value);
          this.totalBasketAmount = this.basketChartData[0].data.reduce(function(a, b){
            return a + b;
          }, 0.0);
        }
      })
    )
  }

  selectedDate(value: { start: Moment, end: Moment, label: string }, datepicker?: any) {
    this.range = new DateRange(value.start, value.end);
    this.reload();
  }

  reload() {
    this.OrderChartData();
    this.CustomersChartData();
    this.AvgOrderAmountChartData();
    this.RevenueChartData();
  }

  // events
  public chartClicked(e: any): void {
    // your code here
  }

  public chartHovered(e: any): void {
    // your code here
  }

}
