const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

// kaikkien käyttäjien hakeminen
usersRouter.get('/', async (request, response) => {
    const userList = await User
    .find({}).populate('blogs', { url: 1, title: 1, author: 1, id:1 })
    response.json(userList)
})

// käyttäjän lisääminen
usersRouter.post('/', async (request, response, next) => {
    const { name, username, password } = request.body

    // salasanan varmistus
    if (password === undefined || password.length < 3) {
        return response.status(400).send({ error: 'password missing or too short' }) 
    }

    // salasanan hashays
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // uuden käyttäjän luonti
    const user = new User({
        username,
        name,
        passwordHash
    })

    // uuden käyttäjän lisääminen tietokantaan
    try {
        const savedUser = await user.save()
        // vastaus
        response.status(201).json(savedUser)
    } catch (error) {
        next(error)
    }
})

module.exports = usersRouter