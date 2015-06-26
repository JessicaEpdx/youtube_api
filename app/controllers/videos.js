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
      var controller = this;
      randomWord().then(function(video) {
        controller.get('model.watchedVideos').pushObject(video);
      });
    },
    ytEnded: function() {
      var controller = this;
      randomWord().then(function(video) {
        controller.get('model.watchedVideos').pushObject(video);
      });
    }
  }
});
