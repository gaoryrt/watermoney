|前端                             |后端                          |
| --------------- | --------------- |
|访问，输入户号                   |                              |
|                                 |户号返回上次数据              |
|展示上次数据，用户输入本次数据   |                              |
|点击确定，提交数据到 temp        |                              |
|                                 |接收temp数据，发送 bark       |
|计算金额，展示收款码             |                              |
|                                 |接受 bark confirm，temp 入库  |

pm2 start back/index.js -n water
screen -r bark
./bark-server_linux_amd64 -addr 0.0.0.0:8080 -data ./bark-data
screen -d
