export async function getUsers(db: { query: (sql: string) => Promise<unknown> }) {
  return db.query("SELECT * FROM users");
}
