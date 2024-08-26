const mongoose = require('mongoose')
require('dotenv').config()
mongoose.set('strictQuery', false)
const url = process.env.MONGODB_URI

mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

const numberValidator = (value) => {
  const phoneRegex = /^\d{2,3}-\d{4,}$/
  return phoneRegex.test(value)
}

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
  },
  number: {
    type: String,
    validate: {
      validator: numberValidator,
      message: props => `${props.value} is not a valid number`
    },
    minLength: 8,
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)
