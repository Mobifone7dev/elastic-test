const { Client } = require('@elastic/elasticsearch');
require('dotenv').config(); // Đọc biến môi trường từ .env
const client = new Client({
    node: process.env.ELASTIC_NODE,
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
async function listIndices() {
    try {
        const result = await client.cat.indices({ format: 'json' });

        // Dữ liệu ở result.body (tuỳ version Elasticsearch client)
        const indices = result.body || result;

        indices.forEach(index => {
            console.log(`📦 Index: ${index.index}, Docs: ${index['docs.count']}`);
        });
    } catch (err) {
        console.error('❌ Lỗi khi lấy danh sách index:', err);
    }
}

async function searchAll() {

    try {

        const result = await client.search({
            index: "chonso7",
            query: {
                match_all: {}
            },
            size: 10  // Số lượng kết quả trả về (mặc định chỉ là 10)
        });

        console.log('📦 Kết quả:', result.hits.hits);
    } catch (err) {
        console.error('❌ Lỗi khi query:', err);
    }
}

async function searchCondition(formatNumber, typeNumber = null) {
    console.log('formatNumber', formatNumber);
    console.log('typeNumber', typeNumber);
    const mustConditions = [
        {
            term: {
                'tel_number_key.keyword': ` '+ ${formatNumber}` + ''
            }
        }
    ];

    // Nếu có truyền typeNumber thì thêm điều kiện
    if (typeNumber) {
        mustConditions.push({
            term: {
                'spe_number_type.keyword': ` '+ ${typeNumber}` + ''
            }
        });
    }
    try {
        const result = await client.search({
            index: 'chonso7',
            query: {
                bool: {
                    must: mustConditions

                }
            }
        });
        console.log('📦 Kết quả:', result.hits.hits);
    } catch (err) {
        console.error('❌ Lỗi khi query:', err);
    }
}


async function getCount() {
    try {
        const result = await client.count({
            index: 'chonso7'
        });

        console.log(`📊 Tổng số documents: ${result.count}`);
    } catch (err) {
        console.error('❌ Lỗi khi đếm documents:', err);
    }
}

async function getMapping() {
    try {
        const result = await client.indices.getMapping({ index: 'chonso7' });
        console.dir(result, { depth: null });
    } catch (err) {
        console.error('❌ Lỗi khi lấy mapping:', err);
    }
}

async function updateIsHoldByTelNumber(telNumberKey, newValue) {
    try {
        const result = await client.updateByQuery({
            index: 'chonso7',
            refresh: true,
            body: {
                script: {
                    source: 'ctx._source.is_hold = params.newValue',
                    lang: 'painless',
                    params: {
                        newValue: newValue
                    }
                },
                query: {
                    term: {
                        'tel_number_key.keyword': telNumberKey
                    }
                }
            }
        });

        console.log('✅ Kết quả cập nhật:', result);
    } catch (err) {
        console.error('❌ Lỗi khi cập nhật:', err);
    }
}

// updateIsHoldByTelNumber('769488990', '1');


// listIndices();
// searchAll();
searchCondition('*88', null);
// checkConnection();
// getCount();
// getMapping();

