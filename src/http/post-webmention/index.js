const arc = require('@architect/functions')
const status = require('@architect/shared/status')
const isValidURL = require('@architect/shared/valid-url')

async function findBlock (source) {
  const data = await arc.tables()
  const domain = new URL(source).host
  const block = data.blocks.get({ domain })
  return block
}

function validate (source, target) {
  if (!source) return 'source parameter is missing'
  if (!isValidURL(source)) return 'source is not a valid URL'
  if (!target) return 'target parameter is missing'
  if (!isValidURL(target)) return 'target is not a valid URL'
  if (source === target) return 'source and target are the same'
  if (findBlock(source)) return 'source is blocked'
}

async function create (source, target) {
  const data = await arc.tables()
  // random id for webmention record
  const id = Math.random().toString(36).substring(2)
  await data.webmentions.put({
    id,
    source,
    target,
    created_at: new Date().toISOString()
  })
  return id
}

async function http (request) {
  const { source, target } = request.body

  const message = validate(source, target)
  if (message) {
    return {
      status: 400,
      json: { message }
    }
  }

  const id = await create(source, target)

  await status.log(id, 'Received webmention')

  await arc.events.publish({
    name: 'verify',
    payload: { id }
  })

  return {
    status: 201,
    location: `${process.env.ROOT_URL}webmention/${id}`
  }
}

exports.handler = arc.http.async(http)
