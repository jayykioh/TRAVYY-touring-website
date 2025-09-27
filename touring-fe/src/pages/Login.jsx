import { useState } from "react";
import axios from "axios";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", form);
      alert("Login success! Token: " + res.data.token);
      localStorage.setItem("token", res.data.token);
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  const googleLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  const facebookLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/facebook";
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" placeholder="Email" onChange={handleChange} /> <br />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} /> <br />
        <button type="submit">Login</button>
      </form>

      <hr />
      <button onClick={googleLogin}>Login with Google</button>
      <button onClick={facebookLogin}>Login with Facebook</button>
    </div>
  );
}

export default Login;