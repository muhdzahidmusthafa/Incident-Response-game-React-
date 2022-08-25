import React from 'react';

import MenuListContainer from './MenuListContainer';
import { Redirect } from 'react-router-dom';
import { Link } from 'react-router-dom';

export class MenuPage extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      redirect: false,
    };
  }
  componentDidMount(){
  if(localStorage.getItem("LOGINDATA"))
  {
    this.setState({"name":localStorage.getItem("LOGINDATA")})
  } 
  else{
    this.setState({redirect:true})
  } 
  }
  render() {
    return (
      <div className="menu-page fade-in">
        {this.state.redirect?<Redirect to="/login" />:null}
        <h1 className="menu-tagline" style={{color:"white"}}>{`Welcome ${this.state.name?this.state.name.split('@')[0]:""}`}</h1>
        <h1 className="menu-title">Security Awareness</h1>
        <h4 className="menu-tagline">An incident response training game</h4>
        <div className="d-flex justify-content-center">
          <p className="menu-info">Start the game and help your company from attacks</p>
        </div>
        <MenuListContainer />
        <Link to="/leadboard" className="navbar-brand"style={{color:"cyan"}}><h4>Leader Board</h4></Link><br></br>
        <button onClick={()=>{localStorage.removeItem("LOGINDATA"); window.location.reload()}}>LogOut</button>
      </div>
    );
  }
}