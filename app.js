const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const config = require('./db/db');
const fetch = require('node-fetch');
const cors = require('cors');
const users = require('./routes/user');
const list = require ('./json_data/data');
// const movies = require('./routes/movie');
// const shows = require('./routes/show');  
// const persons = require('./routes/person'); 
// const reviews = require('./routes/review'); 
const connectionString="mongodb+srv://ilya:270199iluxaA@e-commerce-lk3nb.mongodb.net/e-commerce?retryWrites=true";

mongoose.connect(connectionString, { useNewUrlParser: true }).then(
    () => {console.log('Database is connected') },
    err => { console.log('Can not connect to the database'+ err)}
);

const app = express();
app.use(passport.initialize());
require('./passport')(passport);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({limit: '50mb'}));
app.use(cors());


app.use('/api/users', users);
// app.use('/api/reviews', reviews);
// app.use('/api/movies', movies);
// app.use('/api/shows', shows);
// app.use('/api/persons', persons);

app.get('/productList', (req, res) => {
  let offers = list.shop.offers.offer;  
  let found = offers.filter(function(element) {
    return element.categoryId === req.query.listId
  });
  res.send(found)
})

app.get('/productInfo', (req, res) => {	
  let offers = list.shop.offers.offer;  
  let found = offers.find(function(element) {
    return element._id === req.query.productId
});
  res.send(found)
})

const port = 4000;

app.listen(port,()=>{
  console.log(`Live  on port ${port}`)
})
