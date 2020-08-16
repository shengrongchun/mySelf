const nodemailer = require('nodemailer'); //  引入邮件模块
const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const fs = require('fs');
//
const app = express();
//post body体解析
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//
//将静态资源文件所在的目录作为参数传递给 express.static 中间件就可以提供静态资源文件的访问了
app.use('/',express.static(path.resolve(__dirname, './dist/')));
app.use(function(req, res) {
	if(req.url == '/send') {
    sendEmail(req.body.data,res);
	}else {
		const html = fs.readFileSync(path.resolve(__dirname, './dist/index.html'), 'utf-8');
		res.send(html);
	}
});
//
app.listen(3000);
console.log('server starting 3000');
//
function getHtml(item) {
  let html = '';
  Object.keys(item).forEach((key)=> {
    html +='<p>'+key+': '+item[key]+'</p>'
  });
  return html;
}
function sendEmail(params, res) {
  const {user, pass, subject, emailColumn, tableData} = params;
	nodemailer.createTestAccount((err, account) => {
		let transporter = nodemailer.createTransport({
			host: 'smtp.qq.com', //QQ邮箱的SMTP服务器
			port: 587, //QQ邮箱的SMTP服务器的端口为465或587
			secure: false, // true for 465, false for other ports
			auth: {
				user, // 刚刚申请授权码的邮箱账号
				pass // 刚刚申请的授权码
			}
		});
    //
		let message = {
			from: user, // 这里必须是刚刚申请授权码的邮箱账号
			subject, // Subject line
			text: '文本', // plain text body
		};
    const resData = {};
    let Index = 0;
    tableData.forEach((item)=> {
      const to = item[emailColumn];
      const html  = getHtml(item);
      message.to = to;
      message.html = html;
      //
      transporter.sendMail(message , (error, info) => {
        Index +=1;
				if (!error) {
          const {to} = info.envelope;
					resData[to[0]] = true;
        }
        if(Index===tableData.length) {
          res.send(resData);
        }
		  });
    });
    //
	});
}
