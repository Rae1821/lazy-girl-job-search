"use client";

import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const SearchInput = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (searchTerm.trim() === "") {
      return;
    } else {
      const params = new URLSearchParams(searchParams);
      params.set("query", searchTerm);
      replace(`${pathname}?${params.toString()}`);
      setSearchTerm("");
    }
  };

  return (
    <form onSubmit={handleSearch}>
      <Input
        type="text"
        name="searchItem"
        placeholder="Search jobs..."
        className=""
        onChange={(e) => {
          setSearchTerm(e.target.value);
        }}
      />
      <Button type="submit" className="mt-4">
        Search
      </Button>
    </form>
  );
};

export default SearchInput;
