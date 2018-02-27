/*
 规定接口：
 注册接口:/reg
 登录接口:/loggin
 */

// 一段：先搞个http服务
/*const http = require('http');
 const httpServer = http.createServer(function (req, res) {
 // 使得显示的文字是中文(防止乱码)
 res.writeHead(200,{'Content-Type':'text/html;charset=utf-8'});
 // 显示出文字
 res.end('创建完成！');
 });
 httpServer.listen(8080);*/

// 二段：添加路由
/*const http = require('http');
 const url=require('url');
 const httpServer = http.createServer(function (req, res) {
 // 后台显示文字
 console.log(req.url);
 console.log(url.parse(req.url,true));
 // 使得显示的文字是中文(防止乱码)
 res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
 // 网页上显示出文字
 res.end('创建完成！');
 });
 httpServer.listen(8080);*/

// 三段：路由校验
/*
 const http = require('http');
 const url = require('url');
 const mysql = require('mysql');
 const regExp = {
 // 6-12位的用户名
 usr: /^[a-zA-Z]{1}([a-zA-Z0-9]){5,11}$/,
 // 6-12位密码
 pass: /^(\w){6,12}$/
 };
 // 数据处理函数
 let resolve = function (msg, callback, res, code) {
 // 处理jsonp请求
 const errData = JSON.stringify({code: code, msg: msg});
 if (!callback) {
 // 不是jsonp请求，直接输出
 res.write(errData);
 } else {
 // 是jsonp，那么需要传回调函数
 res.write(callback + '(' + errData + ')');
 }
 res.end();
 };
 // 创建数据库
 const db = mysql.createPool({host: 'localhost', user: 'root', password: 'root', database: 'chat'});
 const httpServer = http.createServer(function (req, res) {
 let {pathname, query} = url.parse(req.url, true);
 // 判断是注册还是登录
 if (pathname == '/reg') {
 // 是注册的话，就会有用户名和密码这两个参数，再加上jsonp的回调函数
 let {callback, username, password} = query;
 // 进行数据校验：用户名是否符合规范？密码是否符合规范？用户名是否重复？最后把用户名添加到数据库
 if (!regExp.usr.test(username)) {
 // 用户名不符合规范
 resolve('用户名不符合规范', callback, res, 1);
 } else if (!regExp.pass.test(password)) {
 resolve('密码不符合规范', callback, res, 1);
 } else {
 // `'${username}'`的疑问
 db.query(`SELECT * FROM usr_tab WHERE username='${username}'`, (err, data) => {
 if (err) {
 resolve('查询数据库错误', callback, res, 1);
 } else if (data.length > 0) {
 resolve('用户名已存在', callback, res, 1);
 } else {
 db.query(`INSERT INTO usr_tab (username,password,online) VALUES ('${username}','${password}',0)`, err => {
 if (err) {
 resolve('添加时数据库错误', callback, res, 1);
 } else {
 resolve('注册成功', callback, res, 0);
 }
 })
 }
 })
 }
 } else if (pathname == '/loggin') {
 let {callback, username, password} = query;
 if (!regExp.usr.test(username)) {
 resolve('用户名不符合规范', callback, res, 1);
 } else if (!regExp.pass.test(password)) {
 resolve('密码不符合规范', callback, res, 1);
 } else {
 db.query(`SELECT ID,password FROM usr_tab WHERE username='${username}'`, (err, data) => {
 if (err) {
 resolve('查询数据库错误', callback, res, 1);
 } else if (data.length == 0) {
 resolve('用户名不存在', callback, res, 1);
 } else if (data[0].password != password) {
 resolve('用户名或密码不正确', callback, res, 1);
 } else {
 db.query(`UPDATE usr_tab SET online=1 WHERE ID=${data[0].ID}`, err => {
 if (err) {
 resolve('登录状态修改失败', callback, res, 1);
 } else {
 resolve('登录成功', callback, res, 0);
 }
 })
 }
 }
 )
 }
 }
 });
 httpServer.listen(8081);
 */

// 四段：websocket
const http = require('http');
const mysql = require('mysql');
const io = require('socket.io');
const regExp = {
    // 6-12位的用户名
    usr: /^[a-zA-Z]{1}([a-zA-Z0-9]){5,11}$/,
    // 6-12位密码
    pass: /^(\w){6,12}$/
};

// 创建数据库
const db = mysql.createPool({host: 'localhost', user: 'root', password: 'root', database: 'chat'});
const httpServer = http.createServer(function (req, res) {
    fs.readFile(`www${req.url}`, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.write('not Found');
            } else {
                res.write(data);
            }
        }
    )
});
httpServer.listen(8081);
const wsServer = io.listen(httpServer);
let aSock = [];
wsServer.on('connection', sock => {
    let cur_username = '';
    let cur_userID = 0;
    aSock.push(sock);
    sock.on('reg', (user, pass) => {
        if (!regExp.usr.test(user)) {
            sock.emit('reg_ret', 1, '用户名不符合规范');
        } else if (!regExp.pass.test(pass)) {
            sock.emit('reg_ret', 1, '密码不符合规范');
        } else {
            db.query(`SELECT ID FROM usr_tab WHERE username='${user}'`, (err, data) => {
                if (err) {
                    sock.emit('reg_ret', 1, '查询数据出错');
                } else if (data.length > 0) {
                    sock.emit('reg_ret', 1, '用户名已存在');
                } else {
                    db.query(`INSERT INTO usr_tab (username,password,online) VALUES ('${user}','${pass}',0)`, err => {
                        if (err) {
                            sock.emit('reg_ret', 1, '插入数据出错');
                        } else {
                            sock.emit('reg_ret', 0, '注册成功')
                        }
                    })
                }
            })
        }
    });
    sock.on('loggin', (user, pass) => {
        if (!regExp.usr.test(user)) {
            sock.emit('loggin_ret', 1, '用户名不符合规范');
        } else if (!regExp.pass.test(pass)) {
            sock.emit('loggin_ret', 1, '密码不符合规范');
        } else {
            db.query(`SELECT ID,password FROM usr_tab WHERE username='${user}'`, (err, data) => {
                if (err) {
                    sock.emit('loggin_ret', 1, '查询数据出错');
                } else if (data.length == 0) {
                    sock.emit('loggin_ret', 1, '此用户不存在');
                } else if (data[0].password != pass) {
                    sock.emit('loggin_ret', '用户名或者密码错误');
                } else {
                    db.query(`UPDATE usr_tab SET online=1 WHERE username='${user}'`, err => {
                        if (err) {
                            sock.emit('loggin_ret', 1, '修改登录状态错误');
                        } else {
                            sock.emit('loggin_ret', 0, '登录成功');
                            cur_username = user;
                            cur_userID = data[0].ID;
                        }
                    })
                }
            })
        }
    });
    sock.on('msg', txt => {
        if (!txt) {
            sock.emit('msg_ret', 1, '文本消息不能为空');
        } else {
            // 广播给所有人
            aSock.forEach(item => {
                // 把自己跳过去
                if (item == sock) return;
                // 把消息发送给所有人
                item.emit('msg', cur_username, txt);
            });

            sock.emit('msg_ret', 0, '发送成功');
        }
    });
    sock.on('disconnect', function () {
        db.query(`UPDATE usr_tab SET online=0 WHERE ID='${cur_userID}'`, err => {
            if (err) {
                console.log('数据库有错', err);
            }
            cur_username = '';
            cur_userID = 0;

            // 把离线的人去除掉
            aSock = aSock.filter(item => item != sock);
        })
    })
});

