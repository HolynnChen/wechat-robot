var events=require('events');
var url=require('url');
var wechat_login=require('./wechat_login');
var wechat_server=require('./wechat_server');

var wx_server=new wechat_server();//开启测试服务器
var wx_login=new wechat_login();

var EU=new wechat_sum();//EU=easy use

EU.GetUuid_Init().//初始化并获取uuid
then(EU.SendLoginImg).
then(EU.GetAndSendUserImg).
then(EU.GetBaseMessage).
then(EU.WaitForNewMessage).
then(EU.Console).
catch((err)=>{console.log(err)});

function wechat_sum(){
	this.GetUuid_Init=()=>{
		wx_login.Init();
		return new Promise((resolve,reject)=>{
			wx_login.getuuid(resolve,reject);
			})//relove uuid
	};
	this.SendLoginImg=(value)=>{
		//console.log(value);
		console.log('please scan the wecaht login code on 127.0.0.1:8080');
		wx_server.start((socket)=>{
			socket.emit('msg',{
				data:'<img src="https://login.weixin.qq.com/qrcode/'+value+'">'
			});
		});
		return new Promise((resolve,reject)=>{wx_login.checklogin(resolve,reject);});
	};
	this.GetAndSendUserImg=(value)=>{
		wx_server.send({data:'<img src='+value+'>'});
		return new Promise((resolve,reject)=>{wx_login.checkloginconfirm(resolve,reject);});
	};
	this.GetBaseMessage=(value)=>{
		return new Promise((resolve,reject)=>{wx_login.allinit(resolve,reject);});
	};
	this.WaitForNewMessage=(value)=>{
		console.log('Waiting for new Message...');
		return new Promise((resolve,reject)=>{wx_login.waitforsync(resolve,reject);});
	};
	this.Console=(value)=>{
		console.log(value)
	};
}