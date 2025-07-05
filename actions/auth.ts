export async function fetchJobs({ searchItem }: { searchItem: string }) {
  const headers = {
    "x-rapidapi-key": "e8e61d9638mshf2c592bf697514fp18b971jsn02e0d86ad08e",
    "x-rapidapi-host": "jsearch.p.rapidapi.com",
  };

  try {
    const response = await fetch(
      `https://jsearch.p.rapidapi.com/search?query=${searchItem}&page=1&num_pages=5&country=us&date_posted=all`,
      {
        headers,
      },
    );

    const result = await response.json();
    console.log(result?.data);
    return result?.data;
  } catch (error) {
    console.error("Error fetching jobs:", error);
  }
}
