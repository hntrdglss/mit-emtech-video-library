"use strict";
$(document).ready(function() {
	window.BCL = {};

	window.router = new MITTR.EmTech.Router();

	window.tabs = new MITTR.EmTech.Tabs([
		{
			id: "highlights",
			title: "Highlights",
			filter: {highlight: true},
			shuffle: true,
			limit: 8
		},
		{
			id: "innovators-under-35",
			title: "Innovators Under 35",
			filter: {tr35: true}
		},
		{
			id: "day-1",
			title: "Day 1",
			filter: {day: 1}
		},
		{
			id: "day-2",
			title: "Day 2",
			filter: {day: 2}
		}
	]);

	window.videos = new MITTR.EmTech.Videos();

	Backbone.history.start({root: "/emtech/12/video/"});
});