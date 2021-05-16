exports.handler = async function http (req) {
  return {
    statusCode: 200,
    headers: {
      'content-type': 'text/plain; charset=utf-8'
    },
    body: 'Webmention receiver'
  }
}
