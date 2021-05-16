const arc = require('@architect/functions')

async function getWebmention (id) {
  const data = await arc.tables()
  return await data.webmentions.get({ id })
}

async function findWebmentionStatuses (webmentionId) {
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
  const { id } = request.params
  if (!id) {
    return {
      status: 400,
      json: { message: 'id parameter is missing' }
    }
  }

  const webmention = await getWebmention(id)
  if (!webmention) {
    return {
      status: 400,
      json: { message: 'Webmention not found' }
    }
  }

  const statuses = await findWebmentionStatuses(id)
  if (!statuses) {
    return {
      status: 400,
      json: { message: 'No statuses found for webmention' }
    }
  }

  return {
    json: { statuses }
  }
}

exports.handler = arc.http.async(http)
