var Backbone = require('backbone');
var _ = require('underscore');
var HighCharts = require('highcharts-browserify');

var template = require('../templates/report.html');
var CategoryCollection = require('../collections/report/Categories');

module.exports = Backbone.View.extend({

	className: 'reportView',

	initialize: function() {

		this.charts = [];

		this.collectionPiePositive = new CategoryCollection();
		this.collectionPieNegative = new CategoryCollection();
		
		this.listenTo( this.collectionPiePositive, 'reset', this.renderPositivePieChart );
		this.listenTo( this.collectionPieNegative, 'reset', this.renderNegativePieChart );
		
		this.collectionPiePositive.fetch({ reset:true, data:{positive:true} });
		this.collectionPieNegative.fetch({ reset:true, data:{positive:false} });
	},

	events: {
		
	},

	render: function() {
		this.$el.html( template() );
		return this;
	},

	renderPositivePieChart: function() {
		this.charts.push( this.getPieChart(
			'Entrate',
			'piePositive',
			[{
				type: 'pie',
				name: 'Categoria',
				data: this.collectionPiePositive.toJSON()
			}]
		));
	},

	renderNegativePieChart: function() {
		this.charts.push( this.getPieChart(
			'Uscite',
			'pieNegative',
			[{
				type: 'pie',
				name: 'Categoria',
				data: this.collectionPieNegative.toJSON()
			}]
		));
	},

	getPieChart: function(title, container, series) {
		var chart = new Highcharts.Chart({
			chart: {
				renderTo: container, 
				plotBackgroundColor: null,
				plotBorderWidth: null,
				plotShadow: false
			},
			credits: {
				enabled: false
			},
			title: {
				text: title
			},
			tooltip: {
				pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
			},
			plotOptions: {
				pie: {
					allowPointSelect: true,
					cursor: 'pointer',
					dataLabels: {
						enabled: true,
						format: '<b>{point.name}</b>: {point.percentage:.1f} %',
						style: {
							color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
						}
					}
				}
			},
			series: series
		});
		return chart;
	},

	getLineChart: function(title, series) {
		var chart = new Highcharts.Chart({
			title: {
				text: title,
				x: -20 
			},
			xAxis: {
				categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
					'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
			},
			yAxis: {
				title: {
					text: 'Importo (€)'
				},
				plotLines: [{
					value: 0,
					width: 1,
					color: '#808080'
				}]
			},
			tooltip: {
				valueSuffix: '€'
			},
			legend: {
				layout: 'vertical',
				align: 'right',
				verticalAlign: 'middle',
				borderWidth: 0
			},
			series: [{
				name: 'Tokyo',
				data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
			}, {
				name: 'New York',
				data: [-0.2, 0.8, 5.7, 11.3, 17.0, 22.0, 24.8, 24.1, 20.1, 14.1, 8.6, 2.5]
			}, {
				name: 'Berlin',
				data: [-0.9, 0.6, 3.5, 8.4, 13.5, 17.0, 18.6, 17.9, 14.3, 9.0, 3.9, 1.0]
			}, {
				name: 'London',
				data: [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0, 16.6, 14.2, 10.3, 6.6, 4.8]
			}]
		});
	},

	destroyCharts: function() {
		this.charts.forEach(function(c) {
			c.destroy();
		});
		this.charts = [];
	},

	close: function() {
		this.destroyCharts();
		this.remove();
		this.unbind();
		this.stopListening();
	}

});