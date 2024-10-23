const http = require('http');
const url = require('url');

let books = []; // Array untuk menyimpan data buku

const respondWithJSON = (res, statusCode, data) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

const createBook = (req, res) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', () => {
    const { title, author, published_year, genre, status } = JSON.parse(body);
    if (title && author && published_year && genre && status) {
      const newBook = {
        book_id: books.length + 1, // Menggunakan panjang array sebagai ID
        title,
        author,
        published_year,
        genre,
        status
      };
      books.push(newBook);
      respondWithJSON(res, 201, { message: 'Buku berhasil ditambahkan', book_id: newBook.book_id });
    } else {
      respondWithJSON(res, 400, { message: 'Data tidak lengkap!' });
    }
  });
};

const readBooks = (res) => {
  respondWithJSON(res, 200, books);
};

const readBookById = (res, id) => {
  const book = books.find(b => b.book_id === parseInt(id)); // Mencari buku berdasarkan ID
  if (book) {
    respondWithJSON(res, 200, book);
  } else {
    respondWithJSON(res, 404, { message: 'Buku tidak ditemukan!' });
  }
};

const updateBook = (req, res, id) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', () => {
    const { title, author, published_year, genre, status } = JSON.parse(body);
    const bookIndex = books.findIndex(b => b.book_id === parseInt(id)); // Mencari indeks buku berdasarkan ID
    if (bookIndex !== -1) {
      books[bookIndex] = {
        book_id: parseInt(id),
        title,
        author,
        published_year,
        genre,
        status
      };
      respondWithJSON(res, 200, { message: 'Buku berhasil diperbarui' });
    } else {
      respondWithJSON(res, 404, { message: 'Buku tidak ditemukan!' });
    }
  });
};

const deleteBook = (res, id) => {
  const bookIndex = books.findIndex(b => b.book_id === parseInt(id)); // Mencari indeks buku
  if (bookIndex !== -1) {
    books.splice(bookIndex, 1); // Menghapus buku dari array
    respondWithJSON(res, 200, { message: 'Buku berhasil dihapus' });
  } else {
    respondWithJSON(res, 404, { message: 'Buku tidak ditemukan!' });
  }
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const { pathname } = parsedUrl;

  if (req.method === 'POST' && pathname === '/api/books') {
    createBook(req, res);
  } else if (req.method === 'GET' && pathname === '/api/books') {
    readBooks(res);
  } else if (req.method === 'GET' && pathname.startsWith('/api/books/')) {
    const id = pathname.split('/')[3];
    readBookById(res, id);
  } else if (req.method === 'PUT' && pathname.startsWith('/api/books/')) {
    const id = pathname.split('/')[3];
    updateBook(req, res, id);
  } else if (req.method === 'DELETE' && pathname.startsWith('/api/books/')) {
    const id = pathname.split('/')[3];
    deleteBook(res, id);
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Rute tidak ditemukan!' }));
  }
   // indexnya mulai dibaca dari URL, jadi localhost:3000 tidak terindikasi karena dia bukan URL
  // [0] index kosong ''
  // [1] api
  // [2] books
  // [3] ID
});

server.listen(3000, () => {
  console.log('Server berjalan di http://localhost:3000');
});
