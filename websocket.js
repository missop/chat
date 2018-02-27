const http = require('http');
const fs = require('fs');
const mysql = require('mysql');
const io = require('socket.io');

let db = mysql.createPool({host: 'localhost', user: 'root', password: 'root', database: 'chat'});
// 1.http服务
const httpServer = http.createServer((req, res) => {

});

httpServer.listen(8081);

// 2.websocket服务
const wsServer = io.listen(httpServer);

wsServer.on('connection', sock => {

});