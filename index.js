require('dotenv').config()

var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var request = require('request');
var twilio = require('twilio');
var MessagingResponse = twilio.twiml.MessagingResponse;

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use(bodyParser());

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function (request, response) {
  response.render("pages/index")
});

app.post('/command', function(request, response) {
  var process_result = function (result) {
    response.json(result);
  };

  process_command(request.body.command, process_result);
});

app.post('/whim', function(req, res, next) {
  var twiml = new MessagingResponse();
  var process_result = function(result) {
    twiml.message(result.message);
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
  }

  process_command(req.body.Body, process_result);  
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

// Workspace

var commands = {
  "mlb": "http://whim.mlb.livediagonal.com/game"
}

var process_command = function (command, process_result) {
  var app = command.split(" ")[0];
  var url = commands[app];

  if (url) {
    request.get({
      url: url,
      qs: {
        team: command.split(" ")[1]
      }
    }, function (error, response, body) {
      process_result(JSON.parse(body));
    });
  } else {
    process_result({
      success: false,
      message: "Failure: app " + app + " not found."
    });
  }
}
