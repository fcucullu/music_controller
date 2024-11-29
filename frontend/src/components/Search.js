import React, { Component } from "react";
import {
  Grid,
  Typography,
  TextField,
  Button,
  Card,
  LinearProgress,
} from "@material-ui/core";

export default class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: "", // Search query
      searchResults: [], // Search results
      isLoading: false, // Loading state
    };
  }

  handleSearchChange = (event) => {
    this.setState({ query: event.target.value });
  };

  handleSearchSubmit = () => {
    if (this.state.query.trim() === "") return;

    this.setState({ isLoading: true });

    // Call backend to search for songs/artists
    fetch(`/spotify/search?q=${encodeURIComponent(this.state.query)}&type=artist%2Ctrack`)
      .then((response) => response.json())
      .then((data) => {
        if (data.tracks && data.tracks.items) {
          this.setState({
            searchResults: data.tracks.items, // Update state with results
            isLoading: false,
          });
        } else {
          // Handle case where no items are found or the structure is different
          this.setState({
            searchResults: [],
            isLoading: false,
          });
          console.error(
            "No items found or unexpected response structure:",
            data,
          );
        }
      })
      .catch((error) => {
        console.error("Error fetching search results:", error);
        this.setState({ isLoading: false });
      });
  };

  render() {
    const { searchResults, isLoading, query } = this.state;

    return (
      <Grid
        container
        justifyContent="center"
        style={{ minHeight: "100vh", overflowY: "auto" }}
      >
        <Grid item xs={12} md={6} style={{ padding: "20px" }}>
          <TextField
            label="Search for Songs or Artists"
            variant="outlined"
            fullWidth
            value={query}
            onChange={this.handleSearchChange}
            style={{ marginBottom: "20px" }}
          />

          <Grid
            item
            xs={12}
            style={{
              display: "flex", // Apply flex here to the Grid container
              justifyContent: "center", // Center the buttons
              gap: "10px", // Space between buttons
              paddingBottom: "10px",
            }}
          >
            <Button
              variant="contained"
              color="secondary"
              onClick={() => this.props.updateShowSearch(false)}
            >
              Go back
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={this.handleSearchSubmit}
              disabled={isLoading}
            >
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </Grid>

          {isLoading && <LinearProgress style={{ marginTop: "20px" }} />}

          {searchResults.length > 0 && (
            <Grid container spacing={2} style={{ marginTop: "20px" }}>
              {searchResults.map((song) => (
                <Grid item xs={12} md={6} key={song.id}>
                  <Card style={{ padding: "10px" }}>
                    <Grid container alignItems="center">
                      <Grid item xs={4} align="center">
                        <img
                          src={song.album.images[0]?.url}
                          height="80px"
                          width="80px"
                          alt={song.name}
                        />
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="h6">{song.name}</Typography>
                        <Typography color="textSecondary" variant="subtitle1">
                          {song.artists.map((artist) => artist.name).join(", ")}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
          
        </Grid>
      </Grid>
    );
  }
}