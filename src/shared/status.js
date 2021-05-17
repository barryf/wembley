const arc = require('@architect/functions')

async function create (webmentionId, message, type) {
  const data = await arc.tables()
  const id = Math.random().toString(36).substring(2)
  await data.statuses.put({
    id,
    webmention_id: webmentionId,
    created_at: new Date().toISOString(),
    type,
    message
  })
}

async function log (webmentionId, message) {
  console.log(`${webmentionId} ${message}`)
  await create(webmentionId, message, 'log')
}

async function error (webmentionId, message) {
  console.error(`${webmentionId} ${message}`)
  await create(webmentionId, message, 'error')
}

module.exports = { log, error }
