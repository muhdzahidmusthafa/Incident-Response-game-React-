import React, { useState } from "react";
import "./Style.css";
import { Link } from "react-router-dom";
import module02 from '../../storyModules/module02.json';
import { GameNavBar } from "../GamePage/GameNavBar";

var module2 = module02

export default function App() {
  let a = module2
  
  //JSON.parse(localStorage.getItem("customGame"));
  
  const [stepId, setstepId] = useState(1);
  return (
    <div>
      <GameNavBar />
      {a.map((item) =>
        item.id === stepId ? (
          <>
            <div className="newgame">
              
              <br />
              {!item.end ? (
                <div>
                  {" "}
                  <p styles={{ color: "white", textIndent: "30px" }}>
                    {item.text}
                  </p>
                  <br />{" "}
                </div>
              ) : (
                <center>
                  <h1>{item.text}</h1>
                </center>
              )}
              {!item.end ? (
                <div>
                  {item.options.map((inter) => (
                    <>
                      <buttton
                        className="choices"
                        onClick={() => {
                          setstepId(inter.next_step);
                        }}
                      >
                        {inter.text}
                      </buttton>
                      <br />
                      <br />
                      <br />
                    </>
                  ))}
                </div>
              ) : (
                <>
                  <br></br>
                  <center>
                    <div styles={{ height: "500px", align: "top" }}>
                      <Link to="/">
                        <button className="returnmenu"> Return To Menu</button>
                      </Link>
                    </div>
                  </center>
                </>
              )}
            </div>
          </>
        ) : null
      )}
    </div>
  );
}
