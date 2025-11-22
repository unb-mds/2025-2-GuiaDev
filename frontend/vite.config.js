import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Adicione esta seção para resolver o problema do hot-reload no Docker
  server: {
    watch: {
      // Força o uso de polling, que é necessário para o Docker
      // detectar as mudanças de arquivo corretamente.
      usePolling: true,
    },
    // Garante que o servidor seja acessível na rede (necessário para o Docker)
    host: true,
    // Garante que o container feche corretamente ao ser parado
    strictPort: true,
    port: 5173, // A porta padrão do Vite
    allowedHosts: [
      "two025-2-guiadev-1-frontend.onrender.com",
      "localhost",
    ]
  },
})