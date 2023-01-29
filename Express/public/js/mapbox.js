//accessing the attribute from the map id element from the html


export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoibWFkaGF2MTIiLCJhIjoiY2xkMWZuajk1MDc3NjN0bXh3anpzbGsxZCJ9.mgUPIBZCmBx1NaDY6Dcxvw';
  const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/madhav12/cld1h0gog000a01ld38x6gtez', // style URL
    scrollZoom: false,
    // center: [-118.113491,34.111745 ], // starting position [lng, lat]
    // zoom: 9, // starting zoom
  });

  //bound our latlngs
  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    //create marker
    const el = document.createElement('div');
    el.className = 'marker';

    //add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    //adding popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day} : ${loc.description}</p>`)
      .addTo(map);

    //extends map bounds  to include current locations
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      bottom: 200,
      top: 200,
      left: 100,
      right: 100,
    },
  });
};
