const { createApp } = Vue;

createApp({
  data() {
    return {
      tracks: null,
      filtered_tracks: [],
      unsorted_tracks: [],
      selected_genres: [],
      all_button: true,
      active_buttons: [],
      num_artists: 0,
      keyword: "",
      genre_set: new Set(),
      render_all_button: false,
      price_click: false,
      collection_click: false,
      reset_click: true,
    };
  },
  methods: {
    fetchAPI(event) {
      if (event.key == "Enter") {
        let keyword = this.keyword;
        let url =
          "https://itunes.apple.com/search?term=" +
          keyword +
          "&attribute=allArtistTerm&entities=all";

        fetch(url)
          .then((response) => response.json())
          .then((data) => {
            // prints the JSON to console
            console.log(data);

            this.tracks = data.results;
            this.num_artists = data.results.length;
            this.filtered_tracks = this.tracks;
            this.unsorted_tracks = [...this.filtered_tracks];
            this.render_all_button = true;
            this.price_click = false;
            this.collection_click = false;
            this.reset_click = true;

            // set all the buttons to not active, except ALL
            this.all_button = true;
            for (let x = 0; x < this.active_buttons.length; ++x) {
              this.active_buttons[x] = false;
            }

            // clears and finds the list of genres
            this.genre_set.clear();
            this.getNumberOfGenres(data.results);

            // console.log(this.genre_set);

            if (data.results.length == 0) {
              alert("No artists were found with that keyword!");
            }
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
          });
      }
    },

    getNumberOfGenres(tracks) {
      for (let x = 0; x < tracks.length; ++x) {
        let genre = tracks[x].primaryGenreName;
        this.genre_set.add(genre);
      }

      for (let x = 0; x < this.genre_set.size; ++x) {
        this.active_buttons.push(false);
      }
    },

    toggleGenre(genre, counter) {
      if (genre == "ALL") {
        this.selected_genres = [];
      } else {
        let index = this.selected_genres.indexOf(genre);

        if (index === -1) {
          // adds the genre if it hasn't been selected
          this.selected_genres.push(genre);
          this.active_buttons[counter] = true;
        } else {
          // removes the genre if already selected
          this.selected_genres.splice(index, 1);
          this.active_buttons[counter] = false;
        }

        // console.log(this.selected_genres);
      }
      this.filterTracksByGenre();
    },

    filterTracksByGenre() {
      if (this.selected_genres.length === 0) {
        this.filtered_tracks = [...this.unsorted_tracks];

        // accounts for all genre
        this.all_button = true;
        for (let x = 0; x < this.active_buttons.length; ++x) {
          this.active_buttons[x] = false;
        }
      } else {
        // accounts for all genre
        this.all_button = false;

        // filters the tracks by the genres
        this.filtered_tracks = this.unsorted_tracks.filter((track) =>
          this.selected_genres.includes(track.primaryGenreName)
        );
      }

      // maintains sorting invariant with genre filtering
      if (this.price_click) {
        this.priceSort();
      } else if (this.collection_click) {
        this.collectionSort();
      }

      // changes the results # based on filtered tracks
      this.num_artists = this.filtered_tracks.length;
    },

    priceSort() {
      this.price_click = true;
      this.collection_click = false;
      this.reset_click = false;

      // sort by ascending price
      this.filtered_tracks.sort((a, b) => a.trackPrice - b.trackPrice);
    },

    collectionSort() {
      this.collection_click = true;
      this.price_click = false;
      this.reset_click = false;

      // sort by ascending collection name
      this.filtered_tracks.sort((a, b) => {
        let collection_nameA = a.collectionName || "No information provided";
        let collection_nameB = b.collectionName || "No information provided";
        return collection_nameA.localeCompare(collection_nameB);
      });
    },

    resetToOriginal() {
      this.reset_click = true;
      this.collection_click = false;
      this.price_click = false;

      // reset to the original unsorted tracks
      this.filtered_tracks = [...this.unsorted_tracks];

      // console.log(this.filtered_tracks);
    },
  },
}).mount("#app");
