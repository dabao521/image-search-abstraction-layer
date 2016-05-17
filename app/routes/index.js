'use strict';
var dotenv = require("dotenv");
dotenv.load();
var querys = require("../models/query.js");
var bing = require('node-bing-api')({ accKey: process.env.ACCOUNT_ACCKEY});
var moment = require("moment");

//console.log(process.env.ACCOUNT_ACCKEY);

module.exports = function(app,urlParser){
    app.get("/api/imagesearch/[\\S\\s]+", function(req, res, next){
        var urlObj = urlParser(req.url, true);
        var offset = 0;
        var pathname = urlObj.pathname;
      //  console.log(urlObj);
        var queryString = /^.*imagesearch\/(.*)$/.exec(pathname)[1];
        if(queryString.length == 0) {
            return res.json({
                error : "please provide query string"
            });
        }
        if(urlObj.query.hasOwnProperty("offset")) {
            offset = urlObj.query.offset;
        }
        queryString = queryString.replace(/\%20/g, ' ');
        //console.log(queryString + " offset: " + offset);
        bing.images(queryString, {"skip" : +offset}, function(err, ress, body){
            if(err) {
                throw err;
            }
            //console.log(body.d.results[0]);
            var rt = [];
            var currTime = new Date().getTime();
            
            var newquery = new querys();
            newquery.when = currTime;
            newquery.term = queryString;
            querys.find({}).sort({"when" : 1}).exec(function(err, results){
                if(err) {
                    throw err;
                }
            //    console.log(results);
                if(results.length < 10) {
                    newquery.save(function(err){
                        if(err) {
                            throw err;
                        }
                        return showData(body.d.results, res);
                    });
                }else {
                    querys.findOneAndRemove({"when" : results[0].when}, function(err){
                        if(err) {
                            throw err;
                        }
                        newquery.save(function(err){
                            if(err) {
                                throw err;
                            }
                            return showData(body.d.results, res);
                        });
                    });
                }
            });
        });
    });
    
    app.get("/api/latest/imagesearch", function(req, res, next){
        querys.find({}, function(err, results){
            if(err) {
                throw err;
            }
            return res.json(results);
        });
    });
    
    function showData(results, res){
        var rt = [];
        for(var i = 0; i < 10 && i < results.length; i++) {
            var config = {
                url : results[i].MediaUrl,
                snippet : results[i].Title,
                thumbnail : results[i].Thumbnail.MediaUrl,
                context : results[i].SourceUrl
            };
            rt.push(config);            
        }
        return res.json(rt);
    };
}