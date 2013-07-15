require([
  '$api/models',
  '$api/search#Search'
], function (models, Search) {

  var base = 'http://api.tumblr.com/v2/';
  var apiKey = 'xzGO5Gq1iF5aYb0pMGi9GHoqzICmWBkFg65FCsTrKtsG8aSFX7';

  var loadFriends = function (blogNames, callback) {
    var datas = [];
    blogNames.forEach(function (blogName) {
      $.get(base + 'blog/' + blogName + '/info?api_key=' + apiKey, function (data) {
        datas.push(data.response.blog);
        if (datas.length === blogNames.length) {
          callback(datas);
        }
      });
    });
  };

  var findTrack = function (term, i, callback) {
    var searcher = Search.search(term.trim());
    searcher.tracks.snapshot({ length: 1 }).done(function (t) {
      callback(t, i);
    });
  };

  var trackListing = function (blogName, callback) {

    // Get the blog info
    $.get(base + 'blog/' + blogName + '.tumblr.com/info?api_key=' + apiKey, function (data) {

      var blog = data.response.blog;

      // Grab songs and find on spotify
      $.get(base + 'blog/' + blogName + '.tumblr.com/posts?type=audio&limit=50&api_key=' + apiKey, function (postData) {

        var posts = postData.response.posts;
        var uris = new Array(posts.length);
        var pending = posts.length;

        for (var i = 0; i < posts.length; i++) {

          var post = posts[i];

          // do we already have the URI?
          if (post.source_title === 'Spotify') {
            var m = post.source_url.match(/track\/(\w+)/);
            if (m) {
              uris[i] = 'spotify:track:' + m[1];
              if (!(pending -= 1)) { callback(data.response.blog, uris); }
              continue;
            }
          }

          // FAIL
          if (! post.track_name) {
            if (!(pending -= 1)) { callback(data.response.blog, uris); }
            continue;
          }

          findTrack(post.track_name + ' ' + (post.artist || ''), i, function (t, i) {
            if (t.length > 0) { uris[i] = t._uris[0]; } // add result
            if (!(pending -= 1)) { callback(data.response.blog, uris); }
          });

        };

      });

    });

  };

  exports.loadFriends = loadFriends;
  exports.trackListing = trackListing;

});

