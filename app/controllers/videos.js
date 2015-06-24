import Ember from 'ember';

export default Ember.Controller.extend({
  actions:{
    nextVideo : function(){
      location.reload();

    }
  }
});
