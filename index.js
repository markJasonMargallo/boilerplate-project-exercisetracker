const express = require('express')
const app = express()
const cors = require('cors')
const crypto = require("crypto");
let bodyParser = require('body-parser');

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// var users = [
//   { username: "mark", _id: "9a89812075419d1d9f92e7167e99e459" }
// ];

// var exercises = [
//   { _id: "9a89812075419d1d9f92e7167e99e459", date: "Wed Apr 01 2023", duration: 60, description: "sit-ups" },
//   { _id: "9a89812075419d1d9f92e7167e99e459", date: "Wed Apr 02 2023", duration: 60, description: "pull-ups" },
//   { _id: "9a89812075419d1d9f92e7167e99e459", date: "Wed Apr 03 2023", duration: 60, description: "push-ups" },
//   { _id: "9a89812075419d1d9f92e7167e99e459", date: "Wed Apr 04 2023", duration: 60, description: "curl-ups" },
//   { _id: "9a89812075419d1d9f92e7167e99e459", date: "Wed Apr 05 2023", duration: 60, description: "push-ups" },
//   { _id: "9a89812075419d1d9f92e7167e99e459", date: "Wed Apr 06 2023", duration: 60, description: "curl-ups" },
//   { _id: "9a89812075419d1d9f92e7167e99e459", date: "Wed Apr 07 2023", duration: 60, description: "sit-ups" },
//   { _id: "9a89812075419d1d9f92e7167e99e459", date: "Wed Apr 08 2023", duration: 60, description: "pull-ups" },
//   { _id: "9a89812075419d1d9f92e7167e99e459", date: "Wed Apr 09 2023", duration: 60, description: "push-ups" },
//   { _id: "9a89812075419d1d9f92e7167e99e459", date: "Wed Apr 10 2023", duration: 60, description: "curl-ups" },
// ];

var users = [];

var exercises = [];

const getUser = (id) => {
  var selectedUser;

  users.forEach(user => {
    if (user._id === id) {
      selectedUser = user
    }
  });

  return selectedUser;
}

const getExerciseCount = () => {
  return exercises.length;
}

const getLogs = (id, from, to, limit) => {
  var userExercises = exercises;
  const fromDate = new Date(from).setHours(0, 0, 0, 0)
  const toDate = new Date(to).setHours(0, 0, 0, 0)

  if(fromDate && toDate){

    userExercises = exercises.filter(exercise =>  
      new Date(exercise.date).setHours(0, 0, 0, 0) >= fromDate && new Date(exercise.date).setHours(0, 0, 0, 0) <= toDate)
  }

  if (limit && limit > 0) {
    userExercises = userExercises.splice(0, limit)
  }

  return userExercises;
}

const addUser = (username) => {
  const id = crypto.randomBytes(16).toString("hex");
  const user = { username: username, _id: id };
  users.push(user);
  return user;
}

const addExercise = (id, requestBody) => {

  const date = requestBody.date !== "" ? new Date(requestBody.date) : new Date();
  const user = getUser(id);

  const exercise = {
    _id: id,
    username: user.username,
    date: date.toDateString(),
    duration: Number(requestBody.duration),
    description: requestBody.description,
  }

  exercises.push(exercise);
  return exercise;
}

const userExist = (id) => {

  users.forEach(user => {
    if (user._id === id) {
      return true
    }
  });

  return false;
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.get('/api/users/:_id/logs', (req, res) => {
  const user = getUser(req.params._id)
  const logs = getLogs(req.params._id, req.query.from, req.query.to, req.query.limit)

  res.json({
    _id: user._id,
    username: user.username,
    count: getExerciseCount(),
    log: logs
  }
  );
});

app.post('/api/users', (req, res) => {
  res.json(addUser(req.body.username));
});

app.post('/api/users/:_id/exercises', (req, res) => {
  res.json(addExercise(req.params._id, req.body));
});


const listener = app.listen(3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
