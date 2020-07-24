// area chart
export const ordersChartData: Array<any> = [
  { data: [0, 150, 140, 105, 190] }
];
export const salesChartData: Array<any> = [
  { data: [0, 140, 90, 200, 230] }
];
export const customersChartData: Array<any> = [
  { data: [0, 20, 60, 120, 200] }
];
export const basketChartData: Array<any> = [
  { data: [0, 40, 150, 100, 190] }
];

export const areaChartLabels: Array<any> = ['', '06:00', '12:00', '18:00', '24:00'];
export const ordersChartOptions: any = {
  animation: {
    duration: 1000, // general animation time
    easing: 'easeOutBack'
  },
  hover: {
    animationDuration: 1000, // duration of animations when hovering an item
  },
  responsiveAnimationDuration: 1000, // animation duration after a resize
  responsive: true,
  maintainAspectRatio: false,
  tooltips: {
    backgroundColor: '#1c2a6b'
  },
  scales: {
    xAxes: [{
      display: true,
      gridLines: {
        color: '#f3f3f3',
        drawTicks: false,
      },
      ticks: {
        padding: 15
      }
    }],
    yAxes: [{
      display: true,
      gridLines: {
        color: '#f3f3f3',
        drawTicks: false
      },
      ticks: {
        stepSize: 1,
        padding: 15
      }
    }]
  },
  title: {
    display: true,
    text: 'Orders'
  }
};
export const salesChartOptions: any = {
  animation: {
    duration: 1000, // general animation time
    easing: 'easeOutBack'
  },
  hover: {
    animationDuration: 1000, // duration of animations when hovering an item
  },
  responsiveAnimationDuration: 1000, // animation duration after a resize
  responsive: true,
  maintainAspectRatio: false,
  tooltips: {
    backgroundColor: '#1c2a6b'
  },
  scales: {
    xAxes: [{
      display: true,
      gridLines: {
        color: '#f3f3f3',
        drawTicks: false,
      },
      ticks: {
        padding: 15
      }
    }],
    yAxes: [{
      display: true,
      gridLines: {
        color: '#f3f3f3',
        drawTicks: false,
      },
      ticks: {
        padding: 15
      }
    }]
  },
  title: {
    display: true,
    text: 'Sales'
  }
};
export const customersChartOptions: any = {
  animation: {
    duration: 1000, // general animation time
    easing: 'easeOutBack'
  },
  hover: {
    animationDuration: 1000, // duration of animations when hovering an item
  },
  responsiveAnimationDuration: 1000, // animation duration after a resize
  responsive: true,
  maintainAspectRatio: false,
  tooltips: {
    backgroundColor: '#1c2a6b'
  },
  scales: {
    xAxes: [{
      display: true,
      gridLines: {
        color: '#f3f3f3',
        drawTicks: false,
      },
      ticks: {
        padding: 15
      }
    }],
    yAxes: [{
      display: true,
      gridLines: {
        color: '#f3f3f3',
        drawTicks: false,
      },
      ticks: {
        stepSize: 1,
        padding: 15
      }
    }]
  },
  title: {
    display: true,
    text: 'Customers'
  }
};
export const basketChartOptions: any = {
  animation: {
    duration: 1000, // general animation time
    easing: 'easeOutBack'
  },
  hover: {
    animationDuration: 1000, // duration of animations when hovering an item
  },
  responsiveAnimationDuration: 1000, // animation duration after a resize
  responsive: true,
  maintainAspectRatio: false,
  tooltips: {
    backgroundColor: '#1c2a6b'
  },
  scales: {
    xAxes: [{
      display: true,
      gridLines: {
        color: '#f3f3f3',
        drawTicks: false,
      },
      ticks: {
        padding: 15
      }
    }],
    yAxes: [{
      display: true,
      gridLines: {
        color: '#f3f3f3',
        drawTicks: false,
      },
      ticks: {
        padding: 15
      }
    }]
  },
  title: {
    display: true,
    text: 'Avg Basket Value'
  }
};
export const areaChartLegend = false;
export const areaChartType = 'line';
