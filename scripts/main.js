require([
  '$api/models',
  '$views/list#List',
  'scripts/vendor/jquery-2.0.3.min',
  'scripts/vendor/underscore-min#_',
  'scripts/blog_track_list'
], function(models, List, jQuery, _, blog_track_list) {
  'use strict';

  // blogs
  var blogNames = ['seejohnrun.tumblr.com', 'magerleagues.tumblr.com'];

  $(function () {

    // Put up the loading indicator
    var $container = $('#container');
    $container.text('Loading...'); // TODO make prettier

    // Load templates
    var bcTemplate = _.template($('#blog-card-template').html());
    var blogsTemplate = _.template($('#blogs-template').html());

    // Handle new requests
    var start = function (args) {
      $container.html('');
      if (args.length > 0 && args[0] === 'blogName') {
        loadBlog(args[1]);
      } else {
        loadBlogDirectory();
      }
    };

    // Load all pages
    var loadBlogDirectory = function () {

      // Add each of the friends as a link
      blog_track_list.loadFriends(blogNames, function (blogs) {

        $container.html(blogsTemplate());
        var $blogs = $container.find('.blogs');
        blogs.forEach(function (blogDetail) {
          blogDetail.avatar64 = 'http://api.tumblr.com/v2/blog/' + blogDetail.name + '.tumblr.com/avatar/64';
          $blogs.append(bcTemplate(blogDetail));
        });

      });

    };

    var loadBlog = function (blogName) {

      var $link = $('<a>').text('back to friends').attr('href', 'spotify:app:tumblr');
      $container.append($link);
      $container.append($('<hr>'));

      blog_track_list.trackListing(blogName, function (blog, uris) {

        if (uris.length === 0) { return; }

        // Load up detail about this person
        var $detail = $('<div>');
        $detail.append($('<h2>').text('Recent from ' + blog.name));
        $detail.append($('<a>').attr('href', blog.url));
        $container.append($detail);

        // Make an OTF playlist
        var tempName = 'tumblr:' + blog.name + ':' + new Date().getTime().toString();
        models.Playlist.createTemporary(tempName).done(function (playlist) {

          // Add the tracks to the playlist
          playlist.load('tracks');
          playlist.tracks.add(models.Track.fromURIs(uris)).done(function () {

            // And put it in a list
            var list = new List.forPlaylist(playlist);
            $container.append(list.node);
            list.init(); // TODO not sure what this does

          });

        });

      });

    };

    // Hook into load and update
    models.application.load('arguments').done(function (app) { start(app.arguments); });
    models.application.addEventListener('arguments', function (e) {
      start(e.data.arguments);
    });

  });

});
