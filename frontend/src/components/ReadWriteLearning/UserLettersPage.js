import React from "react";
import { useParams } from "react-router";
import UserLettersTable from "./UserLettersTable";

const UserLettersPage = () => {
  const { userId } = useParams();

  return (
    <div>
      <h1>User Letters for User ID: {userId}</h1>
      <UserLettersTable userId={userId} />
    </div>
  );
};

export default UserLettersPage;
