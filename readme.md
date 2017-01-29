# Real-time heart rate overlay for streaming

![image of the heart rate overlay overtop of Dark Souls gameplay](http://imgur.com/8iWZlu3.jpg)

This repo provides a real-time heart rate graph that can be selected as a source in Xsplit or OBS to overlay on a stream.
To use this repo, you'll need a bluetooth enabled computer, a bluetooth heart rate band, and you'll need node installed.
I've only tested it with a Polar HR7 band.

`stream.js` reads from the heart rate band and logs the latest rate to `rate.json` (This uses [Noble](https://github.com/sandeepmistry/noble))

## How to use this

- [Install node](https://nodejs.org/en/download/)
- Clone this repo
- In the root directory, run `npm install` to install requirements
- While wearing the Polar H7, run `node stream.js`
- After a few seconds, you should see heart rate data logged into the terminal (and you can double check rate.js to make sure it's updating)
- Then, simply open `index.html` and you should see the overlay.

I recommend serving this through python simple HTTP server (or some other simple server) so that you can easily add it as a source in your streaming software.

## Notes
This _should_ function with other bluetooth heart rate sensors that broadcast the 180d service.
This does not include Fitbit Charge HR - to my knowledge the Charge HR does not broadcast the
heart rate service over bluetooth.
