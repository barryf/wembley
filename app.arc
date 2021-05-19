@app
webmention

@aws
region eu-west-2

@http
get /
get /webmention
get /webmention/:id
post /webmention

@events
parse
send
verify

@tables
blocks
  domain *String
statuses
  id *String
webmentions
  id *String

@indexes
statuses
  webmention_id *String
  created_at **String
webmentions
  target *String
  created_at **String
