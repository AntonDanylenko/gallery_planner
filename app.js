const cors = require("cors");
const express = require('express');
const app = express();
const static = express.static(__dirname + '/public');

const configRoutes = require('./routes');
const exphbs = require('express-handlebars');

app.use('/public', static);
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.engine('handlebars', exphbs.engine({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

var corsOptions = {
  origin: "http://localhost:3001"
};
app.use(cors(corsOptions));

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});