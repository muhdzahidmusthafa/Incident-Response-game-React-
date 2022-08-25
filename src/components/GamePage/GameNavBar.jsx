import React from 'react';

import { Navbar, Container, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export class GameNavBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      seconds: localStorage.getItem("start_second")?parseInt(localStorage.getItem("start_second")) : 0
    };
  }
  tick() {
    this.setState(state => ({
      seconds: state.seconds + 1
    }));
    localStorage.setItem("start_second",this.state.seconds)
  }
  componentDidMount() {
    this.interval = setInterval(() => this.tick(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    return (
      <Navbar expand="lg" variant="dark">
        <Container className="game-nav-container">
          <Link to="/" className="navbar-brand">Incident response</Link>
          <h1>{this.state.seconds}</h1>
          <Nav>
            <Link to="/">Menu</Link>
          </Nav>
        </Container>
      </Navbar>
    );
  }
}