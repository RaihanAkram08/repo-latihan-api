const http = require('http');
const url = require('url');

let users = []; // Array untuk menyimpan data pengguna

const respondWithJSON = (res, statusCode, data) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

const createUser = (req, res) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', () => {
    const { name, email, phone, role, status } = JSON.parse(body);
    if (name && email && phone && role && status) {
      const newUser = {
        user_id: users.length + 1, // Menggunakan panjang array sebagai ID
        name,
        email,
        phone,
        role,
        status
      };
      users.push(newUser);
      respondWithJSON(res, 201, { message: 'Pengguna berhasil ditambahkan', user_id: newUser.user_id });
    } else {
      respondWithJSON(res, 400, { message: 'Data tidak lengkap!' });
    }
  });
};

const readUsers = (res) => {
  respondWithJSON(res, 200, users);
};

const readUserById = (res, id) => {
  const user = users.find(u => u.user_id === parseInt(id)); // Mencari pengguna berdasarkan ID
  if (user) {
    respondWithJSON(res, 200, user);
  } else {
    respondWithJSON(res, 404, { message: 'Pengguna tidak ditemukan!' });
  }
};

const updateUser = (req, res, id) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', () => {
    const { name, email, phone, role, status } = JSON.parse(body);
    const userIndex = users.findIndex(u => u.user_id === parseInt(id)); // Mencari indeks pengguna berdasarkan ID
    if (userIndex !== -1) {
      users[userIndex] = {
        user_id: parseInt(id),
        name,
        email,
        phone,
        role,
        status
      };
      respondWithJSON(res, 200, { message: 'Pengguna berhasil diperbarui' });
    } else {
      respondWithJSON(res, 404, { message: 'Pengguna tidak ditemukan!' });
    }
  });
};

const deleteUser = (res, id) => {
  const userIndex = users.findIndex(u => u.user_id === parseInt(id)); // Mencari indeks pengguna
  if (userIndex !== -1) {
    users.splice(userIndex, 1); // Menghapus pengguna dari array
    respondWithJSON(res, 200, { message: 'Pengguna berhasil dihapus' });
  } else {
    respondWithJSON(res, 404, { message: 'Pengguna tidak ditemukan!' });
  }
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const { pathname } = parsedUrl;

  if (req.method === 'POST' && pathname === '/api/users') {
    createUser(req, res);
  } else if (req.method === 'GET' && pathname === '/api/users') {
    readUsers(res);
  } else if (req.method === 'GET' && pathname.startsWith('/api/users/')) {
    const id = pathname.split('/')[3];
    readUserById(res, id);
  } else if (req.method === 'PUT' && pathname.startsWith('/api/users/')) {
    const id = pathname.split('/')[3];
    updateUser(req, res, id);
  } else if (req.method === 'DELETE' && pathname.startsWith('/api/users/')) {
    const id = pathname.split('/')[3];
    deleteUser(res, id);
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Rute tidak ditemukan!' }));
  }
  // indexnya mulai dibaca dari URL, jadi localhost:3000 tidak terindikasi karena dia bukan URL
  // [0] index kosong ''
  // [1] api
  // [2] users
  // [3] ID
});

server.listen(3000, () => {
  console.log('Server berjalan di http://localhost:3000');
});
