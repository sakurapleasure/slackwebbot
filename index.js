/*
Copyright 2017 Reiju

Permission is hereby granted, free of charge, to any person obtaining a copy of this 
software and associated documentation files (the "Software"), to deal in the Software 
without restriction, including without limitation the rights to use, copy, modify, 
merge, publish, distribute, sublicense, and/or sell copies of the Software, and to 
permit persons to whom the Software is furnished to do so, subject to the following 
conditions:

The above copyright notice and this permission notice shall be included in all copies 
or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT 
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF 
CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR 
THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var RtmClient = require("@slack/client").RtmClient;
var WebClient = require("@slack/client").WebClient;
var RTM_EVENTS = require("@slack/client").RTM_EVENTS;
var webshot = require("webshot");
var fs = require("fs");

var token = process.env.SLACK_API_TOKEN || "";
var rtm = new RtmClient(token, {logLevel: "normal"});
var web = new WebClient(token);
rtm.start();

var prefix="reiju:"
var regex = /.*?\<(.+?)[|\>].*/

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
	//var message = {text: "reiju: <https://google.com>"};
	console.log(message.text);
	try {
		url = message.text.match(regex);
	} catch(e) {
		web.chat.postMessage("reiju", "Error: 文字列関係がア！", function(err, res) {
			console.log(err, res);
		});
	}
	if (url) {
		console.log(url[0].indexOf("reiju:"));
		if(url[0].indexOf("reiju:") != -1) {
			console.log("match! ", url[1]);
			var filePath = __dirname+"/img/"+Date.now()+".png";
			var urlstr = url[1];
			
			const promise = new Promise((resolve, reject) => {
				webshot(url[1], filePath, {shotSize: {width: "all", height: "all"}}, function(err) {
					if(err) {
						web.chat.postMessage(message.channel, "PhantomJSが限界になった(error)", {as_user: true}, function(err, res) {
							console.log(err, res);
						});
						console.log(err);
						reject();
					}
					resolve();
				});
			});
			promise.then(() => web.files.upload("phantom: "+urlstr, {file: fs.createReadStream(filePath), channels: message.channel, title: "phantom: "+urlstr}, function handleStreamFileUpload(err, res) {
				console.log(err, res);
			}));
		}
	}
});
