const fetch = require('node-fetch')
const arc = require('@architect/functions')
const status = require('@architect/shared/status')

const validContentTypes = [
  'text/html',
  'application/json',
  'text/plain'
]

async function handler (event) {
  const { id } = event

  const data = await arc.tables()
  const webmention = await data.webmentions.get({ id })
  if (!webmention) {
    status.error(id, 'Webmention could not be found')
    return
  }

  // fetch default timeout is 5s and 20 redirects
  const response = await fetch(webmention.source, {
    method: 'get',
    size: 1024 * 1024 // 1mb
  })
  if (!response.ok) {
    status.error(id, 'Source could not be fetched')
    return
  }
  const contentType = response.headers.get('content-type')
  if (!validContentTypes.includes(contentType)) {
    status.error(id, 'Source Content-Type was invalid')
    return
  }
  const text = await response.text()
  if (!text.match(webmention.target)) {
    status.error(id, 'Source does not include a link to target')
    return
  }

  await arc.events.publish({
    name: 'parse',
    payload: { id }
  })

  await status.log(id, 'Source links to target')
}

exports.handler = arc.events.subscribe(handler)
