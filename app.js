const STORAGE_KEYS = {
  inventory: "troncosport_inventory",
  users: "troncosport_users",
  activity: "troncosport_activity",
  session: "troncosport_session",
};

const seedInventory = [
  {
    id: "TS-001",
    name: "Camiseta de compresion Elite",
    category: "Camisetas",
    size: "M",
    stock: 18,
    price: 95000,
    supplier: "Fit Supply SAS",
    status: "Disponible",
    updatedAt: "2026-04-09 09:00",
  },
  {
    id: "TS-002",
    name: "Pantaloneta Running Pulse",
    category: "Pantalonetas",
    size: "L",
    stock: 6,
    price: 72000,
    supplier: "Deporte Total",
    status: "Stock bajo",
    updatedAt: "2026-04-09 08:45",
  },
  {
    id: "TS-003",
    name: "Chaqueta Rompevientos Pro",
    category: "Chaquetas",
    size: "XL",
    stock: 0,
    price: 149000,
    supplier: "Urban Fit",
    status: "Agotado",
    updatedAt: "2026-04-08 17:20",
  },
  {
    id: "TS-004",
    name: "Medias tecnicas Match",
    category: "Accesorios",
    size: "Unica",
    stock: 24,
    price: 28000,
    supplier: "Accion Deportiva",
    status: "Disponible",
    updatedAt: "2026-04-08 16:10",
  },
];

const seedUsers = [
  {
    name: "Laura Martinez",
    role: "Administradora",
    shift: "Manana",
    access: "Total",
    status: "Activo",
  },
  {
    name: "Carlos Rojas",
    role: "Auxiliar de bodega",
    shift: "Tarde",
    access: "Inventario",
    status: "Activo",
  },
  {
    name: "Valentina Gomez",
    role: "Cajera",
    shift: "Mixto",
    access: "Consulta",
    status: "En capacitacion",
  },
];

const seedActivity = [
  "Ingreso inicial de referencias deportivas al sistema.",
  "Actualizacion de precios para la coleccion Training 2026.",
  "Revision de alertas por stock bajo en pantalonetas.",
];

