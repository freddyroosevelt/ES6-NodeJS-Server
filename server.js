'use strict';
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
 

let mimes = {
	'.htm': 'text/html',
	'.css': 'text/css',
	'.js': 'text/javascript',
	'.gif': 'image/gif',
	'.jpg': 'image/jpeg',
	'.png': 'image/png',
}

function fileAccess(filePath) {
	return new Promise((resolve, reject) => {
		fs.access(filePath, fs.F_OK, error => {
			if(!error) {
				resolve(filePath);
			}else {
				reject(error);
			}
		});
	});
}


function streamFile(filePath) {
	return new Promise((resolve, reject) => {
		let fileStream = fs.createReadStream(filePath);
		fileStream.on('open', () => {
			resolve(fileStream);
		});

		fileStream.on('error', error => {
			reject(error);
		});
	});
}


function server(req, res) {
	// if the route requested is '/', then load 'index.html' or else
	// load the requested file(s)
	let baseURI = url.parse(req.url);
	let filePath = __dirname + (baseURI.pathname === '/' ? '/index.htm' : baseURI.pathname);
	let contentType = mimes[path.extname(filePath)]; // eg: mimes['.css'] === 'text/css'

	fileAccess(filePath)
		.then(streamFile)
		.then(fileStream => {
			res.writeHead(200, {'Content-type': contentType});
			// the data flows in and gets piped out with the response
			fileStream.pipe(res);
		})
		.catch(error => {
			res.writeHead(404);
			res.end(JSON.stringify(error));
		});
}

http.createServer(server).listen(3000, () => console.log('Server running on port 3000'));