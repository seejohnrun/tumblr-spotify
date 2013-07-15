require([
  '$api/models',
  '$views/list#List',
  '$views/throbber#Throbber',
  'scripts/vendor/jquery-2.0.3.min',
  'scripts/vendor/underscore-min#_',
  'scripts/blog_track_list'
], function(models, List, Throbber, jQuery, _, blog_track_list) {
  'use strict';

  // blogs
  var blogNames = [
    'seejohnrun.tumblr.com',
    'magerleagues.tumblr.com',
    'strle.tumblr.com',
    'gotmelookingsocrazyrightnow.tumblr.com',
    'staff.tumblr.com',
    'pitchfork.tumblr.com',
    'nprmusic.tumblr.com',
    'amenfashion.tumblr.com',
    'macklemore.tumblr.com',
    'britneyspears.tumblr.com',
    'arianasings.tumblr.com',
    'dirtylovinghippies.tumblr.com',
    'thekeysofalicia.tumblr.com',
    'thefader.tumblr.com',
    'spotify.tumblr.com',
    'cmj.tumblr.com',
    'buzzfeedmusic.tumblr.com',
    'iam.beyonce.com',
    'thisisnthappiness.com',
    'fredwilson.vc'
  ];

  $(function () {

    // Load templates
    var $container = $('#container');
    var bcTemplate = _.template($('#blog-card-template').html());
    var blogsTemplate = _.template($('#blogs-template').html());
    var blogTemplate = _.template($('#blog-template').html());
    var blogHeaderTemplate = _.template($('#blog-header-template').html());
    var blogEmptyTemplate = _.template($('#blog-empty-template').html());

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
      // Load the template
      $container.html(blogsTemplate());
      var $blogs = $container.find('.blogs');
      var throbber = Throbber.forElement($blogs[0]);
      // Add each of the friends as a link
      blog_track_list.loadFriends(blogNames, function (blogs) {
        blogs.forEach(function (blogDetail) {
          blogDetail.avatar96 = 'http://api.tumblr.com/v2/blog/' + blogDetail.name + '.tumblr.com/avatar/96';
          $blogs.append(bcTemplate(blogDetail));
        });
        throbber.hide();
      });
    };

    var loadBlog = function (blogName) {

      $container.html(blogTemplate());
      var $blog = $container.find('#blog');
      var blogThrobber = Throbber.forElement($blog[0]);

      blog_track_list.trackListing(blogName, function (blog, uris) {

        uris = _.compact(uris);

        blogThrobber.hide();

        // Load up detail about this person
        blog.avatar128 = 'http://api.tumblr.com/v2/blog/' + blog.name + '.tumblr.com/avatar/128';
        $blog.append(blogHeaderTemplate(blog));

        // be able to stop
        if (uris.length === 0) {
          $blog.append(blogEmptyTemplate());
          return;
        }

        // Make an OTF playlist
        var tempName = 'tumblr:' + blog.name + ':' + new Date().getTime().toString();
        models.Playlist.createTemporary(tempName).done(function (playlist) {

          // Add the tracks to the playlist
          playlist.load('tracks');
          playlist.tracks.add(models.Track.fromURIs(uris)).done(function () {

            // And put it in a list
            var list = new List.forPlaylist(playlist);
            $blog.append(list.node);
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
