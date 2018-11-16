'use strict';
const express = require('express');
const http = require('http');
const https = require('https');
const parseString = require('xml2js').parseString;

const router = express.Router();

/* ========== XML/RSS HANDLER ========== */
const getXML = url => {
  let reqHandler = url.includes('http://') ? http : https;
  return new Promise((resolve, reject) => {
    let req = reqHandler.get(url, res => {
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
        } catch (err) {
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
      // console.log('data', JSON.stringify(data));
      if (!data || !data.rss) {
        return res.status(404).json({
          code: 404,
          reason: 'RSSError',
          message: `RSS Feed not found for ${feedUrl}`,
          location: feedUrl
        });
      }
      const channel = data.rss.channel[0];
      // console.log('channel', channel);

      const title = channel.title ? channel.title[0] : null;
      const author = channel['itunes:author'] ? channel['itunes:author'][0] : null;
      const description = channel.description ? channel.description[0] : null;
      const genres = channel['itunes:category'] ? channel['itunes:category'].map(cat => cat.$.text) : null;
      const episodes = channel.item ? channel.item : null;
      const link = channel.link ? channel.link[0] : null;
      const image = channel['itunes:image'] ? channel['itunes:image'][0].$.href.replace('http://', 'https://') : null;

      const channelInfo = {
        title,
        author,
        description,
        genres,
        episodes,
        link,
        image,
        feedUrl
      };
      res.json(channelInfo);
    })
    .catch(err => {
      if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
        return res.status(404).json({
          code: 404,
          reason: 'RSSError',
          message: `RSS Feed not found for ${feedUrl}`,
          location: feedUrl
        });
      }
      next(err);
    });
});

module.exports = router;
