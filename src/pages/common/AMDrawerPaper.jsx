import React, { useState } from "react";
import AMAppBar from "./AMAppBar";
import AMLeftBar from "./AMLeftBar";

function AMDrawerPaper({ titulo }) {
  const [open, setOpen] = useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <AMLeftBar open={open} handleDrawerClose={handleDrawerClose} />
      <AMAppBar
        open={open}
        handleDrawerOpen={handleDrawerOpen}
        titulo={titulo}
      />
    </div>
  );
}

export default AMDrawerPaper;
