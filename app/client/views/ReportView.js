var Backbone = require('backbone');
var _ = require('underscore');
var HighCharts = require('highcharts-browserify');
var numeral = require('numeral');

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
		this.collectionLineTotal.refetch();
		this.collectionLineComparison.refetch();
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
			this.charts[chartName] = this.getLineChart(
				'Entrate / Uscite',
				chartName,
				this.getTemporalXAxis( this.collectionLineComparison ),
				this.collectionLineComparison.toJSON(),
				true
			);
		} else {
			this.$el.find('#'+chartName).html('Nessuna transazione in questo periodo.');
		}
	},

	renderTotalLineChart: function() {

		var chartName = 'lineTotal';
		this.destroyChart(chartName);

		if ( this.collectionLineTotal.length >0 ) {
			this.charts[chartName] = this.getLineChart(
				'Saldo',
				chartName,
				this.getTemporalXAxis( this.collectionLineTotal ),
				this.collectionLineTotal.toJSON()
			);
		} else {
			this.$el.find('#'+chartName).html('Nessuna transazione in questo periodo.');
		}
	},

	getTemporalXAxis: function( collection ) {
		var axis = [];
		if (ApplicationState.get('periodMonthEnabled')) {
			var daysInMonth = new Date( collection.year, collection.month, 0).getDate();
			for ( var i = 1; i <= daysInMonth; i++ ) {
				axis.push( i );
			}
		} else {
			axis = Settings.monthsShort;
		}
		return axis;
	},

	getPieChart: function( title, container, series ) {
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

	getLineChart: function( title, container, xAxis, series, onlyPositive ) {
		var chart = new Highcharts.Chart({
			chart: {
				renderTo: container, 
				plotBackgroundColor: null,
				plotBorderWidth: null,
				plotShadow: false
			},
			title: {
				text: title
			},
			credits: {
				enabled: false
			},
			xAxis: {
				categories: xAxis
			},
			yAxis: {
				title: {
					text: 'Importo (€)'
				},
				min: (onlyPositive) ? 0 : null
			},
			tooltip: {
				formatter: function() {
					return ( xAxis.length>12 ? 'Giorno ' : '' ) +
						this.x +
						'<br /><span style="color:{this.series.color}">' +
						this.series.name + 
						'</span>: <b>' +
						numeral(this.y).format('0,0.00') +
						'€</b><br/>';
				} 
			},
			series: series
		});
		
		return chart;
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