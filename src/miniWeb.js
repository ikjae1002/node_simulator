// miniWeb.js
// define your Request, Response and App objects here

const net = require('net');
const fs = require('fs');

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
            this.headers['Content-Type'] = contenttype;                
        }
        fs.readFile(fullDir, contentobj, (function(err, data, contenttype) {
            // we have the raw buffer!
            if(err){
                this.status = 500;
                this.end();
            }else{
                this.writeHead(200);
                this.write(data);
                this.end();
            }
        }).bind(this));
    }
}

class App{
    constructor(){
        this.server = net.createServer(this.handleConnection.bind(this));
        this.route = {};        
    }
    
    get(path, cb){
        if(path.charAt(path.length - 1) === "/"){
            this.route[path.substring(0,path.length-1)] = cb;
            this.route[path] = cb;
        }else{
            const newPath = path + '/';
            this.route[newPath] = cb;
            this.route[path] = cb;
        }
    }

    listen(port, host){
        this.server.listen(port, host);
    }

    handleConnection(sock){
        sock.on('data', this.handleRequestData.bind(this, sock));
    }

    handleRequestData(sock, binaryData){
        const s = binaryData + '';
        const req = new Request(s);
        const res = new Response(sock);
        sock.on('close', this.logResponse.bind(this, req, res));        
        if(req.headers['Host'] === undefined){
            res.send(400, "Request denied");
        }
        const callback = this.route[req.path];
        if(callback === undefined){
            res.send(404, "Path does not exist");
        }else{
            callback(req, res);
        }
    }

    logResponse(req, res){
        console.log(req.toString());
        console.log(res.toString());
    }
}

module.exports = {
    App:App,
    Request:Request,
    Response:Response
}