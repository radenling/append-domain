# Append Domain

This Firefox extension adds "- &lt;current domain name&rt;" to the
title of all open tabs. I'm a Keepass user and like to use the
autotype feature. It determines which password to use based on the
window name. This is a problem in Firefox since the page title is used
as the window name and that is usually not enough to determine which
site you're currently visiting. By adding the current domain at the
end of the page title, there will always be something in the window
title to match against.

## About the extension

The extension is minimalistic and without any configurable
options. For each page you open, it adds the current domain to the
title. Whenever the page title changes, it attempts to re-append the
domain.

## Why?

The reason I wrote this extension was two-fold. First, I had trouble
finding an existing extension which didn't disable the multiprocess
support in Firefox. Most of the extensions I found were a few years
old and, seemingly, no longer maintained. Since Firefox is migrating
to a new extension API, forking one of the existing plugins was out of
the question as that meant I would have to learn a soon-to-be
deprecated API.

The second reason is that I have always been curious about what the
process is for developing a browser extension. Writing this simple
extension gave me a chance to get some insight into that.