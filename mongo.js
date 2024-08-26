const mongoose = require('mongoose')

const password = process.argv[2]

const url =
  `mongodb+srv://kevinqinzw2:${password}@cluster0.n8alr.mongodb.net/phonebook?retryWrites=true&w=majority&appName=Cluster0`


const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)

// Save a person by passing 3 command-line arguments (password, name, number)
if (process.argv.length === 5) {
    const name = process.argv[3]
    const number = process.argv[4]

    mongoose.set('strictQuery',false)
    mongoose.connect(url)

    const person = new Person({
        name: name,
        number: number,
    })

    person.save().then(result => {
        console.log('person saved!')
        mongoose.connection.close()
    })
}
// List all the people in the collection
else if (process.argv.length === 3) {
    mongoose.set('strictQuery',false)
    mongoose.connect(url)

    Person.find({}).then(result => {
        result.forEach(person => {
          console.log(person)
        })
        mongoose.connection.close()
    })
}
else {
    console.log('wrong number of arguments')
    process.exit(1)
}
