const { Client } = require('@elastic/elasticsearch');
require('dotenv').config();

const elastic = new Client({
  node: process.env.ELASTIC_NODE, // hoặc lấy từ env
  auth: {
    username: process.env.ELASTIC_USER,
    password: process.env.ELASTIC_PASSWORD
  }
});

async function deleteIndex(indexName) {
  try {
    const response = await elastic.indices.delete({ index: indexName });
    console.log(`Index ${indexName} deleted:`, response);
  } catch (err) {
    if (err.meta && err.meta.statusCode === 404) {
      console.log(`Index ${indexName} không tồn tại.`);
    } else {
      console.error('Lỗi khi xóa index:', err);
    }
  }
}

deleteIndex('kho_so_test');

