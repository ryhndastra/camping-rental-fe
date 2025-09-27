"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, Tent, Mountain, Trees, Compass } from "lucide-react"
import api, { login } from "../api/axios"

// Main Login component
const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validasi input
    if (!email.trim() || !password.trim()) {
      setError("Email dan password wajib diisi!")
      setLoading(false)
      return
    }

    try {
      const data = (await login({ email, password })) as { access_token?: string; message?: string }

      if (data.access_token) {
        // Login berhasil - simpan token
        localStorage.setItem("adminToken", data.access_token)

        // Fetch profile data
        api.defaults.headers.common["Authorization"] = `Bearer ${data.access_token}`
        const profileResponse = await api.get("/admin/profile")
        const userData = profileResponse.data as {
          adminId: number
          email: string
          nama: string
          firstName?: string
          lastName?: string
          role: string
        }

        console.log("Profile response:", profileResponse)
        console.log("UserData from API:", userData)

        // Validasi data user sebelum menyimpan
        if (!userData || !userData.adminId || !userData.email) {
          console.error("Invalid user data received from API:", userData)
          setError("Data user tidak valid. Silakan coba lagi.")
          setLoading(false)
          return
        }

        // Combine firstName and lastName for display name, fallback to nama if not available
        const displayName = `${userData.firstName || ""} ${userData.lastName || ""}`.trim() || userData.nama || "Admin"

        // Simpan data user
        const userObject = {
          id: userData.adminId,
          username: userData.email,
          name: displayName,
          role: userData.role,
          loginTime: new Date().toISOString(),
        }

        console.log("User object to store:", userObject)
        localStorage.setItem("adminUser", JSON.stringify(userObject))

        console.log("Login berhasil!")

        // Dispatch custom event to notify App component of auth change
        window.dispatchEvent(new Event("authChange"))

        navigate("/dashboard")
      } else {
        setError("Login gagal: Token tidak diterima")
      }
    } catch (err: any) {
      console.error("Terjadi kesalahan:", err)
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError("Terjadi kesalahan koneksi. Pastikan backend berjalan.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-green-400/20 to-blue-500/20 rounded-full blur-xl animate-pulse"></div>
        <div
          className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-r from-blue-400/20 to-green-500/20 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-32 left-40 w-40 h-40 bg-gradient-to-r from-gray-400/10 to-blue-400/10 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>

        {/* Grid */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: "50px 50px",
            }}
          ></div>
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left space-y-8">
              {/* Logo */}
              <div className="flex justify-center lg:justify-start">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
                    <Tent className="text-white w-10 h-10" />
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-green-400/20 to-blue-500/20 rounded-3xl blur-lg animate-pulse"></div>
                </div>
              </div>

              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent leading-tight">
                  Camping
                  <br />
                  <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                    Rental
                  </span>
                </h1>
                <p className="text-xl text-gray-300 max-w-md mx-auto lg:mx-0">
                  Sistem manajemen rental alat kemping yang modern dan efisien
                </p>
              </div>

              {/* Icon */}
              <div className="flex justify-center lg:justify-start space-x-6">
                <div className="flex flex-col items-center space-y-2 group">
                  <div className="w-12 h-12 bg-gray-800/50 rounded-xl flex items-center justify-center group-hover:bg-green-500/20 transition-colors duration-300">
                    <Mountain className="w-6 h-6 text-green-400" />
                  </div>
                  <span className="text-xs text-gray-400">Adventure</span>
                </div>
                <div className="flex flex-col items-center space-y-2 group">
                  <div className="w-12 h-12 bg-gray-800/50 rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors duration-300">
                    <Trees className="w-6 h-6 text-blue-400" />
                  </div>
                  <span className="text-xs text-gray-400">Nature</span>
                </div>
                <div className="flex flex-col items-center space-y-2 group">
                  <div className="w-12 h-12 bg-gray-800/50 rounded-xl flex items-center justify-center group-hover:bg-gray-400/20 transition-colors duration-300">
                    <Compass className="w-6 h-6 text-gray-400" />
                  </div>
                  <span className="text-xs text-gray-400">Explore</span>
                </div>
              </div>
            </div>

            <div className="w-full max-w-md mx-auto">
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
                {/* Form header */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">Admin Login</h2>
                  <p className="text-gray-300">Masuk ke dashboard sistem</p>
                </div>

                {/* Error message */}
                {error && (
                  <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-2xl p-4 mb-6">
                    <p className="text-red-200 text-sm font-medium">{error}</p>
                  </div>
                )}

                {/* Login form */}
                <form className="space-y-6">
                  {/* Email */}
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:border-green-400/50 focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all duration-300 text-white placeholder-gray-400 peer"
                      placeholder="Email Address"
                      required
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-400/0 to-blue-500/0 peer-focus:from-green-400/10 peer-focus:to-blue-500/10 transition-all duration-300 pointer-events-none"></div>
                  </div>

                  {/* Password */}
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:border-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 text-white placeholder-gray-400 pr-12 peer"
                      placeholder="Password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/0 to-green-500/0 peer-focus:from-blue-400/10 peer-focus:to-green-500/10 transition-all duration-300 pointer-events-none"></div>
                  </div>

                  {/* Button Login */}
                  <button
                    type="submit"
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full relative overflow-hidden bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center justify-center">
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                          Memproses...
                        </>
                      ) : (
                        "Masuk ke Dashboard"
                      )}
                    </div>
                  </button>
                </form>

                {/* Footer */}
                <div className="text-center mt-8 pt-6 border-t border-white/10">
                  <p className="text-gray-400 text-sm">© 2025 Camping Rental System</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
