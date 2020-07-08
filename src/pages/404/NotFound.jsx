import React from "react";
import { Redirect } from "react-router-dom";

const NotFound = () => {
  return (
    // <div>
    // 	<h1>404 Not Found</h1>
    // </div>
    <Redirect to={"/login"} />
  );
};

export default NotFound;
