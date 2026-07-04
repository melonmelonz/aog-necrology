"use client";

import { useEffect } from "react";

// The register now lives on one page with the memorial hero. Keep this old
// route working by sending visitors to the register section of the home page.
export default function ArchiveRedirect() {
  useEffect(() => {
    window.location.replace("./#register");
  }, []);

  return (
    <main className="status" style={{ padding: "6rem 1.5rem", textAlign: "center" }}>
      Taking you to the register… <a href="./#register">Continue →</a>
    </main>
  );
}
