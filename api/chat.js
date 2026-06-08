import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // 1. Mengambil history chat lama
  if (req.method === 'GET') {
    try {
      const messages = await kv.lrange('chat_history', 0, -1) || [];
      return res.status(200).json(messages.reverse());
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // 2. Menyimpan pesan baru agar abadi
  if (req.method === 'POST') {
    try {
      const { sender, message } = req.body;
      if (!sender || !message) return res.status(400).json({ error: 'Data tidak lengkap' });

      const newMessage = { sender, message };
      await kv.lpush('chat_history', newMessage); 
      return res.status(200).json(newMessage);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method tidak didukung' });
}