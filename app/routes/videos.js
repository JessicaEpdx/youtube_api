import Ember from 'ember';


export default Ember.Route.extend({
 model: function() {

  function buildVideo(videoId) {
    return {
      id          : videoId,
      fullUrl     : "http://www.youtube.com/embed/" + videoId + "?autoplay=1&showinfo=0&controls=0&rel=0",
      externalUrl : "https://www.youtube.com/watch?v=" + videoId
    }
  }

  var viewCountThreshold = 500;
  var keywordBlacklist = ["pronounce", "say", "vocabulary", "spelling"];

  function randomWord() {
    var requestStr = "http://randomword.setgetgo.com/get.php";
    return $.ajax({
       type: "GET",
       url: requestStr,
       dataType: "jsonp",
    }).then(function(data) {return randomVideo(data)});
  }

  function isBlacklisted(title) {
    // debugger;
    title = title.toLowerCase();
    for(var i = 0; i < keywordBlacklist.length; i++) {
      if(title.includes(keywordBlacklist[i])) {
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
           } else if(isBlacklisted(responseJSON2.items[0].snippet.title)) {
             console.log("Title:" + responseJSON2.items[0].snippet.title + " contains blacklisted word. Restarting search.")
             return randomWord();
           } else {
             var videoId = responseJSON2.items[0].id;
             return buildVideo(videoId);
           }
         });
       }

    });
  }

  return randomWord().then(function(video) {
    return {
      startVideo: video,
      watchedVideos: []
    }
  });

}
});
