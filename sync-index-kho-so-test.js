const oracledb = require('oracledb');
const { Client } = require('@elastic/elasticsearch');
require('dotenv').config();
const BATCH_SIZE = 500;

const elastic = new Client({
  node: process.env.ELASTIC_NODE,
  auth: {
    username: process.env.ELASTIC_USERNAME,
    password: process.env.ELASTIC_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});
async function syncDataPaged() {
  let connection;

  try {
    connection = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECT_STRING
    });

    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const result = await connection.execute(
        `
        select * from KHO_SO_TEST
        ORDER BY tel_number
        OFFSET :offset ROWS
        FETCH NEXT :limit ROWS ONLY
        `,
        { offset, limit: BATCH_SIZE },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const rows = result.rows;
      console.log(`Fetched ${rows.length} rows from offset ${offset}`);

      if (rows.length === 0) {
        hasMore = false;
        break;
      }

      const bulkBody = [];

      for (const row of rows) {
        bulkBody.push({
          index: {
            _index: 'kho_so_test',
            _id: row.TEL_NUMBER
          }
        });

        bulkBody.push(row);
      }

      if (bulkBody.length > 0) {
        console.log("Gửi dữ liệu lên Elasticsearch:", bulkBody[0]);
        const esResult = await elastic.bulk({ refresh: true, body: bulkBody });
        if (esResult.errors) {
          if (esResult.errors) {
            esResult.items.forEach((item, i) => {
              const action = item.index || item.create || item.update || item.delete;
              if (action && action.error) {
                console.error(`❌ Lỗi tại bản ghi ${i}:`, {
                  id: action._id,
                  error: action.error
                });
              }
            });
          }
          console.error('Có lỗi khi gửi dữ liệu lên Elasticsearch:', esResult);
        } else {
          console.log(`Đã index ${rows.length} bản ghi.`);
        }
      }

      offset += BATCH_SIZE;
    }
  } catch (err) {
    console.error('Lỗi:', err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Lỗi khi đóng kết nối:', err);
      }
    }
  }
}

syncDataPaged();