function readStorage(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function initializeData() {
  if (!localStorage.getItem(STORAGE_KEYS.inventory)) {
    writeStorage(STORAGE_KEYS.inventory, seedInventory);
  }

  if (!localStorage.getItem(STORAGE_KEYS.users)) {
    writeStorage(STORAGE_KEYS.users, seedUsers);
  }

  if (!localStorage.getItem(STORAGE_KEYS.activity)) {
    writeStorage(STORAGE_KEYS.activity, seedActivity);
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function setMessage(element, text, type = "") {
  if (!element) {
    return;
  }

  element.textContent = text;
  element.classList.remove("is-success", "is-error");

  if (type) {
    element.classList.add(type === "success" ? "is-success" : "is-error");
  }
}

function getStatusByStock(stock, selectedStatus) {
  const numericStock = Number(stock);

  if (numericStock <= 0) {
    return "Agotado";
  }

  if (numericStock <= 8) {
    return selectedStatus === "Disponible" ? "Stock bajo" : selectedStatus;
  }

  return selectedStatus === "Agotado" ? "Disponible" : selectedStatus;
}

function renderUsers() {
  const list = document.getElementById("userList");
  if (!list) {
    return;
  }

  const users = readStorage(STORAGE_KEYS.users, seedUsers);
  list.innerHTML = users
    .map(
      (user) => `
        <article class="user-card">
          <div class="user-card-header">
            <strong>${user.name}</strong>
            <span class="status-badge ${user.status === "Activo" ? "status-disponible" : "status-stock-bajo"}">${user.status}</span>
          </div>
          <span class="user-role">${user.role}</span>
          <span>Turno: ${user.shift}</span>
          <span>Nivel de acceso: ${user.access}</span>
        </article>
      `,
    )
    .join("");
}

function renderActivity() {
  const list = document.getElementById("activityList");
  if (!list) {
    return;
  }

  const activity = readStorage(STORAGE_KEYS.activity, seedActivity);
  list.innerHTML = activity.map((item) => `<li>${item}</li>`).join("");
}

function updateStats(products) {
  const totalProducts = document.getElementById("totalProducts");
  const totalStock = document.getElementById("totalStock");
  const lowStockCount = document.getElementById("lowStockCount");
  const inventoryValue = document.getElementById("inventoryValue");

  if (!totalProducts) {
    return;
  }

  const stockCount = products.reduce((sum, product) => sum + Number(product.stock), 0);
  const lowStock = products.filter((product) => Number(product.stock) > 0 && Number(product.stock) <= 8).length;
  const totalValue = products.reduce(
    (sum, product) => sum + Number(product.stock) * Number(product.price),
    0,
  );

  totalProducts.textContent = String(products.length);
  totalStock.textContent = String(stockCount);
  lowStockCount.textContent = String(lowStock);
  inventoryValue.textContent = formatCurrency(totalValue);
}

function getFilteredProducts(products) {
  const searchInput = document.getElementById("searchInput");
  const filterStatus = document.getElementById("filterStatus");

  const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
  const status = filterStatus ? filterStatus.value : "Todos";

  return products.filter((product) => {
    const matchesQuery =
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.supplier.toLowerCase().includes(query);

    const matchesStatus = status === "Todos" || product.status === status;
    return matchesQuery && matchesStatus;
  });
}

function getStatusClass(status) {
  if (status === "Disponible") {
    return "status-disponible";
  }

  if (status === "Stock bajo") {
    return "status-stock-bajo";
  }

  return "status-agotado";
}

function renderInventory() {
  const tbody = document.getElementById("inventoryBody");
  if (!tbody) {
    return;
  }

  const products = readStorage(STORAGE_KEYS.inventory, seedInventory);
  const filteredProducts = getFilteredProducts(products);

  updateStats(products);

  if (filteredProducts.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9">
          <div class="empty-state">No se encontraron productos con los filtros seleccionados.</div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filteredProducts
    .map(
      (product) => `
        <tr>
          <td><strong>${product.name}</strong><br><small>${product.id}</small></td>
          <td>${product.category}</td>
          <td>${product.size}</td>
          <td>${product.stock}</td>
          <td>${formatCurrency(product.price)}</td>
          <td>${product.supplier}</td>
          <td><span class="status-badge ${getStatusClass(product.status)}">${product.status}</span></td>
          <td>${product.updatedAt}</td>
          <td>
            <div class="action-group">
              <button class="table-action edit" type="button" data-action="edit" data-id="${product.id}">Editar</button>
              <button class="table-action delete" type="button" data-action="delete" data-id="${product.id}">Eliminar</button>
            </div>
          </td>
        </tr>
      `,
    )
    .join("");
}

function resetForm() {
  const form = document.getElementById("inventoryForm");
  const productId = document.getElementById("productId");
  const submitButton = document.getElementById("submitButton");

  if (!form || !productId || !submitButton) {
    return;
  }

  form.reset();
  productId.value = "";
  submitButton.textContent = "Guardar producto";
}

function registerActivity(message) {
  const activity = readStorage(STORAGE_KEYS.activity, seedActivity);
  activity.unshift(message);
  writeStorage(STORAGE_KEYS.activity, activity.slice(0, 5));
  renderActivity();
}

function saveProduct(event) {
  event.preventDefault();

  const formMessage = document.getElementById("formMessage");
  const products = readStorage(STORAGE_KEYS.inventory, seedInventory);

  const productId = document.getElementById("productId").value.trim();
  const name = document.getElementById("productName").value.trim();
  const category = document.getElementById("category").value;
  const size = document.getElementById("size").value;
  const stock = Number(document.getElementById("stock").value);
  const price = Number(document.getElementById("price").value);
  const supplier = document.getElementById("supplier").value.trim();
  const selectedStatus = document.getElementById("status").value;
  const status = getStatusByStock(stock, selectedStatus);
  const updatedAt = new Date().toLocaleString("es-CO", {
    dateStyle: "short",
    timeStyle: "short",
  });

  const payload = {
    id: productId || `TS-${String(Date.now()).slice(-4)}`,
    name,
    category,
    size,
    stock,
    price,
    supplier,
    status,
    updatedAt,
  };

  const existingIndex = products.findIndex((product) => product.id === payload.id);

  if (existingIndex >= 0) {
    products[existingIndex] = payload;
    setMessage(formMessage, "Producto actualizado correctamente.", "success");
    registerActivity(`Se actualizó la referencia ${payload.id} - ${payload.name}.`);
  } else {
    products.unshift(payload);
    setMessage(formMessage, "Producto registrado correctamente.", "success");
    registerActivity(`Se registró la nueva referencia ${payload.id} - ${payload.name}.`);
  }

  writeStorage(STORAGE_KEYS.inventory, products);
  resetForm();
  renderInventory();
}

function handleTableAction(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const action = target.dataset.action;
  const id = target.dataset.id;

  if (!action || !id) {
    return;
  }

  const products = readStorage(STORAGE_KEYS.inventory, seedInventory);
  const product = products.find((item) => item.id === id);
  const formMessage = document.getElementById("formMessage");

  if (!product) {
    return;
  }

  if (action === "edit") {
    document.getElementById("productId").value = product.id;
    document.getElementById("productName").value = product.name;
    document.getElementById("category").value = product.category;
    document.getElementById("size").value = product.size;
    document.getElementById("stock").value = product.stock;
    document.getElementById("price").value = product.price;
    document.getElementById("supplier").value = product.supplier;
    document.getElementById("status").value = product.status;
    document.getElementById("submitButton").textContent = "Actualizar producto";
    setMessage(formMessage, `Editando la referencia ${product.id}.`, "success");
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  if (action === "delete") {
    const confirmed = window.confirm(`Deseas eliminar la referencia ${product.id} - ${product.name}?`);
    if (!confirmed) {
      return;
    }

    const updatedProducts = products.filter((item) => item.id !== id);
    writeStorage(STORAGE_KEYS.inventory, updatedProducts);
    setMessage(formMessage, `Se elimino la referencia ${product.id}.`, "success");
    registerActivity(`Se elimino la referencia ${product.id} - ${product.name}.`);
    renderInventory();
    resetForm();
  }
}

function initIndexPage() {
  const session = readStorage(STORAGE_KEYS.session, null);
  if (session) {
    window.location.href = "dashboard.html";
    return;
  }

  const form = document.getElementById("loginForm");
  const demoAccess = document.getElementById("demoAccess");
  const message = document.getElementById("loginMessage");
  const username = document.getElementById("username");
  const password = document.getElementById("password");

  function login(userValue, passwordValue) {
    if (userValue === "admin.tronco" && passwordValue === "Tronco2026") {
      writeStorage(STORAGE_KEYS.session, {
        user: "admin.tronco",
        role: "Supervisor general",
      });
      setMessage(message, "Acceso concedido. Redirigiendo al dashboard...", "success");
      window.setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 700);
      return;
    }

    setMessage(message, "Credenciales incorrectas. Usa el acceso demo indicado.", "error");
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    login(username.value.trim(), password.value.trim());
  });

  demoAccess.addEventListener("click", () => {
    username.value = "admin.tronco";
    password.value = "Tronco2026";
    login("admin.tronco", "Tronco2026");
  });
}

function initDashboardPage() {
  const session = readStorage(STORAGE_KEYS.session, null);
  if (!session) {
    window.location.href = "index.html";
    return;
  }

  const currentUser = document.getElementById("currentUser");
  if (currentUser) {
    currentUser.textContent = session.user;
  }

  renderUsers();
  renderActivity();
  renderInventory();

  const form = document.getElementById("inventoryForm");
  const resetButton = document.getElementById("resetButton");
  const logoutButton = document.getElementById("logoutButton");
  const table = document.getElementById("inventoryTable");
  const searchInput = document.getElementById("searchInput");
  const filterStatus = document.getElementById("filterStatus");

  form.addEventListener("submit", saveProduct);
  resetButton.addEventListener("click", () => {
    resetForm();
    setMessage(
      document.getElementById("formMessage"),
      "Formulario limpio. Puedes registrar una nueva referencia.",
      "success",
    );
  });
  table.addEventListener("click", handleTableAction);
  searchInput.addEventListener("input", renderInventory);
  filterStatus.addEventListener("change", renderInventory);
  logoutButton.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEYS.session);
    window.location.href = "index.html";
  });
}

function main() {
  initializeData();

  const page = document.body.dataset.page;

  if (page === "index") {
    initIndexPage();
  }

  if (page === "dashboard") {
    initDashboardPage();
  }
}

document.addEventListener("DOMContentLoaded", main);
