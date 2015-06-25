import Ember from 'ember';

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
  visitedVideoIds.push(videoId);
  if (steps === 0) {
   controller.set('currentVideo.id', videoId);
   controller.set('currentVideo.fullUrl', "http://www.youtube.com/embed/" + videoId + "?autoplay=1&showinfo=0&controls=0&rel=0");
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
  setup: function() {
    var model = this.get('model');
    this.set('currentVideo', model.startVideo);
  }.observes('model'),

  actions: {
    nextVideo: function(model) {
      findNextVideo(this.get('currentVideo.id'), 1, [], this);
    }
  }
});
