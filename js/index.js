'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Graph = function (_React$Component) {
   _inherits(Graph, _React$Component);

   function Graph(props) {
      _classCallCheck(this, Graph);

      var _this = _possibleConstructorReturn(this, _React$Component.call(this, props));

      _this.makeGraph = _this.makeGraph.bind(_this);
      _this.fetchData = _this.fetchData.bind(_this);
      _this.bindData = _this.bindData.bind(_this);
      return _this;
   }

   Graph.prototype.makeGraph = function makeGraph(dataset) {
      // Set dimensions for svg
      var width = document.documentElement.clientWidth || window.innerWidth;
      var height = document.documentElement.clientHeight || window.innerHeight;
      var scale = 150;

      // Define projection and its position
      var mercatorProjection = d3.geoMercator().scale(scale).translate([width / 2, height / 2]);

      // Use geoPath function to turn lat/longitude coords into screen coordinates
      var geoPath = d3.geoPath().projection(mercatorProjection);

      var svg = d3.select('.container').append('svg').attr('width', width).attr('height', height);

      // Zoom-in/out
      var zoomed = function zoomed() {
         group.attr('transform', d3.event.transform);
         d3.select('.meteorite').attr('transform', d3.event.transform);
      };

      var zoom = d3.zoom().scaleExtent([1, 10]).on('zoom', zoomed);

      var group = svg.append('g');
      svg.call(zoom);

      group.selectAll('path').data(dataset.features).enter().append('path').attr('fill', 'rgb(239,230,215)').attr('stroke', '#fff').attr('d', geoPath);
      //Bind meteortie landing data
      this.fetchData().then.bindData(mercatorProjection);
   };

   Graph.prototype.bindData = function bindData(dataset, projection) {
      var svg = d3.select('svg');
      var geoPath = d3.geoPath().projection(projection);
      var tooltip = d3.select('.tooltip').style('visibility', 'hidden');
      var meteorites = dataset.features;

      // Set svg path's fill to radial-gradient
      d3.select('svg').append('defs').append('radialGradient').attr('id', 'radialGradient').append('stop').attr('offset', '10%').attr('stop-color', 'rgba(255,215,0,1)');
      d3.select('#radialGradient').append('stop').attr('offset', '50%').attr('stop-color', 'rgba(255,140,0,0.6)');
      d3.select('#radialGradient').append('stop').attr('offset', '80%').attr('stop-color', 'rgba(255,69,0,.2)');

      var meteoriteIncidents = svg.append('g').attr('class', 'meteorite').selectAll('path').data(meteorites).enter().append('path').attr('fill', 'url(#radialGradient)').attr('d', geoPath.pointRadius(function (d) {
         var mass = +d.properties.mass;
         // Adujst mass number to radius to fit on screen
         if (mass < 1000000) return Math.log10(mass);else return Math.log(mass);
      })).attr('class', 'incident').on('mousemove', function (d) {

         var datum = d.properties;
         var year = datum.year.replace(/T\d+:\d+:\d+.\d+/, '');
         tooltip.style('visibility', 'visible').style('left', function () {
            return d3.event.x - 80 + 'px';
         }).style('top', function () {
            return d3.event.y - 160 + 'px';
         }).html('Name: ' + datum.name + '<br>' + 'Year: ' + year + '<br>' + 'Fall: ' + datum.fall + '<br>' + 'Class: ' + datum.recclass + '<br>' + 'Longitude: ' + datum.reclong + '<br>' + 'Latitude: ' + datum.reclat + '<br>' + 'Mass: ' + datum.mass);
      }).on('mouseout', function () {
         tooltip.style('visibility', 'hidden');
      });
   };

   Graph.prototype.fetchData = function fetchData() {
      var _this2 = this;

      var geoJsonUrl = 'https://raw.githubusercontent.com/hongyi0220/world.geo.json/master/countries.geo.json';
      var meteoriteUrl = 'https://raw.githubusercontent.com/hongyi0220/ProjectReferenceData/master/meteorite-strike-data.json';
      return {
         then: {
            makeGraph: function makeGraph() {
               return d3.json(geoJsonUrl, function (dataset) {
                  return _this2.makeGraph(dataset);
               });
            },
            bindData: function bindData(projection) {
               return d3.json(meteoriteUrl, function (dataset) {
                  return _this2.bindData(dataset, projection);
               });
            }
         }
      };
   };

   Graph.prototype.componentDidMount = function componentDidMount() {
      this.fetchData().then.makeGraph();
   };

   Graph.prototype.render = function render() {
      return React.createElement(
         'div',
         { className: 'container' },
         React.createElement('div', { className: 'tooltip' })
      );
   };

   return Graph;
}(React.Component);

ReactDOM.render(React.createElement(Graph, null), document.getElementById('graph'));