import Ember from 'ember';


export default Ember.Route.extend({
 model: function() {
  return {
    startVideo: {
    id: "az5qOjhsang",
    fullUrl: "http://www.youtube.com/embed/az5qOjhsang?autoplay=1&showinfo=0&controls=0&rel=0"
    },
    watchedVideos: []
    }
  }
});
