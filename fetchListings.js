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
				if( count == yelpLinks.length ){ 
					loadYelpListingLinks( yelpSubLinks ); 
				}
		});
		
		
	});
	
}

function loadYelpListingLinks( yelpSubLinks ){
	
	var count = 0;
	var yelpData = [];
	
	$.each( yelpSubLinks, function(i, val){
		
		jsdom.env( "http://www.yelp.com" + val, ['http://code.jquery.com/jquery-1.5.min.js'],
			   	function(errors, window) {
			
				window.$(".column-alpha:first").find("li").each( function(){
					
					var listing = { name: "", address: "", category: "", phone: "", url: "" };
					
					if( window.$(this).find("address:first").length ){
						listing.address = window.$(this).find("address:first").html().replace("<br>", "");
					}
					
					if( window.$(this).find("h2:first").length ){
						var name = $.trim( window.$(this).find("h2:first").text() ).split(".");
						listing.name = name[1];
					}
					
					
					if( listing.address ){
						var phoneRegExp = /(\(\d+\) \d+-\d+)/ig;
						var matches = phoneRegExp.exec(listing.address);
						listing.phone = matches.length ? matches[1] : "";
					}
					
					if( window.$(this).find("h2:first").length ){
						listing.url = "http://www.yelp.com" 
								  	  + window.$(this).find("h2:first")
								  	  .find("a:first").attr("href");
					}
					
					listing.category = window.$(this).find("dd:first").text();
					
					yelpData.push( listing );
					
					console.log( listing.name );
				});
			
				count++;
				if( count == yelpSubLinks.length ){
					exportYelpListings( yelpData );
					// fetchYelpListingUrls( yelpData );
				}
		});
		
		return true;
	});
	
}

function fetchYelpListingUrls( yelpData ){
	
	var count = 0;
	var newYelpData = [];
	
	$.each( yelpData, function(i, val){
		
		jsdom.env( val.url, ['http://code.jquery.com/jquery-1.5.min.js'],
			   	function(errors, window) {

				val.name = window.$("#bizInfoHeader").find("h1:first").text();
				
				if( window.$("#bizUrl").find("a:first").length ){
					var siteUrl = window.$("#bizUrl").find("a:first")
										.attr("href").replace("/biz_redir?", "");
					var parts = siteUrl.split("&");
					
					$.each( parts, function(i, v){
						var p = v.split("=");
						if( p[0] == "url" ){
							siteUrl = decodeURIComponent( p[1] );
						}
					});
					
					val.siteUrl = siteUrl;
				}
				
				newYelpData.push( val );
				
				count++;
				if( count == yelpData.length ){
					exportYelpListings( newYelpData );
				}
		});
		
	});
	
}

function exportYelpListings( yelpData ){
	fs.writeFile( "yelpData.json", JSON.stringify(yelpData) );
}

// main();
var data = JSON.parse( fs.readFileSync( "yelpData.json" ) );
fetchYelpListingUrls( data );
