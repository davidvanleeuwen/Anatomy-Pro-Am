(function() {
  var Hash, addMyFriends, addOauthCredental, addUser, addUserAsFriend, associateFriend, authresponse, base64decode, cleanJSON, color, config, fbGetFriendsObject, fbGetMeObject, fbgraph, fbutil, formatUser, gatherInitLogin, getFriends, getUser, http, httpClient, renderIndex, storeUser, userDeauthed, userDeclinedAccess;
  config = require('./config');
  fbgraph = require('facebook-graph@0.0.6');
  fbutil = require('./facebookutil.js');
  http = require('http');
  color = require('./color.js').set;
  httpClient = require('./public/javascripts/httpclient.js');
  Hash = require('hashish@0.0.2');
  storeUser = function(userData, userCode) {
    console.log('store user');
    return addUser(userData, function(callback) {
      console.log(callback);
      return getUser(userData.id, function(cb) {
        if (!cb.error) {
          return addOauthCredental(JSON.parse(cb).facebook_user.id, userCode, function(callback) {
            return console.log('get user response back from adding oauth');
          });
        } else {
          return console.log("this is coming from storeUser.getUser");
        }
      });
    });
  };
  addOauthCredental = function(userID, userCode, callback) {
    var client, dbPath, postData;
    console.log('this is the oauth area');
    console.log(userID + " " + userCode);
    dbPath = '/users/' + userID + '/facebook_user/authorizations.json';
    postData = {};
    postData["id"] = config.fbconfig.internalAppID;
    postData["user_id"] = userID;
    postData["auth_code"] = userCode;
    postData = JSON.stringify(postData);
    client = new httpClient.httpclient;
    console.log(postData);
    return client.perform(config.sql.fullHost + dbPath, "POST", function(res) {
      return callback(res.response.body);
    }, postData);
  };
  userDeauthed = function(reqInfo, res) {
    console.log(color("------------------- USER REMOVED APP! ----------------", 'red'));
    console.log((JSON.parse(base64decode(reqInfo.body.signed_request.split('.')[1])).user_id));
    console.log(color("------------------- USER REMOVED APP! ----------------", 'red'));
    return res.redirect('http://www.wisc.edu');
  };
  userDeclinedAccess = function(reqInfo, res) {
    console.log(color("------------------- USER DENIED TERMS ----------------", 'red'));
    console.log(reqInfo.query.error_reason);
    console.log(reqInfo.query.error);
    console.log(reqInfo.query.error_description);
    console.log(color("------------------- USER DENIED TERMS ----------------", 'red'));
    return res.redirect('http://www.wisc.edu');
  };
  authresponse = function(req, res) {
    var args, path;
    if (req.query.code) {
      console.log(color("------------------- USER ACCEPTED TERMS, REQUESTING ACCESS TOKEN ----------------", 'green'));
      path = '/oauth/access_token';
      args = {
        client_id: config.fbconfig.appId,
        redirect_uri: config.fbconfig.redirect_uri,
        client_secret: config.fbconfig.appSecret,
        code: req.query.code
      };
      fbutil.auth(path, 'GET', args, function(error, token) {
        var graph;
        if (token) {
          graph = new fbgraph.GraphAPI(token);
          return graph.getObject('me', function(error, userData) {
            if (error) {
              console.log(color('------------------- UNABLE TO RETRIEVE USER OBJECT FROM FACEBOOK ----------------', 'red'));
              console.log(error);
            }
            if (userData) {
              return storeUser(userData, token);
            }
          });
        }
      });
      res.redirect(config.fbconfig.url);
    } else {
      console.log(color('------------------- NO CODE RETURNED FROM SERVER! ----------------', 'red'));
      console.log(req);
      res.end;
    }
    if (req.query.error_reason) {
      userDeclinedAccess(req, res);
      return res.end();
    }
  };
  /*
  renderIndex :
  Renders gathers user info based on either a signed request or the users cookie, or ref's to auth page.
  */
  renderIndex = function(req, res, getToken) {
    var user, user2;
    user = fbgraph.getUserFromCookie(req.cookies, config.fbconfig.appId, config.fbconfig.appSecret);
    if (req.body) {
      console.log(color('------------------- USER AUTHED BY SIGNED_REQUEST -------------------', 'blue'));
      user2 = JSON.parse(base64decode(req.body.signed_request.split('.')[1]));
      return gatherInitLogin(user2.oauth_token, user2.user_id, getToken, function(callback) {
        if (callback.error) {
          return res.render('auth', {
            fb: config.fbconfig
          });
        } else {
          return res.render('index', {
            fb: config.fbconfig,
            token: callback.data.token
          });
        }
      });
    } else {
      if (user) {
        console.log(color('------------------- USER AUTHED BY COOKIE -------------------', 'blue'));
        return gatherInitLogin(user.access_token, user.uid, getToken, function(callback) {
          if (callback.error) {
            return res.render('auth', {
              fb: config.fbconfig
            });
          } else {
            return res.render('index', {
              fb: config.fbconfig,
              token: callback.data.token
            });
          }
        });
      } else {
        console.log(color('------------------- NO USER - RENDERING AUTH PAGE -------------------', 'blue'));
        return res.render('auth', {
          fb: config.fbconfig
        });
      }
    }
  };
  gatherInitLogin = function(authToken, userID, getToken, cb) {
    fbGetMeObject(authToken, function(callback) {
      var token;
      if (callback.data) {
        token = getToken(callback.data);
        if (token) {
          storeUser(callback.data, authToken);
          cb({
            data: {
              token: token
            }
          });
        }
      }
      if (callback.error) {
        return cb({
          error: callback.error
        });
      }
    });
    return fbGetFriendsObject(authToken, function(callback) {
      if (callback.data) {
        return addMyFriends(callback.data, userID);
      }
    });
  };
  fbGetFriendsObject = function(authToken, callback) {
    var graph;
    graph = new fbgraph.GraphAPI(authToken);
    return graph.getConnections('me', 'friends', function(error, data) {
      if (error) {
        console.log(color('fbGetFriendsObject error: ', 'red'));
        console.log(error);
        return callback({
          error: error
        });
      } else {
        return callback({
          data: data
        });
      }
    });
  };
  fbGetMeObject = function(authToken, callback) {
    var graph;
    graph = new fbgraph.GraphAPI(authToken);
    return graph.getObject('me', function(error, data) {
      if (error) {
        console.log(color('fbGetMeObject error: ', 'red'));
        console.log(error);
        return callback({
          error: error
        });
      } else {
        return callback({
          data: data
        });
      }
    });
  };
  addMyFriends = function(d, myID) {
    Hash(d.data).forEach(function(friend) {
      return addUserAsFriend(myID, friend);
    });
    return getUser(myID, function(getUserResult) {
      if (!getUserResult.error) {
        getFriends(JSON.parse(getUserResult).facebook_user.id, function(friendsResult) {});
      } else {
        console.log("This is from addMyFriends.getUser");
      }
      return console.log(getUserResult);
    });
  };
  getFriends = function(uid, cb) {
    var client, dbPath;
    dbPath = '/users/' + uid + '/friends.json';
    client = new httpClient.httpclient;
    return client.perform(config.sql.fullHost + dbPath, "GET", function(res) {
      var result;
      result = res.response.body;
      return cb(result);
    });
  };
  associateFriend = function(uid, friendID) {
    var client, dbPath, postData;
    dbPath = '/users/' + uid + '/friends';
    postData = '{"friend_id":' + friendID + '}';
    client = new httpClient.httpclient;
    return client.perform(config.sql.fullHost + dbPath, "POST", function(res) {
      var result;
      return result = res.response.body;
    }, postData);
  };
  addUser = function(info, callback) {
    return getUser(info.id, function(cb) {
      var client2, dbPath, postData, result;
      if (cb.error === 404) {
        console.log('get user response with error');
        console.log(color('------------------- USER DOES NOT EXIST - CREATING -------------------\n', 'green'));
        console.log(info.id + " " + info.name);
        postData = formatUser(info);
        dbPath = '/facebook_users.json';
        client2 = new httpClient.httpclient;
        return client2.perform(config.sql.fullHost + dbPath, "POST", function(resp) {
          var result;
          result = resp.response.body;
          console.log(color('------------------- RESULT OF ADDING USER -------------------\n', 'green'));
          console.log(JSON.parse(result).facebook_user.id, JSON.parse(result).facebook_user.name);
          return callback(result);
        }, postData);
      } else {
        result = color('------------------- USER ALREADY EXISTS -------------------\n', 'green');
        result += JSON.parse(cb).facebook_user.id + " - " + JSON.parse(cb).facebook_user.name;
        return callback(cb);
      }
    });
  };
  addUserAsFriend = function(playerID, friendInfo) {
    var myID;
    myID = '';
    return getUser(playerID, function(cb) {
      myID = JSON.parse(cb).facebook_user.id;
      return addUser(friendInfo, function(cb) {
        return associateFriend(myID, JSON.parse(cb).facebook_user.id);
      });
    });
  };
  getUser = function(fbid, cb) {
    var client, dbPath;
    dbPath = '/facebook_users/uid/' + fbid + '.json';
    client = new httpClient.httpclient;
    return client.perform(config.sql.fullHost + dbPath, "GET", function(res) {
      var result;
      if (res.response.status === 404) {
        result = {
          error: 404
        };
      } else {
        result = res.response.body;
      }
      return cb(result);
    });
  };
  formatUser = function(inbound) {
    var f, outbound;
    outbound = {};
    Hash(inbound).forEach(function(value, key) {
      switch (key) {
        case 'id':
          return outbound["uid"] = value;
        case 'hometown':
          outbound['hometown'] = {};
          return Hash(value).forEach(function(v2, k2) {
            if (k2 === 'id') {
              return outbound['hometown']["facebook_id"] = v2;
            } else {
              return outbound['hometown'][k2] = v2;
            }
          });
        case 'location':
          outbound['location'] = {};
          return Hash(value).forEach(function(v2, k2) {
            if (k2 === 'id') {
              return outbound['location']["facebook_id"] = v2;
            } else {
              return outbound['location'][k2] = v2;
            }
          });
        case 'name':
        case 'first_name':
        case 'last_name':
        case 'link':
        case 'username':
        case 'birthday':
        case 'email':
        case 'timezone':
        case 'locale':
        case 'verified':
        case 'gender':
          return outbound[key] = value;
        default:
          return console.log("Skipping: " + key + " : " + value);
      }
    });
    f = {};
    f['facebook_user'] = outbound;
    outbound = JSON.stringify(f);
    return outbound;
  };
  cleanJSON = function(input) {
    var a, j, k, keyStr, o, output;
    keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=:-_{}[]".,|';
    output = "";
    k = 0;
    o = '';
    while (k < input.length) {
      a = input.charAt(k++);
      j = 0;
      while (j < keyStr.length) {
        if (a === keyStr.charAt(j++)) {
          o += a;
        }
      }
    }
    return o;
  };
  base64decode = function(input) {
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4, i, keyStr, output;
    keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    output = "";
    i = 0;
    while (i < input.length) {
      enc1 = keyStr.indexOf(input.charAt(i++));
      enc2 = keyStr.indexOf(input.charAt(i++));
      enc3 = keyStr.indexOf(input.charAt(i++));
      enc4 = keyStr.indexOf(input.charAt(i++));
      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = (enc2 & 15) << 4 | (enc3 >> 2);
      chr3 = (enc3 & 3) << 6 | enc4;
      output += String.fromCharCode(chr1);
      if (enc3 !== 64) {
        output += String.fromCharCode(chr2);
      }
      if (enc4 !== 64) {
        output += String.fromCharCode(chr3);
      }
    }
    return cleanJSON(unescape(output));
  };
  exports.addUser = addUser;
  exports.formatUser = formatUser;
  exports.store_user = storeUser;
  exports.userDeauthed = userDeauthed;
  exports.userDeclinedAccess = userDeclinedAccess;
  exports.authresponse = authresponse;
  exports.renderIndex = renderIndex;
}).call(this);
