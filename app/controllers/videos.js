import Ember from 'ember';

// seed generating stuff
function buildVideo(videoId, channelId) {
  return {
    id          : videoId,
    fullUrl     : "http://www.youtube.com/embed/" + videoId + "?autoplay=1&showinfo=0&controls=0&rel=0",
    externalUrl : "https://www.youtube.com/watch?v=" + videoId,
    thumbnail   : "https://i.ytimg.com/vi/" + videoId + "/default.jpg",
    channelId   : channelId
  }
}

var viewCountThreshold = 500;
var keywordBlacklist = ["pronounce", "say", "vocabulary", "spelling", "mean", "definition", "slideshow", "translation"];

function randomWord() {
  var requestStr = "http://randomword.setgetgo.com/get.php";
  return $.ajax({
     type: "GET",
     url: requestStr,
     dataType: "jsonp",
  }).then(function(data) {return randomVideo(data)});
}

function isBlacklisted(title, description) {
  // debugger;
  title = title.toLowerCase();
  description = description.toLowerCase();
  for(var i = 0; i < keywordBlacklist.length; i++) {
    if(title.includes(keywordBlacklist[i]) || description.includes(keywordBlacklist[i])) {
      return true;
    }
  }
  return false;
}

function randomVideo(data) {
  console.log(data.Word);
  var url = "https://www.googleapis.com/youtube/v3/search?order=date&part=snippet&q=" + data.Word + "&type=video&maxResults=50&key=AIzaSyAHu80T94GGhKOzjBs9z5yr0KU8v48Zh60";
  return Ember.$.getJSON(url).then(function(responseJSON) {
   if (responseJSON.items.length < 1) {
     console.log("No videos found for " + data.Word + "Restarting search.");
     return randomWord();
   } else {
       var videoId = responseJSON.items[0].id.videoId;
       var url2 = "https://www.googleapis.com/youtube/v3/videos?part=snippet%2C+statistics&id=" + videoId + "&key=AIzaSyAHu80T94GGhKOzjBs9z5yr0KU8v48Zh60";
       return Ember.$.getJSON(url2).then(function(responseJSON2) {
         if(responseJSON2.items[0].statistics.viewCount > viewCountThreshold) {
           console.log("View count too high. Restarting search.");
           return randomWord();
         } else if(isBlacklisted(responseJSON2.items[0].snippet.title, responseJSON2.items[0].snippet.description)) {
           console.log("Title:" + responseJSON2.items[0].snippet.title + " Description: " + responseJSON2.items[0].snippet.description + " contains blacklisted word. Restarting search.")
           return randomWord();
         } else {
           var videoId = responseJSON2.items[0].id;
           var channelId = responseJSON2.items[0].snippet.channelId;
           return buildVideo(videoId, channelId);
         }
       });
     }

  });
}

var API_KEY = "AIzaSyDSW307ilh8iZL2gFIqR6R_nOoGpBoSc_Y";

function videoURL(videoId) {
  var videoUrl = "https://www.googleapis.com/youtube/v3/videos?part=snippet%2C+statistics";
  videoUrl += "&key=" + API_KEY;
  return videoUrl + "&id=" + videoId;
}

function relatedVideosURL(videoId) {
  var relatedVidsUrl = "https://www.googleapis.com/youtube/v3/search?maxResults=50&type=video&part=snippet"
  relatedVidsUrl += "&key=" + API_KEY;
  return relatedVidsUrl + "&relatedToVideoId=" + videoId;
}

function findNextVideo(videoId, steps, visitedVideoIds, controller) {
  // debugger;
  visitedVideoIds.push(videoId);
  if (steps === 0) {

    //need to add thumbnail to newVideo
    var newVideo = {
      id: videoId,
      fullUrl: "http://www.youtube.com/embed/" + videoId + "?autoplay=1&showinfo=0&controls=0&rel=0",
      externalUrl: "https://www.youtube.com/watch?v=" + videoId,
      thumbnail   : "https://i.ytimg.com/vi/" + videoId + "/default.jpg"
    }
    controller.get('model.watchedVideos').pushObject(newVideo);
    return;
  }

  getRelatedVideoIds(videoId)
  .then(function(relatedVideoIds) {
    return getRelatedVideoViews(relatedVideoIds)
    .then(function(relatedVideos) {
      var nextVideo = leastViewedRelatedVideo(relatedVideos, visitedVideoIds)
      console.log("VideoId: " + nextVideo.id + ", views: " + nextVideo.views);
      findNextVideo(nextVideo.id, steps - 1, visitedVideoIds, controller);
    });
  });
}

function getRelatedVideoIds(videoId) {
  var url = relatedVideosURL(videoId);
  return Ember.$.getJSON(url).then(function(responseJSON) {
    return responseJSON.items.map(function(item) {return item.id.videoId;});
  });
}

function getRelatedVideoViews(relatedVideoIds) {
  return Promise.all(relatedVideoIds.map(function(relatedVideoId) {
    return Ember.$.getJSON(videoURL(relatedVideoId)).then(function(responseJSON) {
      return {
        id: relatedVideoId,
        views: parseInt(responseJSON.items[0].statistics.viewCount)
      }
    });
  }));
}

function leastViewedRelatedVideo(videos, alreadyVisitedIds) {
  var leastViewed = videos[0];
  videos.forEach(function(video) {
    if (video.views < leastViewed.views && alreadyVisitedIds.indexOf(video.id) === -1) {
      leastViewed = video;
    }
  });
  return leastViewed;
}


export default Ember.Controller.extend({
  watchedVideosCount: 0,
  setup: function() {
    var model = this.get('model');
    // this.set('currentVideo', model.startVideo);
    this.get('model.watchedVideos').pushObject(model.startVideo);
  }.observes('model'),

  watchedVideoIds: function() {
    return this.get('model.watchedVideos').map(function(watchedVideo) { return watchedVideo.id; });
  }.property('model.watchedVideos.[]'),

  currentVideo: function() {
    return this.get('model.watchedVideos').get('lastObject');
  }.property('model.watchedVideos.[]'),

  actions: {
    nextVideo: function() {
      this.incrementProperty('watchedVideosCount');
      if (this.get('watchedVideosCount') % 3 === 0) {
        var controller = this;
        randomWord().then(function(video) {
          controller.get('model.watchedVideos').pushObject(video);
        });

      } else {
        console.log(this.get('videosWatched'));
        var currentVideo = this.get('currentVideo');
        console.log(currentVideo.id)
        var watchedVideoIds = this.get('watchedVideoIds');
        findNextVideo(currentVideo.id, 2, watchedVideoIds, this);
      }
    }
  }
});
