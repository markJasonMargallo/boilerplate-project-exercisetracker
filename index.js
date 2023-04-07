const express = require('express')
const app = express()
const cors = require('cors')
const crypto = require("crypto");
let bodyParser = require('body-parser');

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var users = [];

var exercises = [];

const getUser = (id) => {
  var selectedUser;

  users.forEach(user => {
    if (user._id === id) {
      console.log('user:')
      console.log(user)
      selectedUser = user
    }
  });

  return selectedUser;
}

const getExerciseCount = () => {
  return exercises.length;
}

const getLogs = (id, from, to, limit) => {
  var userExercise = []

  exercises.forEach(exercise => {

    const fromDate = new Date(from);
    const toDate = new Date(to);
    const date = new Date(exercise.date);
    const listLimit = limit;

    if (fromDate != null && toDate != null && limit != null){

      if (exercise._id === id && date >= fromDate && date <= toDate && userExercise.length <= limit) {

        userExercise.push({
          description: exercise.description,
          duration: exercise.duration,
          date: exercise.date
        })
      }

    }else{

      if (exercise._id === id) {
        userExercise.push({
          description: exercise.description,
          duration: exercise.duration,
          date: exercise.date
        })
      }

    }

  });

  return userExercise;
}

const addUser = (username) => {
  const id = crypto.randomBytes(16).toString("hex");
  const user = { username: username, _id: id };
  users.push(user);
  return user;
}

const addExercise = (requestBody) => {

  const date = requestBody.date !== "" ? new Date(requestBody.date) : new Date();
  const user = getUser(requestBody[':_id'])

  const exercise = {
    username: user.username,
    description: requestBody.description,
    duration: Number(requestBody.duration),
    date: date.toDateString(),
    _id: requestBody[':_id']
  }

  exercises.push(exercise);
  return exercise
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
  const logs = getLogs(req.params._id, req.query.fromDate, req.query.toDate, req.query.limit)

  console.log(user)
  console.log(logs)
  res.json({
    username: user.username,
    count: getExerciseCount(),
    _id: user._id,
    log: logs
  }
  );
});

app.post('/api/users', (req, res) => {
  res.json(addUser(req.body.username));
  // console.log(users);
});

app.post('/api/users/:_id/exercises', (req, res) => {
  console.log(req.body)
  res.json(addExercise(req.body));
  // console.log(exercises);
});


const listener = app.listen(3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
