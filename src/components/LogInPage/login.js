import React from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import "./Login.css";
import LoginCred from "../../dbData/loginCred.json";
import { Redirect } from "react-router-dom";

export class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      redirect: false,
    };
  }
  render() {
    return (
      <div className="Login">
        {this.state.redirect ? <Redirect to="/" /> : null}
        <Form>
          <Form.Group size="lg" controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              autoFocus
              type="email"
              value={this.state.email}
              onChange={(e) => {
                this.setState({ email: e.target.value });
              }}
            />
          </Form.Group>
          <Form.Group size="lg" controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              value={this.state.password}
              onChange={(e) => {
                this.setState({ password: e.target.value });
              }}
            />
          </Form.Group>
          <Button
            block="true"
            size="lg"
            type="submit"
            onClick={() =>
              console.log(
                LoginCred.map((item) => {
                  if (
                    item.email === this.state.email &&
                    item.password === this.state.password
                  ) {
                    localStorage.setItem("LOGINDATA", item.email);

                    this.setState({ redirect: true });
                  }
                })
              )
            }
          >
            Login
          </Button>
        </Form>
      </div>
    );
  }
}
export default Login;
