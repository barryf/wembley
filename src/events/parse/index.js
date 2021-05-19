const fetch = require('node-fetch')
const arc = require('@architect/functions')
const status = require('@architect/shared/status')

function getXRayUrl (url) {
  const xRayBaseUrl = 'https://xray.p3k.io/parse?url='
  const safeUrl = encodeURIComponent(url)
  return xRayBaseUrl + safeUrl
}

async function fetchSource (webmention) {
  const url = getXRayUrl(webmention.source)
  const response = await fetch(url)
  if (!response.ok) return
  const jf2 = await response.json()
  if (!('data' in jf2)) return
  return jf2
}

async function handler (event) {
  const { id } = event

  const data = await arc.tables()
  const webmention = await data.webmentions.get({ id })
  if (!webmention) {
    status.error(id, 'Webmention could not be found')
    return
  }

  const jf2 = await fetchSource(webmention)
  if (!jf2) {
    status.error(id, 'Source could not be parsed')
    return
  }
  status.log(id, 'Source was parsed')

  // TODO: upload photo to cloudinary

  const post = {
    url: jf2.url,
    type: jf2.data.type,
    published: jf2.data.published,
    author: jf2.data.author
  }

  switch (jf2.data['post-type']) {
    case 'like':
      post['like-of'] = jf2.data['like-of']
      post['wm-property'] = 'like-of'
      break
    case 'repost':
      post['repost-of'] = jf2.data['repost-of']
      post['wm-property'] = 'repost-of'
      break
    case 'reply':
      post['in-reply-to'] = jf2.data['in-reply-to'][0]
      post['wm-property'] = 'in-reply-to'
      post.content = jf2.data.content.text
      if (jf2.data.name) { post.name = jf2.data.name }
      break
  }

  /*
  "post": {
    "type": "entry",
    "author": {
      "name": "Amy Guy",
      "photo": "http://webmention.io/avatar/rhiaro.co.uk/829d3f6e7083d7ee8bd7b20363da84d88ce5b4ce094f78fd1b27d8d3dc42560e.png",
      "url": "http://rhiaro.co.uk/about#me"
    },
    "url": "http://rhiaro.co.uk/2015/11/1446953889",
    "published": "2015-11-08T03:38:09+00:00",
    "name": "repost of http://aaronparecki.com/notes/2015/11/07/4/indiewebcamp",
    "repost-of": "http://aaronparecki.com/notes/2015/11/07/4/indiewebcamp",
    "wm-property": "repost-of"
  }
  */

  data.webmentions.put({ post, ...webmention })

  await arc.events.publish({
    name: 'send',
    payload: { id }
  })
}

exports.handler = arc.events.subscribe(handler)
