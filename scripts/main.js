require([
  '$api/models',
  '$views/list#List',
  'scripts/vendor/jquery-2.0.3.min',
  'scripts/blog_track_list'
], function(models, List, jQuery, blog_track_list) {
  'use strict';

  // blogs
  var blogNames = ['seejohnrun.tumblr.com', 'magerleagues.tumblr.com'];

  $(function () {

    // Put up the loading indicator
    var $container = $('#container');
    $container.text('Loading...'); // TODO make prettier

    // Add each of the friends as a link
    blog_track_list.loadFriends(blogNames, function (blogs) {
      var $blogs = $('<div class="blogs">');
      blogs.forEach(function (blogDetail) {

        var avatar = 'http://api.tumblr.com/v2/blog/' + blogDetail.name + '.tumblr.com/avatar/64';
        var link = blogDetail.url;
        var $blog = $('<div>').addClass('blog-link');
        $blog.append($('<img>').attr('src', avatar));
        $blog.append($('<h3>').text(blogDetail.title));
        $blog.append($('<a>').attr('href', link).text(link));
        $blogs.append($blog);

      });
      $container.html($blogs);
    });

    return; // FUCK OFF GOON

    for (var i = 0; i < blogs.length; i++) {

      var blogName = blogs[i];

      blog_track_list.trackListing(blogs[i], function (blog, uris) {

        if (uris.length === 0) { return; }

        // Load up detail about this person
        var $detail = $('<div>');
        $detail.append($('<h2>').text('Recent from ' + blog.name));
        $detail.append($('<a>').attr('href', blog.url));
        $container.append($detail);

        // Make an OTF playlist
        models.Playlist.createTemporary('tumblr:' + blog.name).done(function (playlist) {

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

  });

});
