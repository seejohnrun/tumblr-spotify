require([
  '$api/models',
  '$api/search#Search',
  '$views/list#List',
  'scripts/vendor/jquery-2.0.3.min'
], function(models, Search, List, jQuery) {
  'use strict';

  // blogs
  var blogs = ['seejohnrun.tumblr.com', 'magerleagues.tumblr.com'];
  var apiKey = 'xzGO5Gq1iF5aYb0pMGi9GHoqzICmWBkFg65FCsTrKtsG8aSFX7';

  $(function () {

    var $container = $('#container');

    for (var i = 0; i < blogs.length; i++) {

      var blogName = blogs[i];

      // Get the blog info
      $.get('http://api.tumblr.com/v2/blog/' + blogName + '/info?api_key=' + apiKey, function (data) {

        var blog = data.response.blog;

        // Load up detail abou this person
        var $detail = $('<div>');
        $detail.append($('<h2>').text('Recent from ' + blog.name));
        $detail.append($('<a>').attr('href', blog.url));

        // Add the list to the page
        var uris = [];

        // grab songs
        $.get('http://api.tumblr.com/v2/blog/' + blogName + '/posts?type=audio&limit=15&api_key=' + apiKey, function (postData) {

          var pending = postData.response.posts.length;
          postData.response.posts.forEach(function (post) {

            var searcher = Search.search(post.track_name + '  ' + post.artist);
            searcher.tracks.snapshot({ length: 1 }).done(function (t) {

              if (t.length > 0) {
                uris.push(t._uris[0]);
              }

              pending -= 1;
              if (pending === 0) {

                console.log(uris);
                var collection = new models.Collection;
                collection.add(models.Track.fromURIs(uris));

                var list = new views.List.forCollection(collection);
                $container.append($detail);
                $container.append(list.node);
                list.init(); // not sure what this does

              }

            });

          });

        });

      });

    };

  });

});
