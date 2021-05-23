const fetch = require('node-fetch')
const arc = require('@architect/functions')
const status = require('@architect/shared/status')
const isValidURL = require('@architect/shared/valid-url')

async function handler (event) {
  const { id } = event

  const data = await arc.tables()
  const webmention = await data.webmentions.get({ id })
  if (!webmention) {
    status.error(id, 'Webmention could not be found')
  }

  const url = process.env.WEBHOOK_URL
  if (!(url)) {
    status.error(id, 'WEBHOOK_URL has not been defined in ENV')
    return
  }
  if (!isValidURL(url)) {
    status.error(id, 'WEBHOOK_URL is not a valid URL')
    return
  }

  const response = await fetch(url, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(webmention.post)
  })

  console.log('webhook', JSON.stringify(webmention.post, null, 2))

  if (response.ok) {
    status.log('Webhook post was successful')
  } else {
    status.error('Webhook post failed')
  }

  return response.ok
}

exports.handler = arc.events.subscribe(handler)
