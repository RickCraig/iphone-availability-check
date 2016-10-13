'use strict';

const request = require('request'),
  mailgun = require('mailgun-js')({
    apiKey: 'key-3cdc958e6f5d9efca7303bd16c4f5a26',
    domain: 'mailgun.spacerevolver.com'
  }),
  CronJob = require('cron').CronJob;

const stockUrl = 'https://reserve.cdn-apple.com/GB/en_GB/reserve/iPhone/availability.json';

const store = {
  storeNumber: 'R313',
  storeName: 'Victoria Square',
  storeEnabled: true,
  sellEdition: false,
  storeCity: 'Belfast'
};

const getStock = () => {
  return new Promise((resolve, reject) => {
    request.get(stockUrl, (err, res) => {
      if (err) return reject(err);
      resolve(JSON.parse(res.body));
    });
  });
};

const models = [
  { name: 'iPhone 7 Plus, Black, 128Gb', model: 'MN4M2B/A' },
  { name: 'iPhone 7 Plus, Black, 256Gb', model: 'MN4W2B/A' }
];

new CronJob('0 */10 * * * *', function() {
  getStock()
    .then(result => {
      if (Object.keys(result).length < 1) return console.log('No Data');
      models.forEach(model => {
        if (result[store.storeNumber][model.model] === 'NONE') {
          console.log(`Ah shit ${model.name} isn't available`);
        } else {
          const data = {
            from: 'IPhone Notification <rick@spacerevolver.com>',
            to: 'richard.craig@gmail.com',
            subject: `model.name is now available!`,
            text: 'http://www.apple.com/uk/shop/buy-iphone/iphone-7#01,11'
          };

          mailgun.messages().send(data, () => {});
        }
      });
    })
    .catch(console.log);
}, null, true, 'America/Los_Angeles');
