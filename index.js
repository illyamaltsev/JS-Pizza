const path = require('path');
const express = require('express');
var bodyParser = require('body-parser');

const app = express();

function main_page(req, res){
    res.render('main');
}

function order_page(req, res){
    res.render('order');
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// eslint-disable-next-line no-undef
app.set('views', path.join(__dirname + '/views'));
app.set('view engine', 'ejs');

// eslint-disable-next-line no-undef
app.use(express.static(__dirname + '/views'));

app.get('/', main_page);

app.get('/get_pizza_list/', function(req, res){
    res.send(require('./Pizza_List'));
});


app.post('/newOrder/', function(req, res){
    var order_info = req.body;
    console.log("Creating Order", order_info);
    res.send({
        success: true
    });
});

app.get('/order.html', order_page);

// eslint-disable-next-line no-console
app.listen(300, () => console.log('listening 300 port started!'));
