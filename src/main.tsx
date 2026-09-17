import { StrictMode } from "react"

import ReactDOM from "react-dom/client"

import { AuthProvider } from "./app/providers/auth-provider"
import QueryProvider from "./app/providers/query-provider/query-provider"
import RouterWithAuthContext from "./app/providers/router-provider"
import { ThemeProvider } from "./app/providers/theme-provider"
import { configureAmplify } from "./infrastructure/auth/amplify.config"

import "./index.css"

// Before anything can ask for a session.
configureAmplify()

const rootElement = document.getElementById("root")!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <QueryProvider>
        <ThemeProvider>
          <AuthProvider>
            <RouterWithAuthContext />
          </AuthProvider>
        </ThemeProvider>
      </QueryProvider>
    </StrictMode>
  )
}
