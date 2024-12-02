import React from "react";
import { useParams } from "react-router-dom";

const AudioGame = () => {
  const { id } = useParams();

  return (
    <div>
      <h1>AudioGame {id}</h1>
      <p>Welcome to AudioGame {id}. Let's start playing!</p>
    </div>
  );
};

export default AudioGame;
