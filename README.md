[![Codacy
Badge](https://www.codacy.com/project/badge/fee09c9561ef44448766ff4afcf96bfa)](https://www.codacy.com/app/woshilapin/github-health)
[![Code
Climate](https://codeclimate.com/github/woshilapin/github-health/badges/gpa.svg)](https://codeclimate.com/github/woshilapin/github-health)

# Usage
To use it, you need `iojs` installed (see
[`nvm`](https://github.com/creationix/nvm)).

```
iojs src/pull-request.js
```

# Configuration
You can run the program without configuration and it will ask you at runtime:
* Which account you want to analyze?  For example,
  [`woshilapin`](https://github.com/woshilapin)
* Your credentials on Github; they are needed to request on Github API: without
  them, only 60 requests per hour can be done, with them, you can have 5000
  requests per hour

About credentials, it's only used to identify yourself on the Github API which
is requested through HTTPS.  So they should be only on your computer.  If you
want more security, I guess you should check yourself and propose some
modification, I'd be happy to hear about them.

If you don't want to type these configuration parameter each time you run the
program, you can have a `health.json` file in your runtime folder with the
configuration inside.

```
{
	"credentials": "octocat:mypassword",
	"account": "woshilapin"
}
```
