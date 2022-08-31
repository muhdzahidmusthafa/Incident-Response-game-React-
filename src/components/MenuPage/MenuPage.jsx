import React from "react";

import MenuListContainer from "./MenuListContainer";
import { Redirect } from "react-router-dom";

import "./Style.css";

export class MenuPage extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      redirect: false,
    };
  }
  componentDidMount() {
    if (localStorage.getItem("LOGINDATA")) {
      this.setState({ name: localStorage.getItem("LOGINDATA") });
    } else {
      this.setState({ redirect: true });
    }
  }
  render() {
    return (
      <div className="menu-page fade-in">
        {this.state.redirect ? <Redirect to="/login" /> : null}
        <h1 className="menu-tagline" style={{ color: "white" }}>{`Welcome ${
          this.state.name ? this.state.name.split("@")[0] : ""
        }`}</h1>
        <MenuListContainer />
      </div>
    );
  }
}