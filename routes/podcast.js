'use strict';
const express = require('express');
const http = require('http');
const https = require('https');
const parseString = require('xml2js').parseString;

const router = express.Router();

/* ========== XML/RSS HANDLER ========== */
const getXML = (url) => {
  let reqHandler = url.includes('http://') ? http : https;
  return new Promise((resolve, reject) => {
    let req = reqHandler.get(url, (res) => {
      let output = '';
      res.setEncoding('utf8');
      res.on('data', chunk => {
        output += chunk;
      });
      res.on('end', () => {
        try {
          parseString(output, (err, res) => {
            resolve(res);
          });
        }
        catch(err) {
          reject(err);
        }
      });
    });
    req.on('error', err => {
      reject(err);
    });
    req.end();
  });
};

/* ========== POST/RETRIEVE A PODCAST CHANNEL ========== */
router.post('/', (req, res, next) => {
  const { feedUrl } = req.body;

  getXML(feedUrl)
    .then(data => {
      const channel = data.rss.channel[0];
      // console.log('channel', channel);
      const channelInfo = {
        title: channel.title[0],
        author: channel['itunes:author'][0],
        description: channel.description[0],
        genres: channel['itunes:category'].map(cat => cat.$.text),
        episodes: channel.item,
        link: channel.link[0]
      };
      // console.log('channelInfo', channelInfo);
      res.json(channelInfo);
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
