import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/auth/AuthProvider";
import { ProtectedRoute } from "@/auth/ProtectedRoute";
import { RoleRoute } from "@/auth/RoleRoute";
import Landing from "@/pages/landing";
import Inspectors from "@/pages/inspectors";
import InspectorProfile from "@/pages/inspector-profile";
import PostRequest from "@/pages/PostRequest";
import RequestsList from "@/pages/RequestsList";
import RequestDetail from "@/pages/RequestDetail";
import InspectorDashboard from "@/pages/InspectorDashboard";
import Thanks from "@/pages/Thanks";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Account from "@/pages/Account";
import Forbidden from "@/pages/Forbidden";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/inspectors" component={Inspectors} />
      <Route path="/inspectors/:id" component={InspectorProfile} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/forbidden" component={Forbidden} />
      <Route path="/thanks" component={Thanks} />
      <Route path="/account">
        <ProtectedRoute><Account /></ProtectedRoute>
      </Route>
      <Route path="/post">
        <RoleRoute role="client"><PostRequest /></RoleRoute>
      </Route>
      <Route path="/requests">
        <RoleRoute role="inspector"><RequestsList /></RoleRoute>
      </Route>
      <Route path="/requests/:id">
        <RoleRoute role="inspector"><RequestDetail /></RoleRoute>
      </Route>
      <Route path="/inspector">
        <RoleRoute role="inspector"><InspectorDashboard /></RoleRoute>
      </Route>
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
