import React, { useState, useEffect } from "react";
import { Grid, Button, Typography } from "@material-ui/core";
import { Link } from "react-router-dom";

export default function MemePage() {
  const [memeUrl, setMemeUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch a random meme
  const fetchRandomMeme = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("https://api.imgflip.com/get_memes"); // API endpoint for fetching memes
      const data = await response.json();
      const randomMeme = data.data.memes[Math.floor(Math.random() * data.data.memes.length)];
      setMemeUrl(randomMeme.url);
    } catch (error) {
      console.error("Error fetching meme:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch meme when the component mounts
  useEffect(() => {
    fetchRandomMeme();
  }, []);

  return (
    <Grid container spacing={1} direction="column" alignItems="center">
      <Grid item xs={12} align="center">
        <Typography component="h4" variant="h5" style={{ marginBottom: "20px" }}>
          Take a random meme for your party!
        </Typography>
      </Grid>

      <Grid item xs={12} align="center">
        {isLoading ? (
          <Typography variant="body1">Loading meme...</Typography>
        ) : memeUrl ? (
          <img src={memeUrl} alt="Random Meme" style={{ maxWidth: "100%", maxHeight: "500px", marginBottom: "20px" }} />
        ) : (
          <Typography variant="body1">Failed to load meme</Typography>
        )}
      </Grid>

      <Grid item xs={12} container justifyContent="center" spacing={2}>
        <Grid item>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => window.history.back()} // Button to go back
          >
            Go Back
          </Button>
        </Grid>

        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={fetchRandomMeme} // Button to refresh the meme
          >
            Refresh Meme
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
}
