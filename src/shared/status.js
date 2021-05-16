const arc = require('@architect/functions')

async function create ({ webmentionId, message }) {
  const data = await arc.tables()
  const id = Math.random().toString(36).substring(2)
  await data.statuses.put({
    id,
    webmention_id: webmentionId,
    created_at: new Date().toISOString(),
    message
  })
  return id
}

module.exports = { create }
