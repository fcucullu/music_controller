import React, { Component } from "react";
import JoinRoomPage from "./JoinRoomPage";
import CreateRoomPage from "./CreateRoomPage";
import Info from "./Info";
import Room from "./Room";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from "react-router-dom";
import { Button, ButtonGroup, Grid, Typography, IconButton } from "@material-ui/core";
import AddIcon from "@mui/icons-material/Add";

export default class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      roomCode: null,
    };
    this.clearRoomCode = this.clearRoomCode.bind(this);
  }

  async componentDidMount() {
    fetch("/api/is-user-in-room")
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          roomCode: data.code,
        });
      });
  }

  renderHomePage() {
    return (
      <Grid container spacing={3} align="center">
        <Grid item xs={12}>
          <Typography variant="h3" compact="h3">
            House Party!
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <ButtonGroup variant="contained" color="primary">
            <Button color="primary" to="/join" component={Link}>
              Join a Room
            </Button>
            <Button color="secondary" to="/create" component={Link}>
              Create a Room
            </Button>
          </ButtonGroup>
        </Grid>

        <Grid item xs={12} style={{ textAlign: "center" }}>
          <div
            style={{
              backgroundColor: "white",
              display: "inline-block",
              padding: "5px",
              borderRadius: "50%",
            }}
          >
            <IconButton
              color="default"
              to="/info"
              component={Link}
              style={{ borderRadius: "50%", width: '0.5px', height: '0.5px' }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </div>
        </Grid>
      </Grid>
    );
  }

  clearRoomCode() {
    this.setState({
      roomCode: null,
    });
  }

  render() {
    return (
      <Router>
        <Switch>
          <Route
            exact
            path="/"
            render={() => {
              return this.state.roomCode ? (
                <Redirect to={`/room/${this.state.roomCode}`}></Redirect>
              ) : (
                this.renderHomePage()
              );
            }}
          ></Route>
          <Route path="/join" component={JoinRoomPage} />
          <Route path="/create" component={CreateRoomPage} />
          <Route path="/info" component={Info} />
          <Route
            path="/room/:roomCode"
            render={(props) => {
              return <Room {...props} leaveRoomCallback={this.clearRoomCode} />;
            }}
          />
        </Switch>
      </Router>
    );
  }
}
