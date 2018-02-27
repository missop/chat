const http = require('http');
const fs = require('fs');
const mysql = require('mysql');
const io = require('socket.io');
const url = require('url');

let db = mysql.createPool({host: 'localhost', user: 'root', password: 'root', database: 'chat'});
// 1.http服务
const httpServer = http.createServer((req, res) => {
    let {pathname, query} = url.parse(req.url, true);
    if (pathname == '/reg') {
        let {callback, user, pass} = query;
        // 1.校验数据
        if (!/^\w{6,32}$/.test(user)) {
            const errorData1 = JSON.stringify({code: 1, msg: '用户名不符合规范'});
            if (!callback) {
                res.write(errorData1);
            } else {
                res.write(callback + '(' + errorData1 + ')');
            }
            res.end();
        } else if (!/^.{6,32}$/.test(pass)) {
            const errorData2 = JSON.stringify({code: 1, msg: '密码不符合规范'});
            if (!callback) {
                res.write(errorData2);
            } else {
                res.write(callback + '(' + errorData2 + ')');
            }
            res.end();
        } else {
            // 2.检验用户名是否重复
            db.query(`SELECT * FROM usr_tab WHERE username='${user}'`, (err, data) => {
                if (err) {
                    const errorData3 = JSON.stringify({code: 1, msg: '数据库有错'});
                    if (!callback) {
                        res.write(errorData3);
                    } else {
                        res.write(callback + '(' + errorData3 + ')');
                    }
                    res.end();
                } else if (data.length > 0) {
                    const errorData4 = JSON.stringify({code: 1, msg: '用户名已存在'});
                    if (!callback) {
                        res.write(errorData4);
                    } else {
                        res.write(callback + '(' + errorData4 + ')');
                    }
                    res.end();
                } else {
                    // 3.插入数据
                    db.query(`INSERT INTO usr_tab (username,password,online) VALUES('${user}','${pass}',0)`, err => {
                        if (err) {
                            const errorData5 = JSON.stringify({code: 1, msg: '数据库有错'});
                            if (!callback) {
                                res.write(errorData5);
                            } else {
                                res.write(callback + '(' + errorData5 + ')');
                            }
                            res.end();
                        } else {
                            const errorData6 = JSON.stringify({code: 0, msg: '注册成功'});
                            if (!callback) {
                                res.write(errorData6);
                            } else {
                                res.write(callback + '(' + errorData6 + ')');
                            }
                            res.end();
                        }
                    })
                }
            })


        }

    } else if (pathname == '/login') {
        // 登录接口
    } else {
        fs.readFile(`www${res.url}`, (err, data) => {
            if (err) {
                res.writeHeader(404);
                res.write('Not Found');
            } else {
                res.write(data);
            }
            res.end();
        });
    }
});

httpServer.listen(8081);

// 2.websocket服务
const wsServer = io.listen(httpServer);

wsServer.on('connection', sock => {

});
