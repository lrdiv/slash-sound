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

var getPossibleCommands = function() {
  return _.pluck(sounds, 'trigger').join(', ');
}

var findSoundFile = function(trigger) {
  var sound;
  if (trigger == 'random') {
    sound = _.sample(sounds);
  } else {
    sound = _.first(_.where(sounds, { trigger: trigger }));
  }
  return sound.filename;
}

var playSound = function(file) {
  return new Promise(function(resolve, reject) {
    var player = new Sound(process.cwd() + "/sounds/" + file);
    player.play();
    
    player.on('complete', function() {
      resolve();
    });
    
    player.on('error', function(err) {
      reject(err);
    });
  });
}

var sendSlackMessage = function(user, trigger) {
  if (user) {
    var slackText = '@' + user + " just triggered the \"" + trigger + "\" sound";
    slack.send({
      text: slackText,
      channel: '#yolo',
      username: 'Soundbot',
      icon_emoji: ':ohgoodforyouuu:'
    });
  }
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
  
  if (!params.text || params.text.length < 2) {
    var commands = getPossibleCommands();
    res.send({text: commands});
  }

  var file = findSoundFile(trigger);
  
  if (!file) {
    res.send({
      text: "No sound matching that trigger!"
    });
  } else {
    res.status(200).end();
    playSound(file).then(
      sendSlackMessage(user, trigger), function(err) {
      res.status(500).end();
    });
  }
});

module.exports = router;
