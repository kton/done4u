## done4u

j4u coupon clipping, automatically done4u

basically phantomjs + [a bookmarklet](https://github.com/nishnet2002/Safeway-Just-for-u) that clips all of your Safeway coupons

## setup

- clone repo
  - `git clone https://github.com/kton/done4u.git`
- create a new free app on heroku
  - `cd done4u`
  - `heroku create --stack cedar-14 --buildpack https://github.com/ddollar/heroku-buildpack-multi.git`
- set the email/password config vars
  - `heroku config:set J4U_LOGIN=<email>`
  - `heroku config:set J4U_PASSWORD=<password>`
- deploy
  - `git push heroku master`
- run manually
  - `heroku run done4u`

## automated daily clipping

- install the free scheduler addon
- set frequency to daily
- enjoy saving money with minimal effort :thumbsup:
