const bounds = [
    [27.9, 40.7], // sol alt
    [30, 41.7], // sağ üst
  ];
  
  const map = new maplibregl.Map({
    container: "map", 
    style: "https://api.maptiler.com/maps/streets/style.json?key=aVIF46VV8VEMda1xrLgm",
    center: [28.97953, 41.015137],
    zoom: 5,
    maxBounds: bounds,
  });
  
  map.addControl(
    new maplibregl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
    })
  );
  
  map.addControl(new maplibregl.FullscreenControl());
  map.addControl(new maplibregl.NavigationControl());
  map.dragRotate.disable();
  
  let isSatelliteView = false;
  
  document.getElementById("satellite").addEventListener("click", () => {
    if (!isSatelliteView) {
      if (map.getStyle().layers.length > 0) {
        map.setStyle("https://api.maptiler.com/maps/hybrid/style.json?key=aVIF46VV8VEMda1xrLgm");
      }
    } else {
      if (map.getStyle().layers.length > 0) {
        map.setStyle("https://api.maptiler.com/maps/streets/style.json?key=aVIF46VV8VEMda1xrLgm");
      }
    }
    isSatelliteView = !isSatelliteView;
  });
  
  const locations = [
    [28.979954228835993, 41.008497692224296],
    [28.971156165158618, 41.008567485567085],
    [28.984056878174954, 41.01278675632358],
    [28.967955749022934, 41.01030525670811],
    [28.97786406892311, 41.008244825043874],
    [28.97411037630195, 41.025602404180745],
    [29.056195791274376, 41.084624462454315],
    [28.922992136, 41.04476979999999],
    [28.97421554380614, 41.02563505740201]
  ];
  
  let currentLocationIndex = 0;
  
  function flyToNextLocation() {
    if (currentLocationIndex < locations.length) {
      map.flyTo({
        center: locations[currentLocationIndex],
        zoom: 15,
        essential: true,
      });
  
      currentLocationIndex++;
    }
  }
  
  document.getElementById("fly").addEventListener("click", flyToNextLocation);
  
  const addMarkers = () => {
    fetch('/static/geo.json')
      .then(response => response.json())
      .then(data => {
        map.addSource('sites', {
          type: 'geojson',
          data: data,
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50
        });
  
        map.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'sites',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': [
              'step',
              ['get', 'point_count'],
              '#660000',
              5,
              '#f1f075',
              100,
              '#f28cb1'
            ],
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              20,
              5,
              30,
              100,
              40
            ]
          }
        });
  
        map.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'sites',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
          }
        });
  
        map.addLayer({
          id: 'unclustered-point',
          type: 'circle',
          source: 'sites',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-radius': 10,
            'circle-color': '#007cbf'
          }
        });
  
        const popup = new maplibregl.Popup({
          closeButton: false,
          closeOnClick: false
        });
  
        map.on('mouseenter', 'unclustered-point', (e) => {
          map.getCanvas().style.cursor = 'pointer';
  
          const coordinates = e.features[0].geometry.coordinates.slice();
          const feature = e.features[0];
          const popupContent = `
            <h3>${feature.properties.name}</h3>
            <p>${feature.properties.description}</p>
            <img src="${feature.properties.image}" alt="${feature.properties.name}" style="width:100px;height:auto;" class="popup-image" />
            <a href="${feature.properties.link}" target="_blank">Daha Fazla Bilgi</a>
          `;
  
          popup.setLngLat(coordinates)
            .setHTML(popupContent)
            .addTo(map);
        });
  
        map.on('mouseleave', 'unclustered-point', () => {
          map.getCanvas().style.cursor = '';
        });
  
        map.on('click', () => {
          popup.remove();
        });
      })
      .catch(error => console.error('Error fetching markers:', error));
  };
  
  map.on('styledata', () => {
    if (!map.getSource('sites')) {
      addMarkers();
    }
  });
  
  document.addEventListener('click', function (event) {
    if (event.target.matches('.popup-image')) {
      const modal = document.getElementById('myModal');
      const modalImg = document.getElementById('img01');
      modal.style.display = "block";
      modalImg.src = event.target.src;
    }
  
    if (event.target.matches('.close')) {
      const modal = document.getElementById('myModal');
      modal.style.display = "none";
    }
  });

  
  