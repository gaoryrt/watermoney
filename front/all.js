import dayjs from 'dayjs';
import { LineChart } from 'echarts/charts';
import {
  DatasetComponent, GridComponent, TitleComponent,
  TooltipComponent, TransformComponent
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  DatasetComponent,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  TransformComponent,
  LineChart,
  CanvasRenderer,
  UniversalTransition
]);

var ROOT_PATH =
  'https://cdn.jsdelivr.net/gh/apache/echarts-website@asf-site/examples';

var chartDom = document.getElementById('main');
var myChart = echarts.init(chartDom);
var option;

function getJSON(url) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;
      if (status === 200) {
        resolve(xhr.response);
      } else {
        reject(status);
      }
    };
    xhr.send();
  });
}

getJSON('https://42.gaoryrt.com/water/whatsup').then(console.log)

const data = [{"_id":"6191c46f9b91899016794a79","door":203,"history":[{"val":2518,"ts":1609430400},{"val":2575,"ts":1617206400},{"val":2623,"ts":1622476800},{"val":2735.2,"ts":1637058350}],"temp":null},{"_id":"6191c5229b91899016794a7b","door":306,"history":[{"val":1984,"ts":1622476800},{"val":1985,"ts":1630425600},{"val":1987,"ts":1636971304}],"temp":null},{"_id":"6191c52d9b91899016794a7c","door":407,"history":[{"val":46,"ts":1622476800},{"val":58,"ts":1627747200},{"val":79,"ts":1636991944}],"temp":null},{"_id":"6191c5429b91899016794a7d","door":611,"history":[{"val":870,"ts":1622476800},{"val":879,"ts":1627747200},{"val":886,"ts":1630425600},{"val":892,"ts":1636972239}],"temp":null},{"_id":"6191c55a9b91899016794a7e","door":612,"history":[{"val":1524,"ts":1622476800},{"val":1539,"ts":1627747200},{"val":1548,"ts":1630425600},{"val":1561,"ts":1636970730}],"temp":null},{"_id":"6191c56a9b91899016794a7f","door":408,"history":[{"val":881,"ts":1622476800},{"val":907,"ts":1627747200},{"val":921,"ts":1630425600}],"temp":null},{"_id":"6191c5789b91899016794a80","door":509,"history":[{"val":119,"ts":1622476800},{"val":122,"ts":1627747200},{"val":173.2,"ts":1637033440},{"val":173.11,"ts":1637032475},{"val":173.1,"ts":1636968567},{"val":173,"ts":1630425600},{"val":173.3,"ts":1637047500}],"temp":{"val":176,"ts":1637051009}},{"_id":"6191c5879b91899016794a81","door":305,"history":[{"val":113,"ts":1604160000},{"val":140,"ts":1609430400},{"val":205,"ts":1622476800}],"temp":{}},{"_id":"6191c5999b91899016794a82","door":510,"history":[{"val":120,"ts":1604160000},{"val":133,"ts":1606752000},{"val":145,"ts":1609430400}],"temp":{}},{"_id":"6191c5ab9b91899016794a83","door":204,"history":[{"val":2008,"ts":1609430400},{"val":2024,"ts":1614528000},{"val":2035,"ts":1617206400}],"temp":{}},{"_id":"6191c5c39b91899016794a84","door":101,"history":[{"val":984,"ts":1604160000},{"val":1005,"ts":1606752000},{"val":1026,"ts":1609430400}],"temp":{}},{"_id":"6191c5d29b91899016794a85","door":102,"history":[{"val":828,"ts":1577808000},{"val":835,"ts":1580486400}],"temp":{}}]
const doors = [101, 102, 203, 204, 305, 306, 407, 408, 509, 510, 611, 612]
const fromDatasetId = 'fromDatasetId'

run(data.reduce((pre, cur) => {
  return pre.concat(cur.history.map(i => [cur.door, i.ts * 1000, i.val]))
}, [['door', 'ts', 'val']]))

function run(_rawData) {
  option = {
    dataset: [
      {
        id: fromDatasetId,
        source: _rawData
      },
      ...doors.map(door => ({
        id: `${door}`,
        fromDatasetId: fromDatasetId,
        transform: {
          type: 'filter',
          config: { dimension: 'door', '=': door }
        }
      }))
    ],
    title: {
      text: '详情'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
        axis: 'y'
      }
    },
    xAxis: {
      type: 'time'
    },
    yAxis: {
      name: 'val'
    },
    series: doors.map(door => {
      return {
        type: 'line',
        datasetId: `${door}`,
        showSymbol: false,
        encode: {
          x: 'ts',
          y: 'val',
          itemName: 'ts',
          tooltip: ['door', 'val']
        }
      }
    })
  };
  myChart.setOption(option);
}

option && myChart.setOption(option);
