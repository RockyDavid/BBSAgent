# BBS Agent

## Introduction
輸入telnet://{BBS站位址}送出可以進入該站台。

## Agenda
1. express 架設後段
2. ejs 建立前端
3. ws 建立與前端連線
4. telnet-client 在ws收到訊息後連接指定BBS站台
5. 將返回訊息使用uao-js進行big5-uao轉utf8
6. 再將utf8的ansi字串，使用ansi-to-pre轉換成html
7. 前端使用字型uming.ttc顯示

## Reference
+ [express](https://www.npmjs.com/package/express)
+ [ejs](https://www.npmjs.com/package/ejs)
+ [ws](https://www.npmjs.com/package/ws)
+ [telnet-client](https://www.npmjs.com/package/telnet-client)
+ [uao-js](https://www.npmjs.com/package/uao-js)
+ [ansi-to-pre](https://www.npmjs.com/package/ansi-to-pre)
+ [uming.ttc](https://launchpad.net/ubuntu/+source/fonts-arphic-uming/0.2.20080216.2-10ubuntu2)
+ [ukai.ttc](https://packages.debian.org/zh-tw/sid/fonts-arphic-ukai)
