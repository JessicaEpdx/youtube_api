import Ember from 'ember';


export default Ember.Route.extend({
 model: function() {
  return {
    startVideo: {
    id: "az5qOjhsang",
    fullUrl: "http://www.youtube.com/embed/az5qOjhsang?autoplay=1&showinfo=0&controls=0&rel=0",
    thumbnail: "https://i.ytimg.com/vi/az5qOjhsang/default.jpg",
    externalUrl: "https://www.youtube.com/watch?v=az5qOjhsang"
    },
    watchedVideos: [{
    id: "PUhuPn8_d0Q",
    fullUrl: "http://www.youtube.com/embed/PUhuPn8_d0Q?autoplay=1&showinfo=0&controls=0&rel=0",
    thumbnail: "https://i.ytimg.com/vi/PUhuPn8_d0Q/default.jpg",
    externalUrl: "https://www.youtube.com/watch?v=PUhuPn8_d0Q"


  }, {
    id: "llNAsoF64Ng",
    fullUrl: "http://www.youtube.com/embed/llNAsoF64Ng?autoplay=1&showinfo=0&controls=0&rel=0",
    thumbnail: "https://i.ytimg.com/vi/llNAsoF64Ng/default.jpg",
    externalUrl: "https://www.youtube.com/watch?v=llNAsoF64Ng"


    }]
    }
  }
});
