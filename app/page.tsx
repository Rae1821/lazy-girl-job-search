import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

const Home = () => {
  return (
    <div>
      <h1>Welcome to the Job Tracker</h1>

      <Button asChild>
        <Link href="/dashboard">Go to Dashboard</Link>
      </Button>

      <div></div>
    </div>
  );
};

export default Home;
