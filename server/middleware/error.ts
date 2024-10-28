import { H3Error } from 'h3'

export default defineEventHandler((event) => {
  // @ts-ignore
  if (!event.error) return

  // Get the error
  // @ts-ignore
  const error = event.error

  // Log the error (you can customize this part)
  console.error('Server Error:', error)

  // Convert error to H3Error if it isn't already
  const h3Error = error instanceof H3Error
    ? error
    : createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      })

  // Set the error response
  setResponseStatus(event, h3Error.statusCode, h3Error.statusMessage)
  
  // Return error details (customize based on environment)
  return {
    statusCode: h3Error.statusCode,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : h3Error.message,
    stack: process.env.NODE_ENV === 'development' ? h3Error.stack : undefined
  }
})
