import express from "express";
import cors from "cors";
import xss from "xss";

const PORT = process.env.PORT || 4000;

const app = express();

app.use(express.static("public"));

// parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

app.get("/users", async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  const response = await fetch(
    `https://jsonplaceholder.typicode.com/users?_limit=${limit}`
  );
  const users = await response.json();

  res.send(`
    <h1 class="text-2xl font-bold my-4">Users</h1>
    <ul>
      ${users.map((user) => `<li>${user.name}</li>`).join("")}
    </ul>
  `);
});

app.post("/convert", async (req, res) => {
  setTimeout(() => {
    const fahrenheit = parseFloat(req.body.fahrenheit);
    const celsius = (fahrenheit - 32) * (5 / 9);

    res.send(`
      <p>${fahrenheit} degrees Fahrenheit is equal to ${celsius} degrees Celsius</p>
    `);
  }, 2000);
});

let counter = 0;

app.get("/poll", async (req, res) => {
  counter++;
  const data = { value: counter };
  res.json(data);
});

let currentTemp = 20;

app.get("/weather", async (req, res) => {
  currentTemp += Math.random() * 2 - 1;
  res.send(`${currentTemp.toFixed(1)} ℃`);
});

const contacts = [
  {
    name: "John Doe",
    email: "john.doe@test.com",
  },
  {
    name: "Jane Doe",
    email: "jane.doe@test.com",
  },
  {
    name: "Bob Ross",
    email: "bobross@test.com",
  },
  {
    name: "Mike Stan",
    email: "mikke@test.com",
  },
  {
    name: "Jenna Smith",
    email: "jennasm@test.com",
  },
];

app.post("/search", async (req, res) => {
  const searchTerm = req.body.search.toLowerCase();

  if (!searchTerm) {
    return res.send(`<tr></tr>`);
  }

  const searchResults = contacts.filter((contact) => {
    const name = contact.name.toLowerCase();
    const email = contact.email.toLowerCase();

    return name.includes(searchTerm) || email.includes(searchTerm);
  });

  setTimeout(() => {
    const searchResultsHTML = searchResults
      .map(
        (contact) => `
      <tr>
        <td><div class="my-4 p-2">${contact.name}</td>
        <td><div class="my-4 p-2">${contact.email}</td>
      </tr>
    `
      )
      .join("");

    res.send(searchResultsHTML);
  }, 1000);
});

app.post("/search/api", async (req, res) => {
  const searchTerm = req.body.search.toLowerCase();

  if (!searchTerm) {
    return res.send(`<tr></tr>`);
  }

  const response = await fetch(`https://jsonplaceholder.typicode.com/users`);
  const contacts = await response.json();

  const searchResults = contacts.filter((contact) => {
    const name = contact.name.toLowerCase();
    const email = contact.email.toLowerCase();

    return name.includes(searchTerm) || email.includes(searchTerm);
  });

  setTimeout(() => {
    const searchResultsHTML = searchResults
      .map(
        (contact) => `
      <tr>
        <td><div class="my-4 p-2">${contact.name}</td>
        <td><div class="my-4 p-2">${contact.email}</td>
      </tr>
    `
      )
      .join("");

    res.send(searchResultsHTML);
  }, 1000);
});

app.post("/contact/email", (req, res) => {
  const submittedEmail = req.body.email;
  const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;

  const isValid = {
    message: "That email is valid",
    class: "text-green-700",
  };

  const isInvalid = {
    message: "Please enter a valid email address",
    class: "text-red-700",
  };

  if (!emailRegex.test(submittedEmail)) {
    return res.send(
      `
      <div class="mb-4" hx-target="this" hx-swap="outerHTML">
      <label class="block text-gray-700 text-sm font-bold mb-2" for="email"
        >Email Address</label
      >
      <input
        name="email"
        hx-post="/contact/email"
        class="border rounded-lg py-2 px-3 w-full focus:outline-none focus:border-blue-500"
        type="email"
        id="email"
        value="${submittedEmail}"
        required
      />
      <div class="${isInvalid.class}">${isInvalid.message}</div>
    </div>
      `
    );
  } else {
    return res.send(
      `
      <div class="mb-4" hx-target="this" hx-swap="outerHTML">
      <label class="block text-gray-700 text-sm font-bold mb-2" for="email"
        >Email Address</label
      >
      <input
        name="email"
        hx-post="/contact/email"
        class="border rounded-lg py-2 px-3 w-full focus:outline-none focus:border-blue-500"
        type="email"
        id="email"
        value="${submittedEmail}"
        required
      />
      <div class="${isValid.class}">${isValid.message}</div>
    </div>
      `
    );
  }
});

app.put("/profile/:id", (req, res) => {
  const name = xss(req.body.name);
  const bio = xss(req.body.bio);

  // Send the updated profile back
  res.send(`
  <div
  class="container mx-auto py-8 max-w-lg"
  hx-target="this"
  hx-swap="outerHTML"
>
  <div class="bg-white p-6 rounded-lg shadow-lg">
    <h1 class="text-2xl font-bold mb-4">${name}</h1>
    <p class="text-gray-700">
      ${bio}
    </p>

    <button
      hx-get="/profile/1/edit"
      class="bg-indigo-700 text-white font-bold w-full py-2 px-4 rounded-lg mt-4 hover:bg-indigo-600"
    >
      Click To Edit
    </button>
  </div>
</div>
  `);
});

app.listen(PORT, () => {
  console.log(`Example app listening on PORT: ${PORT}`);
});
