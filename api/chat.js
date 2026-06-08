import { put, list } from '@vercel/blob';

// Nama file rahasia untuk menyimpan history chat kalian
const BLOB_FILENAME = 'private_chat_history.json';

export default async function handler(req, res) {
  try {
    // 1. MENGAMBIL HISTORY CHAT (GET)
    if (req.method === 'GET') {
      // Cari apakah file json chat sudah pernah dibuat di Blob Store
      const { blobs } = await list();
      const chatBlob = blobs.find(b => b.pathname === BLOB_FILENAME);

      if (!chatBlob) {
        // Jika belum ada chat sama sekali, kirim array kosong
        return res.status(200).json([]);
      }

      // Ambil isi file json tersebut
      const response = await fetch(chatBlob.url);
      const chatHistory = await response.json();
      return res.status(200).json(chatHistory);
    }

    // 2. MENYIMPAN PESAN BARU (POST)
    if (req.method === 'POST') {
      const { sender, message } = req.body;
      if (!sender || !message) return res.status(400).json({ error: 'Data tidak lengkap' });

      // Ambil data lama terlebih dahulu
      const { blobs } = await list();
      const chatBlob = blobs.find(b => b.pathname === BLOB_FILENAME);
      let chatHistory = [];

      if (chatBlob) {
        const response = await fetch(chatBlob.url);
        chatHistory = await response.json();
      }

      // Tambahkan pesan baru ke dalam riwayat
      const newMessage = { sender, message, timestamp: new Date().toISOString() };
      chatHistory.push(newMessage);

      // Upload kembali file JSON yang sudah diperbarui ke Vercel Blob (Menimpa file lama)
      await put(BLOB_FILENAME, JSON.stringify(chatHistory), {
        access: 'public',
        addRandomSuffix: false // Agar nama filenya tetap sama dan menimpa yang lama
      });

      return res.status(200).json(newMessage);
    }

    return res.status(405).json({ error: 'Method tidak didukung' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
