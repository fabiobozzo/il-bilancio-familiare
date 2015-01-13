var Backbone = require('backbone');
var _ = require('underscore');
var HighCharts = require('highcharts-browserify');

var template = require('../templates/report.html');
var CategoryCollection = require('../collections/report/Categories');
var PeriodCollection = require('../collections/report/Periods');
var TransactionPeriodView = require('./TransactionPeriodView');
var ApplicationState = require('../models/ApplicationState');
var Settings = require('../../config/settings');

module.exports = Backbone.View.extend({

	className: 'reportView',

	initialize: function() {

		this.charts = {};

		this.collectionPiePositive = new CategoryCollection({positive:true});
		this.collectionPieNegative = new CategoryCollection({positive:false});
		this.collectionLineComparison = new PeriodCollection({total:false});
		this.collectionLineTotal = new PeriodCollection({total:true});
		
		this.listenTo( this.collectionPiePositive, 'reset', this.renderPositivePieChart );
		this.listenTo( this.collectionPieNegative, 'reset', this.renderNegativePieChart );
		this.listenTo( this.collectionLineComparison, 'reset', this.renderComparisonLineChart );
		this.listenTo( this.collectionLineTotal, 'reset', this.renderTotalLineChart );
		
		this.listenTo( ApplicationState, 'change:currentPeriod', this.updateCurrentPeriod );	
		this.listenTo( ApplicationState, 'change:periodMonthEnabled', this.updateCurrentPeriod );	
		
		this.collectionPiePositive.refetch();
		this.collectionPieNegative.refetch();
	},

	updateCurrentPeriod: function() {
		this.collectionPiePositive.refetch();
		this.collectionPieNegative.refetch();
		this.collectionLineTotal.refetch();
		this.collectionLineComparison.refetch();
	},

	render: function() {

		this.$el.html( template() );

		this.periodChooserView = new TransactionPeriodView({
			closeOnConfirm: false,
			showCancelButton: false,
			canDisableMonth: true
		});
		this.$el.find('.period-chooser').html( this.periodChooserView.render().el );

		return this;
	},

	renderPositivePieChart: function() {

		var chartName = 'piePositive';
		this.destroyChart(chartName);

		if ( this.collectionPiePositive.length >0 ) {
			this.charts[chartName] = this.getPieChart(
				'Entrate',
				chartName,
				[{
					type: 'pie',
					name: 'Categoria',
					data: this.collectionPiePositive.toJSON()
				}]
			);
		} else {
			this.$el.find('#'+chartName).html('Nessuna transazione positiva in questo periodo.');
		}
		
	},

	renderNegativePieChart: function() {

		var chartName = 'pieNegative';
		this.destroyChart(chartName);

		if ( this.collectionPieNegative.length >0 ) {
			this.charts[chartName] = this.getPieChart(
				'Uscite',
				chartName,
				[{
					type: 'pie',
					name: 'Categoria',
					data: this.collectionPieNegative.toJSON()
				}]
			);
		} else {
			this.$el.find('#'+chartName).html('Nessuna transazione negativa in questo periodo.');
		}

	},

	renderComparisonLineChart: function() {
		
		var chartName = 'lineComparison';
		this.destroyChart(chartName);

		if ( this.collectionLineComparison.length >0 ) {
			this.charts[chartName] = this.getPieChart(
				'Saldo',
				chartName,
				this.getTemporalXAxis(),
				this.collectionLineComparison.toJSON()
			);
		} else {
			this.$el.find('#'+chartName).html('Nessuna transazione negativa in questo periodo.');
		}
	},

	renderTotalLineChart: function() {

	},

	getTemporalXAxis: function() {
		var axis = [];
		if (ApplicationState.get('periodMonthEnabled')) {
			var daysInMonth = new Date( this.collectionLineComparison.year, this.collectionLineComparison.month, 0).getDate();
			for ( var i = 1; i <= daysInMonth; i++ ) {
				axis.push(i);
			}
		} else {
			axis = Settings.monthsShort;
		}
		return axis;
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

	getLineChart: function(title, container, xAxis, series) {
		var chart = new Highcharts.Chart({
			chart: {
				renderTo: container, 
				plotBackgroundColor: null,
				plotBorderWidth: null,
				plotShadow: false
			},
			title: {
				text: title,
				x: -20 
			},
			xAxis: {
				//categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
				categories: [xAxis]
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
			// series: [{
			// 	name: 'Tokyo',
			// 	data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
			// }, {
			// 	name: 'New York',
			// 	data: [-0.2, 0.8, 5.7, 11.3, 17.0, 22.0, 24.8, 24.1, 20.1, 14.1, 8.6, 2.5]
			// }, {
			// 	name: 'Berlin',
			// 	data: [-0.9, 0.6, 3.5, 8.4, 13.5, 17.0, 18.6, 17.9, 14.3, 9.0, 3.9, 1.0]
			// }, {
			// 	name: 'London',
			// 	data: [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0, 16.6, 14.2, 10.3, 6.6, 4.8]
			// }]
			series: series
		});
	},

	destroyChart: function(chartName) {
		if (this.charts.hasOwnProperty(chartName)) {
			if (this.charts[chartName].destroy) this.charts[chartName].destroy();
			delete this.charts[chartName];
		}
	},

	destroyAllCharts: function() {
		for (var c in this.charts) {
			if (c.destroy) c.destroy();
		}
		this.charts = {};
	},

	close: function() {
		this.destroyAllCharts();
		this.remove();
		this.unbind();
		this.stopListening();
	}

});