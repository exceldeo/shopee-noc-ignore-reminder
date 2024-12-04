import { v4 as uuidv4 } from 'uuid';

// let dataStorage = Array.from({ length: 20 }, (_, i) => ({
//   id: uuidv4(),
//   title: `Alert ${i + 1}`,
//   description: `Description alert ${i + 1}`,
//   channel: ["Email", "SMS", "Push Notification", "Webhook"][i % 4],
//   reference: `https://example.com/alert${i + 1}`,
//   time_end: new Date(new Date().getTime() + (i + 1) * 3 * 60 * 60 * 1000).toISOString(),
//   created_at: new Date().toISOString(),
// }));

let dataStorage = [];

export async function POST(request) {
  const newData = await request.json();
  dataStorage.push({
    id: uuidv4(),
    created_at: new Date().toISOString(),
    ...newData,
  });
  return Response.json({ message: "Data berhasil di tambahkan" });
}

export function GET(request) {
  return Response.json({ data: dataStorage });
}