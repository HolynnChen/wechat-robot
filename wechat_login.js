var http=require('http');
var https=require('https');
var request=require('request');
var querystring= require('querystring');
var fs=require('fs');

function wx_login(){
	var me=this;
	var uuid;
	var promise;
	var j;
	var user;
	var message;
	var contacter;
	var untonn;//user name to nick name
	var untogn;//predder to use RemarkName
	var message_deal;
	this.Init=()=>{
		me.j=request.jar();
		request = request.defaults({jar:j})
		me.user=new Array();
		me.message=new Array();
		me.contacter=new Array();
		me.untonn=new Array();
		me.untogn=new Array();
		me.user['DeviceID']="e" + ("" + Math.random().toFixed(15)).substring(2, 17);//copy from wechat's js which named index_e01fd8a.js
	};
	this.getuuid=(resolve,reject)=>{
		var options={
			url:'https://login.wx2.qq.com/jslogin?appid=wx782c26e4c19acffb&redirect_uri=https%3A%2F%2Fwx2.qq.com%2Fcgi-bin%2Fmmwebwx-bin%2Fwebwxnewloginpage&fun=new&lang=zh_CN',
			jar:me.j,
		}
		request.get(options,(e,r,b)=>{
			if(!e & r.statusCode==200){
				let re=b.match(/\s=\s.*?(?=;)/g);
				me.uuid=re[1].replace(' = ','').replace(/"/g,'');
				resolve(me.uuid);
			}
		})
	};
	this.checklogin=(resolve,reject)=>{
		var windowcode;
		var windowrespone;
		var options={
			url:'https://wx2.qq.com/cgi-bin/mmwebwx-bin/webwxstatreport?fun=new&lang=zh_CN',
			jar:me.j,
			json:{
				BaseRequest:{
					Uin:"",
					Sid:"",
					DeviceID:me.user.DeviceID,
				},
				Count:0,
				List:[],
			}
		}
		request.post(options,(e,r,b)=>{
			if(!e&r.statusCode==200)reqc();
		})
		//reqc();
		function reqc(){
			var options={
				url:'https://login.wx2.qq.com/cgi-bin/mmwebwx-bin/login?loginicon=true&uuid='+me.uuid+'&tip=1&r='+~Date.now(),
				jar:me.j
			}
			request.get(options,(e,r,b)=>{
				if(!e & r.statusCode==200){
					windowrespone=b;
					windowcode=b.split(';')[0].split('=')[1];
					if(windowcode!=201){
						reqc();
					}else{
						resolve(b.match(/'.*?'/g)[0]);
					};
				}
			})
		}
	};
	this.checkloginconfirm=(resolve,reject)=>{
		var windowcode;
		var windowrespone;
		reqc();
		function reqc(){
			var options={
				url:'https://login.wx2.qq.com/cgi-bin/mmwebwx-bin/login?loginicon=true&uuid='+me.uuid+'&tip=0&r='+~Date.now(),
				jar:me.j,
			}
			request.get(options,(e,r,b)=>{
				if(!e & r.statusCode==200){
					windowrespone=b;
					windowcode=b.split(';')[0].split('=')[1];
					if(windowcode!=200){
						reqc();
					}else{
						var options={
							url:b.match(/".*?"/g)[0].replace(/"/g,'')+'&fun=new&version=v2&lang=zh_CN',
							jar:me.j,
						}
						request.get(options,(e,r,b)=>{
							if(!e&r.statusCode==200){
								//console.log(b);
								me.user['skey']=b.match(/\<skey\>.*?(?=\<\/skey\>)/)[0].replace('<skey>','');
								me.user['pass_ticket']=b.match(/\<pass_ticket\>.*?(?=\<\/pass_ticket\>)/)[0].replace('<pass_ticket>','');
								me.user['wxsid']=b.match(/\<wxsid\>.*?(?=\<\/wxsid\>)/)[0].replace('<wxsid>','');
								me.user['uin']=b.match(/\<wxuin\>.*?(?=\<\/wxuin\>)/)[0].replace('<wxuin>','');
								resolve(me.user);
							}
						})
					};
				}
			})
		}
	};
	this.allinit=(resolve,reject)=>{
		var options={
			url:'https://wx2.qq.com/cgi-bin/mmwebwx-bin/webwxinit?r='+~Date.now()+'&lang=zh_CN&pass_ticket='+me.user.pass_ticket,
			jar:me.j,
			json:{BaseRequest:{
					Uin:me.user.uin,
					Sid:me.user.wxsid,
					Skey:me.user.skey,
					DeviceID:me.user.DeviceID,
				}},
		}
		request.post(options,(e,r,b)=>{
			if(!e & r.statusCode==200){
				me.message['SyncKey']=b.SyncKey;
				me.user['UserName']=b.User.UserName;
				me.user['NickName']=b.User.NickName;
				var options={
					url:'https://wx2.qq.com/cgi-bin/mmwebwx-bin/webwxgetcontact?lang=zh_CN&pass_ticket='+me.user.pass_ticket+'&r='+~Date.now()+'&seq=0&skey='+me.user.skey,
					jar:me.j,
				};
				request.get(options,(e,r,b)=>{
					if(!e&r.statusCode==200){
						b=JSON.parse(b);
						me.contacter=b;
						for(let num=0;num<b.MemberList.length;num++){
							me.untonn[b.MemberList[num].UserName]=b.MemberList[num].NickName;
							b.MemberList[num].RemarkName!=''?me.untogn[b.MemberList[num].UserName]=b.MemberList[num].RemarkName:me.untogn[b.MemberList[num].UserName]=b.MemberList[num].NickName;
						}//初始化名单
						//resolve('Finish');
						var options={
							url:'https://wx2.qq.com/cgi-bin/mmwebwx-bin/webwxstatusnotify?lang=zh_CN&pass_ticket='+me.user.pass_ticket,
							jar:me.j,
							json:{
								BaseRequest:{
									Uin:me.user.uin,
									Sid:me.user.wxsid,
									Skey:me.user.skey,
									DeviceID:me.user.DeviceID,
								},
								ClientMsgId:Date.now(),
								Code:3,
								FromUserName:me.user.UserName,
								ToUserName:me.user.UserName,
							}
						};
						request.post(options,(e,r,b)=>{
							if(!e&r.statusCode==200){
								//console.log(b);
								resolve(b);
							}
						})
					}
				})
			}
		})
	};
	this.waitforsync=(resolve,reject)=>{
		me.message_deal=me.message_deal||me._dealmsg_;
		reqc();
		function reqc(){
			var options={
				url:'https://webpush.wx2.qq.com/cgi-bin/mmwebwx-bin/synccheck?r='+Date.now()+'&skey='+me.user.skey+'&sid='+me.user.wxsid+'&uin='+me.user.uin+'&deviceid='+me.user.DeviceID+'&synckey='+me.getsyncstring(),
				//jar:nj,
				jar:me.j,
			}
			request.get(options,(e,r,b)=>{
				if(!e&r.statusCode==200){
					if(me.message_deal=="null")return;
					if(me.message_deal=="exit"){resolve(b);return;};
					b=b.match(/\{.*?\}/g)[0].replace('{','').replace('}','').split(',');
					if(b[0].split(':')[1]!='"0"'){console.log('异常退出');reject('reason:retcode='+b[0].split(':')[1]);return;};
					if(b[0].split(':')[1]!='"0"' || b[1].split(':')[1]!='"0"'){deal();}else{reqc()};
					//console.log(b);
					//if(b.match(/"0"/g).length!=2){deal();}else{reqc();};
					//reqc(options);
				}
			})
		}
		function deal(){
			var options={
				url:'https://wx2.qq.com/cgi-bin/mmwebwx-bin/webwxsync?sid='+me.user.wxsid+'&skey='+me.user.skey+'&lang=zh_CN&pass_ticket='+me.user.pass_ticket,
				jar:me.j,
				json:{
					BaseRequest:{
						Uin:me.user.uin,
						Sid:me.user.wxsid,
						Skey:me.user.skey,
						DeviceID:me.user.DeviceID,
					},
					SyncKey:me.message.SyncKey,
					rr:~Date.now(),
				}
			}
			request.post(options,(e,r,b)=>{
				if(!e&r.statusCode==200){
					if(me.message_deal=="null")return;
					if(me.message_deal=="exit"){resolve(b);return;};
					me.message['SyncKey']=b.SyncKey;
					//me.message_deal(b.AddMsgList);
					for(let i=0;i<b.AddMsgList.length;i++)me.message_deal(b.AddMsgList[i]);
					reqc();
				}
			})
		}
	};
	this.search=(list,pass,resolve)=>{
		if(list==[]){resolve(pass);return;}
		var options={
			url:'https://wx2.qq.com/cgi-bin/mmwebwx-bin/webwxbatchgetcontact?type=ex&r='+Date.now()+'&lang=zh_CN&pass_ticket='+me.user.pass_ticket,
			jar:me.j,
			json:{
				BaseRequest:{
					Uin:me.user.uin,
					Sid:me.user.wxsid,
					Skey:me.user.skey,
					DeviceID:me.user.DeviceID,
				},
				Count:list.length,
				List:list,

			}
		}
		request.post(options,(e,r,b)=>{
			if(!e&r.statusCode==200){
				//me.untonn[b.ContactList[0].UserName]=b.ContactList[0].NickName;
				for(let i=0;i<b.ContactList.length;i++)me.untonn[b.ContactList[i].UserName]=b.ContactList[i].NickName;
				resolve(pass);
			}
		})
	}

	//base function
	this.getsyncstring=()=>{
		let io=[];
		for(let i=0;i<me.message.SyncKey.List.length;i++)io.push(me.message.SyncKey.List[i].Key+'_'+me.message.SyncKey.List[i].Val);
		return io.join('|'); 
		//return encodeURIComponent(io.join('|'));
	}
	this._msglist_=(UserName,EncryChatRoomId)=>{EncryChatRoomId=EncryChatRoomId||'';return {UserName:UserName,EncryChatRoomId:EncryChatRoomId,}};

	//the function of deal with new message
	this._dealmsg_=(msg)=>{//默认仅支持文本，图片
		switch(msg.MsgType){
			case 1://text message
				let ps=[];
				let pass=new Array();
				if(msg.FromUserName[1]=='@'||msg.ToUserName[1]=='@'){//群消息
					if(msg.FromUserName!=me.user.UserName){
						if(!me.untonn[msg.FromUserName]){//没有保存在联系库中的群名字
							ps.push(me._msglist_(msg.FromUserName));
						};
						let qm=msg.Content.indexOf(':<br/>');
						let postername=msg.Content.substring(0,qm);
						let content=msg.Content.substring(qm+6);
						if(!(me.untogn[postername]||me.untonn[postername])){//没有保存在联系库中的人名
							ps.push(me._msglist_(postername,msg.FromUserName));
						};
						pass['postername']=postername;
						pass['FromUserName']=msg.FromUserName;
						pass['content']=content;
						var doit=(pass)=>{
							var postername=me.untogn[pass.postername]||me.untonn[pass.postername];
							console.log('群【'+me.untonn[pass.FromUserName]+'】 【'+postername+'】:'+pass.content);
						};
						me.search(ps,pass,doit);
					}else{
						if(!(me.untogn[msg.ToUserName]||me.untonn[msg.ToUserName])){//没有保存在联系库中的群名字
							ps.push(me._msglist_(msg.ToUserName));
						};
						pass['ToUserName']=msg.ToUserName;
						pass['content']=msg.Content;
						var doit=(pass)=>{
							console.log('我 -> 群【'+me.untonn[pass.ToUserName]+'】:'+pass.content)
						}
						me.search(ps,pass,doit)
					}
				}else{//非群消息
					if(msg.FromUserName!=me.user.UserName){
						if(!(me.untogn[msg.FromUserName]||me.untonn[msg.FromUserName])){
							ps.push(me._msglist_(FromUserName));
						};
						pass['FromUserName']=msg.FromUserName;
						pass['content']=msg.Content;
						var doit=(pass)=>{
							var postername=me.untogn[pass.FromUserName]||me.untonn[pass.FromUserName];
							console.log('【'+postername+'】:'+pass.content);
						};
						me.search(ps,pass,doit);
					}else{
						if(!(me.untogn[msg.ToUserName]||me.untonn[msg.ToUserName])){
							ps.push(me._msglist_(ToUserName));
						};
						pass['ToUserName']=msg.ToUserName;
						pass['content']=msg.Content;
						var doit=(pass)=>{
							var recevier=me.untogn[pass.ToUserName]||me.untonn[pass.ToUserName];
							console.log('我 -> 【'+recevier+'】:'+pass.content);
						};
						me.search(ps,pass,doit);
					}
				};
				break;

		}

	}
}
module.exports =wx_login;

//something you would want to konw
/*
msgtype of wechatmsg, you can deal with it to do what you want to do.

MSGTYPE_TEXT: 1,
MSGTYPE_IMAGE: 3,
MSGTYPE_VOICE: 34,
MSGTYPE_VIDEO: 43,
MSGTYPE_MICROVIDEO: 62,
MSGTYPE_EMOTICON: 47,
MSGTYPE_APP: 49,
MSGTYPE_VOIPMSG: 50,
MSGTYPE_VOIPNOTIFY: 52,
MSGTYPE_VOIPINVITE: 53,
MSGTYPE_LOCATION: 48,
MSGTYPE_STATUSNOTIFY: 51,
MSGTYPE_SYSNOTICE: 9999,
MSGTYPE_POSSIBLEFRIEND_MSG: 40,
MSGTYPE_VERIFYMSG: 37,
MSGTYPE_SHARECARD: 42,
MSGTYPE_SYS: 10000,
MSGTYPE_RECALLED: 10002,  // 撤销消息
*/