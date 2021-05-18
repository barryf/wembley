const arc = require('@architect/functions')

async function findWebmentionsByTarget (target) {
  const data = await arc.tables()
  const result = await data.webmentions.query({
    IndexName: 'target-created_at-index',
    ScanIndexForward: false,
    KeyConditionExpression: 'target = :target',
    ExpressionAttributeValues: {
      ':target': target
    }
  })
  return result.Items
}

async function http (request) {
  const { target } = request.query
  if (!target) {
    return {
      status: 400,
      json: { message: 'target query parameter is missing' }
    }
  }

  const webmentions = await findWebmentionsByTarget(target)
  if (!webmentions) {
    return {
      status: 404,
      json: { message: 'No webmentions found' }
    }
  }

  return {
    json: { webmentions }
  }
}

exports.handler = arc.http.async(http)
