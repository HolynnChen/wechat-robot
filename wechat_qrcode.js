var gp=require("get-pixels")
var c = require('colors');

gp("test.jpg",(e,p)=>{
	if(e){
		console.log('bad image path');
		return;
	}
	var qdo=10;
	for(let i=25;i<=405;i+=qdo){
		var o=[];
		for(let t=25;t<=405;t+=qdo){
			if(p.get(i,t,0)<200){o+=c.black('█')}else{o+=c.white('█')}
		};
		console.log(o);
	}
})