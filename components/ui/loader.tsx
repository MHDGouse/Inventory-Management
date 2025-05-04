import { useState, CSSProperties } from "react";
import { PulseLoader } from "react-spinners";

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

function loader() {


  return (
    <div className="sweet-loading">

<PulseLoader loading />
    </div>
  );
}

export default loader;