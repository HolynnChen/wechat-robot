var app=require('http').createServer(handler);
var io=require('socket.io')(app);
var fs=require('fs');

function wechat_server(){
	var port=8080;
	this.io=io;
	this.start=(project)=>{project=project||defalut;app.listen(port);io.on('connection',socket=>project(socket))};
	this.close=()=>{app.close()};
	this.send=(data)=>{io.emit('msg',data)};
	this.send_pro=(signal,data)=>{io.emit(signal,data)};
}

function handler(req,res){
	fs.readFile(__dirname + '/index.html',
		function (err, data) {
			if (err) {
				res.writeHead(500);
				return res.end('Error loading index.html');
			}

			res.writeHead(200);
			res.end(data);
		});
}

function defalut(socket){
	socket.on('msg',function(data){
		console.log(data.msg);
	})
}
module.exports =wechat_server;