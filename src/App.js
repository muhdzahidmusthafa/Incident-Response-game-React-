import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import { Provider } from "react-redux";
import Container from "react-bootstrap/Container";
import GameLoadingContainer from "./components/GamePage/GameLoadingContainer";
import { MenuPage } from "./components/MenuPage/MenuPage";
import { Login } from "./components/LogInPage/login";
import LeaderBoardPage from "./components/LeadBoardPage/LeaderBoard";

const App = ({ store }) => (
  <Provider store={store}>
    <Router>
      <Container className="app">
        <Switch>
          <Route exact path="/game">
            <GameLoadingContainer />
          </Route>
          <Route exact path="/">
            <MenuPage />
          </Route>
          <Route exact path="/login">
            <Login />
          </Route>
          <Route exact path="/leadboard">
            <LeaderBoardPage />
          </Route>
        </Switch>
      </Container>
    </Router>
  </Provider>
);

export default App;
