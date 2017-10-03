// evenWarmer.js
// create Request and Response constructors...

const net = require('net');
const HOST = '127.0.0.1';
const PORT = 8080;

class Request {
    constructor(s) {
        const path = s.split(' ')[1];
        this.path = path;
    }
}


function createResponse(status, body) {
    return `HTTP/1.1 ${status} OK
Content-Type: text/html

${body}`;
};

const server = net.createServer((sock) => {
    console.log(`got connection from ${sock.remoteAddress}:${sock.remotePort}`);

    let s = ''
    s += 'GET /foo.html HTTP/1.1\r\n';   // request line
    s += 'Host: localhost:8080\r\n';     // headers
    s += '\r\n\r\n';                     // empty line to mark the boundary between the header and body
    
    const req = new Request(s);
    
    sock.write(createResponse(200,'<em>Hello</em> <strong>World</strong>')); 
    // sock.on('data', (binaryData) => {
    //     sock.write('echo: ' + s); 

    //     // close the connection
    //     sock.end();
    // });
    sock.end();
});

server.listen(PORT, HOST);