
"use strict";
var config = {
  features: {

  },
  tradeoff_analytics : {
    username: 'yours',
    password: 'notMine',
    version: 'v1'
  },
  publicCollectionRecommendations : {
    objectives : { 
      "upvotes" : {
        active : false
      }, 
      "downvotes" : {
        active : false
      }, 
      "followers" : {
        active : true
      }, 
      "upvotesAmongFriends" : {
        active : false
      }, 
      "downvotesAmongFriends" : {
        active : false
      }, 
      "followersAmongFriends" : {
        active : true
      }, 
      "isOwnerAmongFriends" : {
        active : true
      }, 
      "isOwnerVerified" : {
        active : true
      }, 
      "geoContributorDistance" : {
        active : true  
      }, 
      "industryContributorDistance" : {
        active : true
      }
    }
  }
};

module.exports = config;

