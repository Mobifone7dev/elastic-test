require('dotenv').config();
const oracledb = require('oracledb');
const { Client } = require('@elastic/elasticsearch');

const elastic = new Client({
  node: process.env.ELASTIC_NODE,
  auth: {
    username: process.env.ELASTIC_USERNAME,
    password: process.env.ELASTIC_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

async function createIndexKhoSoTestElastic() {
  const response = await elastic.info();
  console.dir(response, { depth: null });

  const indexName = 'kho_so_test'; // tên index bạn muốn tạo
  try {
    // 2. Tạo index nếu chưa có
    const { body: exists } = await elastic.indices.exists({ index: indexName });
    console.log("exits", exists)
    if (!exists) {
      await elastic.indices.create({
        index: indexName,
        body: {
          mappings: {
            properties: {
              TEL_NUMBER: { type: 'keyword' },
              SPE_NUMBER_TYPE: { type: 'keyword' },
              LOAI_CK: { type: 'keyword' },
              CHANGE_DATETIME: { type: 'date', 'format': 'yyyy-MM-dd HH:mm:ss||strict_date_optional_time||epoch_millis' },
              IS_HOLD: { type: 'keyword' },
              // thêm các field cần thiết tùy bảng bạn
            }
          }
        }
      });
      console.log(`✅ Đã tạo index "${indexName}"`);
    }

  } catch (err) {
    console.error('❌ Lỗi:', err);
  }
}

createIndexKhoSoTestElastic();

