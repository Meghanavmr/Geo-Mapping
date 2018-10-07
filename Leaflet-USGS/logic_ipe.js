// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

// Define a function we want to run once for each feature in the features array
function createFeatures(earthquakeData) {
	
   // Give each feature a popup describing the place, time and magnitude of the earthquake
    function onEachFeature(feature, layer) {
    layer.bindPopup("<h1>" + feature.properties.mag +
      "</h1><hr><h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
      }
   // Get earthquake data and set circle marker radius and color depending on magnitude
    var earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: markerSize(feature.properties.mag),
                fillColor: colorRange(feature.properties.mag),
                color: "white",
                weight: 0.5,
                opacity: 0.5,
                fillOpacity: 0.8
            });
        },
        onEachFeature: onEachFeature
    });
    createMap(earthquakes);
}
// Define a function to create our map
function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });
  
  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
  
  // Create legend
    var legend = L.control({
        position: "bottomright"
    });

    legend.onAdd = function(myMap) {
        var div = L.DomUtil.create("div", "info legend"),
        grades = [0, 1, 2, 3, 4, 5],
        labels = [];

    // Loop through our magnitude intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + colorRange(grades[i]) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
    };
	// Add legend to the map
    legend.addTo(myMap);
}
// Define colorRange function that will select marker and legend colors according to the magnitude
function colorRange(mag) {
  switch (true) {
    // If magnitude is 5 or greater
    case mag >= 5.0:
		return 'crimson';
        break;
    // If magnitude is 4 or greater
    case mag >= 4.0:
		return 'orangered';
        break;
    // If magnitude is 3 or greater
    case mag >= 3.0:
		return 'orange';
        break;
    // If magnitude is 2 or greater
    case mag >= 2.0:
		return 'gold';
        break;
	// If magnitude is 1 or greater
	case mag >= 1.0:
		return 'yellow';
        break;
    // Magnitude below 1
    default:
		return 'greenyellow';
    };
 }
 
 // Define a markerSize function that will give each earthquake location a different radius based on magnitude
function markerSize(mag) {
  return mag * 5;
}