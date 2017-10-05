// fansite.js
// create your own fansite using your miniWeb framework

const App = require('./miniWeb.js').App;
const app = new App();

app.get('/', function(req, res) {
    res.sendFile('/html/test.html');
});
app.get('/about', function(req, res) {
    res.sendFile('/html/about.html');
});
app.get('/css/base.css', function(req, res) {
    res.sendFile('/html/base.css');
});
app.get('/rando', function(req, res) {
    res.sendFile('/html/rando.html');
});
app.get('/image1.jpg', function(req, res) {
    res.sendFile('/img/image1.jpg');
});
app.get('/image2.png', function(req, res) {
    res.sendFile('/img/image2.png');
});
app.get('/image3.gif', function(req, res) {
    res.sendFile('/img/bmo1.gif');
});
app.get('/home', function(req, res) {
    res.redirect(301, '/');
});

app.listen(8080, '127.0.0.1');