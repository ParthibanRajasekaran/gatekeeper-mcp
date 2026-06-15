export async function getUsers() {
  const response = await fetch("/api/users");
  return response.json();
}
