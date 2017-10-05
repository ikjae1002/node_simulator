// evenWarmer.js
// create Request and Response constructors...

const net = require('net');
const HOST = '127.0.0.1';
const PORT = 8080;

const fs = require('fs');


// function createResponse(status, type, body) {
//     return `HTTP/1.1 ${status} OK
// Content-Type: ${type}

// ${body}`;
// };

class Request {
    constructor(s) {
        const path = s.split(' ')[1];
        this.path = path;
        const method = s.split(' ')[0];
        this.method = method;
        const names = s.split('\r\n\r\n')[0].split("HTTP/1.1")[1];
        let line = names.split('\r\n');
        while(line[0] === ""){
            line = line.splice(1);
        }
        const headers = {};
        for(let i = 0; i < line.length; i++){
            let head = line[i].split(/: (.+)/);
            headers[head[0]] = head[1];
        }
        this.headers = headers;
        
        const rand = s.split('\r\n\r\n');
        const body = rand[rand.length-1];
        this.body = body;
    }
    toString(){
        let s = this.method + " " + this.path + " HTTP/1.1\r\n";
        for(let key in this.headers){
            s += key + ": " + this.headers[key] + "\r\n";
        }
        s += '\r\n';
        s += this.body;
        return s;
    };
}

class Response {
    constructor(s){
        this.sock = s;
        this.headers = {};
        this.body = '';
        this.statusCode = 0;
        this.objstatus = {
            200: "OK",
            404: "Not Found",
            500: "Internal Server Error",
            400: "Bad Request",
            301: "Moved Permanently",
            302: "Found",
            303: "See Other",
            jpeg: "image/jpeg",
            jpg: "image/jpeg",
            png: "image/png",
            gif: "image/gif",
            html: "text/html",
            css: "text/css",
            text: "text/plain"
        }
    }

    setHeader(name, value){
        this.headers[name] = value;
    }

    write(data){
        this.sock.write(data);
    }

    end(s){
        this.sock.end(s);
    }

    send(status, body){
        this.statusCode = status;
        this.body = body;
        let s = 'HTTP/1.1 ' + this.statusCode + ' ' + this.objstatus[this.statusCode] + '\r\n';
        for(let key in this.headers){
            s += key + ": " + this.headers[key] + "\r\n";
        }s += '\r\n';
        s += this.body;
        this.sock.write(s);
        this.sock.end();
    }

    writeHead(status){
        this.statusCode = status;
        let s = 'HTTP/1.1 ' + this.statusCode + ' ' + this.objstatus[this.statusCode] + '\r\n';
        for(let key in this.headers){
            s += key + ": " + this.headers[key] + "\r\n";
        }s += '\r\n';
        console.log(s);
        this.write(s);
    }

    redirect(status, url){
        if(url !== undefined){
            this.statusCode = status;
            this.headers['Location'] = url;
            let s = 'HTTP/1.1 ' + this.statusCode + ' ' + this.objstatus[this.statusCode] + '\r\n';
            s += "Location: " + this.headers['Location'] + "\r\n";
            this.sock.end(s);
        }else{
            this.statusCode = 301;
            this.headers['Location'] = status;
            let s = 'HTTP/1.1 ' + this.statusCode + ' ' + this.objstatus[this.statusCode] + '\r\n';
            s += "Location: " + this.headers['Location'] + "\r\n";
            this.sock.end(s);
        }
    }

    toString(){
        let s = 'HTTP/1.1 ' + this.statusCode + ' ' + this.objstatus[this.statusCode] + '\r\n';
        for(let key in this.headers){
            s += key + ": " + this.headers[key] + "\r\n";
        }s += '\r\n';
        s += this.body;

        return s;
    }

    sendFile(fileName){
        const fullDir = __dirname + '/../public' + fileName;
        let contenttype;
        const contentobj = {};
        if(fileName.includes('img')){
            if(fileName.includes('jpeg') || fileName.includes('jpg')){
                contenttype = 'image/jpeg';
            }else if(fileName.includes('png')){
                contenttype = 'image/png';
            }else if(fileName.includes('gif')){
                contenttype = 'image/gif';
            }
        }else{
            if(fileName.includes('html')){
                contenttype = 'text/html';
            }else if(fileName.includes('css')){
                contenttype = 'text/css';
            }else if(fileName.includes('txt')){
                contenttype = 'text/plain';
            }contentobj['encoding'] = 'utf8';
        }
        fs.readFile(fullDir, contentobj, (function(err, data, contenttype) {
            // we have the raw buffer!
            if(err){
                this.status = 500;
                this.end();
            }else{
                this.headers['Content-Type'] = contenttype;                
                this.writeHead(200);
                this.write(data);
                this.end();
            }
        }).bind(this));
    }
}


const server = net.createServer((sock) => {
    console.log(`got connection from ${sock.remoteAddress}:${sock.remotePort}`);

    // let s = ''
    // s += 'GET /qqx HTTP/1.1\r\n';   // request line
    // s += 'Host: localhost:8080\r\n';     // headers
    // s += '\r\n';                     // empty line to mark the boundary between the header and body

    
    
    // const req = new Request(s);
    // if(req.path === '/'){
    //     sock.write(createResponse(200, 'html','<em>Hello</em> <strong>World</strong>')); 
    // }else if(req.path === '/foo.css'){
    //     sock.write(createResponse(200, 'css', 'h2 {color: red;}'));
    // }else{
    //     sock.write(createResponse(404, 'plain', 'uh oh... 404 page not found!'))
    // }
    // sock.end();
    sock.on('data', function(binary){
        const res = new Response(sock);
        // res.setHeader('Content-Type', 'text/html');
        // res.write("<h2>A bit o' HTML</h2>");
        // res.write("some stuff"); 
        // res.end('some more stuff'); // closes connection!
        // res.setHeader('Content-Type', 'text/html');
        // res.send(200, 'Hi there!');

        // res.setHeader('Content-Type', 'text/html');
        // res.writeHead(200);
        // // connection isn't closed yet! we can still write more
        // res.write('More stuff');
        // res.end('');

        // res.redirect('http://another.site/here');
        // res.setHeader('Content-Type', 'text/plain');
        // res.statusCode = 404;
        // res.body = "Uh oh! No page here!"
        // console.log(res.toString());
        // let s = 'HTTP/1.1 200 OK\r\n';
        // s += '\r\n';
        // res.status = 404;
        // console.log(res.toString());

        console.log(__dirname);
        res.sendFile('/html/test.html');

        //sock.end();
    });
});

server.listen(PORT, HOST);

module.exports = {
    Request:Request,
    Response:Response
};