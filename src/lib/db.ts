export async function query<T>(sql: string): Promise<T[]> {
  const proc = Bun.spawn(["team-db", sql]);
  const output = await new Response(proc.stdout).text();
  try {
    return JSON.parse(output) as T[];
  } catch (e) {
    console.error("Failed to parse team-db output:", output, e);
    return [];
  }
}

export async function execute(sql: string): Promise<void> {
  const proc = Bun.spawn(["team-db", sql]);
  await proc.exited;
}
