var jsdom = require('jsdom');
var $ = require("jquery");
var request = require('request');
var async = require("async");
var fs = require('fs');

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
	
	var count = 0;
	var yelpData = [];
	
	$.each( yelpSubLinks, function(i, val){
		
		jsdom.env( "http://www.yelp.com" + val, ['http://code.jquery.com/jquery-1.5.min.js'],
			   	function(errors, window) {
				
				window.$(".column-alpha:first").find("li").each( function(){
					
					var listing = { };
					var name = $.trim( window.$(this).find("h2:first").text() ).split(".");
					name = name[1];
					
					listing.url = "http://www.yelp.com" 
								  + window.$(this).find("h2:first").find("a:first").attr("href");
					listing.name = name;
					listing.address = window.$(this).find("address:first").html().replace("<br>", "\n");
					listing.category = window.$(this).find("dd:first").text();
					
					yelpData.push( listing );
				});
			
				count++;
				if( count == yelpSubLinks.length ){
					exportYelpListings( yelpData );
				}
		});
		
	});
}

function exportYelpListings( yelpData ){
	fs.writeFile( "yelpData.json", JSON.stringify(yelpData) );
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

// main();
var data = JSON.parse( fs.readFileSync("yelpData.json") );
console.log( data[0] );
