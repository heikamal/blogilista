const logger = require('./logger')

const tokenExtractor = (request, response, next) => {

  let authorization = request.get('authorization')  
  if (authorization && authorization.startsWith('Bearer ')) {    
    authorization = authorization.replace('Bearer ', '')  
  }

  request.token = authorization

  next()
}

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'MongoServerError'){
    return response.status(400).send({ error: error.message})
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(400).json({ error: 'token missing or invalid' })
  }

  next(error)
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor
}