require([
  '$api/models',
  '$views/list#List',
  'scripts/vendor/jquery-2.0.3.min',
  'scripts/blog_track_list'
], function(models, List, jQuery, blog_track_list) {
  'use strict';

  // blogs
  var blogs = ['seejohnrun.tumblr.com', 'magerleagues.tumblr.com'];

  $(function () {

    var $container = $('#container');

    for (var i = 0; i < blogs.length; i++) {

      var blogName = blogs[i];

      blog_track_list.trackListing(blogs[i], function (blog, uris) {

        if (uris.length === 0) { return; }

        // Load up detail about this person
        var $detail = $('<div>');
        $detail.append($('<h2>').text('Recent from ' + blog.name));
        $detail.append($('<a>').attr('href', blog.url));
        $container.append($detail);

        // Make an OTF collection
        var collection = new models.Collection;
        uris.forEach(function (uri) {
          collection.add(models.Track.fromURI(uri));
        });

        // And put it in a list
        var list = new views.List.forCollection(collection);
        $container.append(list.node);
        list.init(); // TODO not sure what this does

      });

    };

  });

});
