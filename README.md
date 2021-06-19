# Wembley

This is a [Webmention](https://webmention.net) receiver to be used as an
endpoint to receive webmentions for your website.

It's still very much a work-in-progress and not ready for use, but I wanted to
share progress as the spec evolves in the [IndieWeb](https://indieweb.org)
community.

* Node.js with [Architect framework](https://arc.codes)
* Deploy to AWS using Lambda, API Gateway, DynamoDB, SNS

## Outline

### Receiving webmentions

* **POST /webmention** with `source` and `target` form parameters
	* Return 400 if `source` and `target` are not valid URLs
	* Return 400 if `source` is the same as target
	* Return 400 if `target` is not a known domain (`DOMAINS` env var)
	* Return 400 if `source`'s domain is found in blocked domain table
	* Generate a unique id for the webmention
	* Store `id`, `source`, `target` and a timestamp in webmentions table
	* Log status "Received webmention"
	* Publish verify event with `id` payload
	* Return 201 with `Location` header `/webmention/:id`
* Handle **verify** event with `id` payload
	* Get the webmention record from the database
	* Fetch the source, limiting to 1Mb, 20 redirects and a 5-second timeout
	* Log error if `Content-Type` is not HTML, JSON or text
	* Log error if `source` content does not include `target`
	* Publish parse event with `id`
* Handle **parse** event with `id` payload
	* Get the webmention record from the database
	* Send source URL to [XRay](https://xray.p3k.io) to parse into JF2
	* Log status "Source was parsed" or error if unsuccessful
	* Upload author photo to Cloudinary
	* Create a JF2 object (format TBD - see
    https://github.com/indieweb/webmention-ecosystem/issues/2)
	* Update webmention record with JF2 post in table
	* Publish send event with `id` payload
* Handle **send** event with `id` payload
	* Get the webmention record from the database
	* Send POST to config webhook URL with webmention record in JSON body

### Listing webmentions

* **GET /webmention** with `target` query parameter
	* Query for webmentions matching `target`
	* Return 404 if no webmentions are found
	* Return 200 with list of webmentions as HTML (default) or JSON depending on
    `Accept` header

### Webmention statuses

* **GET /webmention/:id**
  * Query for statuses matching `id`
  * Return 404 if no statuses are found
  * Return 200 with list of statuses as HTML (default) or JSON depending on
    `Accept` header

## env

* `ROOT_URL` e.g. https://wembley.barryfrost.com/
* `DOMAINS` e.g. barryfrost.com
* `WEBHOOK_URL` e.g. https://api.barryfrost.com/webmention
