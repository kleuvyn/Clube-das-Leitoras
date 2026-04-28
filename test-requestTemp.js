const res = await fetch("http://localhost:3000/api/auth/request-temp-password", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "kleuvyn@gmail.com" }) // Assume this is your email in db or a valid email
});
console.log(res.status, await res.text());
