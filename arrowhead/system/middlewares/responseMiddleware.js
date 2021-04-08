/**
 * @author Svetlin Tanyi <szvetlin@aitia.ai> on 2020. 01. 29.
 */

import _ from 'lodash'

export function generateResponse (data) {
  let response = {
    code: 200,
    type: 'success',
    message: 'OK'
  }

  if (data instanceof Error) {
    const err = data
    response.message = err.message
    response.type = 'error'
    response.code = 400
    return response
  }
  if (!_.isUndefined(data) && !_.isNull(data)) {
    response = data
  }
  return response
}

export function responseMiddleware () {
  return (req, res, next) => {
    res.finalize = (data) => {
      const err = data instanceof Error && data

      if (err && err.isBoom) {
        const output = err.output
        const statusCode = output.statusCode
        const messageObject = output.payload
        const payload = {
          code: statusCode,
          type: 'error',
          message: messageObject.message
        }
        if (err.data && err.data.errorCode) {
          payload.errorCode = err.data.errorCode
          payload.errorMessage = err.data.errorMessage
        }
        return res.status(statusCode).json(payload)
      }

      if (res.statusCode === 500) {
        console.log('responseHandler', {
          url: req.originalUrl,
          status: res.statusCode,
          error: err
        })
      }

      const response = generateResponse(data)
      return response.type === 'error' ? res.status(400).json(response) : res.json(response)
    }

    return next()
  }
}
