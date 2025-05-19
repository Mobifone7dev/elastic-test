const { Client } = require('@elastic/elasticsearch');
require('dotenv').config(); // Đọc biến môi trường từ .env
const client = new Client({
  node: 'http://localhost:9200',
  auth: {
    username: process.env.ELASTIC_USER,
    password: process.env.ELASTIC_PASSWORD
  },
  tls: {
    rejectUnauthorized: false  // Bỏ kiểm tra SSL nếu dùng self-signed cert
  }
});

async function checkConnection() {
  try {
    const response = await client.info();
    console.dir(response, { depth: null });
    console.log("BODY:", response.body);
  } catch (err) {
    console.error("Lỗi kết nối:", err.meta?.body || err);
  }
}

async function searchAll() {
  try {
    const result = await client.search({
      index: "kho_so_test",
      query: {
        regexp: {
          "TEL_NUMBER.keyword": {
            value: ".*30$"
          }
        }
      },
      size: 10  // Số lượng kết quả trả về (mặc định chỉ là 10)
    });

    console.log('📦 Kết quả:', result.hits.hits);
  } catch (err) {
    console.error('❌ Lỗi khi query:', err);
  }
}

searchAll();

// checkConnection();

