import Ember from 'ember';

export default Ember.Controller.extend({
  movieSwitch: false,
  setup: function() {
    var model = this.get('model');
    var index = Math.floor(Math.random()*model.length);
    this.set('currentVideo', model.objectAt(index));
  }.observes('model'),

  actions: {
    nextVideo: function(model) {
      var index = Math.floor((Math.random()*model.length));
      this.set('movieSwitch', true);
      this.set('currentVideo', model.objectAt(index));
    }
  }

});
