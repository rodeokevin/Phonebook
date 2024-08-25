const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')

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

let persons = [
        { 
          "id": "1",
          "name": "Arto Hellas", 
          "number": "040-123456"
        },
        { 
          "id": "2",
          "name": "Ada Lovelace", 
          "number": "39-44-5323523"
        },
        { 
          "id": "3",
          "name": "Dan Abramov", 
          "number": "12-43-234345"
        },
        { 
          "id": "4",
          "name": "Mary Poppendieck", 
          "number": "39-23-6423122"
        }
    ]

// GET info page of phonebook
app.get('/info', (request, response) => {
    const currentTime = new Date()
    const info = `<p>Phonebook has info for ${persons.length} people</p> <p>${currentTime}</p>`
    response.send(info)
})

// GET all persons
app.get('/api/persons', (request, response) => {
  response.json(persons)
})

// GET the info of 1 person based on the id
app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id)
    person ? response.json(person) : response.status(404).end()
})

// DELETE a person from phonebook
app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
})

// POST a person to phonebook
app.post('/api/persons', (request, response) => {
    const newPerson = request.body

    // Error handling
    if(persons.find(person => person.name === newPerson.name)) {
        return response.status(400).json({
            error: "name must be unique"
        })
    }

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
    const newId = Math.floor(Math.random() * 1000)
    newPerson.id = String(newId)
    persons = persons.concat(newPerson)
    response.json(newPerson)
})

// Middleware if requests are made to non-existant routes
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})