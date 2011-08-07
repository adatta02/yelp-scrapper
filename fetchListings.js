var jsdom = require('jsdom');
var $ = require("jquery");
var request = require('request');
var async = require("async");

function main(){
	
	var yelpDirectories = [ "http://www.yelp.com/boston" ];
	var yelpLinks = [];
	var count = 0;
	$.each( yelpDirectories, function(i, val){
		
		jsdom.env( val, ['http://code.jquery.com/jquery-1.5.min.js'],
				   	function(errors, window) {
				
						window.$("#a-z-biz-list").find("a").each( function(){
							var u = window.$(this).attr("href");
							if( u.indexOf("added") == -1 ){
								yelpLinks.push( window.$(this).attr("href") );
							}
						});
						
						count ++;
						
						if( count == yelpDirectories.length ){
							loadYelpSubListings( yelpLinks );
						}
				}
		);
		
	});

}

function loadYelpListingLinks( yelpSubLinks ){
	console.log( yelpSubLinks );
}

function loadYelpSubListings( yelpLinks ){
	
	var yelpSubLinks = [];
	var count = 0;
	
	$.each( yelpLinks, function(i, val){
		
		jsdom.env( "http://www.yelp.com" + val, ['http://code.jquery.com/jquery-1.5.min.js'],
			   	function(errors, window) {
				window.$(".listing:first").find("a").each( function(){
					yelpSubLinks.push( window.$(this).attr("href") );
				});
				
				count ++;
				if( count == yelpLinks.length ){ loadYelpListingLinks( yelpSubLinks ); }
		});
		
		
	});
	
}

main();
