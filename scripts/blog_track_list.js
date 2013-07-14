require([
  '$api/models',
  '$api/search#Search'
], function (models, Search) {

  var base = 'http://api.tumblr.com/v2/';
  var apiKey = 'xzGO5Gq1iF5aYb0pMGi9GHoqzICmWBkFg65FCsTrKtsG8aSFX7';

  var trackListing = function (blogName, callback) {

    // Get the blog info
    $.get(base + 'blog/' + blogName + '/info?api_key=' + apiKey, function (data) {

      var blog = data.response.blog;

      // Grab songs and find on spotify
      $.get(base + 'blog/' + blogName + '/posts?type=audio&limit=15&api_key=' + apiKey, function (postData) {

          var uris = [];
          var pending = postData.response.posts.length;
          postData.response.posts.forEach(function (post) {

            var searcher = Search.search(post.track_name + '  ' + post.artist);
            searcher.tracks.snapshot({ length: 1 }).done(function (t) {

              if (t.length > 0) { uris.push(t._uris[0]); } // add result

              pending -= 1;
              if (pending === 0) {
                callback(data.response.blog, uris);
              }

            });

          });

        });

      });

  };

  exports.trackListing = trackListing;

});

