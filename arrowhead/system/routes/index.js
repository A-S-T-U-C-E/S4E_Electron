/**
 * @author Svetlin Tanyi <szvetlin@aitia.ai> on 2020. 01. 29.
 */

import Router from 'express-promise-router'

const router = Router()

router.all('/', (req, res, next) => {
  res.render('index')
})

router.post('/demo', (req, res, next) => {
  req.app.io.sockets.emit('arrowhead', req.body)
  console.log(req.body)
  res.finalize('OK')
})

export default router
