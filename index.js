const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const Person = require('./models/person')

app.use(express.static('dist'))

app.use(cors())

app.use(express.json())

morgan.token('body', (req) => {
    if (req.method === 'POST') {
      // Create a shallow copy of the request body without the 'id'
      const { id, ...bodyWithoutId } = req.body
      return JSON.stringify(bodyWithoutId)
    }
    return ''
  })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// GET info page of phonebook
app.get('/info', (request, response) => {
    Person.countDocuments({})
      .then(count => {
        const currentTime = new Date()
        const info = `<p>Phonebook has info for ${count} people</p> <p>${currentTime}</p>`
        response.send(info)
      })
})

// GET all persons
app.get('/api/persons', (request, response) => {
  Person.find({}).then(people => {
    response.json(people)
  })
})

// GET 1 person based on the id [ERROR HANDLER NOT DEFINED]
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      person ? response.json(person) : response.status(404).end()
    })
    .catch(error => next(error))
})

// DELETE a person from phonebook [ERROR HANDLER NOT DEFINED]
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(person => response.status(204).end())
    .catch(error => next(error)) // If error, pass to error handler
})

// POST a person to phonebook
app.post('/api/persons', (request, response) => {
  const newPerson = request.body
  // Same name is now treated as an update
  /*
  if(persons.find(person => person.name.toLowerCase() === newPerson.name.toLowerCase())) {
      return response.status(400).json({
          error: "name must be unique"
      })
  }
  */
  if(!newPerson.name) {
      return response.status(400).json({
          error: "name is missing"
      })
  }
  if(!newPerson.number) {
      return response.status(400).json({
          error: "number is missing"
      })
  }
  // No errors
  const person = new Person({
    name: newPerson.name,
    number: newPerson.number,
  })
  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
})

// Update the number of an existing person
app.put('/api/persons/:id', (request, response) => {
  Person
  .findByIdAndUpdate(request.params.id, request.body, {new: true})
  .then(info => response.json(info))
})

// Middleware if requests are made to non-existant routes
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
  
app.use(unknownEndpoint)

// Error handlers:

// Malformatted ID handler (GET a person and DELETE a person)
const malformattedID = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  next(error)
}

app.use(malformattedID)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})