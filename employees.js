const http = require('http');
const url = require('url');

let employees = []; // Array untuk menyimpan data karyawan

const respondWithJSON = (res, statusCode, data) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

const createEmployee = (req, res) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', () => {
    const { name, position, salary, date_hired, status } = JSON.parse(body);
    if (name && position && salary && date_hired && status) {
      const newEmployee = {
        employee_id: employees.length + 1, // Menggunakan panjang array sebagai ID
        name,
        position,
        salary,
        date_hired,
        status
      };
      employees.push(newEmployee);
      respondWithJSON(res, 201, { message: 'Karyawan berhasil ditambahkan', employee_id: newEmployee.employee_id });
    } else {
      respondWithJSON(res, 400, { message: 'Data tidak lengkap!' });
    }
  });
};

const readEmployees = (res) => {
  respondWithJSON(res, 200, employees);
};

const readEmployeeById = (res, id) => {
  const employee = employees.find(e => e.employee_id === parseInt(id)); // Mencari karyawan berdasarkan ID
  if (employee) {
    respondWithJSON(res, 200, employee);
  } else {
    respondWithJSON(res, 404, { message: 'Karyawan tidak ditemukan!' });
  }
};

const updateEmployee = (req, res, id) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', () => {
    const { name, position, salary, status } = JSON.parse(body);
    const employeeIndex = employees.findIndex(e => e.employee_id === parseInt(id)); // Mencari indeks karyawan berdasarkan ID
    if (employeeIndex !== -1) {
      employees[employeeIndex] = {
        employee_id: parseInt(id),
        name,
        position,
        salary,
        date_hired: employees[employeeIndex].date_hired, // Mengambil tanggal yang sama
        status
      };
      respondWithJSON(res, 200, { message: 'Karyawan berhasil diperbarui' });
    } else {
      respondWithJSON(res, 404, { message: 'Karyawan tidak ditemukan!' });
    }
  });
};

const deleteEmployee = (res, id) => {
  const employeeIndex = employees.findIndex(e => e.employee_id === parseInt(id)); // Mencari indeks karyawan
  if (employeeIndex !== -1) {
    employees.splice(employeeIndex, 1); // Menghapus karyawan dari array
    respondWithJSON(res, 200, { message: 'Karyawan berhasil dihapus' });
  } else {
    respondWithJSON(res, 404, { message: 'Karyawan tidak ditemukan!' });
  }
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const { pathname } = parsedUrl;

  if (req.method === 'POST' && pathname === '/api/employees') {
    createEmployee(req, res);
  } else if (req.method === 'GET' && pathname === '/api/employees') {
    readEmployees(res);
  } else if (req.method === 'GET' && pathname.startsWith('/api/employees/')) {
    const id = pathname.split('/')[3];
    readEmployeeById(res, id);
  } else if (req.method === 'PUT' && pathname.startsWith('/api/employees/')) {
    const id = pathname.split('/')[3];
    updateEmployee(req, res, id);
  } else if (req.method === 'DELETE' && pathname.startsWith('/api/employees/')) {
    const id = pathname.split('/')[3];
    deleteEmployee(res, id);
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Rute tidak ditemukan!' }));
  }
   // indexnya mulai dibaca dari URL, jadi localhost:3000 tidak terindikasi karena dia bukan URL
  // [0] index kosong ''
  // [1] api
  // [2] employees
  // [3] ID
});

server.listen(3000, () => {
  console.log('Server berjalan di http://localhost:3000');
});
