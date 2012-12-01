# MIT EmTech Video Library

MIT EmTech Video Library is used to render, filter, and play videos recorded at EmTech conferences. This code is a subset of the real-time, event-driven platform that is used during the conference. It is used on the EmTech website after the conference is over to display edited videos recorded during the conference. A demo of this code can be viewed on the [EmTech MIT 2012 site](http://www2.technologyreview.com/emtech/12/video/).

## How it works

Backbone.js is used to create two models -- tabs and videos -- and their supporting views and collections. Tabs are defined in JavaScript and are used to filter videos based on certain attributes. Videos are loaded through a Google Docs spreadsheet, which is managed by event content producers. Video thumbnails are loaded using the Brightcove API. Using Google Docs and Brightcove allowed producers to manage video content through already-familiar interfaces, without having to build a proper back-end CMS.

An additional view (VideoView) is used to control the player through Brightcove's API. It handles HTML rendering, showing the player, and loading videos.

N.B.: For use at other conferences, and after conference content has been finalized, video data should be moved into videos.js and thumbnails hosted locally. As-is, code limits video data to EmTech MIT's Google Docs spreadsheet and Brightcove video library.

## Requirements
- [jQuery](http://jquery.com), [Underscore.js](http://underscorejs.org), [Backbone.js](http://backbonejs.org)
- [Brightcove](http://www.brightcove.com) account
- (optional) supporting CSS and thumbnail image files
- (optional) [AddThis](http://www.addthis.com) for sharing

## Usage

- include framework.js and video.js on the page
- add ```<div id="video-stage"></div>``` to page where library should appear
- video.js will bootstrap and build tabs and videos based on information provided
- enjoy!
