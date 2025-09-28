import { useState } from "react";
import axios from "axios";

function Register() {
  const [form, setForm] = useState({ email: "", password: "", phone: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/register", form);
      alert("Register success!");
    } catch (err) {
      alert(err.response?.data?.message || "Register failed");
    }
  };

  const sendOtp = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/phone/send-otp", { phone: form.phone });
      alert("OTP sent!");
    } catch (err) {
      alert("Send OTP failed",err);
    }
  };

  const verifyOtp = async () => {
    const otp = prompt("Enter OTP:");
    try {
      const res = await axios.post("http://localhost:5000/api/auth/phone/verify-otp", {
        phone: form.phone,
        otp
      });
      alert("Phone verified! Token: " + res.data.token);
    } catch (err) {
      alert("OTP verify failed",err);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" placeholder="Email" onChange={handleChange} /> <br />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} /> <br />
        <input type="text" name="phone" placeholder="Phone" onChange={handleChange} /> <br />
        <button type="submit">Register</button>
      </form>

      <hr />
      <button onClick={sendOtp}>Send OTP</button>
      <button onClick={verifyOtp}>Verify OTP</button>
    </div>
  );
}

export default Register;
