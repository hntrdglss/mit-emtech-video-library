"use strict";
var MITTR = MITTR || {};

MITTR.EmTech = {

};

	MITTR.EmTech.Video = Backbone.Model.extend({
		initialize: function() {
			this.view = new MITTR.EmTech.VideoView({
				id: this.get("id"),
				model: this
			});
		},

		watch: function() {
			this.view.watch();
			this.collection.player.watch(this.attributes);
		},

		defaults: {
			id: '',
			brightcove_id: 0,
			title: '',
			description: '',
			thumbnail: "/emtech/12/global/i/img-no_video_thumb.jpg",
			highlight: false,
			tr35: false,
			day: 0
		}
	});

		MITTR.EmTech.VideoView = Backbone.View.extend({
			tagName: "li",
			className: "video",

			events: {
				"click": "navigate"
			},

			initialize: function() {
				this.render();
				this.model.on("change:thumbnail", this.updateThumb, this);
			},

			render: function() {
				this.$el.html('<img src="' + this.model.get("thumbnail") + '" alt="" /><h2>' + this.model.get("title") + '</h2>');
				this.model.collection.view.$el.append(this.el);
			},

			updateThumb: function() {
				this.$("img").attr("src", this.model.get("thumbnail"));
			},

			watch: function() {
				this.model.collection.view.$el.hide();
			},

			navigate: function() {
				window.router.navigate("!/watch/" + this.model.get("id") + "/", {trigger: true});
			}
		});

		MITTR.EmTech.VideoPlayer = Backbone.View.extend({
			id: "video-player",

			isLoaded: false,

			brightcove: {},

			playerConfig: {
				playerID: "1237507476001",
				playerKey: "AQ~~,AAAAAAEgZvo~,jStb8wH-jnIlhYFjMUYJttcZynWzN1UG",
				videoID: "1958752448001",
				width: "800",
				height: "450"
			},

			initialize: function() {
				this.render();
			},

			render: function() {
				var brightcove_markup = this.markup('<object id="myExperience" class="BrightcoveExperience"><param name="bgcolor" value="#000000" /><param name="width" value="{{width}}" /><param name="height" value="{{height}}" /><param name="playerID" value="{{playerID}}" /><param name="playerKey" value="{{playerKey}}" /><param name="isVid" value="true" /><param name="isUI" value="true" /><param name="dynamicStreaming" value="true" /><param name="@videoPlayer" value="{{videoID}}" /><param name="includeAPI" value="true" /><param name="htmlFallback" value="true" /><param name="templateLoadHandler" value="videos.player.instance" /></object>', this.playerConfig);

				$(this.el).html('<h2>Video Title</h2><div id="video-floats"><div id="player-container">' + brightcove_markup + '</div><aside><ul id="video_tools"><li id="share" class="addthis_button">Share</li></div></aside></div><p>Video description.</p>');

				$("#video-stage").append(this.el);

				brightcove.createExperiences();
			},

			instance: function(id) {
				if(!window.videos.player.isLoaded) {
					window.videos.player.brightcove = brightcove.api.getExperience(id).getModule(brightcove.api.modules.APIModules.VIDEO_PLAYER);
					window.videos.player.isLoaded = true;
					window.videos.player.trigger("loaded");
				}
			},

			markup: function(html, data) {
				var m;
				var i = 0;
				var match = html.match(data instanceof Array ? /{{\d+}}/g : /{{\w+}}/g) || [];

				while (m = match[i++]) {
					html = html.replace(m, data[m.substr(2, m.length-4)]);
				}

				return html;
			},

			watch: function(video) {
				if(this.isLoaded) {
					this.show();
					this.$("h2").text(video.title);
					this.$("p").text(video.description);
					this.brightcove.loadVideoByID(video.brightcove_id);

					if(typeof window.addthis  !== "undefined") {
						window.addthis.update("share", "url", "http://www2.technologyreview.com/emtech/12/video/#!/watch/" + video.id + "/");
						window.addthis.update("share", "title", "EmTech Video: " + video.title);
					}
				} else {
					var self = this;

					this.on("loaded", function() {
						self.watch(video);
					});
				}
			},

			show: function() {
				this.$el.addClass("visible"); // show player (see below about using hide/display: none)
			},

			hide: function() {
				this.$el.removeClass("visible"); // hide player, display: none causes BCL player to unlink from API
			}
		});

	MITTR.EmTech.Videos = Backbone.Collection.extend({
		model: MITTR.EmTech.Video,

		url: "https://spreadsheets.google.com/feeds/list/0At2ZHOhs5LhEdFFFUHdDN0dIR0pBT1ZpeUhZbzdLMHc/od6/public/values?alt=json",

		areLoaded: false,

		initialize: function() {
			this.view = new MITTR.EmTech.VideosView({
				id: "video-list",
				collection: this
			});

			this.player = new MITTR.EmTech.VideoPlayer();

			this.fetch();

			this.on("reset", function() {
				this.getThumbnails();
				this.areLoaded = true;
			}, this);
		},

		parse: function(response) {
			var videos = [];

			// Parse and load videos from Google Docs spreadsheet feed
			_.each(response.feed.entry, function(video) {
				if(video["gsx$brightcoveid"]["$t"] !== '' && video["gsx$url"]["$t"] !== '') {
					videos.push({
						id: video["gsx$url"]["$t"].substring(1),
						brightcove_id: video["gsx$brightcoveid"]["$t"],
						title: video["gsx$videotitle"]["$t"],
						description: video["gsx$videodescription"]["$t"],
						highlight: (video["gsx$highlight"]["$t"] === "Yes") ? true : false,
						tr35: (video["gsx$tr35"]["$t"] === "Yes") ? true : false,
						day: parseInt(video["gsx$day1or2"]["$t"])
					});
				}
			});

			return videos;
		},

		getThumbnails: function() {
			var token = "Ss1JfSW00pLYS0pjEfdfRZ77YiJI_qL5suxhz7vKxzY.";
			var endpoint = "http://api.brightcove.com/services/library?command=search_videos&all=tag:emtech12&video_fields=id,VIDEOSTILLURL&token=" + token;
			var self = this;

			$.getJSON(endpoint + "&callback=?", function(response) {
				_.each(response.items, function(video) {
					if(typeof self.get(self.where({brightcove_id: video.id.toString()})[0]) === "undefined") {
						//console.log(video.id.toString() + " not found in video library");
					} else {
						self.get(self.where({brightcove_id: video.id.toString()})[0]).set("thumbnail", video.videoStillURL);
					}
				});
			});
		},

		show: function(filter, shuffle, limit) {
			if(this.player.isLoaded) {
				this.player.brightcove.pause();
				this.player.brightcove.seek(0);
				this.player.hide();
			}

			var videos = this.where(filter);

			if(shuffle) {
				videos = _.shuffle(this.where(filter));
			}

			if(limit) {
				videos = _.first(videos, limit);
			}

			this.view.show(videos);
		}
	});

		MITTR.EmTech.VideosView = Backbone.View.extend({
			tagName: "ul",

			initialize: function() {
				this.render();
			},

			render: function() {
				$("#video-stage").append(this.el);
			},

			show: function(videos) {
				this.$(".video").removeClass("row-end row-begin").addClass("hide");

				this.$("#" + _.pluck(videos, "id").join(", #")).removeClass("hide");

				var count = 0;
				this.$(".video:not(.hide)").each(function() {
					if(count === 4) count = 0;
					if(count === 0) $(this).addClass("row-begin");
					if(count === 3) $(this).addClass("row-end");
					count++;
				});

				this.$el.show();
			}
		});

	MITTR.EmTech.Tab = Backbone.Model.extend({
		initialize: function() {
			this.view = new MITTR.EmTech.TabView({
				id: this.get("id"),
				model: this
			});
		},

		defaults: {
			id: '',
			title: '',
			filter: {},
			shuffle: false,
			limit: 0
		}
	});

		MITTR.EmTech.TabView = Backbone.View.extend({
			tagName: "li",
			className: "tab",

			events: {
				"click": "navigate"
			},

			initialize: function() {
				this.render();
			},

			render: function() {
				this.$el.text(this.model.get("title"));
				this.model.collection.view.$el.append(this.el);
			},

			show: function() {
				this.model.collection.view.$("li.tab").removeClass("active");
				this.$el.addClass("active");
			},

			navigate: function() {
				window.router.navigate("!/tab/" + this.model.get("id") + "/", {trigger: true});
			}
		});

	MITTR.EmTech.Tabs = Backbone.Collection.extend({
		model: MITTR.EmTech.Tab,

		initialize: function() {
			this.view = new MITTR.EmTech.TabsView({
				id: "video-tabs",
				collection: this
			});
		}
	});

		MITTR.EmTech.TabsView = Backbone.View.extend({
			tagName: "ul",

			initialize: function() {
				this.render();
			},

			render: function() {
				$("#video-stage").append(this.el);
			}
		});

	MITTR.EmTech.Router = Backbone.Router.extend({
		routes: {
			"": "load",
			"!/tab/:tab/": "switchTo",
			"!/watch/:video/": "watchVideo"
		},

		load: function() {
			window.router.navigate("!/tab/highlights/", {trigger: true});
		},

		switchTo: function(tab) {
			if(window.videos.areLoaded) {
				var tab_model = window.tabs.get(tab);
				tab_model.view.show();
				window.videos.show(tab_model.get("filter"), tab_model.get("shuffle"), tab_model.get("limit"));

				_gaq.push(["_trackPageview", "/emtech/12/video/tab/" + tab + "/"]);
			} else {
				window.videos.on("reset", function() {
					window.router.switchTo(tab);
				});
			}
		},

		watchVideo: function(video) {
			if(window.videos.areLoaded) {
				window.videos.get(video).watch();

				_gaq.push(["_trackPageview", "/emtech/12/video/watch/" + video + "/"]);
			} else {
				window.videos.on("reset", function() {
					window.videos.get(video).watch();
				});
			}
		}
	});