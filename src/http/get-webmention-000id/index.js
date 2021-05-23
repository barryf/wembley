const arc = require('@architect/functions')
const layout = require('@architect/shared/layout')
const view = require('./view')

async function findStatusesByWebmention (webmentionId) {
  const data = await arc.tables()
  const result = await data.statuses.query({
    IndexName: 'webmention_id-created_at-index',
    ScanIndexForward: false,
    KeyConditionExpression: 'webmention_id = :webmentionId',
    ExpressionAttributeValues: {
      ':webmentionId': webmentionId
    }
  })
  return result.Items
}

async function http (request) {
  const data = await arc.tables()

  const { id } = request.params
  if (!id) {
    return {
      status: 400,
      json: { message: 'id parameter is missing' }
    }
  }

  const webmention = await data.webmentions.get({ id })
  if (!webmention) {
    return {
      status: 404,
      json: { message: 'Webmention not found' }
    }
  }

  const statuses = await findStatusesByWebmention(id)

  if (request.headers.accept.startsWith('application/json')) {
    return {
      json: { ...webmention, statuses }
    }
  }

  const content = view({ webmention, statuses })
  return {
    html: layout(content)
  }
}

exports.handler = arc.http.async(http)
