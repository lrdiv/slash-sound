var _ = require('lodash');
var Promise = require('promise');
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var express = require('express');
var router = express.Router();
var Slack = require('node-slack');
var Sound = require('node-mpg123');

var slack = new Slack(process.env.SLACK_HOOK_URL);
var sounds = require('../lib/sounds');

var findSoundFile = function(trigger) {
  return new Promise(function(resolve, reject) {
    sound = _.first(_.where(sounds, { trigger: trigger }));
    if (sound) {
      resolve(sound.filename);
    } else {
      reject("Unknown trigger.");
    }
  });
}

var playSound = function(file_name) {
  return new Promise(function(resolve, reject) {
    var player = new Sound(process.cwd() + "/sounds/" + file_name);
    player.play();
    
    player.on('complete', function() {
      resolve();
    });
    
    player.on('error', function(err) {
      reject(err);
    });
  });
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/play', function(req, res, next) {
  // Verify that the request is coming from Slack
  if (req.body.token != process.env.SLACK_HOOK_TOKEN) {
    res.status(401).end();
  }

  var params = req.body;
  var trigger = params.text;
  var user = params.user_name;

  findSoundFile(trigger).then(function(file) {
    res.status(200).end();
    playSound(file).then(function() {
      if (user) {
        var slackText = '@' + user + " just triggered the \"" + trigger + "\" sound";
        slack.send({
          text: slackText,
          channel: '#yolo',
          username: 'Soundbot',
          icon_emoji: ':ohgoodforyouuu:'
        });
      }
    }, function(err) {
      console.log(err);
      res.status(500).end();
    });
  }, function(err) {
    console.log(err);
    res.status(500).end();
  });

});

module.exports = router;
