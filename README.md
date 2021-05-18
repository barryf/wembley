# Wembley

WIP [Webmention](https://webmention.net) receiver

* Node.js with [Architect framework](https://arc.codes)
* Deploy to AWS using Lambda, API Gateway, DynamoDB, SNS

## Outline

### Receiving webmentions

* POST /webmention with source and target form parameters
	* Return 400 if source and target are not valid URLs
	* Return 400 if source is the same as target
	* Return 400 if target is not a known domain
	* Return 400 if source’s domain is found in blocked domain table
	* Store source, target and timestamp in webmentions table
	* Publish verify event with ID payload
	* Return 201 with Location header /webmention/:webmentionID
* Handle verify event with webmention ID payload
	* Get the webmention record from the database
	* Fetch the source, limiting to 1Mb max size, 20 redirects and a 5-second timeout
	* Log error if Content-Type is not HTML, JSON or text
	* Log error if source content does not include target
	* Publish parse event with ID
* Handle parse event with webmention ID payload
	* Get the webmention record from the database
	* Send source URL to XRay to parse into Microformats 2
	* Log error if response is not successful
	* Upload author photo to Cloudinary and resize to 128px
	* Create a JF2 object (format TBC)
	* Update webmention record with JF2 post in table
	* Publish send event with ID
* Handle send event with webmention ID payload
	* Get the webmention record from the database
	* Send POST to config webhook URL with webmention record in JSON

### Querying webmentions

* GET /webmention with target query parameter
	* Query for webmentions matching the target
	* Return 404 if no webmentions are found
	* Return 200 with list of webmentions as HTML or JSON depending on Accept header

## ENV

* `ROOT_URL` e.g. https://webmention.barryfrost.com/
* `DOMAINS` e.g. barryfrost.com
* `WEBHOOK_URL` e.g. https://barryfrost.com/webmention
