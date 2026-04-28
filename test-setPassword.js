const res = await fetch("http://localhost:3000/api/auth/set-password", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Cookie": 'clube-sessao=' + encodeURIComponent('{"email":"kleuvyn@gmail.com","role":"convidada"}')
  },
  body: JSON.stringify({ newPassword: "newpassword123" })
});
console.log(res.status, await res.text());
