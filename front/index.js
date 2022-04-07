import { get, post } from 'axios';
import day from 'dayjs';
import Decimal from 'decimal.js';
import './main.css';

const $ = s => document.querySelector(s)
const hide = s => $(s).classList.add('_hide')
const show = s => $(s).classList.remove('_hide')

let door = 0
let lastVal = 0
let lastTs

$('.p1 .btn').addEventListener('click', () => {
  door = Number($('.p1 .select').value)
  hide('.p1')
  show('.sp')
  $('#door').innerText = door
  get('/water/getLastData', {
    params: { door }
  }).then(({ data }) => {
    hide('.sp')
    show('.p2')
    const history = data[0].history
    const { val, ts } = history.sort((a, b) => b.ts - a.ts)[0]
    lastVal = val
    lastTs = new Date(Math.max(ts, 1640880000) * 1000)
    $('#val').innerText = val
    $('#ts').innerText = day(ts * 1000).format('YYYY年MM月DD日 HH:mm')
  })
})

$('.p2 .btn').addEventListener('click', () => {
  const val = Number($('.p2 .input').value)
  if (val < lastVal) return alert('新的数据需大于上次数据')
  hide('.p2')
  show('.sp')
  const now = new Date()
  const ts = Math.floor(now / 1000)
  post('/water/saveTemp', {
    door,
    val,
    ts
  }).then(({ data }) => {
    const alpha = new Decimal(val).minus(lastVal)
    $('#alpha').innerText = alpha
    const wprice = alpha.mul(3.1)
    $('#wprice').innerText = wprice
    const duration = (now.getYear() - lastTs.getYear()) * 12 + now.getMonth() - lastTs.getMonth()
    $('#duration').innerText = duration
    const gprice = duration * 8
    $('#gprice').innerText = gprice
    $('#total').innerText = wprice.plus(gprice)
    hide('.sp')
    show('.p3')
  })
})

$('body').style.opacity = 1
