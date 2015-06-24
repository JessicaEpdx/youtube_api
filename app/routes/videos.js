import Ember from 'ember';


export default Ember.Route.extend({
 model: function() {
   var url = "https://www.googleapis.com/youtube/v3/search?key=AIzaSyD_PxM9k54XqazDnACGpMaI1awoGVqrSsw%20&part=snippet&maxResults=1&publishedAfter=2015-06-21T00%3A00%3A00Z";
   return Ember.$.getJSON(url).then(function(responseJSON) {
     var videos = [];
     responseJSON.items.forEach(function(video) {
        video.fullUrl = "http://www.youtube.com/embed/" + video.id.videoId;
        videos.push(video);
     });
     return videos;
   });
  }
});
