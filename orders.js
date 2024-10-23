const http = require('http');
const url = require('url');

let orders = []; // Array untuk menyimpan data pesanan

const respondWithJSON = (res, statusCode, data) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

const createOrder = (req, res) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', () => {
    const { customer_name, product_id, quantity, total_price, status } = JSON.parse(body);
    if (customer_name && product_id && quantity && total_price && status) {
      const newOrder = {
        order_id: orders.length + 1, // Menggunakan panjang array sebagai ID
        customer_name,
        product_id,
        quantity,
        total_price,
        status
      };
      orders.push(newOrder);
      respondWithJSON(res, 201, { message: 'Pesanan berhasil ditambahkan', order_id: newOrder.order_id });
    } else {
      respondWithJSON(res, 400, { message: 'Data tidak lengkap!' });
    }
  });
};

const readOrders = (res) => {
  respondWithJSON(res, 200, orders);
};

const readOrderById = (res, id) => {
  const order = orders.find(o => o.order_id === parseInt(id)); // Mencari pesanan berdasarkan ID
  if (order) {
    respondWithJSON(res, 200, order);
  } else {
    respondWithJSON(res, 404, { message: 'Pesanan tidak ditemukan!' });
  }
};

const updateOrder = (req, res, id) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', () => {
    const { quantity, total_price, status } = JSON.parse(body);
    const orderIndex = orders.findIndex(o => o.order_id === parseInt(id)); // Mencari indeks pesanan berdasarkan ID
    if (orderIndex !== -1) {
      orders[orderIndex] = {
        order_id: parseInt(id),
        customer_name: orders[orderIndex].customer_name, // Mengambil nama pelanggan yang sama
        product_id: orders[orderIndex].product_id, // Mengambil ID produk yang sama
        quantity,
        total_price,
        status
      };
      respondWithJSON(res, 200, { message: 'Pesanan berhasil diperbarui' });
    } else {
      respondWithJSON(res, 404, { message: 'Pesanan tidak ditemukan!' });
    }
  });
};

const deleteOrder = (res, id) => {
  const orderIndex = orders.findIndex(o => o.order_id === parseInt(id)); // Mencari indeks pesanan
  if (orderIndex !== -1) {
    orders.splice(orderIndex, 1); // Menghapus pesanan dari array
    respondWithJSON(res, 200, { message: 'Pesanan berhasil dihapus' });
  } else {
    respondWithJSON(res, 404, { message: 'Pesanan tidak ditemukan!' });
  }
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const { pathname } = parsedUrl;

  if (req.method === 'POST' && pathname === '/api/orders') {
    createOrder(req, res);
  } else if (req.method === 'GET' && pathname === '/api/orders') {
    readOrders(res);
  } else if (req.method === 'GET' && pathname.startsWith('/api/orders/')) {
    const id = pathname.split('/')[3];
    readOrderById(res, id);
  } else if (req.method === 'PUT' && pathname.startsWith('/api/orders/')) {
    const id = pathname.split('/')[3];
    updateOrder(req, res, id);
  } else if (req.method === 'DELETE' && pathname.startsWith('/api/orders/')) {
    const id = pathname.split('/')[3];
    deleteOrder(res, id);
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Rute tidak ditemukan!' }));
  }
   // indexnya mulai dibaca dari URL, jadi localhost:3000 tidak terindikasi karena dia bukan URL
  // [0] index kosong ''
  // [1] api
  // [2] orders
  // [3] ID
});

server.listen(3000, () => {
  console.log('Server berjalan di http://localhost:3000');
});
