const http = require('http'); // Mengimpor modul http untuk membuat server
const url = require('url'); // Mengimpor modul url untuk mengelola URL

let products = []; // Array untuk menyimpan data produk

// Fungsi untuk merespons dengan JSON
const respondWithJSON = (res, statusCode, data) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' }); // Menetapkan header respons
  res.end(JSON.stringify(data)); // Mengirim data JSON sebagai respons
};

// Fungsi untuk menambah produk baru
const createProduct = (req, res) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString(); // Mengumpulkan data yang dikirim
  });

  req.on('end', () => {
    const { name, price, stock, description, category } = JSON.parse(body); // Menguraikan data JSON
    if (name && price && stock && description && category) {
      const newProduct = {
        product_id: products.length + 1, // Menggunakan panjang array sebagai ID
        name,
        price,
        stock,
        description,
        category
      };
      products.push(newProduct); // Menambahkan produk baru ke array
      respondWithJSON(res, 201, { message: 'Produk berhasil ditambahkan', product_id: newProduct.product_id });
    } else {
      respondWithJSON(res, 400, { message: 'Data tidak lengkap!' }); // Menangani data tidak lengkap
    }
  });
};

// Fungsi untuk membaca seluruh produk
const readProducts = (res) => {
  respondWithJSON(res, 200, products); // Mengirim seluruh daftar produk
};

// Fungsi untuk melihat detail produk
const readProductById = (res, id) => {
  const product = products.find(p => p.product_id === parseInt(id)); // Mencari produk berdasarkan ID
  if (product) {
    respondWithJSON(res, 200, product); // Mengirim data produk jika ditemukan
  } else {
    respondWithJSON(res, 404, { message: 'Produk tidak ditemukan!' }); // Menangani produk tidak ditemukan
  }
};

// Fungsi untuk memperbarui produk
const updateProduct = (req, res, id) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString(); // Mengumpulkan data yang dikirim
  });

  req.on('end', () => {
    const { name, price, stock, description, category } = JSON.parse(body); // Menguraikan data JSON
    const productIndex = products.findIndex(p => p.product_id === parseInt(id)); // Mencari indeks produk berdasarkan ID
    if (productIndex !== -1) {
      products[productIndex] = {
        product_id: parseInt(id), // Menggunakan ID dari parameter
        name,
        price,
        stock,
        description,
        category
      };
      respondWithJSON(res, 200, { message: 'Produk berhasil diperbarui' }); // Mengirim respons berhasil
    } else {
      respondWithJSON(res, 404, { message: 'Produk tidak ditemukan!' }); // Menangani produk tidak ditemukan
    }
  });
};

// Fungsi untuk menghapus produk
const deleteProduct = (res, id) => {
  const productIndex = products.findIndex(p => p.product_id === parseInt(id)); // Mencari indeks produk
  if (productIndex !== -1) {
    products.splice(productIndex, 1); // Menghapus produk dari array
    respondWithJSON(res, 200, { message: 'Produk berhasil dihapus' }); // Mengirim respons berhasil
  } else {
    respondWithJSON(res, 404, { message: 'Produk tidak ditemukan!' }); // Menangani produk tidak ditemukan
  }
};

// Membuat server HTTP
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true); // Mengurai URL
  const { pathname } = parsedUrl; // Mengambil pathname dari URL

  // Tambahkan rute API di sini
  if (req.method === 'POST' && pathname === '/api/products') {
    createProduct(req, res); // Memanggil fungsi untuk menambah produk
  } else if (req.method === 'GET' && pathname === '/api/products') {
    readProducts(res); // Memanggil fungsi untuk membaca seluruh produk
  } else if (req.method === 'GET' && pathname.startsWith('/api/products/')) {
    const id = pathname.split('/')[3]; // Mengambil ID dari URL
    readProductById(res, id); // Memanggil fungsi untuk melihat produk berdasarkan ID
  } else if (req.method === 'PUT' && pathname.startsWith('/api/products/')) {
    const id = pathname.split('/')[3]; // Mengambil ID dari URL
    updateProduct(req, res, id); // Memanggil fungsi untuk memperbarui produk
  } else if (req.method === 'DELETE' && pathname.startsWith('/api/products/')) {
    const id = pathname.split('/')[3]; // Mengambil ID dari URL
    deleteProduct(res, id); // Memanggil fungsi untuk menghapus produk
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' }); // Menangani rute tidak ditemukan
    res.end(JSON.stringify({ message: 'Rute tidak ditemukan!' }));
  }
});

// Memulai server di port 3000
server.listen(3000, () => {
  console.log('Server berjalan di http://localhost:3000'); // Menampilkan pesan ketika server berjalan
});
