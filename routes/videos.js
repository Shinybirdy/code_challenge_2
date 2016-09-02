var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Video = require('../models/videos');
var passport = require('passport');
var jwt = require('express-jwt');
var authConfig = require('../modules/authConfig');

// authentication check
var auth = jwt({secret: authConfig.TOKEN_SECRET, userProperty: 'payload'});

// require to upload images
var multer = require('multer');
var fs = require('fs');
var multerS3 = require('multer-s3');
var aws = require('aws-sdk');
var s3 = new aws.S3();

var router = express.Router();
// router middleware
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
// get all approved videos
router.get('/getApprovedVideos', function(req, res) {
  Video.find({'approved': true}).sort({created: 'desc'}).exec(function(err, videos) {
    if(err) {
      console.log(err);
      res.sendStatus(500);
    } else {
      res.send(videos);
    }
  });
});

// all unapproved videos
router.get('/getUnapprovedVideos', auth, function(req, res) {
  Video.find({'approved': false}).sort({created: 'desc'}).exec(function(err, videos) {
    if(err) {
      console.log(err);
      res.sendStatus(500);
    } else {
      res.send(videos);
    }
  });
});
// approve a video
router.put('/approveVideo/:id', auth, function(req, res) {
  Video.findOne({'_id': req.params.id}, function(err, video) {
    if(err) {
      console.log('/approveVideo error: ', err);
    } else {
      video.approved = true;
      video.save(function(err) {
        if(err) {
          console.log(err);
          res.sendStatus(500);
        } else {
          res.json(video);
        }
      });
    }
  });
});
// flag a video
router.put('/flagVideo/:id', function(req, res) {
  Video.findOne({'_id': req.params.id}, function(err, video) {
    if(err) {
      console.log('/flagVideo error: ', err);
    } else {
      video.flags++;
      video.save(function(err) {
        if(err) {
          console.log(err);
          res.sendStatus(500);
        } else {
          res.json(video);
        }
      });
    }
  });
});
// unflag a video
router.put('/unFlagVideo/:id', function(req, res) {
  Video.findOne({'_id': req.params.id}, function(err, Video) {
    if(err) {
      console.log('/flagVideo error: ', err);
    } else {
      video.flags = 0;
      video.save(function(err) {
        if(err) {
          console.log(err);
          res.sendStatus(500);
        } else {
          res.json(video);
        }
      });
    }
  });
});
// get all videos with more than 0 flags
router.get('/getFlaggedVideos', function(req, res) {
  Video.find({'flags': { $gt: 0 }}).sort({ flags: 'desc'}).exec(function(err, videos) {
    if(err) {
      console.log(err);
      res.sendStatus(500);
    } else {
      res.send(videos);
    }
  });
});
// retrieve a video by its name
router.get('/getVideo/:videoTitle', function(req, res) {
  Video.findOne({'title': req.params.videoTitle}, function(err, video) {
    if(err) {
      console.log('/getVideo error: ', err);
      res.sendStatus(500);
    } else {
      res.json(video);
    }
  });
});
// for uploading photos
var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'hilarious-bucket',
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    // key: function (req, file, cb) {
    //   // file name generation
    //   cb(null, Date.now().toString());
    // }
  })
}); // end multer upload

// create a new video
router.post("/createVideo", upload.single("file"), function (req, res) {
  var newVideo = new Video({
    id: req.body.id,
    title: req.body.title,
    url: req.body.url,
    slug: req.body.slug,
    view_tally: req.body.views,
    vote_tally: req.body.votes,
    created: req.body.created,
    updated: req.body.updated
  });

  if (req.file ){
    newVideo.videoURL = req.file.location;
  } else {
    newVideo.videoURL = '../images/startup-photos-medium.jpg';
  }

  newVideo.save(function(err) {
    if(err) {
      console.log(err);
      res.sendStatus(500);
    } else {
      res.json(newVideo);
    }
  });
});


router.put('/editVideo/:id', auth, function(req, res) {
  Video.findOne({'_id': req.params.id}, function(err, video) {
    if(err) {
      console.log('/editVideo error: ', err);
    } else {

      video.id = req.body.id;
      video.title = req.body.title;
      video.url = req.body.url;
      video.slug = req.body.slug;
      video.view_tally = req.body.view_tally;
      video.vote_tally = req.body.vote_tally;
      video.created = req.body.created;
      video.updated = req.body.updated;

      video.save(function(err) {
        if(err) {
          console.log(err);
          res.sendStatus(500);
        } else {
          res.json(video);
        }
      });
    }
  });
}); //edit video endpoint

// delete a video
router.delete('/deleteVideo/:videoId', function(req, res){
  var id = req.params.videoId;
  Video.findOne({'_id': id}, function(err, video){
    if(err){
      console.log('/deleteVideo error: ', err);
    } else {
      Video.remove({'_id': id}, function(err){
        if(err){
          console.log('remove video error: ', err);
        } else {
          res.json({});
        }
      });
    }
  });
});

module.exports = router;
