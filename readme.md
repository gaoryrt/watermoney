收水费工具的源代码，但是你不知道链接也没啥大用
你觉得数据库用户名密码我会放进来？

|前端                             |后端                          |
| --------------- | --------------- |
|访问，输入户号                   |                              |
|                                 |户号返回上次数据              |
|展示上次数据，用户输入本次数据   |                              |
|点击确定，提交数据到 temp        |                              |
|                                 |接收temp数据，发送 bark       |
|计算金额，展示收款码             |                              |
|                                 |接受 bark confirm，temp 入库  |
```shell
pm2 start back/index.js -n water
screen -r bark
./bark-server_linux_amd64 -addr 0.0.0.0:8080 -data ./bark-data
screen -d
```

代码部分，服务器的和本地的一样，就差这个 readme 没有改过
以后需要更新的话，后端是在服务器上直接 pull 然后 pm2 restart water3
前端的话，在服务器上 pull 然后 npm run build 就可以了，nginx 都是正常的
