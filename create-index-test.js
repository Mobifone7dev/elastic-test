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
              TEL_NUMBER: { type: 'text' },
              SPE_NUMBER_TYPE: { type: 'text' },
              LOAI_CK: { type: 'text' },
              CHANGE_DATETIME: { type: 'date','format': 'yyyy-MM-dd HH:mm:ss||strict_date_optional_time||epoch_millis' },
              IS_HOLD: { type: 'boolean' },
              // thêm các field cần thiết tùy bảng bạn
            }
          }
        }
      });
      console.log(`✅ Đã tạo index "${indexName}"`);
    }

    await connection.close();
  } catch (err) {
    console.error('❌ Lỗi:', err);
  }
}

createIndexKhoSoTestElastic();

