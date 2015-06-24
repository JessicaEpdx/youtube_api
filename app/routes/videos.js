import Ember from 'ember';


export default Ember.Route.extend({
 model: function() {
   var url = "https://www.googleapis.com/youtube/v3/search?maxResults=50&key=AIzaSyD_PxM9k54XqazDnACGpMaI1awoGVqrSsw%20&part=snippet"
   return Ember.$.getJSON(url).then(function(responseJSON) {
     var videos = [];
     responseJSON.items.forEach(function(video) {
        video.fullUrl = "http://www.youtube.com/embed/" + video.id.videoId + "?autoplay=1&showinfo=0&controls=0&rel=0"
        videos.push(video);
     });
     return videos;
   });
  }
});
