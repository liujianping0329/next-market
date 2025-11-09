"use client";

import ky from "ky";
import { useState } from "react";

const Register = () => {

  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const handleSubmit = async(event) => {
    event.preventDefault();
    
    const response = await ky.post('http://localhost:3000/api/user/register', {
      json: {name, email, password}
      }).json();
    alert(response.message);
  }

  return (
    <div>
      <h1>
        User Registration Page
      </h1>
      <form onSubmit={handleSubmit}>
        <input value={name} onChange={(e) => setName(e.target.value)} type="text" name="name" placeholder="Username" required />
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="text" name="email" placeholder="Email" required />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="text" name="password" placeholder="Password" required />
        <button type="submit">Register</button>
      </form>
    </div>
  )
}

export default Register;